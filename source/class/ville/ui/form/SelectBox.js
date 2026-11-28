/**
 * Mode 3 / Path B Unified SelectBox Widget (`ville.ui.form.SelectBox` — `STRAT-WIDGET-08`, `STRAT-CORE-09`).
 *
 * Replaces both `qx.ui.form.SelectBox` and `qx.ui.form.VirtualSelectBox` with a
 * single standards-first widget combining:
 *  - Flattened `<button type="button" role="combobox">` trigger + hidden `<input type="hidden" name="...">`
 *    so native `<form>` `FormData` extraction works automatically.
 *  - Top-Layer Popover dropdown (`ville.ui.overlay.Popup`, `popover="auto"`, `role="listbox"`)
 *    positioned via CSS Anchor Positioning (`MPlacement`).
 *  - Pre-processed `<template>` row cloning via `ville.ui.core.MDataView` with C++
 *    `content-visibility: auto` and `<svg><use>` sprite icons (zero child `Widget` instances per option).
 *  - Full compatibility with both modern `setItems([{ label, value, icon }])` / `getValue()` / `setValue()`
 *    and classic Qooxdoo `add(new ville.ui.form.ListItem(...))` / `getSelection()` / `getModelSelection()`.
 */
qx.Class.define("ville.ui.form.SelectBox", {
  extend: ville.ui.core.Widget,
  include: [
    ville.ui.form.MForm,
    ville.ui.form.MModelSelection,
    ville.ui.core.MDataView
  ],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.IStringForm,
    ville.ui.form.IModelForm,
    ville.ui.form.IForm,
    ville.ui.core.ISingleSelection,
    ville.ui.form.IModelSelection
  ],

  /**
   * @param {Array<string|Object|ville.ui.form.ListItem>} [items] Optional initial options array.
   * @param {string|null} [value] Optional initial selected value.
   */
  construct(items, value) {
    // @ts-ignore
    super();

    this.__selectedItem = null;
    this.__activeIndex = -1;

    this.setItemAppearance("selectbox-item");
    this.initVariant();
    this.initSize();
    this.initRadius();

    this._createChildControl("button");
    this._createChildControl("popup");

    const contentEl = this.getContentElement();
    contentEl.addListener("keydown", this._onKeyDown, this);

    if (Array.isArray(items) || items instanceof ville.data.Array) {
      this.setItems(items);
    }

    if (value !== undefined && value !== null) {
      this.setValue(value);
    }
  },

  events: {
    /** Fired when the selected option changes (`ISingleSelection` contract). */
    changeSelection: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "selectbox"
    },

    /** Visual variant (`"default"`, `"filled"`, `"unstyled"`). */
    variant: {
      init: "default",
      check: ["default", "filled", "unstyled"],
      nullable: true,
      themeable: true,
      apply: "_applyVariant",
      event: "changeVariant"
    },

    /** Size scale (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`). */
    size: {
      init: "sm",
      check: ["xs", "sm", "md", "lg", "xl"],
      nullable: true,
      themeable: true,
      apply: "_applySize",
      event: "changeSize"
    },

    /** Border radius scale (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`). */
    radius: {
      init: "md",
      check: ["xs", "sm", "md", "lg", "xl"],
      nullable: true,
      themeable: true,
      apply: "_applyRadius",
      event: "changeRadius"
    },

    /** Currently selected value (`IField` / `IStringForm` / `IModelForm`). */
    value: {
      nullable: true,
      init: null,
      apply: "_applyValue",
      event: "changeValue"
    },

    /** Native form field `name` synced to an internal `<input type="hidden">`. */
    name: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyName"
    },

    /** Placeholder shown when no option is selected. */
    placeholder: {
      check: "String",
      nullable: true,
      init: "Select an option...",
      apply: "_applyPlaceholder"
    },

    /** Whether the dropdown popover is currently open in `#top-layer`. */
    opened: {
      check: "Boolean",
      init: false,
      apply: "_applyOpened",
      event: "changeOpened"
    },

    /** Maximum dropdown height in pixels (scrolls natively via CSS `overflow-y: auto`). */
    maxListHeight: {
      check: "Number",
      init: 260,
      themeable: true,
      apply: "_applyMaxListHeight"
    }
  },

  members: {
    /** @type {ville.ui.form.ListItem|null} @private */
    __selectedItem: null,

    /** @type {number} @private */
    __activeIndex: -1,

    /** @type {boolean} @private */
    __syncingSelection: false,

    /** @type {ville.html.Element|null} @private */
    __hiddenInputEl: null,

    /** @type {ville.html.Element|null} @private */
    __triggerLabelEl: null,

    /** @type {ville.html.Element|null} @private */
    __triggerIconSlotEl: null,

    /*
    ---------------------------------------------------------------------------
      CHILD CONTROLS (`button` trigger & `popup` top-layer listbox)
    ---------------------------------------------------------------------------
    */

    /**
     * @override
     * @param {string} id
     * @param {*} [hash]
     * @returns {ville.ui.core.Widget|null}
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control;

      switch (id) {
        case "button": {
          control = new ville.ui.core.Box("button");
          const btnEl = control.getContentElement();
          const btnId = `ville-selectbox-btn-${this.toHashCode()}`;
          const listId = `ville-selectbox-list-${this.toHashCode()}`;
          btnEl.setAttributes({
            id: btnId,
            type: "button",
            role: "combobox",
            "aria-haspopup": "listbox",
            "aria-expanded": "false",
            "aria-controls": listId
          });

          const iconSlot = new ville.html.Element("span", null, {
            class: "ville-selectbox-icon",
            "aria-hidden": "true"
          });
          iconSlot.setStyle("display", "none");

          const labelSpan = new ville.html.Element("span", null, {
            class: "ville-selectbox-label"
          });

          const chevronSpan = new ville.html.Element("span", null, {
            class: "ville-selectbox-chevron",
            "aria-hidden": "true"
          });
          const chevronIcon = ville.ui.icon.Default.createElement(
            "CHEVRON_UP_DOWN",
            { size: 15, useSprite: true }
          );
          if (chevronIcon) {
            chevronSpan.add(chevronIcon);
          }

          btnEl.add(iconSlot);
          btnEl.add(labelSpan);
          btnEl.add(chevronSpan);

          this.__triggerIconSlotEl = iconSlot;
          this.__triggerLabelEl = labelSpan;

          const hiddenInput = new ville.html.Element("input", null, {
            type: "hidden",
            name: this.getName() || null,
            value: ""
          });
          this.__hiddenInputEl = hiddenInput;
          this.getContentElement().add(hiddenInput);

          control.addListener("click", () => {
            if (this.isEnabled()) {
              this.toggle();
            }
          });

          this._add(control);
          this.__syncTriggerDisplay();
          break;
        }

        case "popup": {
          control = new ville.ui.overlay.Popup();
          control.setPosition("bottom-left");
          control.placeToWidget(this);

          const popEl = control.getContentElement();
          const listId = `ville-selectbox-list-${this.toHashCode()}`;
          popEl.setAttributes({
            id: listId,
            role: "listbox",
            tabindex: "-1"
          });
          popEl.setStyles({
            maxHeight: `${this.getMaxListHeight()}px`,
            overflowY: "auto",
            minWidth: "anchor-size(width, 180px)"
          });

          // Single delegated click listener on the popup root
          popEl.addListener("click", this._onPopupClick, this);

          control.addListener("changeOpened", (e) => {
            const isOpen = Boolean(e.getData());
            if (this.getOpened() !== isOpen) {
              this.setOpened(isOpen);
            }
          });

          break;
        }
      }

      return control || super._createChildControlImpl(id, hash);
    },

    /*
    ---------------------------------------------------------------------------
      ISingleSelection & PUBLIC SELECTION API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns an array containing the currently selected `ListItem` (or empty array).
     *
     * @returns {ville.ui.form.ListItem[]}
     */
    getSelection() {
      return this.__selectedItem ? [this.__selectedItem] : [];
    },

    /**
     * Sets the active selection from an array of `ListItem` descriptors (or value strings).
     *
     * @param {Array<ville.ui.form.ListItem|string>} items
     */
    setSelection(items) {
      if (!Array.isArray(items) || items.length === 0) {
        this.resetSelection();
        return;
      }
      const candidate = this.findItem(items[0]);
      this.__selectItem(candidate);
    },

    /**
     * Clears the current selection.
     */
    resetSelection() {
      this.__selectItem(null);
    },

    /**
     * Checks whether `item` is currently selected.
     *
     * @param {ville.ui.form.ListItem} item
     * @returns {boolean}
     */
    isSelected(item) {
      return this.__selectedItem === item;
    },

    /**
     * Checks whether no item is selected.
     *
     * @returns {boolean}
     */
    isSelectionEmpty() {
      return this.__selectedItem === null;
    },

    /**
     * Returns all selectable `ListItem` descriptors.
     *
     * @param {boolean} [all=true] If `false`, returns only enabled items.
     * @returns {ville.ui.form.ListItem[]}
     */
    getSelectables(all = true) {
      const items = this.getItems();
      return all ? items : items.filter((it) => it.getEnabled());
    },

    /**
     * Opens the top-layer dropdown listbox.
     */
    open() {
      if (this.isEnabled()) {
        this.setOpened(true);
      }
    },

    /**
     * Closes the top-layer dropdown listbox.
     */
    close() {
      this.setOpened(false);
    },

    /**
     * Toggles the top-layer dropdown listbox.
     */
    toggle() {
      if (this.isEnabled()) {
        this.setOpened(!this.getOpened());
      }
    },

    /*
    ---------------------------------------------------------------------------
      INTERNAL SELECTION & DATA VIEW SYNCHRONIZATION
    ---------------------------------------------------------------------------
    */

    /**
     * Selects a `ListItem` and synchronizes `value`, `changeSelection`, trigger label,
     * hidden `<input>`, and popup DOM rows.
     *
     * @param {ville.ui.form.ListItem|null} item
     * @private
     */
    __selectItem(item) {
      if (this.__selectedItem === item) {
        return;
      }
      const oldItem = this.__selectedItem;
      this.__selectedItem = item || null;
      this.__activeIndex = item ? this.indexOf(item) : -1;

      if (!this.__syncingSelection) {
        this.__syncingSelection = true;
        try {
          const nextVal = item ? item.getEffectiveValue() : null;
          this.setValue(nextVal);
        } finally {
          this.__syncingSelection = false;
        }
      }

      this.__syncTriggerDisplay();
      this._scheduleDataViewRender();

      this.fireDataEvent(
        "changeSelection",
        item ? [item] : [],
        oldItem ? [oldItem] : []
      );
      this._dispatchNativeEvent("ville:change", {
        value: item ? item.getEffectiveValue() : null,
        item
      });
    },

    /**
     * Updates the trigger button's text, placeholder state, icon, and hidden `<input>`.
     *
     * @private
     */
    __syncTriggerDisplay() {
      const item = this.__selectedItem;
      const labelEl = this.__triggerLabelEl;
      const iconSlot = this.__triggerIconSlotEl;
      const hiddenEl = this.__hiddenInputEl;

      if (labelEl) {
        const text = item ? item.getLabel() : this.getPlaceholder() || "";
        labelEl.setAttribute("html", this.__escapeHtml(text));
        if (item) {
          this.removeState("placeholder");
          labelEl.removeAttribute("data-placeholder");
        } else {
          this.addState("placeholder");
          labelEl.setAttribute("data-placeholder", "true");
        }
      }

      if (iconSlot) {
        iconSlot.removeAll();
        const iconSpec = item ? item.getIcon() : null;
        if (iconSpec) {
          const iconVdom = ville.ui.icon.Default.createElement(iconSpec, {
            size: 16,
            useSprite: true
          });
          if (iconVdom) {
            iconSlot.add(iconVdom);
            iconSlot.setStyle("display", "inline-flex");
          }
        } else {
          iconSlot.setStyle("display", "none");
        }
      }

      if (hiddenEl) {
        const val = item ? item.getEffectiveValue() : "";
        hiddenEl.setAttribute(
          "value",
          val !== null && val !== undefined ? String(val) : ""
        );
      }

      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Escapes text safely for `setAttribute("html", ...)`.
     *
     * @param {string} str
     * @returns {string}
     * @private
     */
    __escapeHtml(str) {
      return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },

    /**
     * @override
     * @protected
     */
    _onDataItemsChanged() {
      const items = this.getItems();
      if (this.__selectedItem && !items.includes(this.__selectedItem)) {
        this.__selectedItem = null;
      }
      if (!this.__selectedItem && this.getValue() !== null) {
        const match = this.findItem(this.getValue());
        if (match) {
          this.__selectedItem = match;
        }
      }
      this.__syncTriggerDisplay();
    },

    /**
     * Renders `<template>`-cloned option rows into the popup's live DOM element.
     *
     * @override
     * @protected
     */
    _syncDataViewDom() {
      const popup = this.getChildControl("popup", true);
      if (!popup) {
        return;
      }
      const domContainer = popup._ensureDomElement();
      if (!domContainer) {
        return;
      }
      this._renderDataViewRows(domContainer, {
        selectedItems: this.__selectedItem ? [this.__selectedItem] : [],
        activeIndex: this.__activeIndex,
        showCheckmark: true
      });
    },

    /*
    ---------------------------------------------------------------------------
      EVENT DELEGATION & KEYBOARD NAVIGATION
    ---------------------------------------------------------------------------
    */

    /**
     * Delegated click handler on the popup container (`event.target.closest("[data-ville-index]")`).
     *
     * @param {Object} e
     * @protected
     */
    _onPopupClick(e) {
      const nativeEvt = e?.getNativeEvent ? e.getNativeEvent() : e;
      const target = /** @type {HTMLElement|null} */ (nativeEvt?.target);
      if (!target || typeof target.closest !== "function") {
        return;
      }
      const rowEl = target.closest("[data-ville-index]");
      if (!rowEl) {
        return;
      }
      const idx = Number(rowEl.getAttribute("data-ville-index"));
      const items = this.getItems();
      const item = items[idx];
      if (item && item.getEnabled()) {
        this.__selectItem(item);
        this.close();
      }
    },

    /**
     * Keyboard accessibility handler (`ArrowDown`, `ArrowUp`, `Home`, `End`, `Enter`, `Space`, `Escape`).
     *
     * @param {Object} e
     * @protected
     */
    _onKeyDown(e) {
      if (!this.isEnabled()) {
        return;
      }
      const key = typeof e.getKey === "function" ? e.getKey() : e.key;
      const items = this.getItems();
      if (items.length === 0) {
        return;
      }

      if (key === "ArrowDown" || key === "ArrowUp") {
        e.preventDefault();
        if (!this.getOpened()) {
          this.open();
        }
        const dir = key === "ArrowDown" ? 1 : -1;
        let nextIdx =
          this.__activeIndex >= 0
            ? this.__activeIndex
            : this.__selectedItem
            ? items.indexOf(this.__selectedItem)
            : dir > 0
            ? -1
            : items.length;

        for (let step = 0; step < items.length; step++) {
          nextIdx = (nextIdx + dir + items.length) % items.length;
          if (items[nextIdx].getEnabled()) {
            this.__activeIndex = nextIdx;
            this.__selectItem(items[nextIdx]);
            this._syncDataViewDom();
            break;
          }
        }
      } else if (key === "Enter" || key === " ") {
        e.preventDefault();
        if (this.getOpened()) {
          if (this.__activeIndex >= 0 && items[this.__activeIndex]?.getEnabled()) {
            this.__selectItem(items[this.__activeIndex]);
          }
          this.close();
        } else {
          this.open();
        }
      } else if (key === "Escape" && this.getOpened()) {
        e.preventDefault();
        this.close();
      }
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIERS
    ---------------------------------------------------------------------------
    */

    _applyVariant(value, old) {
      this._syncModifierState("variant", value, old);
    },

    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    _applyRadius(value, old) {
      this._syncModifierState("radius", value, old);
    },

    _applyValue(value) {
      if (this.__syncingSelection) {
        return;
      }
      const match = value !== null && value !== undefined ? this.findItem(value) : null;
      this.__syncingSelection = true;
      try {
        this.__selectItem(match);
      } finally {
        this.__syncingSelection = false;
      }
    },

    _applyName(value) {
      if (this.__hiddenInputEl) {
        this.__hiddenInputEl.setAttribute("name", value || null);
        ville.ui.core.Widget.scheduleFlush();
      }
    },

    _applyPlaceholder() {
      this.__syncTriggerDisplay();
    },

    _applyOpened(value) {
      value ? this.addState("opened") : this.removeState("opened");
      const btn = this.getChildControl("button", true);
      if (btn) {
        btn
          .getContentElement()
          .setAttribute("aria-expanded", value ? "true" : "false");
      }
      const popup = this.getChildControl("popup", true);
      if (popup) {
        if (value) {
          this._syncDataViewDom();
        }
        popup.setOpened(value);
      }
    },

    _applyMaxListHeight(value) {
      const popup = this.getChildControl("popup", true);
      if (popup) {
        popup.getContentElement().setStyle("maxHeight", `${value}px`);
        ville.ui.core.Widget.scheduleFlush();
      }
    }
  }
});
