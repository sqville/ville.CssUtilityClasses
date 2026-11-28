/**
 * The stack container shows only one of its child widgets at a time.
 * All other children are hidden using `visibility: "excluded"`.
 *
 * Uses `ville.ui.core.Box` + `ville.ui.core.ISingleSelection` (zero legacy `qx.ui.*`).
 */
qx.Class.define("ville.ui.container.Stack", {
  extend: ville.ui.core.Box,
  implement: [ville.ui.core.ISingleSelection],

  construct() {
    super();

    this._setLayout(new ville.ui.layout.Grow());
    this.__selected = null;
  },

  properties: {
    /**
     * Whether the size of the stack depends on the selected child. When
     * disabled (default) the stack spans the maximum of all children.
     */
    dynamic: {
      check: "Boolean",
      init: false,
      apply: "_applyDynamic"
    }
  },

  events: {
    /** Fires after the selection was modified. Data: `{Array}` of selected widgets. */
    changeSelection: "qx.event.type.Data"
  },

  members: {
    __selected: null,

    _applyDynamic(value) {
      const children = this._getChildren();
      const selected = this.__selected;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child !== selected) {
          child.setVisibility(value ? "excluded" : "hidden");
        }
      }
    },

    _afterAddChild(child) {
      const selected = this.__selected;
      if (!selected) {
        this.__selected = child;
        child.show();
        this.fireDataEvent("changeSelection", [child], []);
      } else if (child !== selected) {
        child.setVisibility(this.isDynamic() ? "excluded" : "hidden");
      }
    },

    _afterRemoveChild(child) {
      if (this.__selected === child) {
        const children = this._getChildren();
        const next = children[0] || null;
        this.__selected = next;
        if (next) {
          next.show();
          this.fireDataEvent("changeSelection", [next], [child]);
        } else {
          this.fireDataEvent("changeSelection", [], [child]);
        }
      }
    },

    /**
     * Go to the previous child in the children list.
     */
    previous() {
      const children = this._getChildren();
      if (children.length === 0) return;
      const idx = children.indexOf(this.__selected);
      const prevIdx = idx > 0 ? idx - 1 : children.length - 1;
      this.setSelection([children[prevIdx]]);
    },

    /**
     * Go to the next child in the children list.
     */
    next() {
      const children = this._getChildren();
      if (children.length === 0) return;
      const idx = children.indexOf(this.__selected);
      const nextIdx = idx < children.length - 1 ? idx + 1 : 0;
      this.setSelection([children[nextIdx]]);
    },

    // ------------------------------------------------------------------------
    // ISingleSelection Interface
    // ------------------------------------------------------------------------

    getSelection() {
      return this.__selected ? [this.__selected] : [];
    },

    setSelection(items) {
      const item = Array.isArray(items) && items.length > 0 ? items[0] : null;
      if (!item) {
        this.resetSelection();
        return;
      }

      if (!this.isSelectAble(item)) return;
      const old = this.__selected;
      if (old === item) return;

      const hideMode = this.isDynamic() ? "excluded" : "hidden";
      if (old) {
        old.setVisibility(hideMode);
      }

      this.__selected = item;
      item.show();

      this.fireDataEvent("changeSelection", [item], old ? [old] : []);
    },

    resetSelection() {
      const old = this.__selected;
      if (!old) return;
      old.setVisibility(this.isDynamic() ? "excluded" : "hidden");
      this.__selected = null;
      this.fireDataEvent("changeSelection", [], [old]);
    },

    isSelected(item) {
      return this.__selected === item;
    },

    isSelectionEmpty() {
      return this.__selected === null;
    },

    getSelectables(all) {
      return this._getChildren().slice();
    },

    isSelectAble(item) {
      return Boolean(item && this._getChildren().includes(item));
    }
  },

  destruct() {
    this.__selected = null;
  }
});
