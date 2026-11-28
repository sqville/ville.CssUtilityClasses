/**
 * Path B Model Selection Mixin (`ville.ui.form.MModelSelection` — `STRAT-CORE-09`).
 *
 * Bridges `ISingleSelection` / `IMultiSelection` widgets (`SelectBox`, `List`, `RadioButtonGroup`)
 * with an observable `ville.data.Array` (`getModelSelection()` / `setModelSelection()`) so
 * `ville.data.controller.Form` and `SingleValueBinding` can bind directly to `"modelSelection"`.
 */
qx.Mixin.define("ville.ui.form.MModelSelection", {
  construct() {
    this.__modelSelection = new qx.data.Array();
    this.__modelSelection.addListener(
      "change",
      this.__onModelSelectionArrayChange,
      this
    );
    this.addListener("changeSelection", this.__onModelSelectionChange, this);
  },

  events: {
    /**
     * Pseudo event description used by `SingleValueBinding` when binding `"modelSelection[0]"`.
     */
    changeModelSelection: "qx.event.type.Data"
  },

  members: {
    __modelSelection: null,
    __inSelectionChange: false,

    __onModelSelectionChange() {
      if (this.__inSelectionChange) {
        return;
      }
      const data = typeof this.getSelection === "function" ? this.getSelection() : [];
      const modelSelection = [];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (!item) continue;
        const model =
          typeof item.getModel === "function" && item.getModel() !== null
            ? item.getModel()
            : typeof item.getEffectiveValue === "function"
            ? item.getEffectiveValue()
            : null;
        if (model !== null && model !== undefined) {
          modelSelection.push(model);
        }
      }

      this.__inSelectionChange = true;
      try {
        this.setModelSelection(modelSelection);
      } finally {
        this.__inSelectionChange = false;
      }
    },

    __onModelSelectionArrayChange() {
      if (this.__inSelectionChange) {
        return;
      }
      this.__inSelectionChange = true;
      try {
        const selectables =
          typeof this.getSelectables === "function" ? this.getSelectables(true) : [];
        const itemSelection = [];
        const modelSelection = this.__modelSelection.toArray();

        for (let i = 0; i < modelSelection.length; i++) {
          const model = modelSelection[i];
          for (let j = 0; j < selectables.length; j++) {
            const selectable = selectables[j];
            const selectableModel =
              typeof selectable.getModel === "function" && selectable.getModel() !== null
                ? selectable.getModel()
                : typeof selectable.getEffectiveValue === "function"
                ? selectable.getEffectiveValue()
                : null;
            if (model === selectableModel) {
              itemSelection.push(selectable);
              break;
            }
          }
        }

        if (typeof this.setSelection === "function") {
          this.setSelection(itemSelection);
        }
      } finally {
        this.__inSelectionChange = false;
      }
    },

    /**
     * Returns the observable `ville.data.Array` (`qx.data.Array`) of selected models.
     *
     * @returns {qx.data.Array}
     */
    getModelSelection() {
      return this.__modelSelection;
    },

    /**
     * Updates the selected models from a JS `Array` or `ville.data.Array`.
     *
     * @param {Array|qx.data.Array|null} modelSelection
     */
    setModelSelection(modelSelection) {
      if (!modelSelection) {
        this.__modelSelection.removeAll();
        return;
      }

      const list =
        modelSelection instanceof qx.data.Array
          ? modelSelection.toArray().slice()
          : Array.isArray(modelSelection)
          ? modelSelection.slice()
          : [modelSelection];

      const args = [0, this.__modelSelection.getLength(), ...list];
      const returnArray = this.__modelSelection.splice.apply(
        this.__modelSelection,
        args
      );
      if (returnArray && typeof returnArray.dispose === "function") {
        returnArray.dispose();
      }
    }
  },

  destruct() {
    this._disposeObjects("__modelSelection");
  }
});
