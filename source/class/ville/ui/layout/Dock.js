/**
 * Standards-Backed Dock Layout (`ville.ui.layout.Dock` — `STRAT-LAYOUT-01`).
 *
 * Implements Qooxdoo's `qx.ui.layout.Dock` API (`spacingX`, `spacingY`, and per-child
 * `{ edge: "north" | "south" | "west" | "east" | "center", width, height }`) directly
 * on top of native CSS Grid Template Areas (`grid-template-areas`).
 */
qx.Class.define("ville.ui.layout.Dock", {
  extend: ville.ui.layout.Abstract,

  /**
   * @param {number|string} [spacingY=0] Vertical gap between docked regions.
   * @param {number|string} [spacingX=0] Horizontal gap between docked regions.
   */
  construct(spacingY = 0, spacingX = 0) {
    // @ts-ignore
    super();

    if (spacingY) {
      this.setSpacingY(spacingY);
    }
    if (spacingX) {
      this.setSpacingX(spacingX);
    }
  },

  properties: {
    /** Horizontal gap between west, center, and east regions. */
    spacingX: {
      init: 0,
      apply: "_applyDockLayout"
    },

    /** Vertical gap between north, middle, and south regions. */
    spacingY: {
      init: 0,
      apply: "_applyDockLayout"
    },

    /** Sorting mode (`"auto"`, `"y"`, `"x"`) determining corner priority. */
    sort: {
      check: ["auto", "y", "x"],
      init: "auto",
      apply: "_applyDockLayout"
    }
  },

  members: {
    /**
     * @protected
     */
    _applyDockLayout() {
      const widget = this._getWidget();
      if (widget) {
        this._applyContainerStyles(widget);
        ville.ui.core.Widget.scheduleFlush();
      }
    },

    // overridden
    _applyContainerStyles(widget) {
      const sort = this.getSort();
      const areas =
        sort === "x"
          ? '"west north east" "west center east" "west south east"'
          : '"north north north" "west center east" "south south south"';

      const sx = this.getSpacingX();
      const sy = this.getSpacingY();
      widget.getContentElement().setStyles({
        display: "grid",
        "grid-template-areas": areas,
        "grid-template-columns": "auto minmax(0, 1fr) auto",
        "grid-template-rows": "auto minmax(0, 1fr) auto",
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
        "grid-template-areas": null,
        "grid-template-columns": null,
        "grid-template-rows": null,
        "column-gap": null,
        "row-gap": null
      });
    },

    // overridden
    applyChildLayout(child, options = {}) {
      const edge = options.edge || "center";
      const validEdges = {
        north: "north",
        south: "south",
        west: "west",
        east: "east",
        center: "center"
      };
      const el = child.getContentElement();
      el.setStyle("grid-area", validEdges[edge] || "center");

      if (options.width != null) {
        el.setStyle("width", ville.ui.core.Widget.formatCssDimension(options.width));
      }
      if (options.height != null) {
        el.setStyle("height", ville.ui.core.Widget.formatCssDimension(options.height));
      }
    }
  }
});
