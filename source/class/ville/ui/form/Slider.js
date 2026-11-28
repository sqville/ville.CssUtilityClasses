/**
 * Mode 3 / Path B Range Slider Widget (`ville.ui.form.Slider` — `STRAT-WIDGET-06`, `STRAT-CORE-06`).
 *
 * Replaces the 30 KB legacy `qx.ui.form.Slider` (which manually computed pixel knob offsets
 * in JS) with a single semantic `<input type="range">` element via `ville.ui.form.core.Input`.
 */
qx.Class.define("ville.ui.form.Slider", {
  extend: ville.ui.form.core.Input,
  include: [ville.ui.form.MForm],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.INumberForm,
    ville.ui.form.IForm,
    ville.ui.form.IRange
  ],

  /**
   * @param {"horizontal"|"vertical"|number} [minOrOrientation="horizontal"] Slider orientation or minimum value.
   * @param {number} [value=0] Initial value when `(min, value, max)` signature is used.
   * @param {number} [max=100] Maximum value when `(min, value, max)` signature is used.
   */
  construct(minOrOrientation = "horizontal", value, max) {
    // @ts-ignore
    super("range");

    if (typeof minOrOrientation === "number") {
      this.setMinimum(minOrOrientation);
      this.setMaximum(typeof max === "number" ? max : 100);
      this.initSingleStep();
      this.initOrientation();
      this.setValue(typeof value === "number" ? value : minOrOrientation);
    } else {
      this.initMinimum();
      this.initMaximum();
      this.initSingleStep();
      this.setValue(0);
      if (minOrOrientation) {
        this.setOrientation(minOrOrientation);
      } else {
        this.initOrientation();
      }
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "slider"
    },

    /** Slider orientation (`"horizontal"` or `"vertical"`). */
    orientation: {
      check: ["horizontal", "vertical"],
      init: "horizontal",
      apply: "_applyOrientation",
      event: "changeOrientation"
    },

    /** Minimum range value (`min` HTML attribute). */
    minimum: {
      check: "Number",
      init: 0,
      apply: "_applyMinimum",
      event: "changeMinimum"
    },

    /** Maximum range value (`max` HTML attribute). */
    maximum: {
      check: "Number",
      init: 100,
      apply: "_applyMaximum",
      event: "changeMaximum"
    },

    /** Step increment (`step` HTML attribute). */
    singleStep: {
      check: "Number",
      init: 1,
      apply: "_applySingleStep",
      event: "changeSingleStep"
    },

    /** Page step increment for compatibility with `IRange`. */
    pageStep: {
      check: "Number",
      init: 10,
      event: "changePageStep"
    }
  },

  members: {
    /**
     * @override
     * @param {number|string|null} value
     * @protected
     */
    _applyValue(value) {
      const num =
        value === null || value === undefined || value === ""
          ? this.getMinimum()
          : Number(value);
      super._applyValue(!Number.isNaN(num) ? String(num) : "0");
    },

    _applyOrientation(value, old) {
      this._syncModifierState("orientation", value, old);
      this._setAttribute("aria-orientation", value);
    },

    _applyMinimum(value) {
      this._setAttribute("min", value != null ? String(value) : null);
    },

    _applyMaximum(value) {
      this._setAttribute("max", value != null ? String(value) : null);
    },

    _applySingleStep(value) {
      this._setAttribute("step", value != null ? String(value) : null);
    }
  }
});
