/**
 * Gradient configuration object for `ville.ui.typography.Text` when `variant="gradient"`.
 *
 * @typedef {Object} VilleTextGradient
 * @property {string} from Starting color token or CSS color value.
 * @property {string} to Ending color token or CSS color value.
 * @property {number} [deg=45] Gradient angle in degrees.
 */

/**
 * Mode 3 CSS-driven Text widget (`ville.ui.typography.Text`) that renders
 * semantic `<p>` or `<span>` (or custom polymorphic) text elements with safe
 * `qx.html.Text` content and CSS-engine-agnostic modifier states.
 *
 * @example
 * const body = new ville.ui.typography.Text("Hello world");
 * body.setSize("md");
 *
 * const inlineBadgeText = new ville.ui.typography.Text("Status", "span");
 * inlineBadgeText.setTruncate("end");
 */
qx.Class.define("ville.ui.typography.Text", {
  extend: ville.ui.core.Widget,

  /**
   * Creates a new Text widget instance.
   *
   * @param {string|qx.locale.LocalizedString|null} [text] Initial text content.
   * @param {"p"|"span"|"div"|"label"|"a"|"strong"|"em"} [component="p"] Root HTML tag to render.
   */
  construct(text, component) {
    if (qx.core.Environment.get("qx.debug") && component !== undefined) {
      qx.core.Assert.assertInArray(
        component,
        ["p", "span", "div", "label", "a", "strong", "em"],
        `Invalid component tag '${component}'. Allowed tags are 'p', 'span', 'div', 'label', 'a', 'strong', or 'em'.`
      );
    }

    if (component) {
      this.__componentTag = component;
    }

    super();

    if (component === "span") {
      this.setSpan(true);
    }

    this.initSize();

    if (text != null) {
      this.setText(text);
    }
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"typography-text"`).
     * Note: `variant` (e.g., `"gradient"`) is inherited from `ville.ui.core.Widget`.
     */
    appearance: {
      refine: true,
      init: "typography-text"
    },

    /**
     * Plain-text content rendered via `qx.html.Text`.
     * Accepts standard strings or `qx.locale.LocalizedString` instances.
     *
     * @type {string|qx.locale.LocalizedString|null}
     */
    text: {
      check(value) {
        return qx.lang.Type.isString(value);
      },
      apply: "_applyText",
      event: "changeText",
      nullable: true
    },

    /**
     * Typography size scale (`"xs"`–`"xl"`, defaulting to `"md"`).
     * Synchronizes `"size-<value>"` for `--text-fz` and `--text-lh`.
     */
    size: {
      init: "md",
      check: ["xs", "sm", "md", "lg", "xl"],
      apply: "_applySize",
      nullable: true,
      themeable: true,
      event: "changeSize"
    },

    /**
     * Shorthand for rendering as an inline `<span>` element when set before
     * DOM element instantiation.
     */
    span: {
      check: "Boolean",
      init: false,
      apply: "_applySpan",
      event: "changeSpan"
    },

    /**
     * Inherits font properties from the parent element (`data-inherit`).
     */
    inherit: {
      check: "Boolean",
      init: false,
      apply: "_applyInherit",
      themeable: true,
      event: "changeInherit"
    },

    /**
     * Sets `line-height` to `1` for vertical centering (`data-inline`).
     */
    inline: {
      check: "Boolean",
      init: false,
      apply: "_applyInline",
      themeable: true,
      event: "changeInline"
    },

    /**
     * Side on which overflowing text is truncated (`"start"`, `"end"`, or `true`
     * for start truncation). Synchronizes `"truncate-<value>"` for `data-truncate`.
     *
     * @type {boolean|"start"|"end"|null}
     */
    truncate: {
      check(value) {
        return typeof value === "boolean" || value === "start" || value === "end";
      },
      nullable: true,
      init: null,
      apply: "_applyTruncate",
      themeable: true,
      event: "changeTruncate"
    },

    /**
     * Controls the CSS `text-wrap` property (`"wrap"`, `"nowrap"`, `"balance"`,
     * `"pretty"`, or `"stable"`). Synchronizes `"textWrap-<value>"` for `--text-text-wrap`.
     */
    textWrap: {
      check: ["wrap", "nowrap", "balance", "pretty", "stable"],
      nullable: true,
      init: null,
      apply: "_applyTextWrap",
      themeable: true,
      event: "changeTextWrap"
    },

    /**
     * Number of visible lines before clamping text (`data-line-clamp` and `--text-line-clamp`).
     */
    lineClamp: {
      check: "Integer",
      nullable: true,
      init: null,
      apply: "_applyLineClamp",
      themeable: true,
      event: "changeLineClamp"
    },

    /**
     * Gradient definition applied via `--text-gradient` when `variant="gradient"`.
     *
     * @type {VilleTextGradient|string|null}
     */
    gradient: {
      nullable: true,
      init: null,
      apply: "_applyGradient",
      themeable: true,
      event: "changeGradient"
    }
  },

  members: {
    /** @type {"p"|"span"|"div"|"label"|"a"|"strong"|"em"} @private */
    __componentTag: "p",

    /** @type {qx.html.Text|null} @private */
    __textNode: null,

    /**
     * Creates the root `qx.html.Element` using the configured tag (defaults to `"p"`).
     *
     * @returns {qx.html.Element} Root text element.
     * @protected
     */
    _createContentElement() {
      return new qx.html.Element(this.__componentTag);
    },

    /**
     * Property apply handler for `text`. Updates the internal `qx.html.Text`
     * node safely without `innerHTML` and flushes buffered DOM mutations.
     *
     * @param {string|qx.locale.LocalizedString|null} value New text value.
     * @protected
     */
    _applyText(value) {
      const resolved = value && value.translate ? value.translate() : value;
      const textContent = resolved != null ? String(resolved) : "";

      if (!this.__textNode) {
        this.__textNode = new qx.html.Text(textContent);
        this.getContentElement().add(this.__textNode);
      } else {
        this.__textNode.setText(textContent);
      }

      qx.html.Element.flush();
    },

    /**
     * Property apply handler for `span`. Updates the root tag to `"span"` if
     * set prior to lazy DOM element instantiation.
     *
     * @param {boolean} value Whether `<span>` shorthand is active.
     * @protected
     */
    _applySpan(value) {
      if (value) {
        this.__componentTag = "span";
      }
    },

    /**
     * Property apply handler for `size`.
     *
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} value New size token.
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} old Previous size token.
     * @protected
     */
    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    /**
     * Property apply handler for `inherit`.
     *
     * @param {boolean} value Whether parent font inheritance is active.
     * @protected
     */
    _applyInherit(value) {
      value ? this.addState("inherit") : this.removeState("inherit");
    },

    /**
     * Property apply handler for `inline`.
     *
     * @param {boolean} value Whether `line-height: 1` inline mode is active.
     * @protected
     */
    _applyInline(value) {
      value ? this.addState("inline") : this.removeState("inline");
    },

    /**
     * Property apply handler for `truncate`.
     *
     * @param {boolean|"start"|"end"|null} value New truncation mode.
     * @param {boolean|"start"|"end"|null} old Previous truncation mode.
     * @protected
     */
    _applyTruncate(value, old) {
      const nextToken = value === false || value == null ? null : String(value);
      const prevToken = old === false || old == null ? null : String(old);
      this._syncModifierState("truncate", nextToken, prevToken);
    },

    /**
     * Property apply handler for `textWrap`.
     *
     * @param {"wrap"|"nowrap"|"balance"|"pretty"|"stable"|null} value New text-wrap mode.
     * @param {"wrap"|"nowrap"|"balance"|"pretty"|"stable"|null} old Previous text-wrap mode.
     * @protected
     */
    _applyTextWrap(value, old) {
      this._syncModifierState("textWrap", value, old);
    },

    /**
     * Property apply handler for `lineClamp`. Toggles `"lineClamp"` state for
     * `data-line-clamp` and sets `--text-line-clamp`.
     *
     * @param {number|null} value Maximum visible line count.
     * @protected
     */
    _applyLineClamp(value) {
      if (typeof value === "number" && value > 0) {
        this.addState("lineClamp");
        this.setStyle("--text-line-clamp", String(value), true);
      } else {
        this.removeState("lineClamp");
        this.removeStyle("--text-line-clamp", true);
      }
    },

    /**
     * Property apply handler for `gradient`. Toggles `"gradient"` state and
     * sets `--text-gradient`.
     *
     * @param {VilleTextGradient|string|null} value Gradient descriptor or raw CSS gradient string.
     * @protected
     */
    _applyGradient(value) {
      if (!value) {
        this.removeState("gradient");
        this.removeStyle("--text-gradient", true);
        return;
      }

      this.addState("gradient");

      if (typeof value === "string") {
        this.setStyle("--text-gradient", value, true);
      } else {
        const deg = value.deg != null ? value.deg : 45;
        const from = value.from || "blue";
        const to = value.to || "cyan";
        this.setStyle(
          "--text-gradient",
          `linear-gradient(${deg}deg, var(--mantine-color-${from}, ${from}) 0%, var(--mantine-color-${to}, ${to}) 100%)`,
          true
        );
      }
    }
  },

  /**
   * Disposes the internal `qx.html.Text` node on widget destruction.
   */
  destruct() {
    if (this.__textNode) {
      this.__textNode.dispose();
      this.__textNode = null;
    }
  }
});
