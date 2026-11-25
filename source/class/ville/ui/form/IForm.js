/**
 * Form interface for all form widgets. It includes the API for enabled,
 * required and valid states.
 */
qx.Interface.define("ville.ui.form.IForm", {
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /** Fired when the enabled state was modified */
    changeEnabled: "qx.event.type.Data",

    /** Fired when the valid state was modified */
    changeValid: "qx.event.type.Data",

    /** Fired when the invalidMessage was modified */
    changeInvalidMessage: "qx.event.type.Data",

    /** Fired when the required was modified */
    changeRequired: "qx.event.type.Data"
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /*
    ---------------------------------------------------------------------------
      ENABLED PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Set the enabled state of the widget.
     *
     * @param enabled {Boolean} The enabled state.
     * @return {Boolean}
     */
    setEnabled(enabled) {
      return arguments.length == 1;
    },

    /**
     * Return the current set enabled state.
     *
     * @return {Boolean} If the widget is enabled.
     */
    getEnabled() {},

    /*
    ---------------------------------------------------------------------------
      REQUIRED PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the required state of a widget.
     *
     * @param required {Boolean} A flag signaling if the widget is required.
     */
    setRequired(required) {
      return arguments.length == 1;
    },

    /**
     * Return the current required state of the widget.
     *
     * @return {Boolean} True, if the widget is required.
     */
    getRequired() {},

    /*
    ---------------------------------------------------------------------------
      VALID PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the valid state of the widget.
     *
     * @param valid {Boolean} The valid state of the widget.
     */
    setValid(valid) {
      return arguments.length == 1;
    },

    /**
     * Returns the valid state of the widget.
     *
     * @return {Boolean} If the state of the widget is valid.
     */
    getValid() {},

    /*
    ---------------------------------------------------------------------------
      INVALID MESSAGE PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the invalid message of the widget.
     *
     * @param message {String} The invalid message.
     */
    setInvalidMessage(message) {
      return arguments.length == 1;
    },

    /**
     * Returns the invalid message of the widget.
     *
     * @return {String} The current set message.
     */
    getInvalidMessage() {},

    /*
    ---------------------------------------------------------------------------
      REQUIRED INVALID MESSAGE PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the invalid message if required of the widget.
     *
     * @param message {String} The invalid message.
     */
    setRequiredInvalidMessage(message) {
      return arguments.length == 1;
    },

    /**
     * Returns the invalid message if required of the widget.
     *
     * @return {String} The current set message.
     */
    getRequiredInvalidMessage() {}
  }
});
