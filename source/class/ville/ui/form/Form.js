/**
 * Path B Form Manager (`STRAT-FORM-01`, `STRAT-FORM-02`, `STRAT-FORM-03`).
 *
 * Manages form items, group headers, action buttons, initial reset snapshots,
 * native HTML5 Constraint Validation + composable `ville.ui.form.Validator`
 * sync/async schema validation, and `toJSON()` / `toFormData()` serialization.
 */
qx.Class.define("ville.ui.form.Form", {
  extend: qx.core.Object,

  construct() {
    super();

    this.__groups = [];
    this._buttons = [];
    this._buttonOptions = [];
    this.__validators = {};
    this.__initialValues = {};
    this._validationManager = this._createValidationManager();
    this._resetter = this._createResetter();
  },

  events: {
    /** Fired as soon as something changes in the form. */
    change: "qx.event.type.Event",

    /** Fired when form validation completes (`true` or `false`). */
    complete: "qx.event.type.Data",

    /** Fired when the form is validated and submitted, passing `toJSON()` data. */
    submit: "qx.event.type.Data"
  },

  properties: {
    /**
     * Optional form-level schema validator (`ville.ui.form.Validator.object({...})`
     * or a Standard Schema / Zod schema).
     */
    schema: {
      nullable: true,
      init: null
    }
  },

  members: {
    __groups: null,
    __validators: null,
    __initialValues: null,
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
     * @param {ville.ui.core.Widget} item A supported form item.
     * @param {string} label The string which should be used as label.
     * @param {Function|ville.ui.form.Validator|Object|null} [validator=null] Optional validator function or `Validator` instance.
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

      if (name == null) {
        name = label.replace(
          /\s+|&|-|\+|\*|\/|\||!|\.|,|:|\?|;|~|%|\{|\}|\(|\)|\[|\]|<|>|=|\^|@|\\/g,
          ""
        );
      }

      this.__groups[this._groupCounter].items.push(item);
      this.__groups[this._groupCounter].labels.push(label);
      this.__groups[this._groupCounter].names.push(name);
      this.__groups[this._groupCounter].options.push(options);

      if (typeof item.setName === "function" && !item.getName?.()) {
        item.setName(name);
      }

      if (validator != null) {
        this.__validators[name] = {
          validator,
          context: validatorContext || this
        };
      }

      if (typeof item.getValue === "function") {
        this.__initialValues[name] = item.getValue();
      }

      this.fireEvent("change");
    },

    /**
     * Adds a group header to the form.
     *
     * @param {string} title The title of the group header.
     * @param {Object|null} [options=null] Custom options given to the renderer.
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
     * @param {ville.ui.form.Button} button The button to add.
     * @param {Object|null} [options=null] Additional custom data available to the form renderer.
     */
    addButton(button, options) {
      this._buttons.push(button);
      this._buttonOptions.push(options || null);
      this.fireEvent("change");
    },

    __isFirstAdd() {
      return this.__groups.length === 0;
    },

    /*
    ---------------------------------------------------------------------------
       REMOVE & LOOKUP
    ---------------------------------------------------------------------------
    */

    remove(item) {
      for (let i = 0; i < this.__groups.length; i++) {
        const group = this.__groups[i];
        for (let j = 0; j < group.items.length; j++) {
          if (group.items[j] === item) {
            const removedName = group.names[j];
            delete this.__validators[removedName];
            delete this.__initialValues[removedName];
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
            }
            targetGroup = this.__groups[i + 1];
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

    removeButton(button) {
      for (let i = 0; i < this._buttons.length; i++) {
        if (this._buttons[i] === button) {
          this._buttons.splice(i, 1);
          this._buttonOptions.splice(i, 1);
          this.fireEvent("change");
          return true;
        }
      }
      return false;
    },

    getItems() {
      const items = {};
      for (let i = 0; i < this.__groups.length; i++) {
        const group = this.__groups[i];
        for (let j = 0; j < group.names.length; j++) {
          items[group.names[j]] = group.items[j];
        }
      }
      return items;
    },

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
       SERIALIZATION (`toJSON()`, `toFormData()`) & RESET SUPPORT (`STRAT-FORM-01`)
    ---------------------------------------------------------------------------
    */

    /**
     * Extracts a plain JavaScript object `{ [fieldName]: value }` from all
     * registered form items.
     *
     * @returns {Object<string, any>}
     */
    toJSON() {
      const data = {};
      const items = this.getItems();
      for (const [name, item] of Object.entries(items)) {
        if (item && typeof item.getValue === "function") {
          data[name] = item.getValue();
        }
      }
      return data;
    },

    /**
     * Populates and returns a browser `FormData` instance from all registered
     * form items (`STRAT-FORM-01`).
     *
     * @returns {FormData}
     */
    toFormData() {
      const fd = new FormData();
      const data = this.toJSON();
      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined && val !== null) {
          fd.append(key, String(val));
        }
      }
      return fd;
    },

    /**
     * Resets all form items to their initial values and clears invalid states.
     */
    reset() {
      const items = this.getItems();
      for (const [name, item] of Object.entries(items)) {
        if (!item) continue;
        if (name in this.__initialValues && typeof item.setValue === "function") {
          item.setValue(this.__initialValues[name]);
        } else if (typeof item.resetValue === "function") {
          item.resetValue();
        }
        if (typeof item.setValid === "function") {
          item.setValid(true);
        }
        if (typeof item.setInvalidMessage === "function") {
          item.setInvalidMessage("");
        }
      }
    },

    /**
     * Snapshots current values of all form items as the new reset baseline.
     */
    redefineResetter() {
      const items = this.getItems();
      for (const [name, item] of Object.entries(items)) {
        if (item && typeof item.getValue === "function") {
          this.__initialValues[name] = item.getValue();
        }
      }
    },

    /**
     * Snapshots the current value of a single item as its new reset baseline.
     *
     * @param {ville.ui.core.Widget} targetItem
     */
    redefineResetterItem(targetItem) {
      const items = this.getItems();
      for (const [name, item] of Object.entries(items)) {
        if (item === targetItem && typeof item.getValue === "function") {
          this.__initialValues[name] = item.getValue();
        }
      }
    },

    /*
    ---------------------------------------------------------------------------
       SYNC & ASYNC VALIDATION (`STRAT-FORM-01`)
    ---------------------------------------------------------------------------
    */

    __applyItemValidity(item, errorMessage) {
      const isValid = !errorMessage;
      if (typeof item.setInvalidMessage === "function") {
        item.setInvalidMessage(errorMessage || "");
      }
      if (typeof item.setValid === "function") {
        item.setValid(isValid);
      }
      const domEl =
        item.getInputElement?.()?.getDomElement?.() ||
        item.getContentElement?.()?.getDomElement?.();
      if (domEl && typeof domEl.setCustomValidity === "function") {
        domEl.setCustomValidity(errorMessage || "");
      }
    },

    /**
     * Synchronously validates all registered items in the form using both native
     * HTML5 `checkValidity()` and any attached `ville.ui.form.Validator` or
     * form-level `schema`.
     *
     * @returns {boolean} `true` if every item and schema rule is valid.
     */
    validate() {
      let allValid = true;
      const items = this.getItems();
      const values = this.toJSON();

      for (const [name, item] of Object.entries(items)) {
        if (!item) continue;
        this.__applyItemValidity(item, "");

        let itemValid = true;
        if (typeof item.checkValidity === "function") {
          itemValid = item.checkValidity();
        }
        if (itemValid && this.__validators[name]) {
          const { validator, context } = this.__validators[name];
          const err = ville.ui.form.Validator.runSync(
            validator,
            values[name],
            context
          );
          if (err) {
            this.__applyItemValidity(item, err);
            itemValid = false;
          }
        }
        if (!itemValid) {
          allValid = false;
        }
      }

      const schema = this.getSchema();
      if (schema && typeof schema.validate === "function") {
        const res = schema.validate(values);
        if (res && !res.valid && res.errors) {
          allValid = false;
          for (const [field, msg] of Object.entries(res.errors)) {
            if (items[field]) {
              this.__applyItemValidity(items[field], msg);
            }
          }
        }
      }

      this.fireDataEvent("complete", allValid);
      return allValid;
    },

    /**
     * Asynchronously validates all registered items in the form using both native
     * HTML5 `checkValidity()` and async `ville.ui.form.Validator` / Standard Schema rules.
     *
     * @returns {Promise<boolean>}
     */
    async validateAsync() {
      let allValid = true;
      const items = this.getItems();
      const values = this.toJSON();

      for (const [name, item] of Object.entries(items)) {
        if (!item) continue;
        this.__applyItemValidity(item, "");

        let itemValid = true;
        if (typeof item.checkValidity === "function") {
          itemValid = item.checkValidity();
        }
        if (itemValid && this.__validators[name]) {
          const { validator, context } = this.__validators[name];
          const err = await ville.ui.form.Validator.runAsync(
            validator,
            values[name],
            context
          );
          if (err) {
            this.__applyItemValidity(item, err);
            itemValid = false;
          }
        }
        if (!itemValid) {
          allValid = false;
        }
      }

      const schema = this.getSchema();
      if (schema && typeof schema.validateAsync === "function") {
        const res = await schema.validateAsync(values);
        if (res && !res.valid && res.errors) {
          allValid = false;
          for (const [field, msg] of Object.entries(res.errors)) {
            if (items[field]) {
              this.__applyItemValidity(items[field], msg);
            }
          }
        }
      }

      this.fireDataEvent("complete", allValid);
      return allValid;
    },

    /**
     * Validates the form and, if valid, fires the `"submit"` data event with
     * `this.toJSON()`.
     *
     * @returns {boolean}
     */
    submit() {
      if (this.validate()) {
        this.fireDataEvent("submit", this.toJSON());
        return true;
      }
      return false;
    },

    getValidationManager() {
      return this._validationManager;
    },

    getGroups() {
      return this.__groups;
    },

    getButtons() {
      return this._buttons;
    },

    getButtonOptions() {
      return this._buttonOptions;
    },

    _createValidationManager() {
      return this;
    },

    _createResetter() {
      return this;
    }
  },

  destruct() {
    this.__groups =
      this._buttons =
      this._buttonOptions =
      this.__validators =
      this.__initialValues =
        null;
  }
});
