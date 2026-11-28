/**
 * Mode 3 / Path B Native Date Input Widget (`ville.ui.form.DateField` — `STRAT-WIDGET-06`, `STRAT-CORE-06`).
 *
 * Wraps a semantic `<input type="date">` via `ville.ui.form.core.Input` with
 * bidirectional ISO date string (`"YYYY-MM-DD"`) and `Date` object support
 * (`getDateValue()` / `setDateValue()`).
 */
qx.Class.define("ville.ui.form.DateField", {
  extend: ville.ui.form.core.Input,
  include: [ville.ui.form.MForm],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.IDateForm,
    ville.ui.form.IStringForm,
    ville.ui.form.IForm
  ],

  /**
   * @param {string|Date|null} [value] Optional initial ISO date string (`"YYYY-MM-DD"`) or `Date`.
   */
  construct(value) {
    // @ts-ignore
    super("date");

    if (value instanceof Date) {
      this.setDateValue(value);
    } else if (typeof value === "string") {
      this.setValue(value);
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "datefield"
    },

    /** Minimum allowed ISO date (`"YYYY-MM-DD"`). */
    minDate: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyMinDate"
    },

    /** Maximum allowed ISO date (`"YYYY-MM-DD"`). */
    maxDate: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyMaxDate"
    }
  },

  members: {
    /**
     * Formats a JavaScript `Date` instance as an ISO `"YYYY-MM-DD"` string.
     *
     * @param {Date|null} date
     * @returns {string}
     */
    formatIsoDate(date) {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return "";
      }
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    },

    /**
     * Returns the current value as a JavaScript `Date` object, or `null` if empty.
     *
     * @returns {Date|null}
     */
    getDateValue() {
      const val = this.getValue();
      if (!val) {
        return null;
      }
      if (val instanceof Date) {
        return val;
      }
      const parsed = new Date(`${val}T00:00:00`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    },

    /**
     * Sets the date value from a JavaScript `Date` object or ISO `"YYYY-MM-DD"` string.
     *
     * @param {Date|string|null} dateOrIso
     */
    setDateValue(dateOrIso) {
      if (dateOrIso instanceof Date) {
        super.setValue(this.formatIsoDate(dateOrIso));
      } else {
        super.setValue(dateOrIso ? String(dateOrIso) : "");
      }
    },

    /**
     * Overridden `setValue` to accept both `Date` instances and ISO `"YYYY-MM-DD"` strings.
     *
     * @param {Date|string|null} value
     */
    setValue(value) {
      if (value instanceof Date) {
        return super.setValue(this.formatIsoDate(value));
      }
      return super.setValue(value != null ? String(value) : "");
    },

    /**
     * Opens the browser's native date picker (`HTMLInputElement.prototype.showPicker()`).
     */
    showPicker() {
      const domEl = /** @type {HTMLInputElement|null} */ (
        this._ensureDomElement()
      );
      if (domEl && typeof domEl.showPicker === "function") {
        try {
          domEl.showPicker();
        } catch (_) {}
      }
    },

    _applyMinDate(value) {
      this._setAttribute("min", value || null);
    },

    _applyMaxDate(value) {
      this._setAttribute("max", value || null);
    }
  }
});
