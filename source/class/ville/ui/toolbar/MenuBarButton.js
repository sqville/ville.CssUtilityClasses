/**
 * A MenuBar button inside a `{ville.ui.toolbar.MenuBar}`.
 */
qx.Class.define("ville.ui.toolbar.MenuBarButton", {
  extend: ville.ui.toolbar.MenuButton,

  properties: {
    appearance: {
      refine: true,
      init: "menubar-button"
    },

    showArrow: {
      refine: true,
      init: false
    }
  }
});
