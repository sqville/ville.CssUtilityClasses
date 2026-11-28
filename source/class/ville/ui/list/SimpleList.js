/**
 * Pure Semantic HTML5 `<ul>` / `<ol>` List Widget (`ville.ui.list.SimpleList` — `STRAT-WIDGET-08`).
 *
 * A clean, zero-Qooxdoo-selection-manager semantic list (`<ul>` or `<ol>` with `<li>` items)
 * designed as the pure semantic foundation before any advanced data-controller list:
 *  - Single root `<ul>` (or `<ol>` when `ordered: true`) element with zero child `Widget` instances.
 *  - Supports both read-only semantic lists and interactive single-select lists (`selectable: true`)
 *    with a single delegated `"click"` and `"keydown"` (`ArrowUp` / `ArrowDown`) listener.
 *  - Uses native CSS `content-visibility: auto` on `<li>` items for instant C++ rendering.
 */
qx.Class.define("ville.ui.list.SimpleList", {
  extend: ville.ui.core.Widget,

  /**
   * @param {Array<string|Object>} [items] Optional initial list items (`{ label, value, icon, description, badge }`).
   */
  construct(items) {
    // @ts-ignore
    super();

    this.__items = [];

    const el = this.getContentElement();
    el.addListener("click", this._onListClick, this);
    el.addListener("keydown", this._onKeyDown, this);

    this._syncInteractiveRole();

    if (Array.isArray(items) || items instanceof ville.data.Array) {
      this.setItems(items);
    }
  },

  events: {
    /** Fired when an item is clicked or activated via Enter/Space. Data: `{ index, item, value }` */
    itemClick: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "simplelist"
    },

    /** Whether items can be selected interactively (`role="listbox"` + `aria-selected`). */
    selectable: {
      check: "Boolean",
      init: true,
      apply: "_syncInteractiveRole"
    },

    /** Currently selected item's value (when `selectable` is `true`). */
    value: {
      nullable: true,
      init: null,
      apply: "_applyValue",
      event: "changeValue"
    },

    /** Whether a border frame is rendered around the list container. */
    withBorder: {
      check: "Boolean",
      init: true,
      apply: "_applyVisualModifiers"
    },

    /** Whether alternating rows receive a subtle striped background. */
    striped: {
      check: "Boolean",
      init: false,
      apply: "_applyVisualModifiers"
    }
  },

  members: {
    /** @type {Array<Object>|null} @private */
    __items: null,

    /**
     * @override
     * @returns {ville.html.Element}
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element("ul");
    },

    _syncInteractiveRole() {
      const selectable = this.getSelectable();
      if (selectable) {
        this._setAttribute("role", "listbox");
        if (this.getTabIndex() === null) {
          this.setTabIndex(0);
        }
      } else {
        this._setAttribute("role", null);
      }
      this._renderListItems();
    },

    _applyVisualModifiers() {
      this._setAttribute("data-with-border", this.getWithBorder() ? "true" : null);
      this._setAttribute("data-striped", this.getStriped() ? "true" : null);
    },

    /**
     * Replaces all items in the semantic `<ul>` list.
     *
     * @param {Array<string|Object>|ville.data.Array} items
     * @returns {this}
     */
    setItems(items) {
      const rawList =
        items instanceof ville.data.Array
          ? items.toArray()
          : Array.isArray(items)
          ? items
          : [];

      this.__items = rawList.map((entry, idx) => {
        if (typeof entry === "string" || typeof entry === "number") {
          return {
            label: String(entry),
            value: String(entry),
            description: null,
            badge: null,
            disabled: false
          };
        }
        if (entry && typeof entry === "object") {
          const label = String(entry.label ?? entry.text ?? entry.title ?? entry.value ?? `Item ${idx + 1}`);
          const value = entry.value !== undefined ? String(entry.value) : label;
          return {
            label,
            value,
            description: entry.description ? String(entry.description) : null,
            badge: entry.badge ? String(entry.badge) : null,
            disabled: Boolean(entry.disabled)
          };
        }
        return { label: "", value: String(idx), description: null, badge: null, disabled: false };
      });

      this._renderListItems();
      return this;
    },

    /**
     * Returns the current items array.
     *
     * @returns {Array<Object>}
     */
    getItems() {
      return this.__items ? this.__items.slice() : [];
    },

    /**
     * Renders semantic `<li>` children inside `<ul>`.
     *
     * @protected
     */
    _renderListItems() {
      const list = this.__items || [];
      const currentVal = this.getValue();
      const selectable = this.getSelectable();
      const parts = [];

      const escape = (str) =>
        String(str ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const isSelected = selectable && currentVal !== null && item.value === String(currentVal);
        const roleAttr = selectable ? ' role="option"' : "";
        const ariaSelAttr = selectable ? ` aria-selected="${isSelected ? "true" : "false"}"` : "";
        const dataSelAttr = isSelected ? ' data-selected="true"' : "";
        const dataDisAttr = item.disabled ? ' data-disabled="true" aria-disabled="true"' : "";

        const descHtml = item.description
          ? `<span class="ville-simplelist-item-desc">${escape(item.description)}</span>`
          : "";
        const badgeHtml = item.badge
          ? `<span class="ville-simplelist-item-badge">${escape(item.badge)}</span>`
          : "";

        parts.push(
          `<li class="ville-simplelist-item" data-list-index="${i}"${roleAttr}${ariaSelAttr}${dataSelAttr}${dataDisAttr} style="content-visibility:auto;contain-intrinsic-size:auto 36px;">` +
            `<div class="ville-simplelist-item-main">` +
              `<span class="ville-simplelist-item-label">${escape(item.label)}</span>` +
              descHtml +
            `</div>` +
            badgeHtml +
          `</li>`
        );
      }

      this.getContentElement().setAttribute("html", parts.join(""));
      this._applyVisualModifiers();
      ville.ui.core.Widget.scheduleFlush();
    },

    _onListClick(e) {
      if (!this.getEnabled()) return;
      const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
      const target = /** @type {HTMLElement|null} */ (nativeEvt ? nativeEvt.target : null);
      if (!target || typeof target.closest !== "function") return;

      const li = target.closest("[data-list-index]");
      if (!li) return;

      const idx = Number(li.getAttribute("data-list-index"));
      const item = this.__items ? this.__items[idx] : null;
      if (!item || item.disabled) return;

      if (this.getSelectable()) {
        this.setValue(item.value);
      }
      this.fireDataEvent("itemClick", { index: idx, item, value: item.value });
    },

    _onKeyDown(e) {
      if (!this.getEnabled() || !this.getSelectable() || !this.__items || this.__items.length === 0) {
        return;
      }
      const key = typeof e.getKey === "function" ? e.getKey() : e.key;
      if (key !== "ArrowDown" && key !== "ArrowUp") return;

      if (typeof e.preventDefault === "function") {
        e.preventDefault();
      }

      const currentVal = this.getValue();
      const curIdx = this.__items.findIndex((it) => it.value === String(currentVal));
      const dir = key === "ArrowDown" ? 1 : -1;
      let nextIdx = curIdx === -1 ? (dir > 0 ? 0 : this.__items.length - 1) : curIdx;

      for (let step = 0; step < this.__items.length; step++) {
        nextIdx = (nextIdx + dir + this.__items.length) % this.__items.length;
        if (!this.__items[nextIdx].disabled) {
          this.setValue(this.__items[nextIdx].value);
          break;
        }
      }
    },

    _applyValue() {
      this._renderListItems();
    }
  },

  destruct() {
    this.__items = null;
  }
});
