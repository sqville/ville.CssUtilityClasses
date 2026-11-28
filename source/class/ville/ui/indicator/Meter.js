/**
 * Mode 3 / Path B Semantic HTML5 `<meter>` Gauge Widget (`ville.ui.indicator.Meter` — `STRAT-CORE-06`).
 *
 * Wraps a native `<meter min="..." max="..." low="..." high="..." optimum="..." value="...">`
 * element for scalar measurements within a known range (e.g., disk usage, CPU load,
 * password strength, quota consumption).
 */
qx.Class.define("ville.ui.indicator.Meter", {
  extend: ville.ui.core.Widget,

  /**
   * @param {number} [value=0] Current gauge reading.
   * @param {number} [min=0] Minimum bound.
   * @param {number} [max=100] Maximum bound.
   */
  construct(value = 0, min = 0, max = 100) {
    // @ts-ignore
    super();

    this.setMinimum(min);
    this.setMaximum(max);
    this.setValue(value);
  },

  properties: {
    appearance: {
      refine: true,
      init: "meter"
    },

    /** Current gauge measurement (`value` attribute). */
    value: {
      check: "Number",
      init: 0,
      apply: "_applyValue",
      event: "changeValue"
    },

    /** Lower bound of the range (`min` attribute). */
    minimum: {
      check: "Number",
      init: 0,
      apply: "_applyMinimum"
    },

    /** Upper bound of the range (`max` attribute). */
    maximum: {
      check: "Number",
      init: 100,
      apply: "_applyMaximum"
    },

    /** Upper bound of the low range (`low` attribute). */
    low: {
      check: "Number",
      nullable: true,
      init: null,
      apply: "_applyLow"
    },

    /** Lower bound of the high range (`high` attribute). */
    high: {
      check: "Number",
      nullable: true,
      init: null,
      apply: "_applyHigh"
    },

    /** Optimal value within the range (`optimum` attribute). */
    optimum: {
      check: "Number",
      nullable: true,
      init: null,
      apply: "_applyOptimum"
    }
  },

  members: {
    /**
     * @override
     * @returns {ville.html.Element}
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element("meter");
    },

    _applyValue(value) {
      this._setAttribute("value", value != null ? String(value) : "0");
    },

    _applyMinimum(value) {
      this._setAttribute("min", value != null ? String(value) : "0");
    },

    _applyMaximum(value) {
      this._setAttribute("max", value != null ? String(value) : "100");
    },

    _applyLow(value) {
      this._setAttribute("low", value != null ? String(value) : null);
    },

    _applyHigh(value) {
      this._setAttribute("high", value != null ? String(value) : null);
    },

    _applyOptimum(value) {
      this._setAttribute("optimum", value != null ? String(value) : null);
    }
  }
});
