/**
 * Manager for Ville UI meta themes, live 3-Vendor (`mantine`, `obsidian`, `shadcn`)
 * theme hot-swapping, and unified light/dark color-scheme switching
 * (`STRAT-CSS-06`, `STRAT-BUILD-08`, `STRAT-BUILD-09`).
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
     * Active CSS vendor engine (`"mantine"`, `"obsidian"`, or `"shadcn"`).
     * When `ville.css.bundleAllThemes` is enabled, calling `setVendorTheme(vendor)`
     * hot-swaps the active appearance theme, re-evaluates all live widgets in
     * `ville.core.ObjectRegistry`, and switches `<link rel="stylesheet">` to
     * `bundle.<vendor>.min.css` in the browser without recompiling.
     */
    vendorTheme: {
      check: ["mantine", "obsidian", "shadcn"],
      init: "mantine",
      apply: "_applyVendorTheme",
      event: "changeVendorTheme"
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
    /** @type {boolean} @private */
    __initializing: false,

    /**
     * Applies the selected meta theme's `appearance` dictionary to `ville.theme.manager.Appearance`
     * and re-runs `syncAppearance()` across all live `ville.ui.core.Widget` instances.
     *
     * @param {Object} value New meta theme object.
     * @param {Object} old Previous meta theme object.
     * @protected
     */
    _applyTheme(value, old) {
      if (value && value.meta && value.meta.appearance) {
        const appearanceMgr = ville.theme.manager.Appearance.getInstance();
        appearanceMgr.setTheme(value.meta.appearance);

        if (old && !this.__initializing) {
          this.__resyncAllLiveWidgets();
        }
      }
    },

    /**
     * Hot-swaps the active CSS vendor (`"mantine"`, `"obsidian"`, `"shadcn"`):
     * 1. Updates `ville.core.Environment.set("ville.cssEngine", value)` and `data-ville-theme` on `<html>`.
     * 2. Switches to `ville.cssuc.theme.<vendor>.Theme` if registered.
     * 3. Swaps the page's `<link rel="stylesheet">` to `bundle.<vendor>.min.css` when `ville.css.bundleAllThemes` is active.
     * 4. Re-synchronizes light/dark DOM attributes and all live widgets.
     *
     * @param {"mantine"|"obsidian"|"shadcn"} value New vendor identifier.
     * @param {"mantine"|"obsidian"|"shadcn"} old Previous vendor identifier.
     * @protected
     */
    _applyVendorTheme(value, old) {
      ville.core.Environment.set("ville.cssEngine", value);

      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.setAttribute("data-ville-theme", value);
      }

      const vendorThemeMap = {
        mantine: "ville.cssuc.theme.mantine.Theme",
        obsidian: "ville.cssuc.theme.obsidian.Theme",
        shadcn: "ville.cssuc.theme.shadcn.Theme"
      };
      const targetThemeName = vendorThemeMap[value];
      const themeObj = targetThemeName ? ville.Theme.getByName(targetThemeName) : null;
      if (themeObj && this.getTheme() !== themeObj) {
        this.setTheme(themeObj);
      }

      if (
        !this.__initializing &&
        typeof document !== "undefined" &&
        ville.core.Environment.get("ville.css.bundleAllThemes")
      ) {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        for (let i = 0; i < links.length; i++) {
          const href = links[i].getAttribute("href") || "";
          if (/bundle(\.(mantine|obsidian|shadcn))?\.min\.css/.test(href)) {
            const nextHref = href.replace(
              /bundle(\.(mantine|obsidian|shadcn))?\.min\.css/,
              `bundle.${value}.min.css`
            );
            if (nextHref !== href) {
              links[i].setAttribute("href", nextHref);
            }
          }
        }
      }

      this._applyColorScheme(this.getColorScheme());
    },

    /**
     * Re-evaluates appearance themes across all active `ville.ui.core.Widget`
     * instances when a theme or vendor hot-swap occurs at runtime.
     *
     * @private
     */
    __resyncAllLiveWidgets() {
      const registry = ville.core.ObjectRegistry.getRegistry();
      for (const hash in registry) {
        const obj = registry[hash];
        if (
          obj &&
          !obj.isDisposed() &&
          typeof obj.syncAppearance === "function"
        ) {
          obj.syncAppearance();
        }
      }
      if (ville.html && ville.html.Element) {
        ville.html.Element.flush();
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
      this.__initializing = true;
      try {
        const env = ville.core.Environment;
        const cssEngine = env.get("ville.cssEngine") || "mantine";
        let themeName = env.get("qx.theme");

        if (
          cssEngine === "obsidian" &&
          ville.Theme.getByName("ville.cssuc.theme.obsidian.Theme")
        ) {
          themeName = "ville.cssuc.theme.obsidian.Theme";
        } else if (
          cssEngine === "shadcn" &&
          ville.Theme.getByName("ville.cssuc.theme.shadcn.Theme")
        ) {
          themeName = "ville.cssuc.theme.shadcn.Theme";
        } else if (
          cssEngine === "mantine" &&
          ville.Theme.getByName("ville.cssuc.theme.mantine.Theme")
        ) {
          themeName = "ville.cssuc.theme.mantine.Theme";
        }

        if (themeName) {
          const obj = ville.Theme.getByName(themeName);
          if (!obj) {
            throw new Error(
              "The appearance theme to use is not available: " + themeName
            );
          }
          this.setTheme(obj);
        }

        if (["mantine", "obsidian", "shadcn"].includes(cssEngine)) {
          this.setVendorTheme(
            /** @type {"mantine"|"obsidian"|"shadcn"} */ (cssEngine)
          );
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
      } finally {
        this.__initializing = false;
      }
    }
  }
});
