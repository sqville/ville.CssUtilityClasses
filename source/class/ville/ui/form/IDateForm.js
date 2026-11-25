/**
 * Form interface for all form widgets which have date as their primary
 * data type like datechooser's.
 */
qx.Interface.define("ville.ui.form.IDateForm", {
  extend: ville.ui.form.IField,

  events: {
    /** Fired when the value was modified */
    changeValue: "qx.event.type.Data"
  },

  members: {
    /**
     * Sets the element's value.
     *
     * @param value {Date|null} The new value of the element.
     * @return {Date|null}
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
     * @return {Date|null} The value.
     */
    getValue() {}
  }
});
