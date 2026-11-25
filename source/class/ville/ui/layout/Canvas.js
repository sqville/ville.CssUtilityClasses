/**
 * Standards-Backed Canvas / Freeform Positioned Layout (`ville.ui.layout.Canvas` — `STRAT-LAYOUT-01`).
 *
 * Implements Qooxdoo's `qx.ui.layout.Canvas` API (`{ left, top, right, bottom, width, height, edge }`)
 * directly on top of native CSS Positioned Layout (`position: relative` container with
 * `position: absolute` children supporting pixel numbers, percentages `"50%"`, and `edge`).
 */
qx.Class.define("ville.ui.layout.Canvas", {
  extend: ville.ui.layout.Abstract,

  members: {
    // overridden
    _applyContainerStyles(widget) {
      widget.getContentElement().setStyle("position", "relative");
    },

    // overridden
    _disconnectContainerStyles(widget) {
      widget.getContentElement().setStyle("position", null);
    },

    // overridden
    applyChildLayout(child, options = {}) {
      const el = child.getContentElement();
      el.setStyle("position", "absolute");

      if (options.edge !== undefined && options.edge !== null) {
        const edgeVal = ville.ui.core.Widget.formatCssDimension(options.edge);
        el.setStyle("inset", edgeVal);
      }

      if (options.left !== undefined) {
        el.setStyle("left", ville.ui.core.Widget.formatCssDimension(options.left));
      }
      if (options.top !== undefined) {
        el.setStyle("top", ville.ui.core.Widget.formatCssDimension(options.top));
      }
      if (options.right !== undefined) {
        el.setStyle("right", ville.ui.core.Widget.formatCssDimension(options.right));
      }
      if (options.bottom !== undefined) {
        el.setStyle("bottom", ville.ui.core.Widget.formatCssDimension(options.bottom));
      }
      if (options.width !== undefined) {
        el.setStyle("width", ville.ui.core.Widget.formatCssDimension(options.width));
      }
      if (options.height !== undefined) {
        el.setStyle("height", ville.ui.core.Widget.formatCssDimension(options.height));
      }
    }
  }
});
