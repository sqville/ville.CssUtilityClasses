/**
 * Mode 3 field interface (`ville.ui.form.IField`) specifying the value contract
 * for form and display widgets.
 *
 * Replaces `qx.ui.form.IField` so Mode 3 classes have zero `qx.ui.*` dependencies.
 */
qx.Interface.define("ville.ui.form.IField", {
  events: {
    /**
     * Fired when the model value is modified.
     */
    changeValue: "qx.event.type.Data"
  },

  members: {
    /**
     * Sets the field value.
     *
     * @param {*} value New value.
     */
    setValue(value) {
      return arguments.length === 1;
    },

    /**
     * Resets the value to its initial value.
     */
    resetValue() {},

    /**
     * Returns the current value.
     *
     * @returns {*} Current value.
     */
    getValue() {}
  }
});
