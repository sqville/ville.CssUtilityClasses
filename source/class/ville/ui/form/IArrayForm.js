/**
 * Form interface for all form widgets which have arrays as their primary data type.
 */
qx.Interface.define("ville.ui.form.IArrayForm", {
  extend: ville.ui.form.IField,

  events: {
    /** Fired when the value was modified */
    changeValue: "qx.event.type.Data"
  },

  members: {
    /**
     * Sets the element's value.
     *
     * @param {ville.data.Array|Array|null} value The new value of the element.
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
     * @returns {ville.data.Array|Array|null} The value.
     */
    getValue() {}
  }
});
