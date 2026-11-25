/**
 * Mode 3 Toggle Button (`ville.ui.form.ToggleButton` — `STRAT-WIDGET-03`).
 *
 * Extends `ville.ui.form.Button` with a boolean (or tri-state) `value` property,
 * automatic `"checked"` widget state synchronization, WAI-ARIA `aria-pressed`
 * attribute updates, and two-tier `"changeValue"` + `"ville:change"` event dispatch.
 *
 * @example
 * const pinBtn = new ville.ui.form.ToggleButton("Pin Sidebar", "CHECK");
 * pinBtn.addListener("changeValue", (e) => console.log("Pinned:", e.getData()));
 */
qx.Class.define("ville.ui.form.ToggleButton", {
  extend: ville.ui.form.Button,
  implement: [ville.ui.form.IBooleanForm, ville.ui.form.IField],

  /**
   * @param {string|null} [label] Button text caption.
   * @param {string|Object|ville.html.Element|null} [icon] Optional icon key, Iconify class, or element.
   * @param {boolean} [value=false] Initial toggle state.
   */
  construct(label, icon, value = false) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(label, icon);

    if (value !== undefined) {
      this.setValue(Boolean(value));
    } else {
      this.initValue();
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "toggle-button"
    },

    /**
     * Current pressed/checked boolean state of the toggle button.
     */
    value: {
      check: "Boolean",
      nullable: true,
      init: false,
      apply: "_applyValue",
      event: "changeValue"
    },

    /**
     * Whether `null` is permitted as a third indeterminate state.
     */
    triState: {
      check: "Boolean",
      init: false
    }
  },

  members: {
    /**
     * Synchronizes `"checked"` state, `aria-pressed`, and dispatches a bubbling
     * `"ville:change"` `CustomEvent` whenever `value` changes.
     *
     * @param {boolean|null} value New toggle state.
     * @param {boolean|null} old Previous toggle state.
     * @protected
     */
    _applyValue(value, old) {
      if (value) {
        this.addState("checked");
        this.setAriaState("pressed", "true");
      } else if (this.getTriState() && value === null) {
        this.removeState("checked");
        this.setAriaState("pressed", "mixed");
      } else {
        this.removeState("checked");
        this.setAriaState("pressed", "false");
      }

      this._dispatchNativeEvent("ville:change", {
        value: Boolean(value),
        oldValue: Boolean(old)
      });
    },

    /**
     * Toggles `value` on native click before firing `execute()`.
     *
     * @override
     * @param {Object} e Native click event wrapper.
     * @protected
     */
    _onClick(e) {
      if (this.hasState("disabled")) {
        return;
      }
      this.toggleValue();
      super._onClick(e);
    }
  }
});
