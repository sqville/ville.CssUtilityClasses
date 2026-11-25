/**
 * Provides pointer-capture edge and corner resizing behavior to any `ville.ui.core.Widget` (`STRAT-LAYOUT-01`).
 *
 * Modernized for Path B Ville UI:
 * - Uses native `Element.setPointerCapture()` (`this.capture(e.getPointerId())`) and
 *   `Element.getBoundingClientRect()` (`this.getContentLocation()`).
 * - Zero dependency on `qx.ui.core.Widget` or `qx.event.handler.DragDrop`.
 */
qx.Mixin.define("ville.ui.core.MResizable", {
  construct() {
    const content = this.getContentElement();
    content.addListener("pointerdown", this.__onResizePointerDown, this, true);
    content.addListener("pointerup", this.__onResizePointerUp, this);
    content.addListener("pointermove", this.__onResizePointerMove, this);
    content.addListener("pointerout", this.__onResizePointerOut, this);
    content.addListener("lostpointercapture", this.__onResizeLoseCapture, this);
  },

  properties: {
    /** Whether the top edge is resizable. */
    resizableTop: {
      check: "Boolean",
      init: true
    },

    /** Whether the right edge is resizable. */
    resizableRight: {
      check: "Boolean",
      init: true
    },

    /** Whether the bottom edge is resizable. */
    resizableBottom: {
      check: "Boolean",
      init: true
    },

    /** Whether the left edge is resizable. */
    resizableLeft: {
      check: "Boolean",
      init: true
    },

    /** Shorthand property group configuring all four edges at once. */
    resizable: {
      group: [
        "resizableTop",
        "resizableRight",
        "resizableBottom",
        "resizableLeft"
      ],
      mode: "shorthand"
    },

    /** Distance tolerance in pixels from an edge to activate resizing. */
    resizeSensitivity: {
      check: "Integer",
      init: 5
    },

    /** Whether a preview frame should be used during the resize sequence. */
    useResizeFrame: {
      check: "Boolean",
      init: false
    }
  },

  members: {
    /** @type {ville.ui.core.Widget|null} @private */
    __resizeFrame: null,

    /** @type {number} @private */
    __resizeActive: 0,

    /** @type {number} @private */
    __resizeLeft: 0,

    /** @type {number} @private */
    __resizeTop: 0,

    /** @type {Object|null} @private */
    __resizeStart: null,

    /** @type {Object|null} @private */
    __resizeRange: null,

    RESIZE_TOP: 1,
    RESIZE_BOTTOM: 2,
    RESIZE_LEFT: 4,
    RESIZE_RIGHT: 8,

    /**
     * @type {Object<number, string>}
     * @lint ignoreReferenceField(__resizeCursors)
     */
    __resizeCursors: {
      1: "n-resize",
      2: "s-resize",
      4: "w-resize",
      8: "e-resize",
      5: "nw-resize",
      6: "sw-resize",
      9: "ne-resize",
      10: "se-resize"
    },

    /**
     * Returns or lazily creates the resize preview frame widget.
     *
     * @returns {ville.ui.core.Widget} The resize frame widget.
     * @protected
     */
    _getResizeFrame() {
      let frame = this.__resizeFrame;
      if (!frame) {
        frame = this.__resizeFrame = new ville.ui.core.Widget();
        frame.setAppearance("resize-frame");
        frame.exclude();

        const root = this.getApplicationRoot();
        if (root && typeof root._add === "function") {
          root._add(frame);
        }
      }
      return frame;
    },

    /**
     * Displays and syncs the resize frame with the widget's live location.
     *
     * @private
     */
    __showResizeFrame() {
      const location = this.getContentLocation();
      const frame = this._getResizeFrame();
      frame.setUserBounds(
        location.left,
        location.top,
        location.right - location.left,
        location.bottom - location.top
      );
      frame.show();
      frame.setZIndex((this.getZIndex() || 100) + 1);
    },

    /**
     * Computes updated widget boundaries during a resize drag.
     *
     * @param {Object} e Wrapped native pointer event.
     * @returns {{ viewportLeft: number, viewportTop: number, parentLeft: number, parentTop: number, width: number, height: number }} Computed bounds.
     * @private
     */
    __computeResizeResult(e) {
      const resizeActive = this.__resizeActive;
      const hint = this.getSizeHint();
      const range = this.__resizeRange;
      const start = this.__resizeStart;

      let width = start.width;
      let height = start.height;
      let left = start.left;
      let top = start.top;
      let diff;

      if (
        resizeActive & this.RESIZE_TOP ||
        resizeActive & this.RESIZE_BOTTOM
      ) {
        diff =
          Math.max(range.top, Math.min(range.bottom, e.getDocumentTop())) -
          this.__resizeTop;

        if (resizeActive & this.RESIZE_TOP) {
          height -= diff;
        } else {
          height += diff;
        }

        if (height < hint.minHeight) {
          height = hint.minHeight;
        } else if (height > hint.maxHeight) {
          height = hint.maxHeight;
        }

        if (resizeActive & this.RESIZE_TOP) {
          top += start.height - height;
        }
      }

      if (
        resizeActive & this.RESIZE_LEFT ||
        resizeActive & this.RESIZE_RIGHT
      ) {
        diff =
          Math.max(range.left, Math.min(range.right, e.getDocumentLeft())) -
          this.__resizeLeft;

        if (resizeActive & this.RESIZE_LEFT) {
          width -= diff;
        } else {
          width += diff;
        }

        if (width < hint.minWidth) {
          width = hint.minWidth;
        } else if (width > hint.maxWidth) {
          width = hint.maxWidth;
        }

        if (resizeActive & this.RESIZE_LEFT) {
          left += start.width - width;
        }
      }

      return {
        viewportLeft: left,
        viewportTop: top,
        parentLeft: start.bounds.left + left - start.left,
        parentTop: start.bounds.top + top - start.top,
        width,
        height
      };
    },

    /**
     * Updates active edge flags based on pointer distance to widget edges.
     *
     * @param {Object} e Wrapped native pointer event.
     * @private
     */
    __computeResizeMode(e) {
      const location = this.getContentLocation();
      const pointerTolerance = this.getResizeSensitivity();
      const pointerLeft = e.getDocumentLeft();
      const pointerTop = e.getDocumentTop();

      let resizeActive = this.__computeResizeActive(
        location,
        pointerLeft,
        pointerTop,
        pointerTolerance
      );

      if (resizeActive > 0) {
        resizeActive =
          resizeActive |
          this.__computeResizeActive(
            location,
            pointerLeft,
            pointerTop,
            pointerTolerance * 2
          );
      }

      this.__resizeActive = resizeActive;
    },

    /**
     * Evaluates edge proximity flags.
     *
     * @param {Object} location Widget viewport box.
     * @param {number} pointerLeft Pointer X.
     * @param {number} pointerTop Pointer Y.
     * @param {number} pointerTolerance Pixel tolerance.
     * @returns {number} Bitmask of active resize edges.
     * @private
     */
    __computeResizeActive(location, pointerLeft, pointerTop, pointerTolerance) {
      let resizeActive = 0;

      if (
        this.getResizableTop() &&
        Math.abs(location.top - pointerTop) < pointerTolerance &&
        pointerLeft > location.left - pointerTolerance &&
        pointerLeft < location.right + pointerTolerance
      ) {
        resizeActive += this.RESIZE_TOP;
      } else if (
        this.getResizableBottom() &&
        Math.abs(location.bottom - pointerTop) < pointerTolerance &&
        pointerLeft > location.left - pointerTolerance &&
        pointerLeft < location.right + pointerTolerance
      ) {
        resizeActive += this.RESIZE_BOTTOM;
      }

      if (
        this.getResizableLeft() &&
        Math.abs(location.left - pointerLeft) < pointerTolerance &&
        pointerTop > location.top - pointerTolerance &&
        pointerTop < location.bottom + pointerTolerance
      ) {
        resizeActive += this.RESIZE_LEFT;
      } else if (
        this.getResizableRight() &&
        Math.abs(location.right - pointerLeft) < pointerTolerance &&
        pointerTop > location.top - pointerTolerance &&
        pointerTop < location.bottom + pointerTolerance
      ) {
        resizeActive += this.RESIZE_RIGHT;
      }

      return resizeActive;
    },

    /**
     * @param {Object} e Wrapped native pointerdown event.
     * @private
     */
    __onResizePointerDown(e) {
      if (
        !this.__resizeActive ||
        !this.getEnabled() ||
        e.getPointerType() === "touch"
      ) {
        return;
      }

      this.addState("resize");
      this.__resizeLeft = e.getDocumentLeft();
      this.__resizeTop = e.getDocumentTop();

      const location = this.getContentLocation();
      const bounds = this.getBounds();

      this.__resizeStart = {
        top: location.top,
        left: location.left,
        width: location.right - location.left,
        height: location.bottom - location.top,
        bounds: Object.assign({}, bounds)
      };

      const parent = this.getLayoutParent() || this.getApplicationRoot();
      const parentLocation = parent
        ? parent.getContentLocation()
        : { left: 0, top: 0 };
      const parentBounds = parent
        ? parent.getBounds()
        : { width: window.innerWidth, height: window.innerHeight };

      this.__resizeRange = {
        left: parentLocation.left,
        top: parentLocation.top,
        right: parentLocation.left + parentBounds.width,
        bottom: parentLocation.top + parentBounds.height
      };

      if (this.getUseResizeFrame()) {
        this.__showResizeFrame();
      }

      this.capture(e.getPointerId());
      e.stop();
    },

    /**
     * @param {Object} e Wrapped native pointerup event.
     * @private
     */
    __onResizePointerUp(e) {
      if (
        !this.hasState("resize") ||
        !this.getEnabled() ||
        e.getPointerType() === "touch"
      ) {
        return;
      }

      if (this.getUseResizeFrame()) {
        this._getResizeFrame().exclude();
      }

      const bounds = this.__computeResizeResult(e);
      this.setWidth(bounds.width);
      this.setHeight(bounds.height);

      if (this.getResizableLeft() || this.getResizableTop()) {
        this.setLayoutProperties({
          left: bounds.parentLeft,
          top: bounds.parentTop
        });
      }

      this.__resizeActive = 0;
      this.removeState("resize");
      this.resetCursor();
      this.releaseCapture(e.getPointerId());

      e.stopPropagation();
    },

    /**
     * @private
     */
    __onResizeLoseCapture() {
      if (!this.__resizeActive) {
        return;
      }
      this.resetCursor();
      this.removeState("resize");
      if (this.getUseResizeFrame()) {
        this._getResizeFrame().exclude();
      }
    },

    /**
     * @param {Object} e Wrapped native pointermove event.
     * @private
     */
    __onResizePointerMove(e) {
      if (!this.getEnabled() || e.getPointerType() === "touch") {
        return;
      }

      if (this.hasState("resize")) {
        const bounds = this.__computeResizeResult(e);
        if (this.getUseResizeFrame()) {
          const frame = this._getResizeFrame();
          frame.setUserBounds(
            bounds.viewportLeft,
            bounds.viewportTop,
            bounds.width,
            bounds.height
          );
        } else {
          this.setWidth(bounds.width);
          this.setHeight(bounds.height);
          if (this.getResizableLeft() || this.getResizableTop()) {
            this.setLayoutProperties({
              left: bounds.parentLeft,
              top: bounds.parentTop
            });
          }
        }
        e.stopPropagation();
      } else if (!this.hasState("maximized")) {
        this.__computeResizeMode(e);
        const resizeActive = this.__resizeActive;
        if (resizeActive) {
          this.setCursor(this.__resizeCursors[resizeActive]);
        } else if (this.getCursor()) {
          this.resetCursor();
        }
      }
    },

    /**
     * @param {Object} e Wrapped native pointerout event.
     * @private
     */
    __onResizePointerOut(e) {
      if (e.getPointerType() === "touch") {
        return;
      }
      if (this.getCursor() && !this.hasState("resize")) {
        this.resetCursor();
      }
    }
  },

  destruct() {
    if (this.getCursor()) {
      this.resetCursor();
    }
    this._disposeObjects("__resizeFrame");
    this.__resizeStart = null;
    this.__resizeRange = null;
  }
});
