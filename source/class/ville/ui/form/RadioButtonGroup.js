/**
 * Path B Semantic Radio Button Group (`STRAT-FORM-04` & `STRAT-CORE-09`).
 *
 * Replaces legacy `qx.ui.form.RadioButtonGroup` + `qx.ui.form.RadioGroup`
 * manager with a standards-backed `<div role="radiogroup">` container that:
 * 1. Assigns a shared `name` attribute to every child `ville.ui.form.RadioButton`
 *    so the browser natively handles mutual exclusion and arrow-key roving focus.
 * 2. Listens to a single bubbling native `"change"` event on the group container.
 * 3. Preserves Qooxdoo's `ISingleSelection` (`getSelection`, `setSelection`,
 *    `resetSelection`, `getSelectables`) and `MModelSelection` (`getModelSelection`,
 *    `setModelSelection`) contracts so `ville.data.controller.Form` binds cleanly.
 */
qx.Class.define("ville.ui.form.RadioButtonGroup", {
  extend: ville.ui.core.Box,
  include: [ville.ui.form.MForm],
  implement: [ville.ui.form.IForm],

  construct(layout) {
    super();

    this.__items = [];
    this.__groupName = `ville-radiogroup-${this.toHashCode()}`;

    if (layout instanceof ville.ui.layout.Abstract) {
      this._setLayout(layout);
    } else {
      this._setLayout(new ville.ui.layout.VBox(8));
    }

    const el = this.getContentElement();
    el.setAttribute("role", "radiogroup");
    el.addListener("change", this._onBubbledChange, this);
  },

  events: {
    /** Fired when the selected radio button changes. */
    changeSelection: "qx.event.type.Data",

    /** Fired when the selected radio button's value/model changes. */
    changeValue: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "radiobuttongroup"
    },

    /**
     * Shared HTML `<input type="radio" name="...">` group identifier.
     */
    name: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyName"
    }
  },

  members: {
    __items: null,
    __groupName: null,
    __selectedItem: null,

    /**
     * Returns the effective HTML `name` shared across child radio inputs.
     *
     * @return {String}
     */
    getEffectiveGroupName() {
      return this.getName() || this.__groupName;
    },

    // Override Box#add to register radio buttons and synchronize their shared `name`
    add(child, options) {
      super.add(child, options);
      if (child && !this.__items.includes(child)) {
        this.__items.push(child);
        if (typeof child.setName === "function") {
          child.setName(this.getEffectiveGroupName());
        }
        if (typeof child.setGroup === "function") {
          child.setGroup(this);
        }
        if (typeof child.getValue === "function" && child.getValue()) {
          this.__selectItem(child);
        }
      }
      return this;
    },

    remove(child) {
      const idx = this.__items ? this.__items.indexOf(child) : -1;
      if (idx !== -1) {
        this.__items.splice(idx, 1);
      }
      if (this.__selectedItem === child) {
        this.__selectedItem = null;
      }
      return super.remove(child);
    },

    removeAll() {
      if (this.__items) {
        this.__items.length = 0;
      }
      this.__selectedItem = null;
      return super.removeAll();
    },

    _onBubbledChange() {
      if (!this.__items) return;
      for (const item of this.__items) {
        const domInput = item.getInputElement?.()?.getDomElement?.();
        if (domInput && domInput.checked) {
          this.__selectItem(item);
          return;
        }
      }
    },

    __selectItem(selected) {
      if (!this.__items) return;
      const oldItem = this.__selectedItem;
      this.__selectedItem = selected || null;
      for (const item of this.__items) {
        if (typeof item.setValue === "function") {
          item.setValue(item === selected);
        }
      }
      if (oldItem !== this.__selectedItem) {
        const nextSel = this.__selectedItem ? [this.__selectedItem] : [];
        const prevSel = oldItem ? [oldItem] : [];
        this.fireDataEvent("changeSelection", nextSel, prevSel);
        this.fireDataEvent(
          "changeValue",
          this.getValue(),
          oldItem ? this.__extractItemValue(oldItem) : null
        );
      }
    },

    __extractItemValue(item) {
      if (!item) return null;
      if (typeof item.getModel === "function" && item.getModel() != null) {
        return item.getModel();
      }
      if (typeof item.getLabel === "function") {
        return item.getLabel();
      }
      return item;
    },

    /*
    ---------------------------------------------------------------------------
      SELECTION & FORM VALUE API (`ISingleSelection`, `MModelSelection`, `IField`)
    ---------------------------------------------------------------------------
    */

    getSelection() {
      return this.__selectedItem ? [this.__selectedItem] : [];
    },

    setSelection(items) {
      const target = Array.isArray(items) && items.length > 0 ? items[0] : null;
      this.__selectItem(target);
    },

    resetSelection() {
      this.__selectItem(null);
    },

    isSelected(item) {
      return this.__selectedItem === item;
    },

    isSelectionEmpty() {
      return this.__selectedItem == null;
    },

    getSelectables() {
      return this.__items ? this.__items.slice() : [];
    },

    getModelSelection() {
      const val = this.getValue();
      return new qx.data.Array(val != null ? [val] : []);
    },

    setModelSelection(models) {
      const target =
        models && typeof models.getItem === "function"
          ? models.getItem(0)
          : Array.isArray(models)
          ? models[0]
          : null;
      this.setValue(target);
    },

    getValue() {
      return this.__extractItemValue(this.__selectedItem);
    },

    setValue(value) {
      if (value == null) {
        this.resetSelection();
        return;
      }
      if (!this.__items) return;
      for (const item of this.__items) {
        if (item === value || this.__extractItemValue(item) === value) {
          this.__selectItem(item);
          return;
        }
      }
    },

    resetValue() {
      this.resetSelection();
    },

    _applyName() {
      if (!this.__items) {
        return;
      }
      const effective = this.getEffectiveGroupName();
      for (const item of this.__items) {
        if (typeof item.setName === "function") {
          item.setName(effective);
        }
      }
    }
  },

  defer(statics) {
    qx.Bootstrap.createNamespace("ville.ui.form.RadioGroup", statics);
  },

  destruct() {
    this.__items = null;
    this.__selectedItem = null;
  }
});
