/**
 * Mode 3 Navigation Link (`ville.ui.navigation.NavLink` — `STRAT-WIDGET-03`).
 *
 * Extends `ville.ui.core.AbstractButton` to render a semantic `<a>` or `<button>`
 * navigation item with optional left/right icons (`ville.ui.icon.Default`),
 * `active` current-page state (`aria-current="page"` and `data-active="true"`),
 * `href`, `target`, and `"variant-*"` modifier states.
 *
 * @example
 * const dashboardLink = new ville.ui.navigation.NavLink("Dashboard", "#dashboard", "FOLDER");
 * dashboardLink.setActive(true);
 */
qx.Class.define("ville.ui.navigation.NavLink", {
  extend: ville.ui.core.AbstractButton,

  /**
   * @param {string|null} [label] Navigation link text caption.
   * @param {string|null} [href=null] Optional URL or hash target (renders `<a>` when provided or when `component === "a"`).
   * @param {string|Object|ville.html.Element|null} [icon=null] Optional left icon key or Iconify token.
   * @param {"a"|"button"} [component="a"] Root HTML tag (`"a"` or `"button"`).
   */
  construct(label, href = null, icon = null, component = "a") {
    this.__componentTag = component || "a";

    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(label, icon);

    this.initVariant();

    if (href != null) {
      this.setHref(href);
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "navlink"
    },

    /**
     * Target URL or hash route for `<a>` navigation links.
     */
    href: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyHref",
      event: "changeHref"
    },

    /**
     * Link `target` attribute (`"_blank"`, `"_self"`, etc.).
     */
    target: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyTarget"
    },

    /**
     * Whether this link represents the currently active route/view.
     * Synchronizes the `"active"` widget state and sets `aria-current="page"`.
     */
    active: {
      check: "Boolean",
      init: false,
      apply: "_applyActive",
      event: "changeActive"
    },

    /**
     * Visual variant (`"filled"`, `"light"`, `"subtle"`).
     */
    variant: {
      check: ["filled", "light", "subtle"],
      init: "light",
      nullable: true,
      themeable: true,
      apply: "_applyVariant",
      event: "changeVariant"
    }
  },

  members: {
    /** @type {"a"|"button"} @private */
    __componentTag: "a",

    /**
     * @override
     * @returns {ville.html.Element} Root `<a>` or `<button>` element.
     * @protected
     */
    _createContentElement() {
      const el = new ville.html.Element(this.__componentTag);
      if (this.__componentTag === "button") {
        el.setAttribute("type", "button");
      }
      return el;
    },

    _applyHref(value) {
      if (this.__componentTag === "a") {
        this._setAttribute("href", value);
      }
    },

    _applyTarget(value) {
      if (this.__componentTag === "a") {
        this._setAttribute("target", value);
        if (value === "_blank") {
          this._setAttribute("rel", "noopener noreferrer");
        }
      }
    },

    _applyActive(value) {
      if (value) {
        this.addState("active");
        this._setAttribute("aria-current", "page");
      } else {
        this.removeState("active");
        this._setAttribute("aria-current", null);
      }
    },

    _applyVariant(value, old) {
      this._syncModifierState("variant", value, old);
    }
  }
});
