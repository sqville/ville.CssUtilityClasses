qx.Mixin.define("ville.cssuc.MWidget",
{ 
  properties :
  {
    cssUtilityClass: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyCssUtilityClass",
      themeable: true
    },

    cssInlineStyles: {
      check: "Map",
      nullable: true,
      init: null,
      apply: "_applyCssInlineStyles",
      themeable: true
    },

    cssDataAttributes: {
      check: "Map",
      nullable: true,
      init: null,
      apply: "_applyDataAttributes",
      themeable: true
    },

    excludeInlineStyles: {
      check: "Array",
      nullable: true,
      init: null,
      apply: "_applyExcludeInlineStyles",
      themeable: true
    },

    clearAllInlineStyles: {
      check: "Boolean",
      init: false,
      apply: "_applyClearAllInlineStyles",
      themeable: true
    },

    removeCssClasses: {
      check: "Array",
      nullable: true,
      init: null,
      apply: "_applyRemoveCssClasses",
      themeable: true
    }
  },

  members: {

    // property apply
    _applyCssUtilityClass(value, old) {
      var content = this.getContentElement();
      if (old) {
        content.removeClass(old);
      }
      if (value) {
        content.addClass(value);
      }
    },

    // property apply
    _applyCssInlineStyles(value, old) {
      if (value) {
        this.getContentElement().setStyles(value, true);
      }
    },

    // property apply
    _applyCssDataAttributes(value, old) {
      if (value) {
        this.getContentElement().setAttributes(value, true);
      }
    },

    // property apply
    _applyExcludeInlineStyles(value, old) {
      if (value) {
        var elem = this.getContentElement();
        for (const style of value) {
          elem.removeStyle(style, true);
        }
      }
      
    },

    // property apply
    _applyClearAllInlineStyles(value, old) {
      if (value) {
        var elem = this.getContentElement();
        var elemstyles = elem.getAllStyles();
        for (const style in elemstyles) {
          elem.removeStyle(style, true);
        }
      }
    },
    
    // property apply
    _applyRemoveCssClasses(value, old) {
      var elem = this.getContentElement();
      for (const qxcssclass of value) {
        elem.removeClass(qxcssclass, true);
      }
    },

    addClass(classname) {
      this.getContentElement().addClass(classname);
    },

    removeClass(classname) {
      this.getContentElement().removeClass(classname);
    },

    // API - bubble up Style/Attributes
    setStyle(style, value, direct) {
      this.getContentElement().setStyle(style, value, direct);
    },

    // API - bubble up Style/Attributes
    getStyle(style, value) {
      this.getContentElement().getStyle(style, value);
    },

    // API - bubble up Style/Attributes
    setStyles(styles, direct) {
      this.getContentElement().setStyles(styles, direct);
    },

    removeStyle(style) {
      this.getContentElement().removeStyle(style);
    },

    setAttribute(attribute, value, direct) {
      this.getContentElement().setAttribute(attribute, value, direct);
    },

    getAttribute(attribute, value) {
      this.getContentElement().getAttribute(attribute, value);
    },

    setAttributes(attributes, direct) {
      this.getContentElement().setAttributes(attributes, direct);
    },

    removeAttribute(attribute, direct) {
      this.getContentElement().removeAttribute(attribute, direct);
    }
  }
});