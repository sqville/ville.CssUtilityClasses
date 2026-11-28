/**
 * Ville UI's `QxLayout`-Style Take on `qx.ui.list.List` (`ville.ui.list.List` — `STRAT-WIDGET-08`, `STRAT-CORE-09`).
 *
 * Unifies `qx.ui.form.List` and `qx.ui.list.List` (`VirtualList`) into a single
 * non-virtual data-bound list widget powered by `ville.ui.core.MDataView` and
 * `ville.ui.form.MModelSelection`:
 *  - Supports classic `list.add(new ville.ui.form.ListItem(...))` AND modern
 *    `list.setItems([...])` AND observable `list.setModel(new ville.data.Array([...]))`
 *    with `labelPath`, `iconPath`, `descriptionPath`, and `delegate` (`filter`, `sorter`, `bindItem`).
 *  - Uses pre-compiled `<template>` row cloning, Tier 1 `content-visibility: auto`,
 *    Tier 2 windowed DOM row-pool recycling (`virtualThreshold`), and W3C `CSS.highlights`
 *    live search highlighting.
 */
qx.Class.define("ville.ui.list.List", {
  extend: ville.ui.core.Widget,
  include: [
    ville.ui.form.MForm,
    ville.ui.form.MModelSelection,
    ville.ui.core.MDataView
  ],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.IForm,
    ville.ui.core.ISingleSelection,
    ville.ui.form.IModelSelection
  ],

  /**
   * @param {ville.data.Array|Array<Object|string|ville.ui.form.ListItem>|null} [modelOrItems=null] Optional initial observable `ville.data.Array` or items array.
   */
  construct(modelOrItems = null) {
    // @ts-ignore
    super();

    this.__selectedItems = [];
    this.__activeIndex = -1;

    this.setItemAppearance("selectbox-item");

    const el = this.getContentElement();
    el.setAttributes({
      role: "listbox",
      tabindex: "0"
    });
    el.setStyles({
      overflowY: "auto",
      overflowX: "hidden"
    });

    el.addListener("click", this._onListClick, this);
    el.addListener("keydown", this._onKeyDown, this);

    if (modelOrItems instanceof ville.data.Array) {
      this.setModel(modelOrItems);
    } else if (Array.isArray(modelOrItems)) {
      this.setItems(modelOrItems);
    }
  },

  events: {
    /** Fired when the selection changes (`ISingleSelection` / `IMultiSelection`). */
    changeSelection: "qx.event.type.Data",

    /** Fired when an item row is clicked. Data: `{ index, item, value }` */
    itemClick: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "simplelist"
    },

    /** Observable `ville.data.Array` (`qx.data.Array`) data model (`qx.ui.list.List` contract). */
    model: {
      check: "ville.data.Array",
      nullable: true,
      init: null,
      apply: "_applyModel",
      event: "changeModel"
    },

    /** Property path on model items used for the row label (e.g. `"name"` or `"label"`). */
    labelPath: {
      check: "String",
      nullable: true,
      init: "label",
      apply: "_syncFromBoundModel"
    },

    /** Property path on model items used for the row icon (e.g. `"icon"`). */
    iconPath: {
      check: "String",
      nullable: true,
      init: "icon",
      apply: "_syncFromBoundModel"
    },

    /** Property path on model items used for the secondary description. */
    descriptionPath: {
      check: "String",
      nullable: true,
      init: "description",
      apply: "_syncFromBoundModel"
    },

    /** Optional Qooxdoo list delegate (`{ filter, sorter }` functions). */
    delegate: {
      check: "Object",
      nullable: true,
      init: null,
      apply: "_syncFromBoundModel"
    },

    /** Selection mode (`"single"`, `"multi"`, `"additive"`, `"one"`, `"none"`). */
    selectionMode: {
      check: ["single", "multi", "additive", "one", "none"],
      init: "single"
    },

    /** Currently selected value (or array of values in `"multi"` mode). */
    value: {
      nullable: true,
      init: null,
      apply: "_applyValue",
      event: "changeValue"
    },

    /** Live filter text that filters visible rows and highlights matches via `CSS.highlights`. */
    filterText: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyFilterText",
      event: "changeFilterText"
    }
  },

  members: {
    /** @type {ville.ui.form.ListItem[]} @private */
    __selectedItems: null,

    /** @type {number} @private */
    __activeIndex: -1,

    /** @type {boolean} @private */
    __syncingSelection: false,

    /** @type {*} @private */
    __modelChangeListenerId: null,

    _applyModel(value, old) {
      if (old && this.__modelChangeListenerId) {
        old.removeListenerById(this.__modelChangeListenerId);
        this.__modelChangeListenerId = null;
      }
      if (value) {
        this.__modelChangeListenerId = value.addListener(
          "change",
          this._syncFromBoundModel,
          this
        );
      }
      this._syncFromBoundModel();
    },

    _readPath(item, path) {
      if (!item || !path) return undefined;
      if (typeof item !== "object") return item;
      const getter = `get${qx.Bootstrap.firstUp(path)}`;
      if (typeof item[getter] === "function") {
        return item[getter]();
      }
      return item[path];
    },

    _syncFromBoundModel() {
      const model = this.getModel();
      if (!model) return;

      let rawItems = model.toArray().slice();
      const delegate = this.getDelegate();

      if (delegate && typeof delegate.filter === "function") {
        rawItems = rawItems.filter(delegate.filter);
      }
      if (delegate && typeof delegate.sorter === "function") {
        rawItems.sort(delegate.sorter);
      }

      const lPath = this.getLabelPath() || "label";
      const iPath = this.getIconPath() || "icon";
      const dPath = this.getDescriptionPath() || "description";

      const mapped = rawItems.map((entry) => {
        if (entry instanceof ville.ui.form.ListItem) return entry;
        if (typeof entry === "string" || typeof entry === "number") {
          return new ville.ui.form.ListItem(String(entry), null, entry);
        }
        const label =
          this._readPath(entry, lPath) ??
          this._readPath(entry, "name") ??
          this._readPath(entry, "title") ??
          String(entry);
        const icon = this._readPath(entry, iPath) || null;
        const desc = this._readPath(entry, dPath) || null;
        const val = this._readPath(entry, "value") ?? entry;
        const li = new ville.ui.form.ListItem(String(label), icon, entry);
        if (typeof val === "string" || typeof val === "number") {
          li.setValue(String(val));
        }
        if (desc) {
          li.setDescription(String(desc));
        }
        return li;
      });

      this.setItems(mapped);
    },

    _syncDataViewDom() {
      const domEl = this._ensureDomElement();
      if (!domEl) return;
      this._renderDataViewRows(domEl, {
        filterText: this.getFilterText() || "",
        selectedItems: this.__selectedItems || [],
        activeIndex: this.__activeIndex,
        showCheckmark: true,
        highlightQuery: this.getHighlightQuery() || this.getFilterText() || null
      });
    },

    _applyFilterText(value) {
      this.setHighlightQuery(value || null);
      this._scheduleDataViewRender();
    },

    _onListClick(e) {
      if (!this.getEnabled() || this.getSelectionMode() === "none") return;
      const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
      const target = /** @type {HTMLElement|null} */ (nativeEvt ? nativeEvt.target : null);
      if (!target || typeof target.closest !== "function") return;

      const rowEl = target.closest("[data-ville-index]");
      if (!rowEl) return;

      const idx = Number(rowEl.getAttribute("data-ville-index"));
      const item = this.getItems()[idx];
      if (!item || !item.getEnabled()) return;

      this.__activeIndex = idx;
      const mode = this.getSelectionMode();
      if (mode === "additive" || (mode === "multi" && (nativeEvt.metaKey || nativeEvt.ctrlKey))) {
        const next = this.__selectedItems.slice();
        const pos = next.indexOf(item);
        if (pos !== -1) {
          next.splice(pos, 1);
        } else {
          next.push(item);
        }
        this.setSelection(next);
      } else {
        this.setSelection([item]);
      }

      this.fireDataEvent("itemClick", {
        index: idx,
        item,
        value: item.getEffectiveValue()
      });
    },

    _onKeyDown(e) {
      if (!this.getEnabled() || this.getSelectionMode() === "none") return;
      const key = typeof e.getKey === "function" ? e.getKey() : e.key;
      if (key !== "ArrowDown" && key !== "ArrowUp") return;

      if (typeof e.preventDefault === "function") {
        e.preventDefault();
      }
      const items = this.getItems();
      if (items.length === 0) return;

      const dir = key === "ArrowDown" ? 1 : -1;
      let nextIdx =
        this.__activeIndex >= 0
          ? this.__activeIndex
          : this.__selectedItems.length > 0
          ? items.indexOf(this.__selectedItems[0])
          : dir > 0
          ? -1
          : items.length;

      for (let step = 0; step < items.length; step++) {
        nextIdx = (nextIdx + dir + items.length) % items.length;
        if (items[nextIdx].getEnabled()) {
          this.__activeIndex = nextIdx;
          this.setSelection([items[nextIdx]]);
          break;
        }
      }
    },

    // ------------------------------------------------------------------------
    // ISingleSelection / Selection Implementation
    // ------------------------------------------------------------------------

    getSelection() {
      return this.__selectedItems ? this.__selectedItems.slice() : [];
    },

    setSelection(items) {
      const resolved = [];
      if (Array.isArray(items)) {
        for (const candidate of items) {
          const match = this.findItem(candidate);
          if (match && !resolved.includes(match)) {
            resolved.push(match);
          }
        }
      }

      const old = this.__selectedItems ? this.__selectedItems.slice() : [];
      if (qx.lang.Array.equals(old, resolved)) return;

      this.__selectedItems = resolved;
      if (!this.__syncingSelection) {
        this.__syncingSelection = true;
        try {
          const first = resolved[0] || null;
          this.setValue(first ? first.getEffectiveValue() : null);
        } finally {
          this.__syncingSelection = false;
        }
      }

      this._scheduleDataViewRender();
      this.fireDataEvent("changeSelection", resolved, old);
    },

    resetSelection() {
      this.setSelection([]);
    },

    isSelected(item) {
      return Boolean(this.__selectedItems && this.__selectedItems.includes(item));
    },

    isSelectionEmpty() {
      return !this.__selectedItems || this.__selectedItems.length === 0;
    },

    getSelectables(all = true) {
      const items = this.getItems();
      return all ? items : items.filter((it) => it.getEnabled());
    },

    _applyValue(value) {
      if (this.__syncingSelection) return;
      this.__syncingSelection = true;
      try {
        const match = value !== null && value !== undefined ? this.findItem(value) : null;
        this.setSelection(match ? [match] : []);
      } finally {
        this.__syncingSelection = false;
      }
    },

    /**
     * Triggered by `qx.data.controller.List` / developer calls to refresh the view.
     */
    refresh() {
      if (this.getModel()) {
        this._syncFromBoundModel();
      } else {
        this._scheduleDataViewRender();
      }
    }
  },

  destruct() {
    const model = this.getModel();
    if (model && this.__modelChangeListenerId) {
      model.removeListenerById(this.__modelChangeListenerId);
    }
    this.__selectedItems = null;
  }
});
