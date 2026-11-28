/**
 * Qooxdoo compatibility subclass for `ville.ui.table.model.Filtered`.
 *
 * Since `ville.ui.table.model.Simple` natively includes `filter()`, `setSearchQuery()`,
 * and `resetFilter()`, `Filtered` extends `Simple` directly and adds `addNumericFilter()`
 * and `addBetweenFilter()` helpers for legacy Qooxdoo applications.
 */
qx.Class.define("ville.ui.table.model.Filtered", {
  extend: ville.ui.table.model.Simple,

  construct() {
    // @ts-ignore
    super();
    this.__rules = [];
  },

  members: {
    /** @type {Array<Function>} @private */
    __rules: null,

    addNumericFilter(op, targetValue, columnId) {
      this.__rules.push((rowMap) => {
        const v = Number(rowMap[columnId]);
        const t = Number(targetValue);
        if (op === "==" || op === "=") return v === t;
        if (op === "!=") return v !== t;
        if (op === ">") return v > t;
        if (op === ">=") return v >= t;
        if (op === "<") return v < t;
        if (op === "<=") return v <= t;
        return true;
      });
      this.applyFilters();
    },

    addBetweenFilter(op, value1, value2, columnId) {
      const min = Math.min(Number(value1), Number(value2));
      const max = Math.max(Number(value1), Number(value2));
      this.__rules.push((rowMap) => {
        const v = Number(rowMap[columnId]);
        return op === "!between" ? v < min || v > max : v >= min && v <= max;
      });
      this.applyFilters();
    },

    applyFilters() {
      const rules = this.__rules ? this.__rules.slice() : [];
      if (rules.length === 0) {
        this.resetFilter();
      } else {
        this.filter((rowMap) => rules.every((fn) => fn(rowMap)));
      }
    },

    resetHiddenRows() {
      this.__rules = [];
      this.resetFilter();
    }
  },

  destruct() {
    this.__rules = null;
  }
});
