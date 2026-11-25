/**
 * Path B Semantic Switch / Toggle Control (`STRAT-STATE-02` & `STRAT-WIDGET-03`).
 *
 * Extends `ville.ui.form.CheckBox` with `role="switch"` on the inner
 * `<input type="checkbox" role="switch">` and a CSS track/thumb indicator.
 */
qx.Class.define("ville.ui.form.Switch", {
  extend: ville.ui.form.CheckBox,

  construct(label) {
    super(label);
    if (this._inputEl) {
      this._inputEl.setAttribute("role", "switch");
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "switch"
    },

    /**
     * Optional inline text rendered inside the switch track when checked (`ON`).
     */
    onLabel: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyTrackLabels"
    },

    /**
     * Optional inline text rendered inside the switch track when unchecked (`OFF`).
     */
    offLabel: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyTrackLabels"
    }
  },

  members: {
    _applyTrackLabels() {
      if (!this._indicatorEl) {
        return;
      }
      const onTxt = this.getOnLabel();
      const offTxt = this.getOffLabel();
      if (onTxt) {
        this._indicatorEl.setAttribute("data-on-label", onTxt);
      } else {
        this._indicatorEl.removeAttribute("data-on-label");
      }
      if (offTxt) {
        this._indicatorEl.setAttribute("data-off-label", offTxt);
      } else {
        this._indicatorEl.removeAttribute("data-off-label");
      }
    }
  }
});
