qx.Mixin.define("ville.ui.core.MWidget",
{
  members: {

    addClass(classname) {
      this.getContentElement().addClass(classname);
    },

    // API - bubble up Style/Attributes
    setStyle(style, value) {
      this.getContentElement().setStyle(style, value);
    },

    // API - bubble up Style/Attributes
    setStyles(styles) {
      this.getContentElement().setStyles(styles);
    },

    removeStyle(style) {
      this.getContentElement().removeStyle(style);
    },

    setAttribute(attribute, value) {
      this.getContentElement().setAttribute(attribute, value);
    },

    setAttributes(attributes) {
      this.getContentElement().setAttributes(attributes);
    },

    removeAttribute(attribute) {
      this.getContentElement().removeAttribute(attribute);
    }
  }
});