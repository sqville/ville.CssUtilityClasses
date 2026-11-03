qx.Mixin.define("ville.cssuc.patch.MLayoutItem",
{      
  properties :
  {
    bypassRenderLayout: {
      check: "Boolean",
      init: true,
      themeable: true
    },
    
    excludeBoundsFromDom: {
      check: "Boolean",
      init: true,
      themeable: true
    },

    excludeBoundsFromDomMods: {
      check: "Array",
      nullable: true,
      init: null,
      themeable: true
    }
  },

  members :
  {
    renderLayout(left, top, width, height) {
      return null;
    },

    scheduleLayoutUpdate() {}
  }
});