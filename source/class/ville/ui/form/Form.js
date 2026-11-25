/**
 * The form object is responsible for managing form items and passing them to a
 * form renderer ({@link ville.ui.form.IFormRenderer}).
 */
qx.Class.define("ville.ui.form.Form", {
  extend: qx.core.Object,

  construct() {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    this.__groups = [];
    this._buttons = [];
    this._buttonOptions = [];
    this._validationManager = this._createValidationManager();
    this._resetter = this._createResetter();
  },

  events: {
    /** Fired as soon as something changes in the form. */
    change: "qx.event.type.Event"
  },

  members: {
    __groups: null,
    _validationManager: null,
    _groupCounter: 0,
    _buttons: null,
    _buttonOptions: null,
    _resetter: null,

    /*
    ---------------------------------------------------------------------------
       ADD
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a form item to the form.
     *
     * *Hint:* The order of all add calls represents the order in the layout.
     *
     * @param {ville.ui.core.Widget} item A supported form item.
     * @param {string} label The string which should be used as label.
     * @param {Function|null} [validator=null] Optional validator function.
     * @param {string|null} [name=null] The name used by data binding / form extraction.
     * @param {any} [validatorContext=null] The context of the validator.
     * @param {Object|null} [options=null] Additional custom data available to the form renderer.
     */
    add(item, label, validator, name, validatorContext, options) {
      if (this.__isFirstAdd()) {
        this.__groups.push({
          title: null,
          items: [],
          labels: [],
          names: [],
          options: [],
          headerOptions: {}
        });
      }

      this.__groups[this._groupCounter].items.push(item);
      this.__groups[this._groupCounter].labels.push(label);
      this.__groups[this._groupCounter].options.push(options);

      if (name == null) {
        name = label.replace(
          /\s+|&|-|\+|\*|\/|\||!|\.|,|:|\?|;|~|%|\{|\}|\(|\)|\[|\]|<|>|=|\^|@|\\/g,
          ""
        );
      }
      this.__groups[this._groupCounter].names.push(name);

      this.fireEvent("change");
    },

    /**
     * Adds a group header to the form.
     *
     * *Hint:* The order of all add calls represents the order in the layout.
     *
     * @param {string} title The title of the group header.
     * @param {Object|null} [options=null] A special set of custom data given to the renderer.
     */
    addGroupHeader(title, options) {
      if (!this.__isFirstAdd()) {
        this._groupCounter++;
      }
      this.__groups.push({
        title: title,
        items: [],
        labels: [],
        names: [],
        options: [],
        headerOptions: options
      });

      this.fireEvent("change");
    },

    /**
     * Adds a button to the form.
     *
     * *Hint:* The order of all add calls represents the order in the layout.
     *
     * @param {ville.ui.form.Button} button The button to add.
     * @param {Object|null} [options=null] Additional custom data available to the form renderer.
     */
    addButton(button, options) {
      this._buttons.push(button);
      this._buttonOptions.push(options || null);
      this.fireEvent("change");
    },

    /**
     * Returns whether something has already been added.
     *
     * @returns {boolean} `true` if nothing has been added yet.
     */
    __isFirstAdd() {
      return this.__groups.length === 0;
    },

    /*
    ---------------------------------------------------------------------------
       REMOVE
    ---------------------------------------------------------------------------
    */

    /**
     * Removes the given item from the form.
     *
     * @param {ville.ui.core.Widget} item A supported form item.
     * @returns {boolean} `true` if the item could be removed.
     */
    remove(item) {
      for (let i = 0; i < this.__groups.length; i++) {
        const group = this.__groups[i];
        for (let j = 0; j < group.items.length; j++) {
          const storedItem = group.items[j];
          if (storedItem === item) {
            group.items.splice(j, 1);
            group.labels.splice(j, 1);
            group.names.splice(j, 1);
            group.options.splice(j, 1);

            this.fireEvent("change");
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Removes the given group header from the form. All items in the group will be moved to
     * another group (usually the previous group).
     *
     * @param {string} title The title.
     * @returns {boolean} `true` if the header could be removed.
     */
    removeGroupHeader(title) {
      for (let i = 0; i < this.__groups.length; i++) {
        const group = this.__groups[i];
        if (group.title === title) {
          let targetGroup;

          if (i === 0) {
            if (this.__groups.length === 1) {
              group.title = null;
              group.headerOptions = {};
              this.fireEvent("change");
              return true;
            } else {
              targetGroup = this.__groups[i + 1];
            }
          } else {
            targetGroup = this.__groups[i - 1];
          }

          targetGroup.items = targetGroup.items.concat(group.items);
          targetGroup.labels = targetGroup.labels.concat(group.labels);
          targetGroup.names = targetGroup.names.concat(group.names);
          targetGroup.options = targetGroup.options.concat(group.options);

          this.__groups.splice(i, 1);
          this._groupCounter--;

          this.fireEvent("change");
          return true;
        }
      }
      return false;
    },

    /**
     * Removes the given button from the form.
     *
     * @param {ville.ui.form.Button} button The button to remove.
     * @returns {boolean} `true` if the button could be removed.
     */
    removeButton(button) {
      for (let i = 0; i < this._buttons.length; i++) {
        const storedButton = this._buttons[i];
        if (storedButton === button) {
          this._buttons.splice(i, 1);
          this._buttonOptions.splice(i, 1);
          this.fireEvent("change");
          return true;
        }
      }
      return false;
    },

    /**
     * Returns all added items as a map.
     *
     * @returns {Object<string, ville.ui.core.Widget>} A map containing an entry for every item with its name.
     */
    getItems() {
      const items = {};
      for (let i = 0; i < this.__groups.length; i++) {
        const group = this.__groups[i];
        for (let j = 0; j < group.names.length; j++) {
          const name = group.names[j];
          items[name] = group.items[j];
        }
      }
      return items;
    },

    /**
     * Return an item by name.
     *
     * @param {string} name Item name.
     * @returns {ville.ui.core.Widget|null} The form item or `null`.
     */
    getItem(name) {
      for (let i = 0; i < this.__groups.length; i++) {
        const group = this.__groups[i];
        for (let j = 0; j < group.names.length; j++) {
          if (group.names[j] === name) {
            return group.items[j];
          }
        }
      }

      return null;
    },

    /*
    ---------------------------------------------------------------------------
       RESET SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Resets the form.
     */
    reset() {},

    /**
     * Redefines the values used for resetting.
     */
    redefineResetter() {},

    /**
     * Redefines the value used for resetting of the given item.
     *
     * @param {ville.ui.core.Widget} item The item to redefine.
     */
    redefineResetterItem(item) {},

    /*
    ---------------------------------------------------------------------------
       VALIDATION
    ---------------------------------------------------------------------------
    */

    /**
     * Validates all registered items in the form using their native `checkValidity()`
     * method when available.
     *
     * @returns {boolean} The validation result.
     */
    validate() {
      let valid = true;
      const items = this.getItems();
      for (const name in items) {
        const item = /** @type {any} */ (items[name]);
        if (item && typeof item.checkValidity === "function") {
          if (!item.checkValidity()) {
            valid = false;
          }
        }
      }
      return valid;
    },

    /**
     * Returns the internally used validation manager.
     *
     * @returns {any} The used manager.
     */
    getValidationManager() {
      return this._validationManager;
    },

    /*
    ---------------------------------------------------------------------------
       RENDERER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Accessor method for the renderer which returns all added items in an
     * array containing a map of all items:
     * `{ title: title, items: [], labels: [], names: [], options: [], headerOptions: {} }`
     *
     * @returns {Array<Object>} An array containing all necessary data for the renderer.
     * @internal
     */
    getGroups() {
      return this.__groups;
    },

    /**
     * Accessor method for the renderer which returns all added buttons in an
     * array.
     *
     * @returns {ville.ui.form.Button[]} An array containing all added buttons.
     * @internal
     */
    getButtons() {
      return this._buttons;
    },

    /**
     * Accessor method for the renderer which returns all added options for
     * the buttons in an array.
     *
     * @returns {Array<Object|null>} An array containing all added options for the buttons.
     * @internal
     */
    getButtonOptions() {
      return this._buttonOptions;
    },

    /*
    ---------------------------------------------------------------------------
       INTERNAL
    ---------------------------------------------------------------------------
    */

    /**
     * Creates and returns the used validation manager.
     *
     * @returns {any} The validation manager.
     */
    _createValidationManager() {
      return null;
    },

    /**
     * Creates and returns the used resetter.
     *
     * @returns {any} The resetter class.
     */
    _createResetter() {
      return null;
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct() {
    this.__groups = this._buttons = this._buttonOptions = null;
  }
});
