/**
 * Mode 3 / Path B Unified ComboBox Widget (`ville.ui.form.ComboBox` — `STRAT-WIDGET-08`, `STRAT-CORE-09`).
 *
 * Replaces both `qx.ui.form.ComboBox` and `qx.ui.form.VirtualComboBox` with a
 * single standards-first widget combining:
 *  - Editable `<input type="text" role="combobox" aria-autocomplete="list">` (`textfield` child control)
 *    + dropdown toggle chevron (`button` child control).
 *  - Top-Layer Popover dropdown (`ville.ui.overlay.Popup`, `popover="manual"`, `role="listbox"`)
 *    anchored via CSS Anchor Positioning (`MPlacement`) that live-filters `<template>`-cloned
 *    `MDataView` option rows without stealing focus from the text input.
 *  - Full keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`) and support for
 *    both `setItems([...])` and `add(new ville.ui.form.ListItem(...))`.
 */
qx.Class.define("ville.ui.form.ComboBox", {
  extend: ville.ui.core.Widget,
  include: [ville.ui.form.MForm, ville.ui.core.MDataView],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.IStringForm,
    ville.ui.form.IForm
  ],

  /**
   * @param {Array<string|Object|ville.ui.form.ListItem>} [items] Optional initial options array.
   * @param {string|null} [value] Optional initial text value.
   */
  construct(items, value) {
    // @ts-ignore
    super();

    this.__activeIndex = -1;
    this.__selectedItem = null;

    this.setItemAppearance("combobox-item");
    this.initVariant();
    this.initSize();
    this.initRadius();

    this._createChildControl("textfield");
    this._createChildControl("button");
    this._createChildControl("popup");

    if (Array.isArray(items) || items instanceof ville.data.Array) {
      this.setItems(items);
    }

    if (value !== undefined && value !== null) {
      this.setValue(String(value));
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "combobox"
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

    /** Current text value of the combobox. */
    value: {
      check: "String",
      nullable: true,
      init: "",
      apply: "_applyValue",
      event: "changeValue"
    },

    /** Native form field `name` forwarded to the inner `<input>`. */
    name: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyName"
    },

    /** Placeholder text forwarded to the inner `<input>`. */
    placeholder: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyPlaceholder"
    },

    /** Whether typing filters the dropdown list automatically. */
    filterOnInput: {
      check: "Boolean",
      init: true
    },

    /** Whether the dropdown popover is currently open in `#top-layer`. */
    opened: {
      check: "Boolean",
      init: false,
      apply: "_applyOpened",
      event: "changeOpened"
    }
  },

  members: {
    /** @type {number} @private */
    __activeIndex: -1,

    /** @type {ville.ui.form.ListItem|null} @private */
    __selectedItem: null,

    /** @type {boolean} @private */
    __syncingValue: false,

    /** @type {string} @private */
    __filterQuery: "",

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
        case "textfield": {
          control = new ville.ui.form.TextField();
          const tfEl = control.getContentElement();
          const listId = `ville-combobox-list-${this.toHashCode()}`;
          tfEl.setAttributes({
            role: "combobox",
            "aria-autocomplete": "list",
            "aria-expanded": "false",
            "aria-controls": listId
          });

          control.addListener("changeValue", (e) => {
            if (this.__syncingValue) {
              return;
            }
            const val = e.getData() || "";
            this.__syncingValue = true;
            try {
              this.setValue(val);
            } finally {
              this.__syncingValue = false;
            }
            this.__filterQuery = this.getFilterOnInput() ? val : "";
            this.__selectedItem = this.findItem(val);
            if (!this.getOpened() && val.length > 0) {
              this.open();
            } else {
              this._syncDataViewDom();
            }
          });

          tfEl.addListener("focus", () => {
            if (this.isEnabled() && this.getItems().length > 0) {
              this.__filterQuery = "";
              this.open();
            }
          });

          tfEl.addListener("blur", () => {
            // Delay close slightly so a pointer click on a popup option processes first
            setTimeout(() => {
              if (!this.isDisposed() && this.getOpened()) {
                this.close();
              }
            }, 140);
          });

          tfEl.addListener("keydown", this._onKeyDown, this);
          this._add(control);
          break;
        }

        case "button": {
          control = new ville.ui.form.ActionIcon("CHEVRON_DOWN", "subtle");
          control.setTabIndex(-1);
          control.setAriaLabel("Toggle options");
          control.addListener("execute", () => {
            if (this.isEnabled()) {
              this.__filterQuery = "";
              this.toggle();
              this.getChildControl("textfield").focus();
            }
          });
          this._add(control);
          break;
        }

        case "popup": {
          control = new ville.ui.overlay.Popup();
          control.setPopoverMode("manual");
          control.setPosition("bottom-left");
          control.placeToWidget(this);

          const popEl = control.getContentElement();
          const listId = `ville-combobox-list-${this.toHashCode()}`;
          popEl.setAttributes({
            id: listId,
            role: "listbox",
            tabindex: "-1"
          });
          popEl.setStyles({
            maxHeight: "240px",
            overflowY: "auto",
            minWidth: "anchor-size(width, 180px)"
          });

          popEl.addListener("mousedown", (e) => {
            // Prevent input blur before click handler runs
            e.preventDefault();
          });
          popEl.addListener("click", this._onPopupClick, this);
          break;
        }
      }

      return control || super._createChildControlImpl(id, hash);
    },

    /**
     * Opens the top-layer suggestions popup.
     */
    open() {
      if (this.isEnabled()) {
        this.setOpened(true);
      }
    },

    /**
     * Closes the top-layer suggestions popup.
     */
    close() {
      this.setOpened(false);
    },

    /**
     * Toggles the top-layer suggestions popup.
     */
    toggle() {
      if (this.isEnabled()) {
        this.setOpened(!this.getOpened());
      }
    },

    /**
     * Renders `<template>`-cloned option rows (filtered by `__filterQuery`) into the popup.
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
        filterText: this.__filterQuery,
        selectedItems: this.__selectedItem ? [this.__selectedItem] : [],
        activeIndex: this.__activeIndex,
        showCheckmark: true
      });
    },

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
      const item = this.getItems()[idx];
      if (item && item.getEnabled()) {
        this.__selectedItem = item;
        this.__activeIndex = idx;
        this.__filterQuery = "";
        this.setValue(item.getLabel());
        this.close();
      }
    },

    /**
     * Keyboard navigation handler (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).
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
          this.__filterQuery = "";
          this.open();
        }
        const dir = key === "ArrowDown" ? 1 : -1;
        let nextIdx =
          this.__activeIndex >= 0
            ? this.__activeIndex
            : dir > 0
            ? -1
            : items.length;

        for (let step = 0; step < items.length; step++) {
          nextIdx = (nextIdx + dir + items.length) % items.length;
          if (items[nextIdx].getEnabled()) {
            this.__activeIndex = nextIdx;
            this._syncDataViewDom();
            break;
          }
        }
      } else if (key === "Enter" && this.getOpened()) {
        if (this.__activeIndex >= 0 && items[this.__activeIndex]?.getEnabled()) {
          e.preventDefault();
          const chosen = items[this.__activeIndex];
          this.__selectedItem = chosen;
          this.__filterQuery = "";
          this.setValue(chosen.getLabel());
          this.close();
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
      const tf = this.getChildControl("textfield", true);
      if (tf && value) {
        tf.setVariant(value);
      }
    },

    _applySize(value, old) {
      this._syncModifierState("size", value, old);
      const tf = this.getChildControl("textfield", true);
      if (tf) {
        tf.setSize(value);
      }
    },

    _applyRadius(value, old) {
      this._syncModifierState("radius", value, old);
      const tf = this.getChildControl("textfield", true);
      if (tf) {
        tf.setRadius(value);
      }
    },

    _applyValue(value) {
      const str = value !== null && value !== undefined ? String(value) : "";
      this.__selectedItem = this.findItem(str);
      if (!this.__syncingValue) {
        this.__syncingValue = true;
        try {
          const tf = this.getChildControl("textfield", true);
          if (tf) {
            tf.setValue(str);
          }
        } finally {
          this.__syncingValue = false;
        }
      }
      this._scheduleDataViewRender();
    },

    _applyName(value) {
      const tf = this.getChildControl("textfield", true);
      if (tf) {
        tf.setName(value);
      }
    },

    _applyPlaceholder(value) {
      const tf = this.getChildControl("textfield", true);
      if (tf) {
        tf.setPlaceholder(value);
      }
    },

    _applyOpened(value) {
      value ? this.addState("opened") : this.removeState("opened");
      const tf = this.getChildControl("textfield", true);
      if (tf) {
        tf.getContentElement().setAttribute(
          "aria-expanded",
          value ? "true" : "false"
        );
      }
      const popup = this.getChildControl("popup", true);
      if (popup) {
        if (value) {
          this._syncDataViewDom();
        }
        popup.setOpened(value);
      }
    }
  }
});
