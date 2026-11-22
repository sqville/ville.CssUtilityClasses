/**
 * Mode 3 Flex container (`ville.ui.layout.Flex`).
 */
qx.Class.define("ville.ui.layout.Flex", {
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
      init: "layout-flex"
    }
  }
});
