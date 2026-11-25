/**
 * Path B Mixin handling the `valid`, `required`, `invalidMessage`, and
 * `requiredInvalidMessage` properties for form widgets (`STRAT-FORM-01`).
 */
qx.Mixin.define("ville.ui.form.MForm", {
  properties: {
    /**
     * Flag signaling if a widget is valid. If a widget is invalid, an `"invalid"`
     * state and `aria-invalid="true"` attribute will be set.
     */
    valid: {
      check: "Boolean",
      init: true,
      apply: "_applyValid",
      event: "changeValid"
    },

    /**
     * Flag signaling if a widget is required.
     */
    required: {
      check: "Boolean",
      init: false,
      event: "changeRequired"
    },

    /**
     * Message shown when the widget is invalid.
     */
    invalidMessage: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeInvalidMessage"
    },

    /**
     * Message shown when `required` is `true` and the widget is invalid.
     */
    requiredInvalidMessage: {
      check: "String",
      nullable: true,
      event: "changeRequiredInvalidMessage"
    }
  },

  members: {
    _applyValid(value) {
      if (value) {
        this.removeState("invalid");
        if (typeof this.setAriaState === "function") {
          this.setAriaState("invalid", null);
        }
      } else {
        this.addState("invalid");
        if (typeof this.setAriaState === "function") {
          this.setAriaState("invalid", "true");
        }
      }
    }
  }
});
