/**
 * Standards-Backed Auto-Stretch Grow Layout (`ville.ui.layout.Grow` — `STRAT-LAYOUT-01`).
 *
 * Implements Qooxdoo's `qx.ui.layout.Grow` API (stretching child widgets to fill
 * 100% of the container's available width and height) directly on top of native
 * CSS Grid (`display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr)`).
 */
qx.Class.define("ville.ui.layout.Grow", {
  extend: ville.ui.layout.Abstract,

  members: {
    // overridden
    _applyContainerStyles(widget) {
      widget.getContentElement().setStyles({
        display: "grid",
        "grid-template-columns": "minmax(0, 1fr)",
        "grid-template-rows": "minmax(0, 1fr)",
        "place-items": "stretch"
      });
    },

    // overridden
    _disconnectContainerStyles(widget) {
      widget.getContentElement().setStyles({
        display: null,
        "grid-template-columns": null,
        "grid-template-rows": null,
        "place-items": null
      });
    },

    // overridden
    applyChildLayout(child) {
      child.getContentElement().setStyles({
        "grid-area": "1 / 1",
        width: "100%",
        height: "100%"
      });
    }
  }
});
