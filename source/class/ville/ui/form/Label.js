/**
 * Mode 3 CSS-driven form `<label>` container widget (`ville.ui.form.Label`).
 *
 * Extends `ville.ui.core.Box` (with `MChildrenHandling`) to support HTML `<label>`
 * implicit control nesting (e.g., `label.add(input)`) alongside explicit `htmlFor`
 * association, rendering its text safely via `qx.html.Text` so nested children are
 * never overwritten by `innerHTML`.
 *
 * @example
 * // 1. Implicit nesting (<label>Email <input /></label>)
 * const label = new ville.ui.form.Label("Email");
 * label.add(new ville.ui.form.TextInput());
 *
 * // 2. Trailing label (<label><input type="checkbox" /> Remember me</label>)
 * const checkLabel = new ville.ui.form.Label("Remember me");
 * checkLabel.setLabelPosition("after");
 * checkLabel.add(checkbox);
 */
qx.Class.define("ville.ui.form.Label", {
  extend: ville.ui.core.Box,
  implement: [qx.ui.form.IStringForm],

  /**
   * Creates a new form Label container.
   *
   * @param {string|qx.locale.LocalizedString|null} [text] Initial label text.
   * @param {string|null} [htmlFor] Optional target input `id` for the `for` attribute.
   */
  construct(text, htmlFor) {
    super("label");

    this.initSize();

    if (text != null) {
      this.setValue(text);
    }

    if (htmlFor != null) {
      this.setHtmlFor(htmlFor);
    }

    if (qx.core.Environment.get("qx.dynlocale")) {
      this.__changeLocaleLabelListenerId = qx.locale.Manager.getInstance().addListener(
        "changeLocale",
        this._onChangeLocale,
        this
      );
    }
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"form-label"`).
     */
    appearance: {
      refine: true,
      init: "form-label"
    },

    /**
     * Typography size scale (`"xs"`–`"xl"`). Synchronizes the mutually exclusive
     * `"size-<value>"` widget state for the active Appearance theme.
     */
    size: {
      init: "xs",
      check: ["xs", "sm", "md", "lg", "xl"],
      apply: "_applySize",
      nullable: true,
      themeable: true,
      event: "changeSize"
    },

    /**
     * Plain-text label caption rendered via `qx.html.Text`.
     * Accepts standard strings or `qx.locale.LocalizedString` instances.
     *
     * @type {string|qx.locale.LocalizedString|null}
     */
    value: {
      check(value) {
        return qx.lang.Type.isString(value);
      },
      apply: "_applyValue",
      event: "changeValue",
      nullable: true
    },

    /**
     * Target form control `id` assigned to the native HTML `for` attribute.
     */
    htmlFor: {
      check: "String",
      apply: "_applyHtmlFor",
      nullable: true,
      event: "changeHtmlFor"
    },

    /**
     * Position of the label's text node relative to nested child widgets
     * (`"before"` inserts text at index `0`; `"after"` appends text after children).
     */
    labelPosition: {
      init: "before",
      check: ["before", "after"],
      apply: "_applyLabelPosition",
      event: "changeLabelPosition"
    }
  },

  members: {
    /** @type {qx.html.Text|null} @private */
    __textNode: null,

    /** @type {string|null} @private */
    __changeLocaleLabelListenerId: null,

    /**
     * Property apply handler for `size`. Synchronizes `"size-<value>"` so the
     * active Appearance theme applies engine-specific attributes or tokens.
     *
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} value New size token.
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} old Previous size token.
     * @protected
     */
    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    /**
     * Property apply handler for `htmlFor`. Sets or removes the HTML `for` attribute.
     *
     * @param {string|null} value Target element ID.
     * @protected
     */
    _applyHtmlFor(value) {
      if (value) {
        this.setAttribute("for", value);
      } else {
        this.removeAttribute("for");
      }
    },

    /**
     * Property apply handler for `labelPosition`. Repositions the internal
     * `qx.html.Text` node before or after nested child widgets.
     *
     * @param {"before"|"after"} value New text placement.
     * @protected
     */
    _applyLabelPosition(value) {
      if (!this.__textNode || !this.__textNode.getParent()) {
        return;
      }

      const contentEl = this.getContentElement();
      contentEl.remove(this.__textNode);

      if (value === "after") {
        contentEl.add(this.__textNode);
      } else {
        contentEl.addAt(this.__textNode, 0);
      }

    },

    /**
     * Re-translates and flushes the active `qx.locale.LocalizedString` when the
     * application locale changes, preserving the underlying `LocalizedString`
     * reference in `value` for subsequent locale switches.
     *
     * @param {qx.event.type.Data} e Locale change event.
     * @protected
     */
    _onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
      true(e) {
        const content = this.getValue();
        if (content && content.translate) {
          this._applyValue(content);
        }
      },

      false: null
    }),

    /**
     * Property apply handler for `value`. Updates the label's `qx.html.Text`
     * node safely without disturbing nested child widgets.
     *
     * @param {string|qx.locale.LocalizedString|null} value New label text.
     * @protected
     */
    _applyValue: qx.core.Environment.select("qx.dynlocale", {
      true(value) {
        const resolved = value && value.translate ? value.translate() : value;
        this.__setTextContent(resolved != null ? String(resolved) : "");
      },
      false(value) {
        this.__setTextContent(value != null ? String(value) : "");
      }
    }),

    /**
     * Creates, updates, or detaches the internal `qx.html.Text` node
     *
     * @param {string} text Escaped plain-text content to render.
     * @private
     */
    __setTextContent(text) {
      const contentEl = this.getContentElement();

      if (text !== "") {
        if (!this.__textNode) {
          this.__textNode = new qx.html.Text(text);
          if (this.getLabelPosition() === "after") {
            contentEl.add(this.__textNode);
          } else {
            contentEl.addAt(this.__textNode, 0);
          }
        } else {
          this.__textNode.setText(text);
          if (!this.__textNode.getParent()) {
            if (this.getLabelPosition() === "after") {
              contentEl.add(this.__textNode);
            } else {
              contentEl.addAt(this.__textNode, 0);
            }
          }
        }
      } else if (this.__textNode && this.__textNode.getParent()) {
        contentEl.remove(this.__textNode);
      }

    }
  },

  /**
   * Unregisters the locale change listener and disposes the internal `qx.html.Text` node.
   */
  destruct() {
    if (qx.core.Environment.get("qx.dynlocale") && this.__changeLocaleLabelListenerId) {
      qx.locale.Manager.getInstance().removeListenerById(
        this.__changeLocaleLabelListenerId
      );
      this.__changeLocaleLabelListenerId = null;
    }

    if (this.__textNode) {
      this.__textNode.dispose();
      this.__textNode = null;
    }
  }
});
