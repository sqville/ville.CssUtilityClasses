/**
 * Form interface for all form widgets which have a model object as their primary data type.
 */
qx.Interface.define("ville.ui.form.IModelForm", {
  extend: ville.ui.form.IField,

  events: {
    /** Fired when the value was modified */
    changeValue: "qx.event.type.Data"
  },

  members: {
    /**
     * Sets the element's value.
     *
     * @param {*} value The new value of the element.
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
     * @returns {*} The value.
     */
    getValue() {}
  }
});
