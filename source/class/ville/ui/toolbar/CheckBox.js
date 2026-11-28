/**
 * A toggle button inside a `{ville.ui.toolbar.ToolBar}`.
 */
qx.Class.define("ville.ui.toolbar.CheckBox", {
  extend: ville.ui.form.ToggleButton,

  construct(label, icon) {
    super(label, icon);
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
