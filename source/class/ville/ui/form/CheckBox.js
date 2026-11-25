/**
 * Path B Semantic Checkbox Widget (`STRAT-STATE-02` & `STRAT-WIDGET-03`).
 *
 * Replaces legacy `qx.ui.form.CheckBox` + child `Atom` / `Icon` widgets with
 * semantic HTML (`<label>` root containing `<input type="checkbox">`, an inline
 * check/indeterminate SVG indicator from `ville.ui.icon.Default`, and a raw
 * `ville.html.Text` label node) with zero child `Widget` instance overhead.
 *
 * Delegates `:checked`, `:indeterminate`, `:disabled`, `:focus-visible`, and
 * `:user-invalid` styling directly to the browser C++ CSS selector engine.
 */
qx.Class.define("ville.ui.form.CheckBox", {
  extend: ville.ui.core.Widget,
  include: [ville.ui.form.MForm, ville.ui.form.MModelProperty],
  implement: [
    ville.ui.form.IForm,
    ville.ui.form.IBooleanForm,
    ville.ui.form.IModel
  ],

  construct(label) {
    super();

    const rootEl = this.getContentElement();

    this._inputEl = new ville.html.Element("input");
    this._inputEl.setAttribute("type", this._getInputType());
    rootEl.add(this._inputEl);

    this._indicatorEl = new ville.html.Element("span");
    this._indicatorEl.setAttribute("aria-hidden", "true");
    this._glyphEl = ville.ui.icon.Default.createElement("CHECK", { size: 12 });
    if (this._glyphEl) {
      this._indicatorEl.add(this._glyphEl);
    }
    rootEl.add(this._indicatorEl);

    this._labelEl = new ville.html.Text("span");
    rootEl.add(this._labelEl);

    if (label != null) {
      this.setLabel(label);
    }

    this._inputEl.addListener("change", this._onNativeChange, this);
  },

  properties: {
    appearance: {
      refine: true,
      init: "checkbox"
    },

    /**
     * Text label displayed next to the checkbox input.
     */
    label: {
      check: "String",
      nullable: true,
      event: "changeLabel",
      apply: "_applyLabel"
    },

    /**
     * Boolean or tri-state (`null` when `triState: true`) checked value.
     */
    value: {
      check: "Boolean",
      nullable: true,
      init: false,
      event: "changeValue",
      apply: "_applyValue"
    },

    /**
     * Enables indeterminate (`null`) tri-state support.
     */
    triState: {
      check: "Boolean",
      init: false,
      apply: "_applyTriState"
    },

    /**
     * Form field `name` attribute on the inner `<input>`.
     */
    name: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyName"
    },

    /**
     * Size token (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`).
     */
    size: {
      check: ["xs", "sm", "md", "lg", "xl"],
      init: "sm",
      themeable: true,
      apply: "_applySize",
      event: "changeSize"
    }
  },

  members: {
    _inputEl: null,
    _indicatorEl: null,
    _glyphEl: null,
    _labelEl: null,

    _createContentElement() {
      return new ville.html.Element("label");
    },

    _getInputType() {
      return "checkbox";
    },

    /**
     * Returns the inner `<input>` `ville.html.Element`.
     *
     * @return {ville.html.Element}
     */
    getInputElement() {
      return this._inputEl;
    },

    /**
     * Toggles the boolean value.
     */
    toggleValue() {
      this.setValue(!this.getValue());
    },

    /**
     * Native HTML5 Constraint Validation check (`STRAT-FORM-01`).
     *
     * @return {Boolean}
     */
    checkValidity() {
      const domInput = this._inputEl?.getDomElement();
      if (domInput && typeof domInput.checkValidity === "function") {
        const ok = domInput.checkValidity();
        this.setValid(ok);
        return ok;
      }
      if (this.getRequired() && !this.getValue()) {
        this.setValid(false);
        return false;
      }
      this.setValid(true);
      return true;
    },

    _onNativeChange(e) {
      const nativeEvt = e?.getNativeEvent ? e.getNativeEvent() : e;
      const target = nativeEvt?.target || this._inputEl?.getDomElement();
      if (target) {
        this.setValue(Boolean(target.checked));
      }
    },

    _applyEnabled(value) {
      super._applyEnabled(value);
      if (this._inputEl) {
        if (value) {
          this._inputEl.removeAttribute("disabled");
        } else {
          this._inputEl.setAttribute("disabled", "disabled");
        }
      }
    },

    _applyLabel(value) {
      if (this._labelEl) {
        this._labelEl.setText(value ? String(value) : "");
      }
    },

    _applyValue(value) {
      if (!this._inputEl) {
        return;
      }
      const isIndeterminate = this.getTriState() && value === null;
      const isChecked = Boolean(value);

      if (isChecked) {
        this._inputEl.setAttribute("checked", "checked");
        this.addState("checked");
      } else {
        this._inputEl.removeAttribute("checked");
        this.removeState("checked");
      }

      if (isIndeterminate) {
        this.addState("undetermined");
        this.getContentElement().setAttribute("aria-checked", "mixed");
      } else {
        this.removeState("undetermined");
        this.getContentElement().removeAttribute("aria-checked");
      }

      const domInput = this._inputEl.getDomElement();
      if (domInput) {
        domInput.checked = isChecked;
        domInput.indeterminate = isIndeterminate;
      }

      if (this._indicatorEl) {
        const iconName = isIndeterminate ? "INDETERMINATE" : "CHECK";
        if (this._glyphEl) {
          this._indicatorEl.remove(this._glyphEl);
        }
        this._glyphEl = ville.ui.icon.Default.createElement(iconName, {
          size: 12
        });
        if (this._glyphEl) {
          this._indicatorEl.add(this._glyphEl);
        }
      }
    },

    _applyTriState() {
      this._applyValue(this.getValue());
    },

    _applyName(value) {
      if (!this._inputEl) {
        return;
      }
      if (value) {
        this._inputEl.setAttribute("name", value);
      } else {
        this._inputEl.removeAttribute("name");
      }
    },

    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    }
  },

  destruct() {
    this._inputEl = null;
    this._indicatorEl = null;
    this._glyphEl = null;
    this._labelEl = null;
  }
});
