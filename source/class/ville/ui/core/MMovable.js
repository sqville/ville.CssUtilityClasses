/**
 * Provides pointer-capture move behavior to any `ville.ui.core.Widget` (`STRAT-LAYOUT-01`).
 *
 * Modernized for Path B Ville UI:
 * - Uses native `Element.setPointerCapture()` (`widget.capture(e.getPointerId())`) and
 *   `Element.getBoundingClientRect()` (`widget.getContentLocation()`).
 * - Zero dependency on `qx.ui.core.Widget`, `qx.ui.window.IDesktop`, or `qx.event.handler.DragDrop`.
 */
qx.Mixin.define("ville.ui.core.MMovable", {
  properties: {
    /** Whether the widget is movable. */
    movable: {
      check: "Boolean",
      init: true
    },

    /** Whether to use a ghost frame instead of moving the widget live. */
    useMoveFrame: {
      check: "Boolean",
      init: false
    }
  },

  members: {
    /** @type {ville.ui.core.Widget|null} @private */
    __moveHandle: null,

    /** @type {ville.ui.core.Widget|null} @private */
    __moveFrame: null,

    /** @type {{ left: number, top: number, right: number, bottom: number }|null} @private */
    __dragRange: null,

    /** @type {number} @private */
    __dragLeft: 0,

    /** @type {number} @private */
    __dragTop: 0,

    /** @type {number} @private */
    __parentLeft: 0,

    /** @type {number} @private */
    __parentTop: 0,

    /**
     * Registers a child control or widget as the drag/move handle.
     *
     * @param {ville.ui.core.Widget} widget Widget to activate as move handle.
     * @protected
     */
    _activateMoveHandle(widget) {
      if (this.__moveHandle) {
        throw new Error("The move handle could not be redefined!");
      }

      this.__moveHandle = widget;
      widget.addListener("pointerdown", this._onMovePointerDown, this);
      widget.addListener("pointerup", this._onMovePointerUp, this);
      widget.addListener("pointermove", this._onMovePointerMove, this);
      widget.addListener("lostpointercapture", this.__onMoveLoseCapture, this);
    },

    /**
     * Returns or lazily creates the shared move frame widget on the application root.
     *
     * @returns {ville.ui.core.Widget} The move frame widget.
     * @private
     */
    __getMoveFrame() {
      let frame = this.__moveFrame;
      if (!frame) {
        frame = this.__moveFrame = new ville.ui.core.Widget();
        frame.setAppearance("move-frame");
        frame.exclude();

        const root = this.getApplicationRoot();
        if (root && typeof root._add === "function") {
          root._add(frame);
        }
      }
      return frame;
    },

    /**
     * Displays and aligns the move preview frame with the widget's current bounds.
     *
     * @private
     */
    __showMoveFrame() {
      const location = this.getContentLocation();
      const bounds = this.getBounds();
      const frame = this.__getMoveFrame();
      frame.setUserBounds(
        location.left,
        location.top,
        bounds.width,
        bounds.height
      );
      frame.show();
      frame.setZIndex((this.getZIndex() || 100) + 1);
    },

    /**
     * Computes clamped drag coordinates from the pointer event.
     *
     * @param {Object} e Wrapped native pointer event.
     * @returns {{ viewportLeft: number, viewportTop: number, parentLeft: number, parentTop: number }} Computed coordinates.
     * @private
     */
    __computeMoveCoordinates(e) {
      const range = this.__dragRange || {
        left: -Infinity,
        top: -Infinity,
        right: Infinity,
        bottom: Infinity
      };
      const pointerLeft = Math.max(
        range.left,
        Math.min(range.right, e.getDocumentLeft())
      );
      const pointerTop = Math.max(
        range.top,
        Math.min(range.bottom, e.getDocumentTop())
      );

      const viewportLeft = this.__dragLeft + pointerLeft;
      const viewportTop = this.__dragTop + pointerTop;

      return {
        viewportLeft: Math.round(viewportLeft),
        viewportTop: Math.round(viewportTop),
        parentLeft: Math.round(viewportLeft - this.__parentLeft),
        parentTop: Math.round(viewportTop - this.__parentTop)
      };
    },

    /**
     * Starts a pointer-captured move session.
     *
     * @param {Object} e Wrapped native pointerdown event.
     * @protected
     */
    _onMovePointerDown(e) {
      if (!this.getMovable() || this.hasState("maximized")) {
        return;
      }

      const parent = this.getLayoutParent() || this.getApplicationRoot();
      const parentLocation = parent
        ? parent.getContentLocation()
        : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const parentBounds = parent
        ? parent.getBounds()
        : { width: window.innerWidth, height: window.innerHeight };

      this.__dragRange = {
        left: parentLocation.left,
        top: parentLocation.top,
        right: parentLocation.left + parentBounds.width,
        bottom: parentLocation.top + parentBounds.height
      };

      const widgetLocation = this.getContentLocation();
      this.__parentLeft = parentLocation.left;
      this.__parentTop = parentLocation.top;
      this.__dragLeft = widgetLocation.left - e.getDocumentLeft();
      this.__dragTop = widgetLocation.top - e.getDocumentTop();

      this.addState("move");
      this.__moveHandle.capture(e.getPointerId());

      if (this.getUseMoveFrame()) {
        this.__showMoveFrame();
      }

      e.stop();
    },

    /**
     * Updates widget or frame position during pointer move.
     *
     * @param {Object} e Wrapped native pointermove event.
     * @protected
     */
    _onMovePointerMove(e) {
      if (!this.hasState("move")) {
        return;
      }

      const coords = this.__computeMoveCoordinates(e);
      if (this.getUseMoveFrame()) {
        this.__getMoveFrame().setDomPosition(
          coords.viewportLeft,
          coords.viewportTop
        );
      } else {
        const parent = this.getLayoutParent();
        const insets = parent ? parent.getInsets() : { left: 0, top: 0 };
        this.setDomPosition(
          coords.parentLeft - (insets.left || 0),
          coords.parentTop - (insets.top || 0)
        );
      }

      e.stopPropagation();
    },

    /**
     * Finalizes the move session and commits `left` / `top` layout properties.
     *
     * @param {Object} e Wrapped native pointerup event.
     * @protected
     */
    _onMovePointerUp(e) {
      if (!this.hasState("move")) {
        return;
      }

      this.removeState("move");
      this.__moveHandle.releaseCapture(e.getPointerId());

      const coords = this.__computeMoveCoordinates(e);
      const parent = this.getLayoutParent();
      const insets = parent ? parent.getInsets() : { left: 0, top: 0 };
      this.setLayoutProperties({
        left: coords.parentLeft - (insets.left || 0),
        top: coords.parentTop - (insets.top || 0)
      });

      if (this.getUseMoveFrame()) {
        this.__getMoveFrame().exclude();
      }

      e.stopPropagation();
    },

    /**
     * Cleans up move state if pointer capture is lost unexpectedly.
     *
     * @private
     */
    __onMoveLoseCapture() {
      if (!this.hasState("move")) {
        return;
      }
      this.removeState("move");
      if (this.getUseMoveFrame()) {
        this.__getMoveFrame().exclude();
      }
    }
  },

  destruct() {
    this._disposeObjects("__moveFrame", "__moveHandle");
    this.__dragRange = null;
  }
});
