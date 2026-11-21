/**
 * Mode 3 virtual DOM wrapper (`ville.html.Input`) for all 22 HTML `<input>` types
 * as well as `<textarea>` and `<select>`.
 *
 * Replaces `qx.html.Input` and `qx.bom.Input` with direct standard DOM property
 * synchronization (`value`, `checked`, `type`, and HTML5 Constraint Validation APIs).
 */
qx.Class.define("ville.html.Input", {
  extend: ville.html.Element,

  statics: {
    /**
     * All 22 standard HTML `<input>` types.
     *
     * @type {Record<string, boolean>}
     */
    INPUT_TYPES: {
      button: true,
      checkbox: true,
      color: true,
      date: true,
      "datetime-local": true,
      email: true,
      file: true,
      hidden: true,
      image: true,
      month: true,
      number: true,
      password: true,
      radio: true,
      range: true,
      reset: true,
      search: true,
      submit: true,
      tel: true,
      text: true,
      time: true,
      url: true,
      week: true
    },

    /**
     * All 22 `<input>` types plus `"textarea"` and `"select"`.
     *
     * @type {Record<string, boolean>}
     */
    SUPPORTED_TYPES: {
      button: true,
      checkbox: true,
      color: true,
      date: true,
      "datetime-local": true,
      email: true,
      file: true,
      hidden: true,
      image: true,
      month: true,
      number: true,
      password: true,
      radio: true,
      range: true,
      reset: true,
      search: true,
      submit: true,
      tel: true,
      text: true,
      time: true,
      url: true,
      week: true,
      textarea: true,
      select: true
    },

    /**
     * Text-entry `<input>` types that can safely transition dynamically at runtime
     * without losing string values, event listeners, or DOM node identity.
     *
     * @type {Record<string, boolean>}
     */
    TEXT_COMPATIBLE_TYPES: {
      text: true,
      password: true,
      email: true,
      search: true,
      tel: true,
      url: true
    }
  },

  /**
   * Creates a new `ville.html.Input` wrapper.
   *
   * @param {string} [type="text"] Any of the 22 HTML `<input>` types, `"textarea"`, or `"select"`.
   * @param {Record<string, any>|null} [styles] Optional initial inline styles.
   * @param {Record<string, any>|null} [attributes] Optional initial HTML attributes.
   */
  construct(type = "text", styles = null, attributes = null) {
    if (qx.core.Environment.get("qx.debug")) {
      qx.core.Assert.assertKeyInMap(
        type,
        ville.html.Input.SUPPORTED_TYPES,
        `Unsupported input type: '${type}'.`
      );
    }

    const isInputTag = type !== "textarea" && type !== "select";
    const nodeName = isInputTag ? "input" : type;

    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(nodeName, styles, attributes);

    this.__type = type;

    if (isInputTag) {
      this.setAttribute("type", type);
    }
  },

  members: {
    /** @type {string} @private */
    __type: "text",

    /** @type {any} @private */
    __pendingValue: undefined,

    /** @type {boolean|undefined} @private */
    __pendingChecked: undefined,

    /**
     * Returns the configured control type (`"text"`, `"password"`, `"textarea"`, `"select"`, etc.).
     *
     * @returns {string} Input type identifier.
     */
    getType() {
      return this.__type;
    },

    /**
     * Dynamically updates `<input>`'s `type` within compatible text-entry types
     * (`text`, `password`, `email`, `search`, `tel`, `url`) by mutating `domEl.type`
     * directly so event listeners, DOM references, and caret selection stay intact.
     *
     * @param {string} type Target HTML `<input>` type.
     */
    setType(type) {
      if (this.__type === type) {
        return;
      }

      if (this.__type === "textarea" || this.__type === "select") {
        throw new Error(`Cannot change type on <${this.__type}> element.`);
      }

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertKeyInMap(
          type,
          ville.html.Input.INPUT_TYPES,
          `Invalid <input> type: '${type}'.`
        );

        const compat = ville.html.Input.TEXT_COMPATIBLE_TYPES;
        if (!compat[this.__type] || !compat[type]) {
          this.warn(
            `Incompatible dynamic <input> type transition ('${this.__type}' -> '${type}'). Keep runtime transitions within text-compatible types (text, password, email, search, tel, url).`
          );
        }
      }

      this.__type = type;

      const domEl = /** @type {HTMLInputElement|null} */ (this.getDomElement());
      if (domEl) {
        const isFocused = document.activeElement === domEl;
        const selStart = isFocused ? domEl.selectionStart : null;
        const selEnd = isFocused ? domEl.selectionEnd : null;

        // Mutate the DOM IDL property directly (never outerHTML) to preserve listeners & node identity
        domEl.type = type;

        // Keep ville.html.Element's internal attribute cache synchronized without re-queuing
        this.setAttribute("type", type, true);

        if (
          isFocused &&
          selStart !== null &&
          selEnd !== null &&
          typeof domEl.setSelectionRange === "function"
        ) {
          try {
            domEl.setSelectionRange(selStart, selEnd);
          } catch (err) {
            // Some types (e.g., email) do not support selectionRange
          }
        }
      } else {
        this.setAttribute("type", type);
      }
    },

    /**
     * Copies buffered attributes, styles, and any pending `value` or `checked`
     * state onto the newly created form control DOM element.
     *
     * @override
     * @param {boolean} [fromMarkup=false] Whether hydrated from markup.
     * @protected
     */
    _copyData(fromMarkup) {
      super._copyData(fromMarkup);

      const domEl = /** @type {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null} */ (
        this._domNode
      );
      if (!domEl) {
        return;
      }

      if (this.__pendingValue !== undefined) {
        domEl.value = this.__pendingValue != null ? String(this.__pendingValue) : "";
      }

      if (this.__pendingChecked !== undefined && "checked" in domEl) {
        /** @type {HTMLInputElement} */ (domEl).checked = Boolean(this.__pendingChecked);
      }
    },

    /**
     * Sets the form control's current `value` property directly on the live DOM
     * element if materialized, or buffers it until flush.
     *
     * @param {string|number|null} value New input value.
     * @returns {this} This instance for chaining.
     */
    setValue(value) {
      const normalized = value != null ? String(value) : "";
      this.__pendingValue = normalized;

      const domEl = /** @type {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null} */ (
        this._domNode
      );
      if (domEl && domEl.value !== normalized) {
        domEl.value = normalized;
      }

      return this;
    },

    /**
     * Returns the form control's current live `value` (or buffered value prior to flush).
     *
     * @returns {string} Current input value.
     */
    getValue() {
      const domEl = /** @type {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null} */ (
        this._domNode
      );
      if (domEl) {
        return domEl.value;
      }
      return this.__pendingValue !== undefined ? String(this.__pendingValue) : "";
    },

    /**
     * Sets the `checked` state for `checkbox` and `radio` inputs.
     *
     * @param {boolean} checked Whether the control is checked.
     * @returns {this} This instance for chaining.
     */
    setChecked(checked) {
      const next = Boolean(checked);
      this.__pendingChecked = next;

      const domEl = /** @type {HTMLInputElement|null} */ (this._domNode);
      if (domEl && "checked" in domEl) {
        domEl.checked = next;
      }

      return this;
    },

    /**
     * Returns the current `checked` state for `checkbox` and `radio` inputs.
     *
     * @returns {boolean} `true` if checked.
     */
    getChecked() {
      const domEl = /** @type {HTMLInputElement|null} */ (this._domNode);
      if (domEl && "checked" in domEl) {
        return Boolean(domEl.checked);
      }
      return Boolean(this.__pendingChecked);
    },

    /**
     * Evaluates native HTML5 constraint validation (`checkValidity()`).
     *
     * @returns {boolean} `true` if the control satisfies all validation constraints.
     */
    checkValidity() {
      const domEl = /** @type {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null} */ (
        this._domNode
      );
      if (domEl && typeof domEl.checkValidity === "function") {
        return domEl.checkValidity();
      }
      return true;
    },

    /**
     * Evaluates native HTML5 constraint validation and reports validity to the user (`reportValidity()`).
     *
     * @returns {boolean} `true` if valid.
     */
    reportValidity() {
      const domEl = /** @type {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null} */ (
        this._domNode
      );
      if (domEl && typeof domEl.reportValidity === "function") {
        return domEl.reportValidity();
      }
      return true;
    },

    /**
     * Sets a custom HTML5 validation message (`setCustomValidity()`). Pass `""` to clear.
     *
     * @param {string} message Custom validity error message, or `""` if valid.
     */
    setCustomValidity(message) {
      const domEl = /** @type {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null} */ (
        this._domNode
      );
      if (domEl && typeof domEl.setCustomValidity === "function") {
        domEl.setCustomValidity(message || "");
      }
    }
  }
});
