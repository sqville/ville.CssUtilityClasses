/**
 * 
 */
qx.Mixin.define("ville.cssuc.MButton",
{ 
  members: {

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