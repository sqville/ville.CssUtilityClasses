/**
 * Mode 3 semantic base form input widget (`ville.ui.form.core.Input`).
 *
 * Wraps `ville.html.Input` to render a single semantic `<input type="...">`,
 * `<textarea>`, or `<select>` element with native Constraint Validation,
 * `qx.data` `changeValue` binding support, and bubbling `CustomEvent` dispatch.
 */
qx.Class.define("ville.ui.form.core.Input", {
  extend: ville.ui.core.Widget,

  /**
   * Creates a new form input widget.
   *
   * @param {string} [type="text"] Any of the 22 HTML `<input>` types, `"textarea"`, or `"select"`.
   * @param {string|number|string[]|null} [value] Optional initial value.
   */
  construct(type = "text", value) {
    this.__initialType = type;

    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    if (type !== "text") {
      this.setType(type);
    }

    if (value !== undefined) {
      this.setValue(value);
    }

    const contentEl = this.getContentElement();
    contentEl.addListener("input", this._onNativeInput, this);
    contentEl.addListener("change", this._onNativeChange, this);
    contentEl.addListener("invalid", this._onNativeInvalid, this);
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"input"`).
     */
    appearance: {
      refine: true,
      init: "input"
    },

    /**
     * HTML `<input>` type (`"text"`, `"email"`, `"password"`, `"number"`, `"date"`,
     * `"checkbox"`, `"radio"`, `"file"`, etc.) or `"textarea"` / `"select"`.
     */
    type: {
      check: Object.keys(ville.html.Input.SUPPORTED_TYPES),
      init: "text",
      apply: "_applyType",
      event: "changeType"
    },

    /**
     * Current control value. Fires `changeValue` for `qx.data` single-value bindings.
     */
    value: {
      nullable: true,
      init: "",
      apply: "_applyValue",
      event: "changeValue"
    },

    /**
     * Native HTML `name` attribute for form submission and radio button grouping.
     */
    name: {
      check: "String",
      nullable: true,
      apply: "_applyName"
    },

    /**
     * Native HTML `placeholder` text shown when empty.
     */
    placeholder: {
      check: "String",
      nullable: true,
      apply: "_applyPlaceholder"
    },

    /**
     * Whether the input is read-only (`readonly` attribute and `"readOnly"` state).
     */
    readOnly: {
      check: "Boolean",
      init: false,
      apply: "_applyReadOnly",
      event: "changeReadOnly"
    },

    /**
     * Whether a value is required for native Constraint Validation (`required` attribute).
     */
    required: {
      check: "Boolean",
      init: false,
      apply: "_applyRequired",
      event: "changeRequired"
    },

    /**
     * Native HTML `autocomplete` hint (e.g., `"email"`, `"current-password"`, `"off"`).
     */
    autoComplete: {
      check: "String",
      nullable: true,
      apply: "_applyAutoComplete"
    }
  },

  members: {
    /** @type {string} @private */
    __initialType: "text",

    /** @type {boolean} @private */
    __syncingFromDom: false,

    /**
     * Creates the underlying `ville.html.Input` wrapper for the configured initial type.
     *
     * @override
     * @returns {ville.html.Input} Root input virtual DOM element.
     * @protected
     */
    _createContentElement() {
      return new ville.html.Input(this.__initialType || "text");
    },

    /**
     * Typed helper returning the root `ville.html.Input` instance.
     *
     * @returns {ville.html.Input} Root input element wrapper.
     */
    getInputElement() {
      return /** @type {ville.html.Input} */ (this.getContentElement());
    },

    /**
     * Focuses the underlying native form control synchronously.
     *
     * @param {FocusOptions} [options] Optional browser focus options (e.g., `{ preventScroll: true }`).
     */
    focus(options) {
      const domEl = this._ensureDomElement();
      if (domEl && typeof domEl.focus === "function") {
        domEl.focus(options);
      }
    },

    /**
     * Selects the text inside `<input>` or `<textarea>` controls.
     */
    selectAll() {
      const domEl = /** @type {HTMLInputElement|HTMLTextAreaElement|null} */ (
        this._ensureDomElement()
      );
      if (domEl && typeof domEl.select === "function") {
        domEl.select();
      }
    },

    /**
     * Validates the control against native HTML constraints and updates the `"invalid"` state.
     *
     * @returns {boolean} `true` if valid.
     */
    checkValidity() {
      const valid = this.getInputElement().checkValidity();
      valid ? this.removeState("invalid") : this.addState("invalid");
      return valid;
    },

    /**
     * Validates the control and triggers the browser's native validation tooltip if invalid.
     *
     * @returns {boolean} `true` if valid.
     */
    reportValidity() {
      const valid = this.getInputElement().reportValidity();
      valid ? this.removeState("invalid") : this.addState("invalid");
      return valid;
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIERS
    ---------------------------------------------------------------------------
    */

    /**
     * @override
     * @param {boolean} value New enabled state.
     * @protected
     */
    _applyEnabled(value) {
      super._applyEnabled(value);
      this._setAttribute("disabled", value ? null : "disabled");
    },

    /**
     * @param {string} value New input type.
     * @param {string} old Previous input type.
     * @protected
     */
    _applyType(value, old) {
      const inputEl = this.getInputElement();
      if (inputEl.getType() !== value) {
        inputEl.setType(value);
        ville.ui.core.Widget.scheduleFlush();
      }
      this._syncModifierState("type", value, old);
    },

    /**
     * @param {string|number|string[]|null} value New value.
     * @protected
     */
    _applyValue(value) {
      if (this.__syncingFromDom) {
        return;
      }
      this.getInputElement().setValue(value);
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * @param {string|null} value New `name` attribute.
     * @protected
     */
    _applyName(value) {
      this._setAttribute("name", value);
    },

    /**
     * @param {string|null} value New `placeholder` attribute.
     * @protected
     */
    _applyPlaceholder(value) {
      this._setAttribute("placeholder", value);
    },

    /**
     * @param {boolean} value Whether the input is read-only.
     * @protected
     */
    _applyReadOnly(value) {
      this._setAttribute("readonly", value ? true : null);
      value ? this.addState("readOnly") : this.removeState("readOnly");
    },

    /**
     * @param {boolean} value Whether the input is required.
     * @protected
     */
    _applyRequired(value) {
      this._setAttribute("required", value ? true : null);
      value ? this.addState("required") : this.removeState("required");
    },

    /**
     * @param {string|null} value New `autocomplete` hint.
     * @protected
     */
    _applyAutoComplete(value) {
      this._setAttribute("autocomplete", value);
    },

    /*
    ---------------------------------------------------------------------------
      NATIVE DOM EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Syncs live keystroke/input mutations to `value` (firing `changeValue` for
     * `qx.data` bindings) and emits a bubbling `"ville:input"` `CustomEvent`.
     *
     * @param {qx.event.type.Native} e Native `input` event wrapper.
     * @protected
     */
    _onNativeInput(e) {
      const nextVal = this.getInputElement().getValue();
      this.__syncingFromDom = true;
      try {
        this.setValue(nextVal);
      } finally {
        this.__syncingFromDom = false;
      }

      if (this.hasState("invalid") && this.getInputElement().checkValidity()) {
        this.removeState("invalid");
      }

      this._dispatchNativeEvent("ville:input", {
        value: nextVal,
        nativeEvent: e.getNativeEvent()
      });
    },

    /**
     * Syncs committed change events (blur/Enter on text inputs, selection on
     * `<select>`, `date`, `color`, `file`, `checkbox`, `radio`) and emits a
     * bubbling `"ville:change"` `CustomEvent`.
     *
     * @param {qx.event.type.Native} e Native `change` event wrapper.
     * @protected
     */
    _onNativeChange(e) {
      const nextVal = this.getInputElement().getValue();
      this.__syncingFromDom = true;
      try {
        this.setValue(nextVal);
      } finally {
        this.__syncingFromDom = false;
      }

      this._dispatchNativeEvent("ville:change", {
        value: nextVal,
        nativeEvent: e.getNativeEvent()
      });
    },

    /**
     * Marks the widget `"invalid"` when native Constraint Validation fails.
     *
     * @protected
     */
    _onNativeInvalid() {
      this.addState("invalid");
    }
  },

  destruct() {
    const contentEl = this.getContentElement();
    if (contentEl) {
      contentEl.removeListener("input", this._onNativeInput, this);
      contentEl.removeListener("change", this._onNativeChange, this);
      contentEl.removeListener("invalid", this._onNativeInvalid, this);
    }
  }
});
