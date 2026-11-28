/**
 * A toolbar button that opens an attached `{ville.ui.menu.Menu}`.
 */
qx.Class.define("ville.ui.toolbar.MenuButton", {
  extend: ville.ui.form.MenuButton,

  properties: {
    appearance: {
      refine: true,
      init: "toolbar-menubutton"
    },

    show: {
      refine: true,
      init: "both"
    },

    focusable: {
      refine: true,
      init: false
    },

    /** Whether a dropdown arrow indicator is displayed */
    showArrow: {
      check: "Boolean",
      init: true,
      themeable: true
    }
  }
});
