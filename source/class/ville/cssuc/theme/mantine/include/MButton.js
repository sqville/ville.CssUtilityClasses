/**
 * Patch for ville.ui.Button to handle Mantine CSS file injection.
 * (Asset hints and CSS class application are handled externally).
 * @require(ville.ui.util.CssRegistry)
 */
qx.Mixin.define("ville.cssuc.theme.mantine.include.MButton", {

  construct() {
    // Executes immediately after the host widget's native constructor finishes.
    ville.ui.util.CssRegistry.load(this._mantineCss);
  },

  members: {

    _mantineCss : "mantine/core/styles/Button.css",

    // overridden
    _applyEnabled(value, old) {
      super._applyEnabled(value, old);
      if (value === false) {
        // villeui-mantine attriubute setting
        this.getContentElement().setAttribute("data-disabled", true);
        this.getContentElement().removeClass("mantine-active");
      } else {
        // villeui-mantine attriubute setting
        this.getContentElement().removeAttribute("data-disabled");
        this.getContentElement().addClass("mantine-active");
      }
    }
  }
});
