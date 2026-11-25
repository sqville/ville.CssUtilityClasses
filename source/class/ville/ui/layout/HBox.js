/**
 * Standards-Backed Horizontal Box Layout (`ville.ui.layout.HBox` — `STRAT-LAYOUT-01`).
 *
 * Implements Qooxdoo's `qx.ui.layout.HBox` API (`spacing`, `alignX`, `alignY`,
 * `reversed`, and per-child `{ flex, width, height, alignY }`) directly on top of
 * the browser's C++ CSS Flexible Box Layout engine (`display: flex`).
 *
 * Supports both integer pixel spacing (`new HBox(12)`) and semantic theme tokens
 * (`new HBox("md")`).
 */
qx.Class.define("ville.ui.layout.HBox", {
  extend: ville.ui.layout.Abstract,

  /**
   * @param {number|string} [spacing=0] Horizontal gap between children (in px or theme token `"xs".."xl"`).
   * @param {"left"|"center"|"right"|"space-between"|"space-around"} [alignX="left"] Horizontal distribution of children.
   */
  construct(spacing = 0, alignX = "left") {
    // @ts-ignore
    super();

    if (spacing) {
      this.setSpacing(spacing);
    }
    if (alignX) {
      this.setAlignX(alignX);
    }
  },

  properties: {
    /** Horizontal gap between children (`number` in px, theme token `"xs".."xl"`, or CSS length). */
    spacing: {
      init: 0,
      apply: "_applyLayoutChange"
    },

    /** Horizontal `justify-content` alignment (`"left"`, `"center"`, `"right"`, `"space-between"`, `"space-around"`). */
    alignX: {
      check: ["left", "center", "right", "space-between", "space-around"],
      init: "left",
      apply: "_applyLayoutChange"
    },

    /** Vertical `align-items` alignment (`"top"`, `"middle"`, `"bottom"`, `"baseline"`, `"stretch"`). */
    alignY: {
      check: ["top", "middle", "bottom", "baseline", "stretch"],
      init: "stretch",
      apply: "_applyLayoutChange"
    },

    /** Whether child display order is reversed (`flex-direction: row-reverse`). */
    reversed: {
      check: "Boolean",
      init: false,
      apply: "_applyLayoutChange"
    }
  },

  members: {
    /**
     * @protected
     */
    _applyLayoutChange() {
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
        right: "flex-end",
        "space-between": "space-between",
        "space-around": "space-around"
      };
      const alignMap = {
        top: "flex-start",
        middle: "center",
        bottom: "flex-end",
        baseline: "baseline",
        stretch: "stretch"
      };

      const spacing = this.getSpacing();
      widget.getContentElement().setStyles({
        display: "flex",
        "flex-direction": this.getReversed() ? "row-reverse" : "row",
        "justify-content": justifyMap[this.getAlignX()] || "flex-start",
        "align-items": alignMap[this.getAlignY()] || "stretch",
        gap:
          spacing !== 0 && spacing !== null
            ? ville.ui.core.Widget.formatCssDimension(spacing)
            : null
      });
    },

    // overridden
    _disconnectContainerStyles(widget) {
      widget.getContentElement().setStyles({
        display: null,
        "flex-direction": null,
        "justify-content": null,
        "align-items": null,
        gap: null
      });
    },

    // overridden
    applyChildLayout(child, options = {}) {
      const el = child.getContentElement();
      const alignSelfMap = {
        top: "flex-start",
        middle: "center",
        bottom: "flex-end",
        baseline: "baseline"
      };

      const flex = options.flex;
      const shrink = child.getAllowShrinkX() ? 1 : 0;
      if (flex !== undefined && flex !== null) {
        el.setStyle("flex", `${flex} ${shrink} 0%`);
      } else if (!child.getAllowGrowX()) {
        el.setStyle("flex", `0 ${shrink} auto`);
      }

      if (options.width !== undefined && options.width !== null) {
        el.setStyle(
          "width",
          ville.ui.core.Widget.formatCssDimension(options.width)
        );
      }

      const childAlignY = options.alignY || child.getAlignY();
      if (childAlignY && alignSelfMap[childAlignY]) {
        el.setStyle("align-self", alignSelfMap[childAlignY]);
      } else if (!child.getAllowGrowY() && this.getAlignY() === "stretch") {
        el.setStyle("align-self", "flex-start");
      } else {
        el.setStyle("align-self", null);
      }
    }
  }
});
