/**
 * A part is a logical subdivision of a toolbar that groups logically related buttons.
 *
 * @childControl handle {ville.ui.core.Widget} Visual handle indicator of the toolbar part
 * @childControl container {ville.ui.toolbar.PartContainer} Holds the part's buttons
 */
qx.Class.define("ville.ui.toolbar.Part", {
  extend: ville.ui.core.Box,
  include: [ville.ui.core.MRemoteChildrenHandling],

  construct() {
    super(new ville.ui.layout.HBox());
    this.setAlignY("middle");

    this._createChildControl("handle");
    this._createChildControl("container");
  },

  properties: {
    appearance: {
      refine: true,
      init: "toolbar/part"
    },

    /** Spacing between every child of the toolbar part */
    spacing: {
      nullable: true,
      check: "Integer",
      init: 4,
      themeable: true,
      apply: "_applySpacing"
    },

    show: {
      init: "both",
      check: ["both", "label", "icon"],
      inheritable: true,
      apply: "_applyShow",
      event: "changeShow"
    }
  },

  members: {
    getChildrenContainer() {
      return this.getChildControl("container");
    },

    _createChildControlImpl(id) {
      let control;

      switch (id) {
        case "handle":
          control = new ville.ui.core.Widget();
          control.setAlignY("middle");
          this._add(control);
          break;

        case "container":
          control = new ville.ui.toolbar.PartContainer();
          this._add(control);
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    _applySpacing(value) {
      const layout = this.getChildControl("container").getLayout();
      if (layout && typeof layout.setSpacing === "function") {
        layout.setSpacing(value == null ? 0 : value);
      }
    },

    _applyShow(value) {
      this.getChildControl("container").setShow(value);
    },

    /**
     * Adds a separator to the toolbar part.
     */
    addSeparator() {
      this.add(new ville.ui.toolbar.Separator());
    },

    /**
     * Returns all nested menu buttons in this part.
     *
     * @return {ville.ui.form.MenuButton[]}
     */
    getMenuButtons() {
      const children = this.getChildren();
      const menuButtons = [];
      for (let i = 0; i < children.length; i++) {
        if (children[i] instanceof ville.ui.form.MenuButton) {
          menuButtons.push(children[i]);
        }
      }
      return menuButtons;
    }
  }
});
