/**
 * Container which provides an overflow scroll viewport and optional
 * forward/backward step buttons when content overflows the available space.
 *
 * Built on native overflow scrolling and the Baseline 2025 `scrollend` event
 * (zero legacy `qx.ui.core.scroll.ScrollPane`).
 *
 * @childControl button-forward {ville.ui.form.Button} Button to step forward
 * @childControl button-backward {ville.ui.form.Button} Button to step backward
 * @childControl content {ville.ui.core.Box} Scrollable inner container holding child widgets
 */
qx.Class.define("ville.ui.container.SlideBar", {
  extend: ville.ui.core.Box,
  include: [ville.ui.core.MRemoteChildrenHandling, ville.ui.core.MRemoteLayoutHandling],

  /**
   * @param {string} [orientation="horizontal"] Orientation (`"horizontal"` or `"vertical"`)
   */
  construct(orientation) {
    // @ts-ignore
    super();

    this._createChildControl("button-backward");
    this._createChildControl("content");
    this._createChildControl("button-forward");

    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },

  events: {
    /** Fired on scroll movement */
    scroll: "qx.event.type.Data",

    /** Fired when scrolling finishes (native `scrollend`) */
    scrollEnd: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "slidebar"
    },

    /** Number of pixels to scroll when pressing forward/backward buttons */
    scrollStep: {
      check: "Integer",
      init: 120,
      themeable: true
    },

    /** Orientation of the bar (`"horizontal"` or `"vertical"`) */
    orientation: {
      check: ["horizontal", "vertical"],
      init: "horizontal",
      apply: "_applyOrientation"
    }
  },

  members: {
    getChildrenContainer() {
      return this.getChildControl("content");
    },

    _createChildControlImpl(id) {
      let control;

      switch (id) {
        case "button-backward":
          control = new ville.ui.form.Button("‹");
          control.setFocusable(false);
          control.addListener("execute", this._onExecuteBackward, this);
          this._addAt(control, 0);
          break;

        case "content": {
          control = new ville.ui.core.Box();
          control.setStyles({
            flex: "1 1 auto",
            minWidth: "0",
            minHeight: "0",
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            scrollBehavior: "smooth",
            display: "flex",
            alignItems: "center"
          });
          const el = control.getContentElement();
          if (el) {
            el.addListener("scroll", () => {
              const domEl = el.getDomElement();
              this._updateArrowsEnabled();
              this.fireDataEvent("scroll", {
                scrollLeft: domEl ? domEl.scrollLeft : 0,
                scrollTop: domEl ? domEl.scrollTop : 0
              });
            });
            el.addListener("scrollend", () => {
              const domEl = el.getDomElement();
              this._updateArrowsEnabled();
              this.fireDataEvent("scrollEnd", {
                scrollLeft: domEl ? domEl.scrollLeft : 0,
                scrollTop: domEl ? domEl.scrollTop : 0
              });
            });
          }
          this._addAt(control, 1, { flex: 1 });
          break;
        }

        case "button-forward":
          control = new ville.ui.form.Button("›");
          control.setFocusable(false);
          control.addListener("execute", this._onExecuteForward, this);
          this._addAt(control, 2);
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    _applyOrientation(value, old) {
      const content = this.getChildControl("content");
      const btnBack = this.getChildControl("button-backward");
      const btnFwd = this.getChildControl("button-forward");

      if (old) {
        this.removeState(old);
        btnBack.removeState(old);
        btnFwd.removeState(old);
      }

      if (value === "vertical") {
        this._setLayout(new ville.ui.layout.VBox());
        content.setLayout(new ville.ui.layout.VBox());
        content.setStyles({
          overflowX: "hidden",
          overflowY: "auto",
          flexDirection: "column"
        });
        btnBack.setLabel("▴");
        btnFwd.setLabel("▾");
      } else {
        this._setLayout(new ville.ui.layout.HBox());
        content.setLayout(new ville.ui.layout.HBox());
        content.setStyles({
          overflowX: "auto",
          overflowY: "hidden",
          flexDirection: "row"
        });
        btnBack.setLabel("‹");
        btnFwd.setLabel("›");
      }

      this.addState(value);
      btnBack.addState(value);
      btnFwd.addState(value);
      this._updateArrowsEnabled();
    },

    /**
     * Scrolls the slide bar by the given delta in pixels.
     *
     * @param {number} delta
     */
    scrollBy(delta) {
      const content = this.getChildControl("content");
      const domEl = content ? content._ensureDomElement() : null;
      if (!domEl || typeof domEl.scrollBy !== "function") return;

      if (this.getOrientation() === "horizontal") {
        domEl.scrollBy({ left: Number(delta) || 0, behavior: "smooth" });
      } else {
        domEl.scrollBy({ top: Number(delta) || 0, behavior: "smooth" });
      }
    },

    /**
     * Scrolls the slide bar to the given pixel position.
     *
     * @param {number} value
     */
    scrollTo(value) {
      const content = this.getChildControl("content");
      const domEl = content ? content._ensureDomElement() : null;
      if (!domEl || typeof domEl.scrollTo !== "function") return;

      if (this.getOrientation() === "horizontal") {
        domEl.scrollTo({ left: Number(value) || 0, behavior: "smooth" });
      } else {
        domEl.scrollTo({ top: Number(value) || 0, behavior: "smooth" });
      }
    },

    _onExecuteBackward() {
      this.scrollBy(-this.getScrollStep());
    },

    _onExecuteForward() {
      this.scrollBy(this.getScrollStep());
    },

    _updateArrowsEnabled() {
      const content = this.getChildControl("content");
      const domEl = content ? content.getContentElement().getDomElement() : null;
      if (!domEl) return;

      const btnBack = this.getChildControl("button-backward");
      const btnFwd = this.getChildControl("button-forward");

      if (this.getOrientation() === "horizontal") {
        const maxScroll = Math.max(0, domEl.scrollWidth - domEl.clientWidth);
        btnBack.setEnabled(domEl.scrollLeft > 0);
        btnFwd.setEnabled(domEl.scrollLeft < maxScroll - 1);
      } else {
        const maxScroll = Math.max(0, domEl.scrollHeight - domEl.clientHeight);
        btnBack.setEnabled(domEl.scrollTop > 0);
        btnFwd.setEnabled(domEl.scrollTop < maxScroll - 1);
      }
    }
  }
});
