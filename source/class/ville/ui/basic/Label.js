/**
 * Mode 3 CSS-driven Label widget (`ville.ui.basic.Label`).
 *
 * Renders plain text safely inside a `<span>` or `<div>` element via `qx.html.Text`
 * (avoiding `innerHTML` / `setAttribute("html", ...)` XSS sinks) and supports
 * dynamic locale updates when `qx.dynlocale` is enabled.
 *
 * @example
 * const label = new ville.ui.basic.Label("Username");
 * label.setValue("Email Address");
 */
qx.Class.define("ville.ui.basic.Label", {
  extend: ville.ui.core.Widget,
  implement: [qx.ui.form.IStringForm],

  /**
   * Creates a new Label instance.
   *
   * @param {string|qx.locale.LocalizedString|null} [text] Initial label text.
   * @param {"span"|"div"} [component="span"] Root HTML tag to render (`"span"` or `"div"`).
   */
  construct(text, component) {
    if (qx.core.Environment.get("qx.debug")) {
      if (component !== undefined) {
        qx.core.Assert.assertInArray(
          component,
          ["span", "div"],
          `Invalid component tag '${component}'. Allowed tags are 'span' or 'div'.`
        );
      }
    }

    if (component) {
      this.__contentElementTag = component;
    }

    super();

    if (text != null) {
      this.setValue(text);
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
     * Appearance selector ID resolved against the active theme (defaults to `"label"`).
     */
    appearance: {
      refine: true,
      init: "label"
    },

    /**
     * Text content rendered inside the label. Accepts plain strings or
     * `qx.locale.LocalizedString` instances.
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
    }
  },

  members: {
    /** @type {"span"|"div"} @private */
    __contentElementTag: "span",

    /** @type {qx.html.Text|null} @private */
    __textNode: null,

    /** @type {string|null} @private */
    __changeLocaleLabelListenerId: null,

    /**
     * Creates the root `qx.html.Element` (`"span"` or `"div"`).
     *
     * @returns {qx.html.Element} Root label element.
     * @protected
     */
    _createContentElement() {
      return new qx.html.Element(this.__contentElementTag);
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
     * Updates the label's `qx.html.Text` node safely without `innerHTML` and
     * flushes buffered virtual DOM changes.
     *
     * @param {string|qx.locale.LocalizedString|null} value New text or localized string.
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
     * Lazily creates and updates the internal `qx.html.Text` node.
     *
     * @param {string} text Escaped plain-text content to render.
     * @private
     */
    __setTextContent(text) {
      if (!this.__textNode) {
        this.__textNode = new qx.html.Text(text);
        this.getContentElement().add(this.__textNode);
      } else {
        this.__textNode.setText(text);
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
