/**
 * Standards-Backed Vertical Box Layout (`ville.ui.layout.VBox` — `STRAT-LAYOUT-01`).
 *
 * Implements Qooxdoo's `qx.ui.layout.VBox` API (`spacing`, `alignX`, `alignY`,
 * `reversed`, and per-child `{ flex, height, width, alignX }`) directly on top of
 * the browser's C++ CSS Flexible Box Layout engine (`display: flex; flex-direction: column`).
 */
qx.Class.define("ville.ui.layout.VBox", {
  extend: ville.ui.layout.Abstract,

  /**
   * @param {number|string} [spacing=0] Vertical gap between children (in px or theme token `"xs".."xl"`).
   * @param {"top"|"middle"|"bottom"|"space-between"|"space-around"} [alignY="top"] Vertical distribution of children.
   */
  construct(spacing = 0, alignY = "top") {
    // @ts-ignore
    super();

    if (spacing) {
      this.setSpacing(spacing);
    }
    if (alignY) {
      this.setAlignY(alignY);
    }
  },

  properties: {
    /** Vertical gap between children (`number` in px, theme token `"xs".."xl"`, or CSS length). */
    spacing: {
      init: 0,
      apply: "_applyLayoutChange"
    },

    /** Vertical `justify-content` distribution (`"top"`, `"middle"`, `"bottom"`, `"space-between"`, `"space-around"`). */
    alignY: {
      check: ["top", "middle", "bottom", "space-between", "space-around"],
      init: "top",
      apply: "_applyLayoutChange"
    },

    /** Horizontal `align-items` alignment (`"left"`, `"center"`, `"right"`, `"stretch"`). */
    alignX: {
      check: ["left", "center", "right", "stretch"],
      init: "stretch",
      apply: "_applyLayoutChange"
    },

    /** Whether child display order is reversed (`flex-direction: column-reverse`). */
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
        top: "flex-start",
        middle: "center",
        bottom: "flex-end",
        "space-between": "space-between",
        "space-around": "space-around"
      };
      const alignMap = {
        left: "flex-start",
        center: "center",
        right: "flex-end",
        stretch: "stretch"
      };

      const spacing = this.getSpacing();
      widget.getContentElement().setStyles({
        display: "flex",
        "flex-direction": this.getReversed() ? "column-reverse" : "column",
        "justify-content": justifyMap[this.getAlignY()] || "flex-start",
        "align-items": alignMap[this.getAlignX()] || "stretch",
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
        left: "flex-start",
        center: "center",
        right: "flex-end"
      };

      const flex = options.flex;
      const shrink = child.getAllowShrinkY() ? 1 : 0;
      if (flex !== undefined && flex !== null) {
        el.setStyle("flex", `${flex} ${shrink} 0%`);
      } else if (!child.getAllowGrowY()) {
        el.setStyle("flex", `0 ${shrink} auto`);
      }

      if (options.height !== undefined && options.height !== null) {
        el.setStyle(
          "height",
          ville.ui.core.Widget.formatCssDimension(options.height)
        );
      }

      const childAlignX = options.alignX || child.getAlignX();
      if (childAlignX && alignSelfMap[childAlignX]) {
        el.setStyle("align-self", alignSelfMap[childAlignX]);
      } else if (!child.getAllowGrowX() && this.getAlignX() === "stretch") {
        el.setStyle("align-self", "flex-start");
      } else {
        el.setStyle("align-self", null);
      }
    }
  }
});
