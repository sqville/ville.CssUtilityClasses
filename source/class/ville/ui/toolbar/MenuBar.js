/**
 * A MenuBar is a specialized `{ville.ui.toolbar.ToolBar}` with `role="menubar"`.
 */
qx.Class.define("ville.ui.toolbar.MenuBar", {
  extend: ville.ui.toolbar.ToolBar,

  construct() {
    super();
    this.setAttribute("role", "menubar");
  },

  properties: {
    appearance: {
      refine: true,
      init: "menubar"
    }
  }
});
