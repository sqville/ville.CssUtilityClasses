/**
 * Native CSS overflow scroll container with Baseline 2025 `scrollend` support.
 *
 * Replaces the legacy synthetic `qx.ui.core.scroll.AbstractScrollArea` and its
 * two-scrollbar child controls with hardware-accelerated native browser overflow
 * scrolling (`overflow-x` / `overflow-y`, `scroll-behavior`, `overscroll-behavior`).
 */
qx.Class.define("ville.ui.container.Scroll", {
  extend: ville.ui.core.Box,
  include: [ville.ui.core.MContentPadding],

  /**
   * @param {ville.ui.core.Widget|null} [content=null] The content widget to scroll
   */
  construct(content) {
    // @ts-ignore
    super(new ville.ui.layout.Grow());

    this._initOverflow();
    this._wireScrollEvents();

    if (content) {
      this.add(content);
    }
  },

  events: {
    /** Fired continuously during scrolling. Data: `{ scrollLeft, scrollTop }` */
    scroll: "qx.event.type.Data",

    /**
     * Baseline 2025 native `scrollend` event fired when scrolling has completed
     * (including momentum/smooth scroll completion). Data: `{ scrollLeft, scrollTop }`
     */
    scrollEnd: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "scrollarea"
    },

    /**
     * Horizontal scrollbar policy: `"auto"`, `"on"` (`scroll`), or `"off"` (`hidden`).
     */
    scrollbarX: {
      check: ["auto", "on", "off"],
      init: "auto",
      apply: "_applyScrollbar"
    },

    /**
     * Vertical scrollbar policy: `"auto"`, `"on"` (`scroll`), or `"off"` (`hidden`).
     */
    scrollbarY: {
      check: ["auto", "on", "off"],
      init: "auto",
      apply: "_applyScrollbar"
    },

    /**
     * CSS `scroll-behavior` (`"auto"` or `"smooth"`).
     */
    scrollBehavior: {
      check: ["auto", "smooth"],
      init: "auto",
      apply: "_applyScrollBehavior"
    }
  },

  members: {
    _initOverflow() {
      this._applyScrollbar();
      this.setStyle("overscrollBehavior", "contain");
    },

    _applyScrollbar() {
      const mapPolicy = (val) => {
        if (val === "on") return "scroll";
        if (val === "off") return "hidden";
        return "auto";
      };
      this.setStyle("overflowX", mapPolicy(this.getScrollbarX()));
      this.setStyle("overflowY", mapPolicy(this.getScrollbarY()));
    },

    _applyScrollBehavior(value) {
      this.setStyle("scrollBehavior", value || "auto");
    },

    _wireScrollEvents() {
      const el = this.getContentElement();
      if (!el) return;

      el.addListener("scroll", () => {
        const domEl = el.getDomElement();
        this.fireDataEvent("scroll", {
          scrollLeft: domEl ? domEl.scrollLeft : 0,
          scrollTop: domEl ? domEl.scrollTop : 0
        });
      });

      el.addListener("scrollend", () => {
        const domEl = el.getDomElement();
        this.fireDataEvent("scrollEnd", {
          scrollLeft: domEl ? domEl.scrollLeft : 0,
          scrollTop: domEl ? domEl.scrollTop : 0
        });
      });
    },

    /**
     * Sets the content of the scroll area. Scroll areas may only have one child.
     *
     * @param {ville.ui.core.Widget} widget Child widget to add
     */
    add(widget) {
      const children = this._getChildren();
      if (children.length > 0) {
        this._removeAll();
      }
      this._add(widget);
    },

    /**
     * Removes the content widget from the scroll container.
     *
     * @param {ville.ui.core.Widget|null} [widget=null] Optional child reference
     * @returns {ville.ui.core.Widget|null} The removed child
     */
    remove(widget) {
      const children = this._getChildren();
      const target = widget || children[0] || null;
      if (target) {
        this._remove(target);
      }
      return target;
    },

    /**
     * Returns the current content widget array (length 0 or 1).
     *
     * @returns {ville.ui.core.Widget[]}
     */
    getChildren() {
      return this._getChildren();
    },

    _getContentPaddingTarget() {
      return this;
    },

    /**
     * Scrolls the horizontal axis to the given pixel offset.
     *
     * @param {number} value Horizontal offset in pixels
     * @param {boolean} [smooth=false] Whether to animate smoothly
     */
    scrollToX(value, smooth = false) {
      const domEl = this._ensureDomElement();
      if (!domEl || typeof domEl.scrollTo !== "function") return;
      domEl.scrollTo({
        left: Number(value) || 0,
        behavior: smooth || this.getScrollBehavior() === "smooth" ? "smooth" : "auto"
      });
    },

    /**
     * Scrolls the vertical axis to the given pixel offset.
     *
     * @param {number} value Vertical offset in pixels
     * @param {boolean} [smooth=false] Whether to animate smoothly
     */
    scrollToY(value, smooth = false) {
      const domEl = this._ensureDomElement();
      if (!domEl || typeof domEl.scrollTo !== "function") return;
      domEl.scrollTo({
        top: Number(value) || 0,
        behavior: smooth || this.getScrollBehavior() === "smooth" ? "smooth" : "auto"
      });
    },

    /**
     * Scrolls horizontally by the given delta in pixels.
     *
     * @param {number} delta
     * @param {boolean} [smooth=false]
     */
    scrollByX(delta, smooth = false) {
      const domEl = this._ensureDomElement();
      if (!domEl || typeof domEl.scrollBy !== "function") return;
      domEl.scrollBy({
        left: Number(delta) || 0,
        behavior: smooth || this.getScrollBehavior() === "smooth" ? "smooth" : "auto"
      });
    },

    /**
     * Scrolls vertically by the given delta in pixels.
     *
     * @param {number} delta
     * @param {boolean} [smooth=false]
     */
    scrollByY(delta, smooth = false) {
      const domEl = this._ensureDomElement();
      if (!domEl || typeof domEl.scrollBy !== "function") return;
      domEl.scrollBy({
        top: Number(delta) || 0,
        behavior: smooth || this.getScrollBehavior() === "smooth" ? "smooth" : "auto"
      });
    },

    /**
     * Returns the current horizontal scroll offset.
     * @returns {number}
     */
    getScrollX() {
      const domEl = this.getContentElement().getDomElement();
      return domEl ? domEl.scrollLeft : 0;
    },

    /**
     * Returns the current vertical scroll offset.
     * @returns {number}
     */
    getScrollY() {
      const domEl = this.getContentElement().getDomElement();
      return domEl ? domEl.scrollTop : 0;
    }
  }
});
