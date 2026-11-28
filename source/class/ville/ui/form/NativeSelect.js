/**
 * Pure Semantic HTML5 `<select>` Control (`ville.ui.form.NativeSelect` — `STRAT-WIDGET-06`, `STRAT-CORE-06`).
 *
 * A zero-Popover, zero-`MModelSelection`, browser-native `<select>` widget that renders
 * semantic `<option>` and `<optgroup>` elements directly inside `<select>`:
 *  - Participates natively in `<form>` `FormData` extraction and HTML5 Constraint Validation.
 *  - Accepts strings (`["Web", "PWA"]`), option objects (`[{ label, value, disabled, group }]`),
 *    or explicit `<optgroup>` definitions (`[{ group: "Targets", items: [...] }]`).
 *  - Uses the active vendor theme's input/select styling (`mantine`, `obsidian`, `shadcn`).
 */
qx.Class.define("ville.ui.form.NativeSelect", {
  extend: ville.ui.core.Widget,
  include: [ville.ui.form.MForm],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.IStringForm,
    ville.ui.form.IForm
  ],

  /**
   * @param {Array<string|Object>} [items] Optional initial options array.
   * @param {string|null} [value] Optional initial selected value.
   */
  construct(items, value) {
    // @ts-ignore
    super();

    this.__items = [];

    this.initVariant();
    this.initSize();
    this.initRadius();

    const el = this.getContentElement();
    el.addListener("change", this._onNativeChange, this);

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
      init: "nativeselect"
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

    /** Currently selected `<option>` value string. */
    value: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyValue",
      event: "changeValue"
    },

    /** Native HTML `name` attribute for `<form>` `FormData` submission. */
    name: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyName"
    },

    /** Optional placeholder prompt rendered as a disabled `<option value="">` at index 0. */
    placeholder: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyPlaceholder"
    }
  },

  members: {
    /** @type {Array<Object>|null} @private */
    __items: null,

    /** @type {boolean} @private */
    __syncingDom: false,

    /**
     * @override
     * @returns {ville.html.Element}
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element("select");
    },

    /**
     * Replaces all `<option>` / `<optgroup>` entries in the `<select>`.
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

      this.__items = rawList.map((entry) => {
        if (typeof entry === "string" || typeof entry === "number") {
          return { label: String(entry), value: String(entry), disabled: false, group: null };
        }
        if (entry && typeof entry === "object") {
          if (Array.isArray(entry.items)) {
            return {
              group: String(entry.group || entry.label || ""),
              items: entry.items.map((sub) =>
                typeof sub === "string" || typeof sub === "number"
                  ? { label: String(sub), value: String(sub), disabled: false }
                  : {
                      label: String(sub.label ?? sub.text ?? sub.value ?? ""),
                      value: String(sub.value ?? sub.label ?? ""),
                      disabled: Boolean(sub.disabled)
                    }
              )
            };
          }
          return {
            label: String(entry.label ?? entry.text ?? entry.value ?? ""),
            value: String(entry.value ?? entry.label ?? ""),
            disabled: Boolean(entry.disabled || entry.enabled === false),
            group: entry.group ? String(entry.group) : null
          };
        }
        return { label: "", value: "", disabled: false, group: null };
      });

      this._renderOptionsHtml();
      return this;
    },

    /**
     * Returns the normalized options list.
     *
     * @returns {Array<Object>}
     */
    getItems() {
      return this.__items ? this.__items.slice() : [];
    },

    /**
     * Builds the inner `<option>` and `<optgroup>` HTML markup and syncs the selected value.
     *
     * @protected
     */
    _renderOptionsHtml() {
      const list = this.__items || [];
      const currentVal = this.getValue();
      const placeholder = this.getPlaceholder();
      const parts = [];

      const escape = (str) =>
        String(str ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");

      if (placeholder) {
        const isSel = currentVal === null || currentVal === "" ? " selected" : "";
        parts.push(
          `<option value="" disabled${isSel}>${escape(placeholder)}</option>`
        );
      }

      // Group items with a shared `group` property if flat objects specify `group`
      const groupedMap = new Map();
      for (const item of list) {
        if (Array.isArray(item.items)) {
          parts.push(`<optgroup label="${escape(item.group)}">`);
          for (const sub of item.items) {
            const sel = currentVal !== null && sub.value === currentVal ? " selected" : "";
            const dis = sub.disabled ? " disabled" : "";
            parts.push(
              `<option value="${escape(sub.value)}"${sel}${dis}>${escape(sub.label)}</option>`
            );
          }
          parts.push(`</optgroup>`);
        } else if (item.group) {
          if (!groupedMap.has(item.group)) {
            groupedMap.set(item.group, []);
          }
          groupedMap.get(item.group).push(item);
        } else {
          const sel = currentVal !== null && item.value === currentVal ? " selected" : "";
          const dis = item.disabled ? " disabled" : "";
          parts.push(
            `<option value="${escape(item.value)}"${sel}${dis}>${escape(item.label)}</option>`
          );
        }
      }

      for (const [grpName, grpItems] of groupedMap.entries()) {
        parts.push(`<optgroup label="${escape(grpName)}">`);
        for (const sub of grpItems) {
          const sel = currentVal !== null && sub.value === currentVal ? " selected" : "";
          const dis = sub.disabled ? " disabled" : "";
          parts.push(
            `<option value="${escape(sub.value)}"${sel}${dis}>${escape(sub.label)}</option>`
          );
        }
        parts.push(`</optgroup>`);
      }

      this.getContentElement().setAttribute("html", parts.join(""));
      ville.ui.core.Widget.scheduleFlush();

      // If no initial value was set and no placeholder exists, adopt the first enabled option
      if (currentVal === null && !placeholder && list.length > 0) {
        const firstOpt = Array.isArray(list[0].items) ? list[0].items[0] : list[0];
        if (firstOpt && firstOpt.value !== undefined) {
          this.__syncingDom = true;
          this.setValue(firstOpt.value);
          this.__syncingDom = false;
        }
      }
    },

    _onNativeChange() {
      const domEl = /** @type {HTMLSelectElement|null} */ (
        this.getContentElement().getDomElement()
      );
      if (!domEl) return;
      this.__syncingDom = true;
      try {
        this.setValue(domEl.value);
      } finally {
        this.__syncingDom = false;
      }
    },

    _applyValue(value) {
      if (this.__syncingDom) {
        return;
      }
      const domEl = /** @type {HTMLSelectElement|null} */ (
        this.getContentElement().getDomElement()
      );
      if (domEl) {
        domEl.value = value !== null && value !== undefined ? String(value) : "";
      } else {
        this._renderOptionsHtml();
      }
    },

    _applyName(value) {
      this._setAttribute("name", value || null);
    },

    _applyPlaceholder() {
      this._renderOptionsHtml();
    },

    _applyVariant(value, old) {
      this._syncModifierState("variant", value, old);
    },

    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    _applyRadius(value, old) {
      this._syncModifierState("radius", value, old);
    },

    _applyEnabled(value) {
      super._applyEnabled(value);
      this._setAttribute("disabled", !value);
    }
  },

  destruct() {
    this.__items = null;
  }
});
