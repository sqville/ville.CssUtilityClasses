qx.Mixin.define("ville.ui.core.MWidget",
{
  members: {

    addClass(classname) {
      this.getContentElement().addClass(classname);
    },

    removeClass(classname) {
      this.getContentElement().removeClass(classname);
    },

    // API - bubble up Style/Attributes
    setStyle(style, value) {
      this.getContentElement().setStyle(style, value);
    },

    // API - bubble up Style/Attributes
    getStyle(style, value) {
      this.getContentElement().getStyle(style, value);
    },

    // API - bubble up Style/Attributes
    setStyles(styles) {
      this.getContentElement().setStyles(styles);
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