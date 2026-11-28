/**
 * Radio buttons are used to manage a single selection among multiple toolbar buttons.
 */
qx.Class.define("ville.ui.toolbar.RadioButton", {
  extend: ville.ui.toolbar.CheckBox,
  implement: [ville.ui.form.IRadioItem, ville.ui.form.IModel],
  include: [ville.ui.form.MModelProperty],

  properties: {
    /** The assigned `ville.ui.form.RadioGroup` which handles the switching between registered buttons */
    group: {
      check: "ville.ui.form.RadioGroup",
      nullable: true,
      apply: "_applyGroup"
    },

    /**
     * Prohibit the deselecting of the checked radio button when clicked.
     */
    noEmptySelection: {
      check: "Boolean",
      init: true
    }
  },

  members: {
    _applyGroup(value, old) {
      if (old) {
        old.remove(this);
      }
      if (value) {
        value.add(this);
      }
    },

    _applyValue(value, old) {
      super._applyValue(value, old);
      if (value) {
        const grp = this.getGroup();
        if (grp) {
          grp.setSelection([this]);
        }
      }
    },

    _onExecute(e) {
      const grp = this.getGroup();
      if (grp && (this.isNoEmptySelection() || !grp.getAllowEmptySelection())) {
        this.setValue(true);
      } else {
        this.toggleValue();
      }
    }
  }
});
