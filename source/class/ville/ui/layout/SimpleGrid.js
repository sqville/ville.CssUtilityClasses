/**
 * Mode 3 SimpleGrid layout (`ville.ui.layout.SimpleGrid`).
 */
qx.Class.define("ville.ui.layout.SimpleGrid", {
  extend: ville.ui.core.Box,

  /**
   * @param {string} [component="div"] Root HTML tag name.
   */
  construct(component) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(component);
  },

  properties: {
    appearance: {
      refine: true,
      init: "simplegrid"
    }
  }
});
