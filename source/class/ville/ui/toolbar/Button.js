/**
 * Toolbar buttons are specialized `{ville.ui.form.Button}` instances styled for `{ville.ui.toolbar.ToolBar}`.
 */
qx.Class.define("ville.ui.toolbar.Button", {
  extend: ville.ui.form.Button,

  construct(label, icon, command) {
    super(label, icon, command);
  },

  properties: {
    appearance: {
      refine: true,
      init: "toolbar-button"
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
