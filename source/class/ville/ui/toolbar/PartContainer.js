/**
 * The container used by `{ville.ui.toolbar.Part}` to store the actual toolbar buttons.
 */
qx.Class.define("ville.ui.toolbar.PartContainer", {
  extend: ville.ui.core.Box,

  construct() {
    super(new ville.ui.layout.HBox());
    this.setAlignY("middle");
  },

  events: {
    /** Fired whenever a child is added or removed */
    changeChildren: "qx.event.type.Event"
  },

  properties: {
    appearance: {
      refine: true,
      init: "toolbar/part/container"
    },

    show: {
      init: "both",
      check: ["both", "label", "icon"],
      inheritable: true,
      event: "changeShow"
    }
  },

  members: {
    _afterAddChild(child) {
      this.fireEvent("changeChildren");
    },

    _afterRemoveChild(child) {
      this.fireEvent("changeChildren");
    }
  }
});
