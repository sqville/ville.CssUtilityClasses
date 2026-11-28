/**
 * The Resizer is a resizable container widget built on `ville.ui.core.Box`
 * and `ville.ui.core.MResizable`.
 */
qx.Class.define("ville.ui.container.Resizer", {
  extend: ville.ui.core.Box,
  include: [ville.ui.core.MResizable],

  properties: {
    appearance: {
      refine: true,
      init: "resizer"
    }
  }
});
