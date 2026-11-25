/**
 * shadcn/ui Vendor Appearance Theme (`ville.cssuc.theme.shadcn.Appearance` — `STRAT-CSS-06`).
 *
 * Maps Ville UI's 4-Tier provider-independent widget states (`disabled`, `loading`,
 * `invalid`, `variant-*`, `size-*`, `radius-*`, `gap-*`, `justify-*`, `align-*`)
 * onto shadcn/ui OKLCH token utilities (`tokens.css` + `utilities.css`).
 */
qx.Theme.define("ville.cssuc.theme.shadcn.Appearance", {
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
          cssUtilityClass: "shadcn-appshell"
        };
      }
    },
    "appshell-header": {
      style() {
        return {
          cssUtilityClass: "shadcn-appshell-header"
        };
      }
    },
    "appshell-header-inner": {
      include: "hgroup",
      style() {
        return {
          cssStates: {
            "set-styles": {
              "padding-inline": "1.25rem",
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
              "font-size": "1.125rem",
              "letter-spacing": "-0.025em"
            }
          }
        };
      }
    },
    "appshell-main": {
      style() {
        return {
          cssUtilityClass: "shadcn-appshell-main"
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
          cssUtilityClass: "shadcn-hgroup",
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
          cssUtilityClass: "shadcn-vstack",
          cssStates: {
            "set-styles": setStyles
          }
        };
      }
    },

    "layout-center": {
      style() {
        return {
          cssUtilityClass: "shadcn-center"
        };
      }
    },

    paper: {
      style() {
        return {
          cssUtilityClass: "shadcn-card"
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
          cssUtilityClass: "shadcn-divider",
          cssStates: {
            "set-styles": setStyles
          }
        };
      }
    },
    "divider/label": {},

    /* --- Typography & Navigation --- */
    "typography-title": {
      style() {
        return {
          cssUtilityClass: "shadcn-title"
        };
      }
    },
    "typography-text": {
      style() {
        return {
          cssUtilityClass: "shadcn-text"
        };
      }
    },
    anchor: {
      style() {
        return {
          cssUtilityClass: "shadcn-anchor"
        };
      }
    },
    image: {},

    /* --- Buttons & Menus --- */
    "button-frame": {
      style() {
        return {
          cssUtilityClass: "shadcn-btn"
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
        if (states.fullWidth) {
          classes.push("shadcn-btn-block");
        }

        if (states["variant-filled"]) {
          classes.push("shadcn-btn-primary");
        } else if (states["variant-secondary"] || states["variant-light"]) {
          classes.push("shadcn-btn-secondary");
        } else if (states["variant-subtle"] || states["variant-transparent"]) {
          classes.push("shadcn-btn-ghost");
        } else if (states["variant-danger"] || states["variant-destructive"]) {
          classes.push("shadcn-btn-destructive");
        } else {
          // Default in Ville UI maps to shadcn outline/primary surface
          classes.push("shadcn-btn-outline");
        }

        const heightMap = {
          xs: "1.75rem",
          sm: "2rem",
          md: "2.25rem",
          lg: "2.5rem",
          xl: "2.75rem"
        };
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
          cssUtilityClass: "shadcn-menu ville-menu-dropdown",
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
          cssUtilityClass: "shadcn-menu-item ville-menu-item",
          cssStates: {
            "set-classes": classes
          }
        };
      }
    },

    "menu-separator": {
      style() {
        return {
          cssUtilityClass: "shadcn-menu-separator"
        };
      }
    },

    /* --- Forms & Inputs --- */
    fieldset: {
      style() {
        return {
          cssUtilityClass: "shadcn-fieldset"
        };
      }
    },
    "fieldset/legend": {
      style() {
        return {
          cssUtilityClass: "shadcn-fieldset-legend"
        };
      }
    },

    "form-label": {
      style() {
        return {
          cssUtilityClass: "shadcn-label"
        };
      }
    },

    input: {
      style(states) {
        const classes = [];
        if (states.invalid) {
          classes.push("shadcn-input-invalid");
        }
        return {
          cssUtilityClass: "shadcn-input",
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
            "set-classes": states.checked
              ? ["shadcn-btn-primary"]
              : ["shadcn-btn-outline"],
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
          cssUtilityClass: "ville-burger shadcn-btn-ghost",
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
    "window/pane": "vstack"
  }
});
