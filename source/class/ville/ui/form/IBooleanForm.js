/**
 * Form interface for all form widgets which have boolean as their primary
 * data type like a checkbox or switch.
 */
qx.Interface.define("ville.ui.form.IBooleanForm", {
  extend: ville.ui.form.IField,

  events: {
    /** Fired when the value was modified */
    changeValue: "qx.event.type.Data"
  },

  members: {
    /**
     * Sets the element's value.
     *
     * @param value {Boolean|null} The new value of the element.
     * @return {Boolean|null}
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
     * @return {Boolean|null} The value.
     */
    getValue() {}
  }
});
