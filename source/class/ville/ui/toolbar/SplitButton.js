/**
 * A two-part toolbar button consisting of an action button and an arrow dropdown button
 * that opens an attached `{ville.ui.menu.Menu}`.
 */
qx.Class.define("ville.ui.toolbar.SplitButton", {
  extend: ville.ui.form.SplitButton,

  properties: {
    appearance: {
      refine: true,
      init: "toolbar-splitbutton"
    },

    show: {
      refine: true,
      init: "both"
    },

    focusable: {
      refine: true,
      init: false
    }
  }
});
