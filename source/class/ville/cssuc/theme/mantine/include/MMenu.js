/**
 * Patch for ville.ui.Button to handle Mantine CSS file injection.
 * (Asset hints and CSS class application are handled externally).
 * @require(ville.ui.util.CssRegistry)
 */
qx.Mixin.define("ville.cssuc.theme.mantine.include.MMenu", {

  construct() {
    // Executes immediately after the host widget's native constructor finishes.
    ville.ui.util.CssRegistry.load(this._mantineCss);
  },

  members: {

    _mantineCss : "mantine/core/styles/Menu.css"

  }
});
