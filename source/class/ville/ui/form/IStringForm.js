/**
 * Mode 3 form interface (`ville.ui.form.IStringForm`) for widgets whose primary
 * value is a string (such as `ville.ui.basic.Label` and `ville.ui.form.Label`).
 *
 * Replaces `qx.ui.form.IStringForm` so Mode 3 classes have zero `qx.ui.*` dependencies.
 */
qx.Interface.define("ville.ui.form.IStringForm", {
  extend: ville.ui.form.IField,

  events: {
    /**
     * Fired when the string value is modified.
     */
    changeValue: "qx.event.type.Data"
  },

  members: {
    /**
     * Sets the element's string value.
     *
     * @param {string|null} value New string value.
     */
    setValue(value) {
      return arguments.length === 1;
    },

    /**
     * Resets the element's value to its initial value.
     */
    resetValue() {},

    /**
     * Returns the element's current string value.
     *
     * @returns {string|null} Current string value.
     */
    getValue() {}
  }
});
