/**
 * Mode 3 CSS-driven Anchor widget (`ville.ui.navigation.Anchor`).
 *
 * Extends `ville.ui.form.Button` to inherit flattened `ville.html.Text` caption
 * rendering, optional icons, `MExecutable` command binding, and keyboard/pointer
 * `execute` activation while defaulting to a semantic `<a>` element.
 *
 * @example
 * const link = new ville.ui.navigation.Anchor("Documentation");
 * link.setHref("https://qooxdoo.org");
 * link.setUnderline("hover");
 * link.addListener("execute", () => console.log("Anchor activated"));
 */
qx.Class.define("ville.ui.navigation.Anchor", {
  extend: ville.ui.form.Button,

  /**
   * Creates a new Anchor instance.
   *
   * @param {string|null} [label] Anchor text caption.
   * @param {"a"|"button"|"span"} [component="a"] Root HTML tag to render (`"a"`, `"button"`, or `"span"`).
   */
  construct(label, component) {
    const tag = component || "a";

    if (qx.core.Environment.get("qx.debug")) {
      qx.core.Assert.assertInArray(
        tag,
        ["a", "button", "span"],
        `Invalid component tag '${tag}'. Allowed tags are 'a', 'button', or 'span'.`
      );
    }

    this.__componentTag = tag;

    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(label);

    if (tag === "button") {
      this.getContentElement().setAttribute("type", "button");
      this.setAriaRole("button");
    } else {
      this.setAriaRole(null);
    }

    this.initUnderline();
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"anchor"`).
     */
    appearance: {
      refine: true,
      init: "anchor"
    },

    /**
     * Underline behavior modifier (`"always"`, `"hover"`, `"not-hover"`, or `"never"`).
     * Synchronizes the mutually exclusive `"underline-<value>"` widget state.
     */
    underline: {
      init: "hover",
      check: ["always", "hover", "not-hover", "never"],
      apply: "_applyUnderline",
      themeable: true,
      event: "changeUnderline"
    },

    /**
     * Destination URL for `<a>` anchor elements. Prevents default full-page
     * navigation so Qooxdoo `execute` listeners handle routing cleanly.
     */
    href: {
      apply: "_applyHref",
      nullable: true,
      check: "String",
      event: "changeHref"
    },

    /**
     * Browsing context target attribute (e.g., `"_blank"`, `"_self"`).
     */
    target: {
      apply: "_applyTarget",
      nullable: true,
      check: "String",
      event: "changeTarget"
    }
  },

  members: {
    /** @type {"a"|"button"|"span"} @private */
    __componentTag: "a",

    /** @type {Function|null} @private */
    __onClickPrevent: null,

    /**
     * Creates the root `ville.html.Element` using the configured polymorphic tag (`"a"`, `"button"`, or `"span"`).
     *
     * @override
     * @returns {ville.html.Element} Root anchor element.
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element(this.__componentTag);
    },

    /**
     * Property apply handler for `underline`. Synchronizes `"underline-<value>"`
     * so the active Appearance theme applies `data-underline` or utility classes.
     *
     * @param {"always"|"hover"|"not-hover"|"never"|null} value New underline mode.
     * @param {"always"|"hover"|"not-hover"|"never"|null} old Previous underline mode.
     * @protected
     */
    _applyUnderline(value, old) {
      this._syncModifierState("underline", value, old);
    },

    /**
     * Property apply handler for `href`. Sets or removes the `href` attribute and
     * manages a single `click` `preventDefault()` listener without leaks.
     *
     * @param {string|null} value Destination URL.
     * @protected
     */
    _applyHref(value) {
      if (value) {
        this.getContentElement().setAttribute("href", value);
        if (!this.__onClickPrevent) {
          this.__onClickPrevent = (e) => e.preventDefault();
          this.addListener("click", this.__onClickPrevent, this);
        }
      } else {
        this.getContentElement().removeAttribute("href");
        if (this.__onClickPrevent) {
          this.removeListener("click", this.__onClickPrevent, this);
          this.__onClickPrevent = null;
        }
      }
    },

    /**
     * Property apply handler for `target`.
     *
     * @param {string|null} value Target attribute value (e.g., `"_blank"`).
     * @protected
     */
    _applyTarget(value) {
      if (value) {
        this.getContentElement().setAttribute("target", value);
      } else {
        this.getContentElement().removeAttribute("target");
      }
    }
  },

  /**
   * Detaches the `href` click prevention listener on disposal.
   */
  destruct() {
    if (this.__onClickPrevent) {
      this.removeListener("click", this.__onClickPrevent, this);
      this.__onClickPrevent = null;
    }
  }
});
