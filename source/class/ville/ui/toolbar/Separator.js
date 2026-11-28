/**
 * A Separator used as a visual divider between items in a `{ville.ui.toolbar.ToolBar}`.
 */
qx.Class.define("ville.ui.toolbar.Separator", {
  extend: ville.ui.core.Divider,

  construct() {
    super("vertical");
  },

  properties: {
    appearance: {
      refine: true,
      init: "toolbar-separator"
    }
  }
});
