/**
 * Mode 3 / Path B Number Input / Spinner Widget (`ville.ui.form.Spinner` — `STRAT-WIDGET-06`, `STRAT-CORE-06`).
 *
 * Extends `ville.ui.form.core.Input` (`<input type="number">`) with native
 * `min`, `max`, `step`, `stepUp()`, `stepDown()`, and numeric `value` coercion.
 */
qx.Class.define("ville.ui.form.Spinner", {
  extend: ville.ui.form.core.Input,
  include: [ville.ui.form.MForm],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.INumberForm,
    ville.ui.form.IForm,
    ville.ui.form.IRange
  ],

  /**
   * @param {number} [min=0] Minimum allowed value.
   * @param {number} [value=0] Initial numeric value.
   * @param {number} [max=100] Maximum allowed value.
   */
  construct(min, value, max) {
    // @ts-ignore
    super("number");

    if (min !== undefined && min !== null) {
      this.setMinimum(min);
    } else {
      this.initMinimum();
    }

    if (max !== undefined && max !== null) {
      this.setMaximum(max);
    } else {
      this.initMaximum();
    }

    this.initSingleStep();

    if (value !== undefined && value !== null) {
      this.setValue(Number(value));
    } else {
      this.setValue(this.getMinimum());
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "spinner"
    },

    /** Minimum allowed number (`min` HTML attribute). */
    minimum: {
      check: "Number",
      init: 0,
      apply: "_applyMinimum",
      event: "changeMinimum"
    },

    /** Maximum allowed number (`max` HTML attribute). */
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

    /** Page Up / Page Down increment step. */
    pageStep: {
      check: "Number",
      init: 10
    }
  },

  members: {
    /**
     * Increments the value by `singleStep` (clamped to `maximum`).
     */
    stepUp() {
      const current = Number(this.getValue() ?? this.getMinimum());
      const next = Math.min(this.getMaximum(), current + this.getSingleStep());
      this.setValue(next);
    },

    /**
     * Decrements the value by `singleStep` (clamped to `minimum`).
     */
    stepDown() {
      const current = Number(this.getValue() ?? this.getMinimum());
      const next = Math.max(this.getMinimum(), current - this.getSingleStep());
      this.setValue(next);
    },

    /**
     * @override
     * @param {number|string|null} value
     * @protected
     */
    _applyValue(value) {
      const num =
        value === null || value === undefined || value === ""
          ? null
          : Number(value);
      super._applyValue(num !== null && !Number.isNaN(num) ? String(num) : "");
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
