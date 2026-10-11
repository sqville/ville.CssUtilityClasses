qx.Mixin.define("qxapp.MImage",
{

  properties: {
    /** Any text string which can contain HTML, too */
    html: {
      check: "String",
      apply: "_applyHtml",
      themeable: true,
      nullable: true
    },

    /**
     * The color of the rendered icon/image.
     */
    color :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColor",
      event : "changeColor",
      themeable : true,
      inheritable : true
    },

    clipPath :
    {
      check: "String",
      apply: "_applyClipPath",
      event: "changeClipPath",
      themeable: true,
      nullable: true
    }
  },
  
  members :
  {
    // apply only if Html property has been set since this changes the same style value used by TextColor property
    _applyColor(value) {
      if (this.getHtml()){
        var el = this.getContentElement();
        if (this.__wrapper) {
            el = el.getChild(0);
        }

        if (value) {
        el.setStyle(
            "color",
            qx.theme.manager.Color.getInstance().resolve(value)
        );
        } else {
            el.removeStyle("color");
        }
      }
    },

    // property apply
    _applyHtml(value, old) {
      this.getContentElement().setAttribute("html", value || "");
    },

    // property apply
    _applyClipPath(value, old) {
      this.getContentElement().setStyle("clip-path", value);
    }
  }
});