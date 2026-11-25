/**
 * Path B Top-Layer Popover Widget (`STRAT-EVENT-02` & `STRAT-CORE-09`).
 *
 * Replaces legacy `qx.ui.popup.Popup` + `qx.ui.popup.Manager` with the native
 * HTML5 Popover API (`popover="auto" | "manual" | "hint"`), `#top-layer`
 * rendering, native light-dismiss, and CSS Anchor Positioning via
 * `ville.ui.core.MPlacement`.
 *
 * @ignore(CommandEvent)
 */
qx.Class.define("ville.ui.overlay.Popup", {
  extend: ville.ui.core.Box,
  include: [ville.ui.core.MPlacement],

  construct(layout) {
    super();
    if (layout) {
      this._setLayout(layout);
    }
    const contentEl = this.getContentElement();
    contentEl.addClass("ville-popover");
    contentEl.setAttribute("popover", this.getPopoverMode());

    contentEl.addListener("toggle", (e) => {
      const nativeEvt = e?.getNativeEvent ? e.getNativeEvent() : e;
      const isOpen =
        nativeEvt?.newState === "open" ||
        Boolean(contentEl.getDomElement()?.matches?.(":popover-open"));
      this.setOpened(isOpen);
    });
  },

  events: {
    /** Fired when the popover opens in `#top-layer`. */
    open: "qx.event.type.Event",

    /** Fired when the popover closes from `#top-layer`. */
    close: "qx.event.type.Event"
  },

  properties: {
    appearance: {
      refine: true,
      init: "popup"
    },

    /**
     * Native HTML5 `popover` attribute mode:
     * - `"auto"`: light-dismiss on outside click or Escape, closes other auto popovers
     * - `"manual"`: explicit open/close without automatic light-dismiss
     * - `"hint"`: ephemeral tooltip/hint popover
     */
    popoverMode: {
      check: ["auto", "manual", "hint"],
      init: "auto",
      apply: "_applyPopoverMode"
    },

    /**
     * Legacy compatibility alias for `popoverMode: "auto"` vs `"manual"`.
     */
    autoHide: {
      check: "Boolean",
      init: true,
      apply: "_applyAutoHide"
    },

    /**
     * Reactive open state synchronized with native `:popover-open`.
     */
    opened: {
      check: "Boolean",
      init: false,
      event: "changeOpened",
      apply: "_applyOpened"
    }
  },

  members: {
    __syncingPopover: false,

    /**
     * Ensures the popover DOM element is attached to the application root or
     * `document.body` so native `showPopover()` can promote it to `#top-layer`.
     */
    _ensureInDocument() {
      const contentEl = this.getContentElement();
      if (!contentEl.getParent()) {
        const appRoot = qx.core.Init.getApplication?.()?.getRoot?.();
        if (appRoot) {
          appRoot.add(this);
        }
      }
      contentEl.flush();
      const domEl = contentEl.getDomElement();
      if (domEl && !domEl.isConnected && typeof document !== "undefined") {
        document.body.appendChild(domEl);
      }
      return domEl;
    },

    /**
     * Opens the popover in the browser `#top-layer`.
     */
    open() {
      this.setOpened(true);
    },

    /**
     * Closes the popover from the browser `#top-layer`.
     */
    close() {
      this.setOpened(false);
    },

    /**
     * Toggles the popover open/closed state.
     */
    toggle() {
      this.setOpened(!this.getOpened());
    },

    // Override Widget#show / hide to route through the top-layer Popover API
    show() {
      super.show();
      this.open();
    },

    hide() {
      this.close();
    },

    _applyPopoverMode(value) {
      this.getContentElement().setAttribute("popover", value || "auto");
    },

    _applyAutoHide(value) {
      this.setPopoverMode(value ? "auto" : "manual");
    },

    _applyOpened(value) {
      if (this.__syncingPopover) {
        return;
      }
      this.__syncingPopover = true;
      try {
        const domEl = this._ensureInDocument();
        if (value) {
          this.updatePlacement();
          if (domEl && typeof domEl.showPopover === "function") {
            if (!domEl.matches(":popover-open")) {
              domEl.showPopover();
            }
          } else {
            this.getContentElement().setAttribute("data-open", "true");
            this.getContentElement().setStyle("display", "block");
          }
          this.fireEvent("open");
        } else {
          if (domEl && typeof domEl.hidePopover === "function") {
            if (domEl.matches(":popover-open")) {
              domEl.hidePopover();
            }
          } else {
            this.getContentElement().removeAttribute("data-open");
            this.getContentElement().setStyle("display", "none");
          }
          this.fireEvent("close");
        }
      } finally {
        this.__syncingPopover = false;
      }
    }
  }
});
