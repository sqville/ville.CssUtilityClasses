qx.Mixin.define("ville.ui.core.MWidget",
{      
  properties:{
    
    component: {
      check: "String",
      init: "div",
      themeable: false,
      nullable: false,
      apply: "_applyComponent"
    }

  },

  members: {

    __componenttag: null,

    // property apply
    _applyComponent(value, old) {
      var content = this.getContentElement();
      if (old) {
        content.removeClass(old);
      }
      if (value) {
        content.addClass(value);
      }
      //this.getContentElement().setCssClass(value);
    }
  }
});