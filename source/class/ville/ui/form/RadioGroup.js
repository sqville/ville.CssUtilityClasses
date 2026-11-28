/**
 * Lightweight non-DOM radio group manager (`ville.ui.form.RadioGroup`)
 * managing single-selection state across `{ville.ui.form.IRadioItem}` instances
 * (`TabButton`, `toolbar.RadioButton`, `RadioButton`, `menu.RadioButton`).
 */
qx.Class.define("ville.ui.form.RadioGroup", {
  extend: qx.core.Object,
  implement: [ville.ui.core.ISingleSelection],

  /**
   * @param varargs {ville.ui.form.IRadioItem...} Optional items to add initially
   */
  construct(...items) {
    super();

    this.__items = [];
    if (items.length > 0) {
      this.add(...items);
    }
  },

  events: {
    /** Fires after the selection was modified. Data: `{ville.ui.form.IRadioItem[]}` */
    changeSelection: "qx.event.type.Data",

    /** Fired when the selected item's value/model changes. */
    changeValue: "qx.event.type.Data"
  },

  properties: {
    /** Whether cycling from last to first item is enabled */
    wrap: {
      check: "Boolean",
      init: true
    },

    /** Whether the radio group is allowed to have no selected item */
    allowEmptySelection: {
      check: "Boolean",
      init: false,
      apply: "_applyAllowEmptySelection"
    },

    /** Whether all items in the group are enabled */
    enabled: {
      check: "Boolean",
      init: true,
      apply: "_applyEnabled"
    }
  },

  members: {
    __items: null,
    __selected: null,
    __inSync: false,

    /**
     * Adds one or more items to the radio group.
     *
     * @param varargs {ville.ui.form.IRadioItem...} Items to add
     */
    add(...items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item || this.__items.includes(item)) continue;

        this.__items.push(item);
        item.addListener("changeValue", this._onItemChangeValue, this);

        if (typeof item.getGroup === "function" && item.getGroup() !== this) {
          item.setGroup(this);
        }

        if (item.getValue()) {
          this.setSelection([item]);
        } else if (!this.__selected && !this.getAllowEmptySelection() && this.__items.length === 1) {
          this.setSelection([item]);
        }
      }
    },

    /**
     * Removes an item from the radio group.
     *
     * @param item {ville.ui.form.IRadioItem} Item to remove
     */
    remove(item) {
      const idx = this.__items ? this.__items.indexOf(item) : -1;
      if (idx === -1) return;

      this.__items.splice(idx, 1);
      item.removeListener("changeValue", this._onItemChangeValue, this);

      if (typeof item.getGroup === "function" && item.getGroup() === this) {
        item.setGroup(null);
      }

      if (this.__selected === item) {
        if (!this.getAllowEmptySelection() && this.__items.length > 0) {
          this.setSelection([this.__items[0]]);
        } else {
          this.resetSelection();
        }
      }
    },

    /**
     * Returns all items managed by this group.
     *
     * @return {ville.ui.form.IRadioItem[]}
     */
    getItems() {
      return this.__items ? this.__items.slice() : [];
    },

    /**
     * Alias for `getItems()`.
     *
     * @return {ville.ui.form.IRadioItem[]}
     */
    getChildren() {
      return this.getItems();
    },

    _onItemChangeValue(e) {
      if (this.__inSync) return;
      const item = e.getTarget();
      if (e.getData()) {
        this.setSelection([item]);
      } else if (this.__selected === item) {
        if (this.getAllowEmptySelection()) {
          this.resetSelection();
        } else {
          this.__inSync = true;
          item.setValue(true);
          this.__inSync = false;
        }
      }
    },

    _applyAllowEmptySelection(value) {
      if (!value && !this.__selected && this.__items && this.__items.length > 0) {
        this.setSelection([this.__items[0]]);
      }
    },

    _applyEnabled(value) {
      if (!this.__items) return;
      for (let i = 0; i < this.__items.length; i++) {
        if (typeof this.__items[i].setEnabled === "function") {
          this.__items[i].setEnabled(value);
        }
      }
    },

    // ------------------------------------------------------------------------
    // ISingleSelection Implementation
    // ------------------------------------------------------------------------

    getSelection() {
      return this.__selected ? [this.__selected] : [];
    },

    setSelection(items) {
      const target = Array.isArray(items) && items.length > 0 ? items[0] : null;
      if (!target) {
        if (this.getAllowEmptySelection()) {
          this.resetSelection();
        }
        return;
      }

      if (!this.__items || !this.__items.includes(target)) return;
      const old = this.__selected;
      if (old === target) {
        if (!target.getValue()) {
          this.__inSync = true;
          target.setValue(true);
          this.__inSync = false;
        }
        return;
      }

      this.__inSync = true;
      if (old && old.getValue()) {
        old.setValue(false);
      }
      this.__selected = target;
      if (!target.getValue()) {
        target.setValue(true);
      }
      this.__inSync = false;

      this.fireDataEvent("changeSelection", [target], old ? [old] : []);
    },

    resetSelection() {
      const old = this.__selected;
      if (!old) return;
      this.__inSync = true;
      if (old.getValue()) {
        old.setValue(false);
      }
      this.__selected = null;
      this.__inSync = false;
      this.fireDataEvent("changeSelection", [], [old]);
    },

    isSelected(item) {
      return this.__selected === item;
    },

    isSelectionEmpty() {
      return this.__selected === null;
    },

    getSelectables(all) {
      if (!this.__items) return [];
      if (all) return this.__items.slice();
      return this.__items.filter((item) =>
        typeof item.getEnabled === "function" ? item.getEnabled() !== false : true
      );
    }
  },

  destruct() {
    this.__items = null;
    this.__selected = null;
  }
});
