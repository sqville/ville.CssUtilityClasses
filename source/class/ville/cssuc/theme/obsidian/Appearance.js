/**
 * Obsidian Vendor Appearance Theme (`ville.cssuc.theme.obsidian.Appearance` — `STRAT-CSS-06`).
 *
 * Maps Ville UI's 4-Tier provider-independent widget states (`disabled`, `loading`,
 * `invalid`, `variant-*`, `size-*`, `radius-*`, `gap-*`, `justify-*`, `align-*`)
 * onto Obsidian's bare semantic HTML selectors (`<button>`, `<input>`, `<fieldset>`)
 * and `.mod-*` / `.is-*` modifier classes.
 */
qx.Theme.define("ville.cssuc.theme.obsidian.Appearance", {
  appearances: {
    widget: {},
    root: {},
    label: {},
    form: {},
    "form-renderer-label": "label",

    /* --- AppShell --- */
    appshell: {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-appshell"
        };
      }
    },
    "appshell-header": {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-appshell-header"
        };
      }
    },
    "appshell-header-inner": {
      include: "hgroup",
      style() {
        return {
          cssStates: {
            "set-styles": {
              "padding-inline": "var(--size-4-4)",
              height: "100%"
            }
          }
        };
      }
    },
    "appshell-logo-text": {
      style() {
        return {
          cssStates: {
            "set-styles": {
              "font-weight": "700",
              "font-size": "18px",
              color: "var(--text-normal)"
            }
          }
        };
      }
    },
    "appshell-main": {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-appshell-main"
        };
      }
    },

    /* --- Declarative Layout Containers --- */
    hgroup: {
      style(states) {
        const setStyles = {};
        for (const justify of ["center", "flex-start", "flex-end", "space-between", "space-around"]) {
          if (states["justify-" + justify]) {
            setStyles["--group-justify"] = justify;
            break;
          }
        }
        for (const align of ["stretch", "center", "flex-start", "flex-end", "baseline"]) {
          if (states["align-" + align]) {
            setStyles["--group-align"] = align;
            break;
          }
        }
        for (const gap of ["xs", "sm", "md", "lg", "xl"]) {
          if (states["gap-" + gap]) {
            setStyles["--group-gap"] = `var(--ville-spacing-${gap})`;
            break;
          }
        }
        return {
          cssUtilityClass: "ville-obsidian-hgroup",
          cssStates: {
            "set-styles": setStyles
          }
        };
      }
    },

    vstack: {
      style(states) {
        const setStyles = {};
        for (const align of ["stretch", "center", "flex-start", "flex-end"]) {
          if (states["align-" + align]) {
            setStyles["--stack-align"] = align;
            break;
          }
        }
        for (const justify of ["center", "flex-start", "flex-end", "space-between", "space-around"]) {
          if (states["justify-" + justify]) {
            setStyles["--stack-justify"] = justify;
            break;
          }
        }
        for (const gap of ["xs", "sm", "md", "lg", "xl"]) {
          if (states["gap-" + gap]) {
            setStyles["--stack-gap"] = `var(--ville-spacing-${gap})`;
            break;
          }
        }
        return {
          cssUtilityClass: "ville-obsidian-vstack",
          cssStates: {
            "set-styles": setStyles
          }
        };
      }
    },

    "layout-center": {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-center"
        };
      }
    },

    paper: {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-paper"
        };
      }
    },

    divider: {
      style(states) {
        const setStyles = {};
        const sizeMap = { xs: "1px", sm: "1px", md: "2px", lg: "3px", xl: "4px" };
        for (const [token, px] of Object.entries(sizeMap)) {
          if (states["size-" + token]) {
            setStyles["--divider-size"] = px;
            break;
          }
        }
        return {
          cssUtilityClass: "ville-obsidian-divider",
          cssStates: {
            "set-styles": setStyles
          }
        };
      }
    },
    "divider/label": {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-divider-label"
        };
      }
    },

    /* --- Typography & Navigation --- */
    "typography-title": {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-title"
        };
      }
    },
    "typography-text": {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-text"
        };
      }
    },
    anchor: {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-anchor clickable-icon"
        };
      }
    },
    image: {},

    /* --- Buttons & Menus --- */
    "button-frame": {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-button"
        };
      }
    },

    button: {
      include: "button-frame",
      style(states) {
        const classes = [];
        const styles = {};

        if (states.disabled) {
          classes.push("is-disabled");
        }
        if (states.loading) {
          classes.push("mod-loading");
        }
        if (states.fullWidth) {
          classes.push("mod-full-width");
        }

        if (states["variant-filled"]) {
          classes.push("mod-cta");
        } else if (states["variant-danger"] || states["variant-destructive"]) {
          classes.push("mod-warning");
        } else if (states["variant-subtle"] || states["variant-transparent"]) {
          classes.push("clickable-icon");
        }

        const heightMap = { xs: "26px", sm: "30px", md: "32px", lg: "38px", xl: "44px" };
        for (const [token, h] of Object.entries(heightMap)) {
          if (states["size-" + token]) {
            styles["--button-height"] = h;
            break;
          }
        }

        return {
          cssStates: {
            "set-classes": classes,
            "set-styles": styles
          }
        };
      }
    },

    menubutton: {
      include: "button",
      style(states) {
        return {
          cssStates: {
            "set-attributes": {
              "data-expanded": states.expanded ? "true" : null
            }
          }
        };
      }
    },

    menu: {
      style(states) {
        return {
          cssUtilityClass: "menu ville-menu-dropdown",
          cssStates: {
            "set-attributes": {
              "data-open": states.open ? "true" : null,
              "data-submenu": states.submenu ? "true" : null,
              "data-contextmenu": states.contextmenu ? "true" : null
            }
          }
        };
      }
    },

    "menu-button": {
      style(states) {
        const classes = [];
        if (states.disabled) {
          classes.push("is-disabled");
        }
        return {
          cssUtilityClass: "menu-item ville-menu-item",
          cssStates: {
            "set-classes": classes
          }
        };
      }
    },

    "menu-separator": {
      style() {
        return {
          cssUtilityClass: "menu-separator"
        };
      }
    },

    /* --- Forms & Inputs --- */
    fieldset: {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-fieldset"
        };
      }
    },
    "fieldset/legend": {},

    "form-label": {
      style() {
        return {
          cssUtilityClass: "ville-obsidian-label"
        };
      }
    },

    input: {
      style(states) {
        const classes = [];
        if (states.invalid) {
          classes.push("is-invalid");
        }
        if (states.disabled) {
          classes.push("is-disabled");
        }
        return {
          cssUtilityClass: "ville-obsidian-input",
          cssStates: {
            "set-classes": classes
          }
        };
      }
    },
    textfield: "input",
    textarea: "input",

    /* --- Tier A1 Actions, Toggles, Navigation, Overlays & Form Controls --- */
    actionicon: "button",
    "toggle-button": {
      include: "button",
      style(states) {
        return {
          cssStates: {
            "set-classes": states.checked ? ["mod-cta"] : [],
            "set-attributes": {
              "data-active": states.checked ? "true" : null
            }
          }
        };
      }
    },
    "toggle-actionicon": "toggle-button",
    burger: {
      style(states) {
        return {
          cssUtilityClass: "ville-burger clickable-icon",
          cssStates: {
            "set-attributes": {
              "data-opened": states.opened ? "true" : null
            }
          }
        };
      }
    },
    navlink: {
      style(states) {
        return {
          cssUtilityClass: "ville-navlink",
          cssStates: {
            "set-attributes": {
              "data-active": states.active ? "true" : null
            }
          }
        };
      }
    },
    checkbox: {
      style() {
        return {
          cssUtilityClass: "ville-checkbox"
        };
      }
    },
    switch: {
      style() {
        return {
          cssUtilityClass: "ville-switch"
        };
      }
    },
    radiobutton: {
      style() {
        return {
          cssUtilityClass: "ville-radiobutton"
        };
      }
    },
    radiobuttongroup: {},
    popup: {
      style() {
        return {
          cssUtilityClass: "ville-popover"
        };
      }
    },
    tooltip: {
      style() {
        return {
          cssUtilityClass: "ville-tooltip"
        };
      }
    },
    modal: {
      style() {
        return {
          cssUtilityClass: "ville-modal"
        };
      }
    },
    "modal/header": "hgroup",
    "modal/title": "typography-title",
    "modal/close-button": "actionicon",
    "modal/pane": "vstack",
    window: "modal",
    "window/header": "hgroup",
    "window/title": "typography-title",
    "window/close-button": "actionicon",
    "window/pane": "vstack",

    /* --- Stage 6: Unified MDataView (`SelectBox` & `ComboBox`), Tier A2 Controls & Composite Containers --- */
    selectbox: {
      style() {
        return {
          cssUtilityClass: "ville-selectbox"
        };
      }
    },
    "selectbox/button": "button",
    "selectbox/popup": "popup",
    "selectbox/list": {
      style() {
        return {
          cssUtilityClass: "ville-dataview-list"
        };
      }
    },
    "selectbox-item": {
      style() {
        return {
          cssUtilityClass: "ville-dataview-item"
        };
      }
    },
    combobox: {
      style() {
        return {
          cssUtilityClass: "ville-combobox"
        };
      }
    },
    "combobox/textfield": "textfield",
    "combobox/button": "actionicon",
    "combobox/popup": "popup",
    "combobox/list": "selectbox/list",
    "combobox-item": "selectbox-item",
    spinner: {
      style() {
        return {
          cssUtilityClass: "ville-spinner"
        };
      }
    },
    "spinner/textfield": "textfield",
    "spinner/controls": {},
    "spinner/upbutton": "button",
    "spinner/downbutton": "button",
    slider: {
      style() {
        return {
          cssUtilityClass: "ville-slider"
        };
      }
    },
    datefield: "textfield",
    datechooser: {
      style() {
        return {
          cssUtilityClass: "ville-datechooser"
        };
      }
    },
    "datechooser/navigation-bar": "hgroup",
    "datechooser/prev-month-button": "actionicon",
    "datechooser/next-month-button": "actionicon",
    "datechooser/month-year-label": "label",
    "datechooser/date-pane": {},
    colorselector: {
      style() {
        return {
          cssUtilityClass: "ville-colorselector"
        };
      }
    },
    "colorselector/color-well": {},
    "colorselector/hex-field": "textfield",
    "colorselector/preset-grid": "hgroup",
    colorpopup: "popup",
    "colorpopup/colorselector": "colorselector",
    progressbar: {
      style() {
        return {
          cssUtilityClass: "ville-progressbar"
        };
      }
    },
    meter: {
      style() {
        return {
          cssUtilityClass: "ville-meter"
        };
      }
    },
    tabview: {
      style() {
        return {
          cssUtilityClass: "ville-tabview"
        };
      }
    },
    "tabview/bar": {
      style() {
        return {
          cssUtilityClass: "ville-tabview-bar"
        };
      }
    },
    "tabview/pane": {
      style() {
        return {
          cssUtilityClass: "ville-tabview-pane"
        };
      }
    },
    "tabview-page": "widget",
    "tabview-page/button": {
      include: "button",
      style(states) {
        return {
          cssUtilityClass: "ville-tabview-button",
          cssStates: {
            "set-classes": states.checked ? ["mod-cta"] : [],
            "set-attributes": {
              "data-active": states.checked ? "true" : null
            }
          }
        };
      }
    },
    toolbar: {
      style() {
        return {
          cssUtilityClass: "ville-toolbar"
        };
      }
    },
    "toolbar/part": "hgroup",
    "toolbar/part/container": "hgroup",
    "toolbar/part/handle": "widget",
    "toolbar-separator": "divider",
    "toolbar-button": "button",
    "toolbar-menubutton": "menubutton",
    "toolbar-splitbutton": "button",
    menubar: "toolbar",
    "menubar-button": "menubutton",
    splitpane: {
      style() {
        return {
          cssUtilityClass: "ville-splitpane"
        };
      }
    },
    "splitpane/splitter": {
      style(states) {
        return {
          cssUtilityClass: `ville-splitpane-splitter${states.horizontal ? " horizontal" : states.vertical ? " vertical" : ""}`,
          cssStates: {
            "set-attributes": {
              "data-active": states.pressed ? "true" : null
            }
          }
        };
      }
    },
    "splitpane/splitter/knob": "widget",
    "splitpane/slider": "widget",
    scrollarea: "widget",
    slidebar: "hgroup",
    "slidebar/button-forward": "button",
    "slidebar/button-backward": "button",
    "slidebar/content": "widget",
    resizer: "widget",

    /* --- Pure Semantic HTML5 Takes (`NativeSelect`, `SimpleList`, `SimpleTable`) --- */
    nativeselect: {
      include: "input",
      style() {
        return {
          cssUtilityClass: "ville-obsidian-input dropdown ville-nativeselect"
        };
      }
    },
    simplelist: {
      style() {
        return {
          cssUtilityClass: "ville-simplelist"
        };
      }
    },
    simpletable: {
      style() {
        return {
          cssUtilityClass: "ville-simpletable"
        };
      }
    },

    /* --- Stage 7B: Advanced Qx-Compatible Data Views (`Table`, `List`, `Tree`) --- */
    table: {
      style() {
        return {
          cssUtilityClass: "ville-table"
        };
      }
    },
    "table/scroll-viewport": {
      style() {
        return {
          cssUtilityClass: "ville-table-viewport"
        };
      }
    },
    "table/table-el": "simpletable",
    "table/statusbar": {
      style() {
        return {
          cssUtilityClass: "ville-table-statusbar"
        };
      }
    },
    list: {
      style() {
        return {
          cssUtilityClass: "ville-list ville-dataview-list"
        };
      }
    },
    "list-item": "selectbox-item",
    tree: {
      style() {
        return {
          cssUtilityClass: "ville-tree"
        };
      }
    },
    "tree-folder": {},
    "tree-file": {}
  }
});
