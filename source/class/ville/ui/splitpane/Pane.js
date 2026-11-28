/**
 * A SplitPane divides an area into two resizable regions separated by a draggable splitter bar.
 *
 * Baseline 2025 Architecture:
 * - Built on native CSS Flexbox (`HBox` for `"horizontal"`, `VBox` for `"vertical"`) and
 *   W3C Pointer Events with `Element.setPointerCapture(e.pointerId)` on the splitter bar.
 * - Eliminates the legacy `SplitPaneLayout` pixel-calculation engine and the `blocker` overlay div:
 *   pointer capture routes all `pointermove` / `pointerup` events directly to the splitter even
 *   over iframes or outside the window.
 *
 * @childControl splitter {ville.ui.splitpane.Splitter} Draggable divider between the two child widgets
 * @childControl slider {ville.ui.splitpane.Slider} Optional ghost slider shown during non-live drag
 */
qx.Class.define("ville.ui.splitpane.Pane", {
  extend: ville.ui.core.Box,

  /**
   * @param {string} [orientation="horizontal"] Split orientation (`"horizontal"` or `"vertical"`)
   */
  construct(orientation) {
    // @ts-ignore
    super();

    this.__children = [];
    this.__flexValues = [1, 1];

    this._createChildControl("splitter");

    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "splitpane"
    },

    /**
     * Distance between pointer down and drag start threshold in pixels.
     */
    offset: {
      check: "Integer",
      init: 2
    },

    /**
     * The orientation of the splitpane control (`"horizontal"` or `"vertical"`).
     */
    orientation: {
      init: "horizontal",
      check: ["horizontal", "vertical"],
      apply: "_applyOrientation"
    },

    /**
     * Whether pane resizing occurs live during pointer movement (`true`, default in Ville UI).
     */
    liveResize: {
      check: "Boolean",
      init: true
    }
  },

  members: {
    __children: null,
    __flexValues: null,
    __isDragging: false,
    __activePointerId: null,

    _createChildControlImpl(id) {
      let control;

      switch (id) {
        case "splitter": {
          control = new ville.ui.splitpane.Splitter(this);
          this._wireSplitterPointerCapture(control);
          break;
        }

        case "slider":
          control = new ville.ui.splitpane.Slider();
          control.exclude();
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    _wireSplitterPointerCapture(splitter) {
      const el = splitter.getContentElement();
      if (!el) return;

      el.setStyles({
        touchAction: "none",
        userSelect: "none"
      });

      el.addListener("pointerdown", (e) => {
        const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
        if (!nativeEvt) return;
        if (nativeEvt.button !== 0 && nativeEvt.pointerType === "mouse") return;
        if (this.__children.length < 2) return;

        if (typeof e.preventDefault === "function") {
          e.preventDefault();
        }
        this.__isDragging = true;
        this.__activePointerId = nativeEvt.pointerId;
        splitter.addState("pressed");

        if (nativeEvt.pointerId != null) {
          splitter.capture(nativeEvt.pointerId);
        }
      });

      el.addListener("pointermove", (e) => {
        if (!this.__isDragging || this.__children.length < 2) return;
        const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
        if (nativeEvt) {
          this._updateSplitFromPointer(nativeEvt);
        }
      });

      const endDrag = () => {
        if (!this.__isDragging) return;
        this.__isDragging = false;
        splitter.removeState("pressed");
        if (this.__activePointerId != null) {
          splitter.releaseCapture(this.__activePointerId);
        }
        this.__activePointerId = null;
      };

      el.addListener("pointerup", endDrag);
      el.addListener("pointercancel", endDrag);
    },

    _updateSplitFromPointer(nativeEvt) {
      const containerDom = this._ensureDomElement();
      const splitter = this.getChildControl("splitter");
      const splitterDom = splitter ? splitter._ensureDomElement() : null;
      if (!containerDom || !splitterDom || this.__children.length < 2) return;

      const rect = containerDom.getBoundingClientRect();
      const splitterRect = splitterDom.getBoundingClientRect();
      const isHorizontal = this.getOrientation() === "horizontal";

      const totalSize = isHorizontal
        ? rect.width - splitterRect.width
        : rect.height - splitterRect.height;

      if (totalSize <= 0) return;

      const firstWidget = this.__children[0];
      const secondWidget = this.__children[1];

      const minFirst = isHorizontal
        ? Number(firstWidget.getMinWidth()) || 24
        : Number(firstWidget.getMinHeight()) || 24;
      const minSecond = isHorizontal
        ? Number(secondWidget.getMinWidth()) || 24
        : Number(secondWidget.getMinHeight()) || 24;

      const pointerOffset = isHorizontal
        ? nativeEvt.clientX - rect.left - splitterRect.width / 2
        : nativeEvt.clientY - rect.top - splitterRect.height / 2;

      const clampedFirst = Math.max(
        minFirst,
        Math.min(totalSize - minSecond, pointerOffset)
      );
      const ratioFirst = clampedFirst / totalSize;
      const ratioSecond = Math.max(0.01, 1 - ratioFirst);

      firstWidget.setStyles({
        flexGrow: String(Number(ratioFirst.toFixed(4))),
        flexShrink: "1",
        flexBasis: "0px"
      });
      secondWidget.setStyles({
        flexGrow: String(Number(ratioSecond.toFixed(4))),
        flexShrink: "1",
        flexBasis: "0px"
      });
    },

    _applyOrientation(value, old) {
      const splitter = this.getChildControl("splitter");
      const knob = splitter.getChildControl("knob");

      if (old) {
        this.removeState(old);
        splitter.removeState(old);
        knob.removeState(old);
      }

      const isHorizontal = value === "horizontal";
      this._setLayout(
        isHorizontal ? new ville.ui.layout.HBox() : new ville.ui.layout.VBox()
      );
      this.setStyles({
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        alignItems: "stretch"
      });

      splitter.setAttribute(
        "aria-orientation",
        isHorizontal ? "vertical" : "horizontal"
      );
      splitter.setStyles({
        cursor: isHorizontal ? "col-resize" : "row-resize",
        flex: "0 0 auto"
      });

      this.addState(value);
      splitter.addState(value);
      knob.addState(value);

      this._syncChildrenOrder();
    },

    _syncChildrenOrder() {
      const splitter = this.getChildControl("splitter");
      this._removeAll();

      if (this.__children.length === 0) {
        return;
      }

      const first = this.__children[0];
      const flex0 = this.__flexValues[0] != null ? this.__flexValues[0] : 1;
      this._add(first, { flex: flex0 });
      this._applyFlexStyle(first, flex0);

      if (this.__children.length > 1) {
        this._add(splitter);
        const second = this.__children[1];
        const flex1 = this.__flexValues[1] != null ? this.__flexValues[1] : 1;
        this._add(second, { flex: flex1 });
        this._applyFlexStyle(second, flex1);
      }
    },

    _applyFlexStyle(widget, flex) {
      if (flex === 0) {
        widget.setStyles({
          flexGrow: "0",
          flexShrink: "0",
          flexBasis: "auto"
        });
      } else {
        widget.setStyles({
          flexGrow: String(flex),
          flexShrink: "1",
          flexBasis: "0px",
          minWidth: "0",
          minHeight: "0"
        });
      }
    },

    /**
     * Adds a widget to the splitpane. Accepts up to 2 children.
     *
     * @param {ville.ui.core.Widget} widget The widget to be added into the split pane
     * @param {number} [flex=1] Optional flex ratio (`0` for static size, `>= 1` for proportional)
     */
    add(widget, flex = 1) {
      if (this.__children.length >= 2) {
        throw new Error("A SplitPane can only have two children.");
      }
      const idx = this.__children.length;
      this.__children.push(widget);
      this.__flexValues[idx] = flex !== undefined ? flex : 1;
      this._syncChildrenOrder();
    },

    /**
     * Removes the given widget from the splitpane.
     *
     * @param {ville.ui.core.Widget} widget The widget to be removed
     */
    remove(widget) {
      const idx = this.__children.indexOf(widget);
      if (idx === -1) return;
      this.__children.splice(idx, 1);
      this.__flexValues.splice(idx, 1);
      this._syncChildrenOrder();
    },

    /**
     * Returns an array containing the current child widgets (excluding the internal splitter).
     *
     * @returns {ville.ui.core.Widget[]}
     */
    getChildren() {
      return this.__children.slice();
    }
  },

  destruct() {
    this.__children = null;
    this.__flexValues = null;
  }
});
