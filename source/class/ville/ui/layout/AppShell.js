/**
 * First-class AppShell layout container (`ville.ui.layout.AppShell` — `STRAT-WIDGET-01`).
 *
 * Provides a semantic, responsive application frame (`<div class="...AppShell-root">`)
 * with lazy-created `<header>`, `<nav>`, `<main>`, `<aside>`, and `<footer>` structural
 * regions (`getChildControl("header" | "navbar" | "main" | "aside" | "footer")`) and
 * provider-independent states (`mode-fixed`, `mode-static`, `withBorder`, `navbarCollapsed`,
 * `asideCollapsed`).
 *
 * Can also be used as a direct container where callers append custom `Box("header")`
 * and `Box("main")` children directly.
 */
qx.Class.define("ville.ui.layout.AppShell", {
  extend: ville.ui.core.Box,

  /**
   * @param {Object} [options] Optional initial property map (`{ mode: "fixed", withBorder: true }`).
   */
  construct(options) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super("div");

    this.initMode();
    this.initWithBorder();

    if (options && typeof options === "object") {
      this.set(options);
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "appshell"
    },

    /**
     * Layout positioning mode (`"fixed"` or `"static"`).
     */
    mode: {
      check: ["fixed", "static"],
      init: "fixed",
      themeable: true,
      apply: "_applyMode",
      event: "changeMode"
    },

    /**
     * Whether structural sections display borders (`"withBorder"` state).
     */
    withBorder: {
      check: "Boolean",
      init: true,
      themeable: true,
      apply: "_applyWithBorder",
      event: "changeWithBorder"
    },

    /**
     * Whether the `<nav>` sidebar region is collapsed (`"navbarCollapsed"` state).
     */
    navbarCollapsed: {
      check: "Boolean",
      init: false,
      apply: "_applyNavbarCollapsed",
      event: "changeNavbarCollapsed"
    },

    /**
     * Whether the `<aside>` region is collapsed (`"asideCollapsed"` state).
     */
    asideCollapsed: {
      check: "Boolean",
      init: false,
      apply: "_applyAsideCollapsed",
      event: "changeAsideCollapsed"
    }
  },

  members: {
    _forwardStates: {
      withBorder: true,
      navbarCollapsed: true,
      asideCollapsed: true
    },

    _applyMode(value, old) {
      this._syncModifierState("mode", value, old);
    },

    _applyWithBorder(value) {
      value ? this.addState("withBorder") : this.removeState("withBorder");
    },

    _applyNavbarCollapsed(value) {
      value ? this.addState("navbarCollapsed") : this.removeState("navbarCollapsed");
      const nav = this.getChildControl("navbar", true);
      if (nav) {
        nav.setInert(Boolean(value));
      }
    },

    _applyAsideCollapsed(value) {
      value ? this.addState("asideCollapsed") : this.removeState("asideCollapsed");
      const aside = this.getChildControl("aside", true);
      if (aside) {
        aside.setInert(Boolean(value));
      }
    },

    /**
     * Creates semantic structural child controls (`"header"`, `"navbar"`, `"main"`, `"aside"`, `"footer"`).
     *
     * @override
     * @param {string} id Child control ID.
     * @returns {ville.ui.core.Widget|null} Created section widget.
     * @protected
     */
    _createChildControlImpl(id) {
      let control = null;
      switch (id) {
        case "header":
          control = new ville.ui.core.Box("header");
          control.setAppearance("appshell-header");
          this._add(control);
          break;
        case "navbar":
          control = new ville.ui.core.Box("nav");
          control.setAppearance("appshell-navbar");
          this._add(control);
          break;
        case "main":
          control = new ville.ui.core.Box("main");
          control.setAppearance("appshell-main");
          this._add(control);
          break;
        case "aside":
          control = new ville.ui.core.Box("aside");
          control.setAppearance("appshell-aside");
          this._add(control);
          break;
        case "footer":
          control = new ville.ui.core.Box("footer");
          control.setAppearance("appshell-footer");
          this._add(control);
          break;
      }
      return control || super._createChildControlImpl(id);
    },

    /**
     * Convenience accessor for the `<header>` section widget.
     *
     * @returns {ville.ui.core.Box} Header widget.
     */
    getHeader() {
      return /** @type {ville.ui.core.Box} */ (this.getChildControl("header"));
    },

    /**
     * Convenience accessor for the `<nav>` section widget.
     *
     * @returns {ville.ui.core.Box} Navbar widget.
     */
    getNavbar() {
      return /** @type {ville.ui.core.Box} */ (this.getChildControl("navbar"));
    },

    /**
     * Convenience accessor for the `<main>` section widget.
     *
     * @returns {ville.ui.core.Box} Main content widget.
     */
    getMain() {
      return /** @type {ville.ui.core.Box} */ (this.getChildControl("main"));
    },

    /**
     * Convenience accessor for the `<aside>` section widget.
     *
     * @returns {ville.ui.core.Box} Aside widget.
     */
    getAside() {
      return /** @type {ville.ui.core.Box} */ (this.getChildControl("aside"));
    },

    /**
     * Convenience accessor for the `<footer>` section widget.
     *
     * @returns {ville.ui.core.Box} Footer widget.
     */
    getFooter() {
      return /** @type {ville.ui.core.Box} */ (this.getChildControl("footer"));
    }
  }
});
