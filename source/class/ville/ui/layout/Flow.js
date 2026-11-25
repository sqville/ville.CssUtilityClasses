/**
 * Standards-Backed Wrapping Flow Layout (`ville.ui.layout.Flow` — `STRAT-LAYOUT-01`).
 *
 * Implements Qooxdoo's `qx.ui.layout.Flow` API (`spacingX`, `spacingY`, `alignX`,
 * `alignY`, `reversed`) directly on top of native CSS Flexbox with `flex-wrap: wrap`.
 */
qx.Class.define("ville.ui.layout.Flow", {
  extend: ville.ui.layout.Abstract,

  /**
   * @param {number|string} [spacingX=0] Horizontal gap between items.
   * @param {number|string} [spacingY=0] Vertical gap between wrapped rows.
   * @param {"left"|"center"|"right"} [alignX="left"] Horizontal line alignment.
   */
  construct(spacingX = 0, spacingY = 0, alignX = "left") {
    // @ts-ignore
    super();

    if (spacingX) {
      this.setSpacingX(spacingX);
    }
    if (spacingY) {
      this.setSpacingY(spacingY);
    }
    if (alignX) {
      this.setAlignX(alignX);
    }
  },

  properties: {
    /** Horizontal gap between flow items (`column-gap`). */
    spacingX: {
      init: 0,
      apply: "_applyFlowStyles"
    },

    /** Vertical gap between wrapped lines (`row-gap`). */
    spacingY: {
      init: 0,
      apply: "_applyFlowStyles"
    },

    /** Horizontal `justify-content` alignment (`"left"`, `"center"`, `"right"`). */
    alignX: {
      check: ["left", "center", "right"],
      init: "left",
      apply: "_applyFlowStyles"
    },

    /** Vertical `align-items` alignment (`"top"`, `"middle"`, `"bottom"`, `"baseline"`). */
    alignY: {
      check: ["top", "middle", "bottom", "baseline"],
      init: "top",
      apply: "_applyFlowStyles"
    },

    /** Whether items flow in reverse horizontal order (`row-reverse`). */
    reversed: {
      check: "Boolean",
      init: false,
      apply: "_applyFlowStyles"
    }
  },

  members: {
    /**
     * @protected
     */
    _applyFlowStyles() {
      const widget = this._getWidget();
      if (widget) {
        this._applyContainerStyles(widget);
        ville.ui.core.Widget.scheduleFlush();
      }
    },

    // overridden
    _applyContainerStyles(widget) {
      const justifyMap = {
        left: "flex-start",
        center: "center",
        right: "flex-end"
      };
      const alignMap = {
        top: "flex-start",
        middle: "center",
        bottom: "flex-end",
        baseline: "baseline"
      };

      const sx = this.getSpacingX();
      const sy = this.getSpacingY();
      widget.getContentElement().setStyles({
        display: "flex",
        "flex-wrap": "wrap",
        "flex-direction": this.getReversed() ? "row-reverse" : "row",
        "justify-content": justifyMap[this.getAlignX()] || "flex-start",
        "align-items": alignMap[this.getAlignY()] || "flex-start",
        "column-gap":
          sx !== 0 && sx !== null
            ? ville.ui.core.Widget.formatCssDimension(sx)
            : null,
        "row-gap":
          sy !== 0 && sy !== null
            ? ville.ui.core.Widget.formatCssDimension(sy)
            : null
      });
    },

    // overridden
    _disconnectContainerStyles(widget) {
      widget.getContentElement().setStyles({
        display: null,
        "flex-wrap": null,
        "flex-direction": null,
        "justify-content": null,
        "align-items": null,
        "column-gap": null,
        "row-gap": null
      });
    }
  }
});
