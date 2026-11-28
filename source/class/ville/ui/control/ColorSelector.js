/**
 * Mode 3 / Path B ColorSelector & ColorPopup Controls (`ville.ui.control.ColorSelector` & `ColorPopup` — `STRAT-WIDGET-06`).
 *
 * Replaces the 39 KB legacy `qx.ui.control.ColorSelector` with a standards-first
 * native `<input type="color">` picker (`ville.ui.form.core.Input`) plus an optional
 * delegated preset swatch strip and hex readout (`getValue()` / `setValue()` returning
 * `"#rrggbb"` strings as well as `red`, `green`, `blue` integer properties for
 * legacy Qooxdoo compatibility).
 */
qx.Class.define("ville.ui.control.ColorSelector", {
  extend: ville.ui.layout.HGroup,
  include: [ville.ui.form.MForm],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.IColorForm,
    ville.ui.form.IStringForm,
    ville.ui.form.IForm
  ],

  /**
   * @param {string} [value="#228be6"] Initial hex color value (`"#rrggbb"`).
   */
  construct(value = "#228be6") {
    // @ts-ignore
    super();

    this.setGap("xs");
    this._createChildControl("color-input");
    this._createChildControl("hex-field");

    if (value) {
      this.setValue(value);
    }
  },

  events: {
    /** Fired when the user commits a color change. */
    dialogok: "qx.event.type.Event"
  },

  properties: {
    appearance: {
      refine: true,
      init: "colorselector"
    },

    /** Active hex color string (`"#rrggbb"`). */
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
      init: 34,
      apply: "_applyRgbChannel"
    },

    /** Green channel (0..255). */
    green: {
      check: "Integer",
      init: 139,
      apply: "_applyRgbChannel"
    },

    /** Blue channel (0..255). */
    blue: {
      check: "Integer",
      init: 230,
      apply: "_applyRgbChannel"
    }
  },

  members: {
    /** @type {boolean} @private */
    __syncingColor: false,

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
        case "color-input":
          control = new ville.ui.form.core.Input("color", this.getValue() || "#228be6");
          control.setWidth(36);
          control.setHeight(32);
          control.addListener("changeValue", (e) => {
            if (!this.__syncingColor) {
              this.setValue(e.getData());
            }
          });
          this.add(control);
          break;

        case "hex-field":
          control = new ville.ui.form.TextField(this.getValue() || "#228be6");
          control.setWidth(96);
          control.addListener("changeValue", (e) => {
            const val = String(e.getData() || "").trim();
            if (!this.__syncingColor && /^#[0-9a-fA-F]{6}$/.test(val)) {
              this.setValue(val.toLowerCase());
            }
          });
          this.add(control);
          break;
      }

      return control || super._createChildControlImpl(id, hash);
    },

    _applyValue(value) {
      if (this.__syncingColor) {
        return;
      }
      this.__syncingColor = true;
      try {
        const hex =
          typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)
            ? value.toLowerCase()
            : "#228be6";
        const colorInput = this.getChildControl("color-input", true);
        const hexField = this.getChildControl("hex-field", true);
        if (colorInput) {
          colorInput.setValue(hex);
        }
        if (hexField) {
          hexField.setValue(hex);
        }
        this.setRed(parseInt(hex.slice(1, 3), 16));
        this.setGreen(parseInt(hex.slice(3, 5), 16));
        this.setBlue(parseInt(hex.slice(5, 7), 16));
      } finally {
        this.__syncingColor = false;
      }
    },

    _applyRgbChannel() {
      if (this.__syncingColor) {
        return;
      }
      const toHex = (n) =>
        Math.max(0, Math.min(255, Number(n) || 0))
          .toString(16)
          .padStart(2, "0");
      const hex = `#${toHex(this.getRed())}${toHex(this.getGreen())}${toHex(this.getBlue())}`;
      this.setValue(hex);
    }
  }
});
