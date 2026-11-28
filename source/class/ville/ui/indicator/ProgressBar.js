/**
 * Mode 3 / Path B Semantic HTML5 `<progress>` Widget (`ville.ui.indicator.ProgressBar` — `STRAT-CORE-06`).
 *
 * Replaces legacy `qx.ui.indicator.ProgressBar` (which nested `Composite` + `Canvas`
 * divs and calculated percentages in JS) with a single native `<progress>` element.
 * When `value` is `null`, the `<progress>` element automatically enters the native
 * browser `:indeterminate` animation state.
 */
qx.Class.define("ville.ui.indicator.ProgressBar", {
  extend: ville.ui.core.Widget,

  /**
   * @param {number|null} [value=0] Current progress value (or `null` for indeterminate).
   * @param {number} [maximum=100] Maximum progress value.
   */
  construct(value = 0, maximum = 100) {
    // @ts-ignore
    super();

    this.initSize();
    this.initRadius();

    if (maximum !== undefined && maximum !== null) {
      this.setMaximum(maximum);
    } else {
      this.initMaximum();
    }

    if (value !== undefined) {
      this.setValue(value);
    } else {
      this.initValue();
    }
  },

  events: {
    /** Fired when `value === maximum`. */
    complete: "qx.event.type.Event",

    /** Fired when the completion percentage (0..100) changes. */
    change: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "progressbar"
    },

    /** Maximum value (`max` attribute on `<progress>`). */
    maximum: {
      check: "Number",
      init: 100,
      apply: "_applyMaximum",
      event: "changeMaximum"
    },

    /** Current value (`value` attribute on `<progress>`, or `null` for indeterminate). */
    value: {
      check: "Number",
      nullable: true,
      init: 0,
      apply: "_applyValue",
      event: "changeValue"
    },

    /** Thickness scale (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`). */
    size: {
      check: ["xs", "sm", "md", "lg", "xl"],
      init: "md",
      themeable: true,
      apply: "_applySize",
      event: "changeSize"
    },

    /** Border radius scale (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`). */
    radius: {
      check: ["xs", "sm", "md", "lg", "xl"],
      init: "md",
      themeable: true,
      apply: "_applyRadius",
      event: "changeRadius"
    }
  },

  members: {
    /**
     * @override
     * @returns {ville.html.Element}
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element("progress");
    },

    _applyMaximum(value) {
      const max = typeof value === "number" && value > 0 ? value : 100;
      this._setAttribute("max", String(max));
    },

    _applyValue(value, old) {
      if (value === null || value === undefined) {
        this._setAttribute("value", null);
        this.addState("indeterminate");
        return;
      }
      this.removeState("indeterminate");
      const max = this.getMaximum() || 100;
      const clamped = Math.max(0, Math.min(max, Number(value)));
      this._setAttribute("value", String(clamped));

      const pct = Math.round((clamped / max) * 100);
      const oldPct =
        old != null ? Math.round((Math.max(0, Math.min(max, Number(old))) / max) * 100) : 0;
      if (pct !== oldPct) {
        this.fireDataEvent("change", pct, oldPct);
      }
      if (clamped >= max) {
        this.fireEvent("complete");
      }
    },

    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    _applyRadius(value, old) {
      this._syncModifierState("radius", value, old);
    }
  }
});
