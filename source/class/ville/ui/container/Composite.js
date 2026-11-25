/**
 * Qooxdoo-compatible generic layout container (`ville.ui.container.Composite` — `STRAT-LAYOUT-01`).
 *
 * Extends `ville.ui.core.Box` (`MChildrenHandling` + `MLayoutHandling`) so legacy
 * Qooxdoo code and new Ville UI views can instantiate `new Composite(new Grid(12, 8))`
 * or `new Composite(new HBox(10))` and call `comp.add(child, options)` with 0ms
 * JS layout-queue overhead.
 */
qx.Class.define("ville.ui.container.Composite", {
  extend: ville.ui.core.Box,

  /**
   * @param {ville.ui.layout.Abstract|string} [layout] Initial layout manager instance (or semantic tag name).
   * @param {Object<string, *>} [props] Optional initial property bag.
   */
  construct(layout, props) {
    // @ts-ignore
    super(layout, props);
  }
});
