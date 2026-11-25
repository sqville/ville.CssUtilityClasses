/**
 * Base class for all Standards-Backed `QxLayout` managers (`ville.ui.layout.Abstract` — `STRAT-LAYOUT-01`).
 *
 * Architectural design:
 * - Built-in layout subclasses (`HBox`, `VBox`, `Grid`, `Dock`, `Canvas`, `Flow`, `Grow`)
 *   translate container properties and per-child `add(child, options)` / `setLayoutProperties()`
 *   directly into native C++ CSS Flexbox, CSS Grid, and CSS Positioned styles on
 *   `ville.html.Element` with **0ms JavaScript layout-queue overhead**.
 * - Custom algorithmic layout subclasses that override `renderLayout(availWidth, availHeight)`
 *   (just like Qooxdoo's `qx.ui.layout.Abstract#renderLayout`) are automatically
 *   connected to a single shared browser `ResizeObserver` (`contentBoxSize`), which
 *   invokes `renderLayout(availWidth, availHeight)` right before browser paint and
 *   batches all `child.setUserBounds(left, top, width, height)` writes into a single
 *   `ville.html.Element.flush()`.
 *
 * @ignore(ResizeObserver, queueMicrotask)
 */
qx.Class.define("ville.ui.layout.Abstract", {
  type: "abstract",
  extend: qx.core.Object,

  statics: {
    /**
     * Single shared `ResizeObserver` instance driving custom `renderLayout(availWidth, availHeight)`
     * subclasses across the application (`STRAT-LAYOUT-01`).
     *
     * @type {ResizeObserver|null}
     * @private
     */
    __sharedResizeObserver: null,

    /**
     * Returns or lazily creates the shared `ResizeObserver`.
     *
     * @returns {ResizeObserver|null} Shared resize observer.
     * @private
     */
    __getResizeObserver() {
      if (
        !ville.ui.layout.Abstract.__sharedResizeObserver &&
        typeof ResizeObserver !== "undefined"
      ) {
        ville.ui.layout.Abstract.__sharedResizeObserver = new ResizeObserver(
          (entries) => {
            let needsFlush = false;
            for (let i = 0; i < entries.length; i++) {
              const entry = entries[i];
              // @ts-ignore
              const widget = entry.target.$$qxObject;
              if (!widget || widget.isDisposed()) {
                continue;
              }
              const layout = widget._getLayout();
              if (
                layout &&
                !layout.isDisposed() &&
                typeof layout.renderLayout === "function"
              ) {
                const box =
                  entry.contentBoxSize && entry.contentBoxSize[0]
                    ? entry.contentBoxSize[0]
                    : null;
                const availWidth = Math.round(
                  box ? box.inlineSize : entry.contentRect.width
                );
                const availHeight = Math.round(
                  box ? box.blockSize : entry.contentRect.height
                );
                layout.renderLayout(availWidth, availHeight);
                widget.fireDataEvent("resize", {
                  width: availWidth,
                  height: availHeight
                });
                needsFlush = true;
              }
            }
            if (needsFlush) {
              ville.html.Element.flush();
            }
          }
        );
      }
      return ville.ui.layout.Abstract.__sharedResizeObserver;
    }
  },

  members: {
    /** @type {ville.ui.core.Widget|null} @private */
    __widget: null,

    /** @type {boolean} @private */
    __observingResize: false,

    /**
     * Returns the container widget currently managed by this layout instance.
     *
     * @returns {ville.ui.core.Widget|null} Connected container widget.
     * @protected
     */
    _getWidget() {
      return this.__widget;
    },

    /**
     * Returns the visible (non-excluded) child widgets of the connected container.
     *
     * @returns {ville.ui.core.Widget[]} Array of visible child widgets.
     * @protected
     */
    _getLayoutChildren() {
      return this.__widget ? this.__widget._getLayoutChildren() : [];
    },

    /**
     * Connects or disconnects this layout manager to/from a container widget.
     *
     * @param {ville.ui.core.Widget|null} widget Container widget or `null` to disconnect.
     */
    connectToWidget(widget) {
      if (this.__widget === widget) {
        return;
      }

      if (this.__widget) {
        this.__unobserveContainer(this.__widget);
        this._disconnectContainerStyles(this.__widget);
      }

      this.__widget = widget;

      if (widget) {
        this._applyContainerStyles(widget);

        // If a custom subclass defines `renderLayout(availWidth, availHeight)`,
        // enroll the container in the shared `ResizeObserver`.
        if (typeof this.renderLayout === "function") {
          this.__observeContainer(widget);
        }
      }
    },

    /**
     * Applies container-level CSS styles/variables when connected or when layout
     * properties change. Overridden by subclasses (`HBox`, `VBox`, `Grid`, `Dock`, `Canvas`, `Flow`, `Grow`).
     *
     * @param {ville.ui.core.Widget} widget Connected container widget.
     * @protected
     */
    _applyContainerStyles(widget) {
      if (typeof this.renderLayout === "function") {
        widget.getContentElement().setStyle("position", "relative");
      }
    },

    /**
     * Cleans up container-level CSS styles when the layout is replaced or disposed.
     *
     * @param {ville.ui.core.Widget} widget Disconnecting container widget.
     * @protected
     */
    _disconnectContainerStyles(widget) {},

    /**
     * Translates per-child layout properties (`add(child, options)` / `child.setLayoutProperties(options)`)
     * and child widget alignment/growth properties (`alignX`, `alignY`, `allowGrowX`, `allowGrowY`)
     * into CSS properties on `child.getContentElement()`.
     *
     * @param {ville.ui.core.Widget} child Child widget.
     * @param {Object<string, *>} options Child layout options map.
     */
    applyChildLayout(child, options) {
      if (typeof this.renderLayout === "function" && this.__widget) {
        this.invalidateLayoutCache();
      }
    },

    /**
     * Hook invoked when a child widget is removed from the container.
     *
     * @param {ville.ui.core.Widget} child Removed child widget.
     */
    onChildRemoved(child) {
      if (typeof this.renderLayout === "function" && this.__widget) {
        this.invalidateLayoutCache();
      }
    },

    /**
     * Triggers a container style or custom `renderLayout(availWidth, availHeight)` pass
     * on the next microtask turn.
     */
    invalidateLayoutCache() {
      const widget = this.__widget;
      if (!widget || widget.isDisposed()) {
        return;
      }
      this._applyContainerStyles(widget);
      if (typeof this.renderLayout === "function") {
        queueMicrotask(() => {
          if (this.isDisposed() || !this.__widget || this.__widget.isDisposed()) {
            return;
          }
          const bounds = this.__widget.getBounds();
          if (bounds.width > 0 || bounds.height > 0) {
            this.renderLayout(bounds.width, bounds.height);
            ville.html.Element.flush();
          }
        });
      }
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Enrolls the container widget's DOM element in the shared `ResizeObserver`.
     *
     * @param {ville.ui.core.Widget} widget Container widget.
     * @private
     */
    __observeContainer(widget) {
      this.__observingResize = true;
      queueMicrotask(() => {
        if (this.isDisposed() || this.__widget !== widget || widget.isDisposed()) {
          return;
        }
        const domEl = widget._ensureDomElement();
        const obs = ville.ui.layout.Abstract.__getResizeObserver();
        if (domEl && obs) {
          obs.observe(domEl);
        }
      });
    },

    /**
     * Unregisters the container widget's DOM element from the shared `ResizeObserver`.
     *
     * @param {ville.ui.core.Widget} widget Container widget.
     * @private
     */
    __unobserveContainer(widget) {
      if (!this.__observingResize) {
        return;
      }
      this.__observingResize = false;
      const obs = ville.ui.layout.Abstract.__sharedResizeObserver;
      const domEl = widget.getContentElement()?.getDomElement();
      if (obs && domEl) {
        obs.unobserve(domEl);
      }
    }
  },

  destruct() {
    if (this.__widget) {
      this.__unobserveContainer(this.__widget);
      this.__widget = null;
    }
  }
});
