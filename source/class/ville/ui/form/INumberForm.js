/**
 * Form interface for all form widgets which use a numeric value as their
 * primary data type like a spinner.
 */
qx.Interface.define("ville.ui.form.INumberForm", {
  extend: ville.ui.form.IField,

  events: {
    /** Fired when the value was modified */
    changeValue: "qx.event.type.Data"
  },

  members: {
    /**
     * Sets the element's value.
     *
     * @param value {Number|null} The new value of the element.
     */
    setValue(value) {
      return arguments.length == 1;
    },

    /**
     * Resets the element's value to its initial value.
     */
    resetValue() {},

    /**
     * The element's user set value.
     *
     * @return {Number|null} The value.
     */
    getValue() {}
  }
});
