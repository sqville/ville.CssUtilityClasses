/**
 * Path B Semantic Radio Button Widget (`STRAT-STATE-02` & `STRAT-FORM-04`).
 *
 * Extends `ville.ui.form.CheckBox` with `<input type="radio">`, delegating
 * mutual exclusion and arrow-key roving focus natively to the browser via
 * shared `name` attributes when grouped in a `ville.ui.form.RadioButtonGroup`
 * (`ville.ui.form.RadioGroup`).
 */
qx.Class.define("ville.ui.form.RadioButton", {
  extend: ville.ui.form.CheckBox,

  construct(label, model) {
    super(label);
    if (model !== undefined) {
      this.setModel(model);
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "radiobutton"
    },

    /**
     * Optional parent `RadioButtonGroup` managing this radio button.
     */
    group: {
      nullable: true,
      init: null,
      apply: "_applyGroup"
    }
  },

  members: {
    _getInputType() {
      return "radio";
    },

    _applyGroup(group) {
      if (group && typeof group.getName === "function" && group.getName()) {
        this.setName(group.getName());
      }
    }
  }
});
