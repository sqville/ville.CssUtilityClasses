/**
 * Mode 3 / Path B Top-Layer ColorPopup Control (`ville.ui.control.ColorPopup` — `STRAT-WIDGET-06`).
 *
 * Wraps `ville.ui.control.ColorSelector` inside a Top-Layer `ville.ui.overlay.Popup`
 * (`popover="auto"`) positioned via CSS Anchor Positioning (`MPlacement`).
 */
qx.Class.define("ville.ui.control.ColorPopup", {
  extend: ville.ui.overlay.Popup,
  include: [ville.ui.form.MForm],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.IColorForm,
    ville.ui.form.IStringForm,
    ville.ui.form.IForm
  ],

  construct() {
    // @ts-ignore
    super();

    this._createChildControl("colorselector");
  },

  properties: {
    appearance: {
      refine: true,
      init: "colorpopup"
    },

    /** Active hex color value (`"#rrggbb"`). */
    value: {
      check: "String",
      nullable: true,
      init: "#228be6",
      apply: "_applyValue",
      event: "changeValue"
    },

    /** Red channel (0..255). */
    red: {
      check: "Integer",
      nullable: true,
      init: 34
    },

    /** Green channel (0..255). */
    green: {
      check: "Integer",
      nullable: true,
      init: 139
    },

    /** Blue channel (0..255). */
    blue: {
      check: "Integer",
      nullable: true,
      init: 230
    }
  },

  members: {
    /** @type {boolean} @private */
    __syncing: false,

    /**
     * @override
     * @param {string} id
     * @param {*} [hash]
     * @returns {ville.ui.core.Widget|null}
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control;

      switch (id) {
        case "colorselector":
          control = new ville.ui.control.ColorSelector(this.getValue() || "#228be6");
          control.addListener("changeValue", (e) => {
            if (!this.__syncing) {
              this.__syncing = true;
              try {
                this.setValue(e.getData());
                this.setRed(control.getRed());
                this.setGreen(control.getGreen());
                this.setBlue(control.getBlue());
              } finally {
                this.__syncing = false;
              }
            }
          });
          this.add(control);
          break;
      }

      return control || super._createChildControlImpl(id, hash);
    },

    _applyValue(value) {
      if (this.__syncing) {
        return;
      }
      const selector = this.getChildControl("colorselector", true);
      if (selector && value) {
        this.__syncing = true;
        try {
          selector.setValue(value);
          this.setRed(selector.getRed());
          this.setGreen(selector.getGreen());
          this.setBlue(selector.getBlue());
        } finally {
          this.__syncing = false;
        }
      }
    }
  }
});
