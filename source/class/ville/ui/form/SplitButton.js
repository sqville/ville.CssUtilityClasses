/**
 * A SplitButton combines a primary action button and a dropdown arrow button
 * that opens an attached `{ville.ui.menu.Menu}`.
 *
 * @childControl button {ville.ui.form.Button} Primary action button
 * @childControl arrow {ville.ui.form.MenuButton} Menu trigger arrow button
 */
qx.Class.define("ville.ui.form.SplitButton", {
  extend: ville.ui.core.Box,
  implement: [ville.ui.form.IExecutable],

  /**
   * @param label {String?null} Button label
   * @param icon {String?null} Optional icon spec
   * @param menu {ville.ui.menu.Menu?null} Optional menu instance
   * @param command {ville.ui.command.Command?null} Optional command for the primary button
   */
  construct(label, icon, menu, command) {
    super(new ville.ui.layout.HBox(0));

    this._createChildControl("button");
    this._createChildControl("arrow");

    if (label != null) {
      this.setLabel(label);
    }
    if (icon != null) {
      this.setIcon(icon);
    }
    if (menu != null) {
      this.setMenu(menu);
    }
    if (command != null) {
      this.setCommand(command);
    }
  },

  events: {
    /** Fired when the primary button is executed */
    execute: "qx.event.type.Event"
  },

  properties: {
    appearance: {
      refine: true,
      init: "splitbutton"
    },

    /** Label of the primary action button */
    label: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyLabel"
    },

    /** Icon of the primary action button */
    icon: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyIcon"
    },

    /** Attached dropdown menu */
    menu: {
      check: "ville.ui.menu.Menu",
      nullable: true,
      init: null,
      apply: "_applyMenu"
    },

    /** Display mode (`"both"`, `"label"`, `"icon"`) */
    show: {
      check: ["both", "label", "icon"],
      init: "both",
      inheritable: true,
      apply: "_applyShow"
    },

    /** Attached command for the primary button */
    command: {
      check: "ville.ui.command.Command",
      nullable: true,
      init: null,
      apply: "_applyCommand"
    }
  },

  members: {
    _createChildControlImpl(id) {
      let control;

      switch (id) {
        case "button":
          control = new ville.ui.form.Button();
          control.addListener("execute", () => this.fireEvent("execute"));
          this._addAt(control, 0, { flex: 1 });
          break;

        case "arrow":
          control = new ville.ui.form.MenuButton("▾");
          this._addAt(control, 1);
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    _applyLabel(value) {
      this.getChildControl("button").setLabel(value);
    },

    _applyIcon(value) {
      this.getChildControl("button").setIcon(value);
    },

    _applyMenu(value) {
      this.getChildControl("arrow").setMenu(value);
    },

    _applyShow(value) {
      const btn = this.getChildControl("button");
      if (typeof btn.setShow === "function") {
        btn.setShow(value);
      }
    },

    _applyCommand(value) {
      this.getChildControl("button").setCommand(value);
    },

    /**
     * Executes the primary button action.
     */
    execute() {
      this.getChildControl("button").execute();
    }
  }
});
