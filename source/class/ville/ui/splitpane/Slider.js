/**
 * Ghost slider indicator used when `{ville.ui.splitpane.Pane}` is dragged in non-live mode.
 */
qx.Class.define("ville.ui.splitpane.Slider", {
  extend: ville.ui.core.Widget,

  properties: {
    appearance: {
      refine: true,
      init: "splitpane/slider"
    },

    allowGrowX: {
      refine: true,
      init: false
    },

    allowGrowY: {
      refine: true,
      init: false
    }
  }
});
