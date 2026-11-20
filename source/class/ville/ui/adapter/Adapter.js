qx.Class.define("ville.ui.adapter.Adapter", {
  extend: qx.ui.core.Widget,

  construct(pureVilleWidget) {
    super();
    this.__pureVilleWidget = pureVilleWidget;
    
    // Establish the logical hierarchy
    pureVilleWidget.setParent(this);

    // Inject the new DOM node into the legacy wrapper once it mounts
    this.addListenerOnce("appear", () => {
      this.getContentElement().add(pureVilleWidget.getContentElement());
    });
  },

  members: {
    __pureVilleWidget: null,

    getVilleWidget() {
      return this.__pureVilleWidget;
    }
  },

  destruct() {
    if (this.__pureVilleWidget) {
      this.__pureVilleWidget.dispose();
    }
  }
});
