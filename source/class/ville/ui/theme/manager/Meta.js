/**
 * Manager for Ville UI meta themes and unified 3-Vendor (`mantine`, `obsidian`, `shadcn`)
 * light/dark color-scheme switching (`STRAT-CSS-06`, `STRAT-BUILD-08`).
 */
qx.Class.define("ville.ui.theme.manager.Meta", {
  type: "singleton",
  extend: qx.core.Object,

  properties: {
    /**
     * Active meta theme (`Theme.define` object with `meta.appearance`).
     */
    theme: {
      check: "Theme",
      nullable: false,
      apply: "_applyTheme",
      event: "changeTheme"
    },

    /**
     * Active color scheme (`"light"` or `"dark"`).
     * Automatically synchronizes all 3 vendor DOM contracts on `<html>` and `<body>`:
     * - Mantine: `data-mantine-color-scheme="light|dark"` on `<html>`
     * - shadcn/ui: `.dark` class and `data-theme="light|dark"` on `<html>`
     * - Obsidian: `.theme-dark` / `.theme-light` classes on `<body>`
     * - Browser native UI: `document.documentElement.style.colorScheme`
     */
    colorScheme: {
      check: ["light", "dark"],
      init: "light",
      apply: "_applyColorScheme",
      event: "changeColorScheme"
    }
  },

  members: {
    /**
     * Applies the selected meta theme's `appearance` dictionary to `qx.theme.manager.Appearance`.
     *
     * @param {Object} value New meta theme object.
     * @param {Object} old Previous meta theme object.
     * @protected
     */
    _applyTheme(value, old) {
      if (value && value.meta && value.meta.appearance) {
        const appearanceMgr = qx.theme.manager.Appearance.getInstance();
        appearanceMgr.setTheme(value.meta.appearance);
      }
    },

    /**
     * Synchronizes the active `"light"` or `"dark"` color scheme across `<html>`
     * and `<body>` for Mantine, Obsidian, shadcn/ui, and native browser controls.
     *
     * @param {"light"|"dark"} value New color scheme.
     * @protected
     */
    _applyColorScheme(value) {
      if (typeof document === "undefined" || !document.documentElement) {
        return;
      }
      const scheme = value === "dark" ? "dark" : "light";
      const isDark = scheme === "dark";
      const rootEl = document.documentElement;

      rootEl.setAttribute("data-mantine-color-scheme", scheme);
      rootEl.setAttribute("data-theme", scheme);
      rootEl.classList.toggle("dark", isDark);
      rootEl.style.colorScheme = scheme;

      if (document.body) {
        document.body.classList.toggle("theme-dark", isDark);
        document.body.classList.toggle("theme-light", !isDark);
      }
    },

    /**
     * Toggles the active color scheme between `"light"` and `"dark"`.
     *
     * @returns {"light"|"dark"} The newly activated color scheme.
     */
    toggleColorScheme() {
      const next = this.getColorScheme() === "dark" ? "light" : "dark";
      this.setColorScheme(next);
      return next;
    },

    /**
     * Initializes the active vendor theme and detects initial light/dark color
     * scheme from the document at application boot.
     */
    initialize() {
      const env = qx.core.Environment;
      const cssEngine = env.get("ville.cssEngine");
      let themeName = env.get("qx.theme");

      if (
        cssEngine === "obsidian" &&
        qx.Theme.getByName("ville.cssuc.theme.obsidian.Theme")
      ) {
        themeName = "ville.cssuc.theme.obsidian.Theme";
      } else if (
        cssEngine === "shadcn" &&
        qx.Theme.getByName("ville.cssuc.theme.shadcn.Theme")
      ) {
        themeName = "ville.cssuc.theme.shadcn.Theme";
      }

      if (themeName) {
        const obj = qx.Theme.getByName(themeName);
        if (!obj) {
          throw new Error(
            "The appearance theme to use is not available: " + themeName
          );
        }
        this.setTheme(obj);
      }

      if (typeof document !== "undefined" && document.documentElement) {
        const rootEl = document.documentElement;
        const initialDark =
          rootEl.getAttribute("data-mantine-color-scheme") === "dark" ||
          rootEl.getAttribute("data-theme") === "dark" ||
          rootEl.classList.contains("dark") ||
          Boolean(
            document.body && document.body.classList.contains("theme-dark")
          );
        const initialScheme = initialDark ? "dark" : "light";
        this.setColorScheme(initialScheme);
        this._applyColorScheme(initialScheme);
      }
    }
  }
});
