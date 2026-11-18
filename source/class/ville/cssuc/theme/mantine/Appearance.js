/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Martin Wittemann (martinwittemann)

************************************************************************* */

qx.Theme.define("ville.cssuc.theme.mantine.Appearance", {

  appearances: {

    /*
    ---------------------------------------------------------------------------
      MANTINE CONTROLS
    ---------------------------------------------------------------------------
    */

    overlay: {
      style() {
        return {
          cssUtilityClass: `m_9814e45f${qx.core.Environment.get("qx.debug") ? ' mantine-Overlay-root' : ''}`
        };
      }
    },

    affix: {
      style() {
        return {
          cssUtilityClass: `m_7f854edf${qx.core.Environment.get("qx.debug") ? ' mantine-Affix-root' : ''}`
        };
      }
    },

    floatingindicator: {
      style() {
        return {
          cssUtilityClass: `m_f9a45e7b m_96b553a6${qx.core.Environment.get("qx.debug") ? ' mantine-FloatingIndicator-root' : ''}`
        };
      }
    },

    "divider": {
      style(states) {
        const setAttrs = {
          "data-orientation": states["orientation-vertical"] ? "vertical" : "horizontal"
        };
        const setStyles = {};

        if (states.withLabel) {
          setAttrs["data-with-label"] = "true";
        }

        if (states["variant-dashed"]) {
          setAttrs["data-variant"] = "dashed";
        } else if (states["variant-dotted"]) {
          setAttrs["data-variant"] = "dotted";
        }

        for (const size of ["xs", "sm", "md", "lg", "xl"]) {
          if (states["size-" + size]) {
            setAttrs["data-size"] = size;
            setStyles["--divider-size"] = `var(--divider-size-${size})`;
            break;
          }
        }

        for (const spacing of ["xs", "sm", "md", "lg", "xl"]) {
          if (states["spacing-" + spacing]) {
            setStyles["margin-block"] = `var(--mantine-spacing-${spacing})`;
            break;
          }
        }

        return {
          cssUtilityClass: "m_3eebeb36 mantine-Divider-root",
          cssStates: {
            "set-attributes": setAttrs,
            "set-styles": setStyles
          }
        };
      }
    },

    "divider/label": {
      style(states) {
        let position = "center";
        if (states["position-left"]) {
          position = "left";
        } else if (states["position-right"]) {
          position = "right";
        }

        return {
          cssUtilityClass: "m_9e365f20 mantine-Divider-label",
          cssStates: {
            "set-attributes": {
              "data-position": position
            }
          }
        };
      }
    },

    paper: {
      style() {
        return {
          cssUtilityClass: `m_1b7284a3${qx.core.Environment.get("qx.debug") ? ' mantine-Paper-root' : ''}`
        };
      }
    },

    hgroup: {
      style() {
        return {
          cssUtilityClass: `m_4081bf90${qx.core.Environment.get("qx.debug") ? ' mantine-Group-root' : ''}`
        };
      }
    },

    vstack: {
      style() {
        return {
          cssUtilityClass: `m_6d731127${qx.core.Environment.get("qx.debug") ? ' mantine-Stack-root' : ''}`
        };
      }
    },

    "layout-center": {
      style(states) {
        const attrs = {};
        const classes = [];
        const styles = {};

        // 1. Disabled / Loading states
        if (states.inline) {
          attrs["data-inline"] = "true";
        }

        return {
          cssUtilityClass: `m_4451eb3a${qx.core.Environment.get("qx.debug") ? ' mantine-Center-root' : ''}`,
          cssStates: {
            "set-attributes": attrs,
            "set-classes": classes,
            "set-styles": styles
          },
          inline: states.inline ? true : false
        };
      }
    },

    "typography-title": {
      style() {
        return {
          cssUtilityClass: `m_8a5d1357${qx.core.Environment.get("qx.debug") ? ' mantine-Title-root' : ''}`
        };
      }
    },

    "typography-text": {
      style(states) {
        const setAttrs = {};
        const setStyles = {};

        // Size -> --text-fz, --text-lh
        for (const size of ["xs", "sm", "md", "lg", "xl"]) {
          if (states["size-" + size]) {
            setAttrs["data-size"] = size;
            setStyles["--text-fz"] = `var(--mantine-font-size-${size})`;
            setStyles["--text-lh"] = `var(--mantine-line-height-${size})`;
            break;
          }
        }

        // Truncate -> data-truncate
        for (const mode of ["true", "start", "end"]) {
          if (states["truncate-" + mode]) {
            setAttrs["data-truncate"] = mode;
            break;
          }
        }

        // Text wrap -> --text-text-wrap
        for (const wrap of ["wrap", "nowrap", "balance", "pretty", "stable"]) {
          if (states["textWrap-" + wrap]) {
            setStyles["--text-text-wrap"] = wrap;
            break;
          }
        }

        // Boolean flags -> data-line-clamp, data-inline, data-inherit
        if (states.lineClamp) {
          setAttrs["data-line-clamp"] = true;
        }
        if (states.inline) {
          setAttrs["data-inline"] = true;
        }
        if (states.inherit) {
          setAttrs["data-inherit"] = true;
        }
        if (states["variant-gradient"]) {
          setAttrs["data-variant"] = "gradient";
        }

        return {
          cssUtilityClass: "m_b6d8b162 mantine-Text-root",
          cssStates: {
            "set-attributes": setAttrs,
            "set-styles": setStyles
          }
        };
      }
    },


    "anchor": {
      style(states) {
        let underline = "hover";
        if (states["underline-always"]) {
          underline = "always";
        } else if (states["underline-not-hover"]) {
          underline = "not-hover";
        } else if (states["underline-never"]) {
          underline = "never";
        }
        // m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label
        return {
          cssUtilityClass: `m_8fdc1311${qx.core.Environment.get("qx.debug") ? ' mantine-InputWrapper-label mantine-TextInput-label' : ''}`,
          cssStates: {
            "set-attributes": {
              "data-underline": underline
            }
          }
        };
      }
    },

    "form-label": {
      style(states) {
        let size = "xs";
        for (const token of ["xs", "sm", "md", "lg", "xl"]) {
          if (states["size-" + token]) {
            size = token;
            break;
          }
        }

        return {
          cssUtilityClass: "m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label",
          cssStates: {
            "set-attributes": {
              "data-size": size
            },
            "set-styles": {
              "--input-label-size": `var(--mantine-font-size-${size})`
            }
          }
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    widget: {},

    label: {},

    image: {
      style() {
        return {
          cssUtilityClass: `m_9e117634${qx.core.Environment.get("qx.debug") ? ' mantine-Image-root' : ''}`
        };
      }
    },

    atom: {},
    "atom/label": "label",
    "atom/icon": "image",

   root: {},

    popup: {
      style() {
        return {
          cssUtilityClass: qx.core.Environment.get("ville.cssLayout") ? "ville-popover" : ""
        };
      }
    },

    tooltip: "popup",

    "tooltip/atom": "atom",

    "tooltip-error": "tooltip",

    "tooltip-error/atom": "atom",

    iframe: {},

    "move-frame": {},

    "resize-frame": "move-frame",

    "dragdrop-cursor": {},

    /*
    ---------------------------------------------------------------------------
      SLIDEBAR
    ---------------------------------------------------------------------------
    */

    slidebar: {},
    "slidebar/scrollpane": {},
    "slidebar/content": {},

    "slidebar/button-forward": "button",

    "slidebar/button-backward": "button",

    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    table: "widget",

    "table/statusbar": {},

    "table/column-button": "button",

    "table-column-reset-button": "menu-button",

    "table-scroller/scrollbar-x": "scrollbar",
    "table-scroller/scrollbar-y": "scrollbar",

    "table-scroller": "widget",

    "table-scroller/header": {},

    "table-scroller/pane": {},

    "table-scroller/focus-indicator": {},

    "table-scroller/resize-line": {},

    "table-header-cell": "atom",

    "table-header-cell/icon": "atom/icon",

    "table-header-cell/sort-icon": {},

    "table-editor-textfield": "textfield",

    "table-editor-selectbox": "selectbox",

    "table-editor-combobox": "combobox",

    "progressive-table-header": {},

    "progressive-table-header-cell": {},

    /*
    ---------------------------------------------------------------------------
      TREEVIRTUAL
    ---------------------------------------------------------------------------
    */

    treevirtual: "textfield",

    "treevirtual-folder": {},

    "treevirtual-file": "treevirtual-folder",

    "treevirtual-line": {},

    "treevirtual-contract": {},

    "treevirtual-expand": {},

    "treevirtual-only-contract": {},

    "treevirtual-only-expand": {},

    "treevirtual-start-contract": {},

    "treevirtual-start-expand": {},

    "treevirtual-end-contract": {},

    "treevirtual-end-expand": {},

    "treevirtual-cross-contract": {},

    "treevirtual-cross-expand": {},

    "treevirtual-end": {},

    "treevirtual-cross": {},

    "treevirtual-node-editor-textfield": "textfield",

    /*
    ---------------------------------------------------------------------------
      RESIZER
    ---------------------------------------------------------------------------
    */

    resizer: {},

    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    splitpane: {},

    "splitpane/splitter": {},

    "splitpane/splitter/knob": {},

    "splitpane/slider": {},

    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    //m_38a85659 mantine-Menu-dropdown m_dc9b7c9f
    menu: {
      style(states) {
        return {
          cssUtilityClass: `m_38a85659${qx.core.Environment.get("qx.debug") ? ' mantine-Menu-dropdown' : ''} m_dc9b7c9f ville-menu-dropdown`,
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

    /*menu: {
      style() {
        return {
          cssUtilityClass: `m_38a85659 mantine-Menu-dropdown m_dc9b7c9f${qx.core.Environment.get("ville.cssLayout") ? ' ville-popover' : ''}`
        };
      }
    },*/

    "menu/slidebar": "menu-slidebar",

    "menu-slidebar": "widget",

    "menu-slidebar-button": {},

    "menu-slidebar/button-backward": "menu-slidebar-button",

    "menu-slidebar/button-forward": "menu-slidebar-button",

    "menu-separator": {},

    /*"menu-button": {
      style() {
        return {
          cssUtilityClass: "mantine-focus-auto m_99ac2aa1 mantine-Menu-item m_87cf2631 mantine-UnstyledButton-root"
        };
      }
    },*/

    
    "menu-button": {
      style(states) {

        // mantine-focus-auto m_99ac2aa1 mantine-Menu-item m_87cf2631 mantine-UnstyledButton-root
        // ville-menu-item

        const cssucs = `mantine-focus-auto m_99ac2aa1${qx.core.Environment.get("qx.debug") ? ' mantine-Menu-item' : ''} m_87cf2631${qx.core.Environment.get("qx.debug") ? ' mantine-UnstyledButton-root' : ''}`

        return {
          cssUtilityClass: cssucs,
          cssStates: {
            "set-attributes": {
              "data-hovered": states.selected ? "true" : null,
              "data-disabled": states.disabled ? "true" : null
            }
          }
        };
      }
    },

    "menu-button/shortcut": {
      style() {
        return {
          cssUtilityClass: "m_599a2148 mantine-Menu-itemSection ville-menu-item-shortcut"
        };
      }
    },

    "menu-button/arrow": {
      style() {
        return {
          cssUtilityClass: "m_599a2148 mantine-Menu-itemSection ville-menu-item-arrow"
        };
      }
    },

    "menu-separator": {
      style() {
        return {
          cssUtilityClass: "m_efdf90cb mantine-Menu-divider"
        };
      }
    },

    "menu-button/icon": "image",

    "menu-button/label": {
      style() {
        return {
          cssUtilityClass: "m_5476e0d3 mantine-Menu-itemLabel"
        };
      }
    },

    "menu-button/shortcut": "label",

    "menu-button/arrow": "image",

    "menu-checkbox": "menu-button",

    "menu-radiobutton": "menu-button",

    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */

    menubar: {},

    "menubar-button": {},

    /*
    ---------------------------------------------------------------------------
      VIRTUAL WIDGETS
    ---------------------------------------------------------------------------
    */
    "virtual-list": "list",
    "virtual-list/row-layer": "row-layer",

    "row-layer": "widget",
    "column-layer": "widget",

    "virtual-background-span": "widget",

    "virtual-list-header-cell": "atom",

    "group-item": "label",

    "virtual-selectbox": "selectbox",
    "virtual-selectbox/dropdown": "popup",
    "virtual-selectbox/dropdown/list": "virtual-list",

    "virtual-combobox": "combobox",
    "virtual-combobox/dropdown": "popup",
    "virtual-combobox/dropdown/list": "virtual-list",

    "virtual-tree": "tree",

    "virtual-tree-folder": "tree-folder",
    "virtual-tree-file": "tree-file",

    cell: {},

    "cell-string": "cell",
    "cell-number": "cell",

    "cell-image": "cell",
    "cell-boolean": "cell",
    "cell-atom": "cell",
    "cell-date": "cell",
    "cell-html": "cell",

    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */

    scrollbar: {},
    "scrollbar/slider": {},

    "scrollbar/slider/knob": {},

    "scrollbar/button": "button",

    "scrollbar/button-begin": "scrollbar/button",
    "scrollbar/button-end": "scrollbar/button",

    /*
    ---------------------------------------------------------------------------
      SCROLLAREA
    ---------------------------------------------------------------------------
    */

    "scrollarea/corner": {},

    scrollarea: "widget",
    "scrollarea/pane": "widget",
    "scrollarea/scrollbar-x": "scrollbar",
    "scrollarea/scrollbar-y": "scrollbar",

    /*
    ---------------------------------------------------------------------------
      TEXT FIELD
    ---------------------------------------------------------------------------
    */
    textfield: {},

    textarea: "textfield",

    "textfield/scrollbar-y/button-begin": "scrollbar/button",
    "textfield/scrollbar-y/button-end": "scrollbar/button",

    /*
    ---------------------------------------------------------------------------
      RADIO BUTTON
    ---------------------------------------------------------------------------
    */
    "radiobutton/icon": {},

    radiobutton: {},

    /*
    ---------------------------------------------------------------------------
      FORM
    ---------------------------------------------------------------------------
    */
    "form-renderer-label": "label",

    /*
    ---------------------------------------------------------------------------
      CHECK BOX. 
    ---------------------------------------------------------------------------
    */
    checkbox: {
      style() {
        return {
          cssUtilityClass: "m_bf2d988c mantine-Checkbox-root m_5f75b09e mantine-Checkbox-root"
        };
      }
    },

    "checkbox/icon": {},


    "checkbox/label": {
      style() {
        return {
          cssUtilityClass: `m_8ee546b8${qx.core.Environment.get("qx.debug") ? ' mantine-Checkbox-label' : ''}`
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      SPINNER
    ---------------------------------------------------------------------------
    */

    spinner: {},

    "spinner/textfield": "textfield",

    "spinner/upbutton": "combobox/button",

    "spinner/downbutton": "combobox/button",

    /*
    ---------------------------------------------------------------------------
      SELECTBOX
    ---------------------------------------------------------------------------
    */

    selectbox: "button-frame",

    "selectbox/atom": "atom",
    "selectbox/popup": "popup",
    "selectbox/list": "list",

    "selectbox/arrow": "button-frame",

    "selectbox-arrow-button": {},

    /*
    ---------------------------------------------------------------------------
      COMBO BOX
    ---------------------------------------------------------------------------
    */

    combobox: {},

    "combobox/button": "button-frame",

    "combobox/popup": "popup",
    "combobox/list": "list",

    "combobox/textfield": "textfield",

    /*
    ---------------------------------------------------------------------------
      DATEFIELD
    ---------------------------------------------------------------------------
    */

    datefield: "textfield",

    "datefield/button": "combobox/button",

    "datefield/textfield": "textfield",

    "datefield/list": "datechooser",

    /*
    ---------------------------------------------------------------------------
      LIST
    ---------------------------------------------------------------------------
    */

    list: "textfield",

    listitem: "atom",

    /*
    ---------------------------------------------------------------------------
      SLIDER
    ---------------------------------------------------------------------------
    */

    slider: {},

    "slider/knob": "scrollbar/slider/knob",

    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    /*"button-frame": {
      style() {
        return {
          cssUtilityClass: "mantine-focus-auto m_77c9d27d mantine-Button-root m_87cf2631 mantine-UnstyledButton-root"
        };
      }
    },*/

    /*"button-frame/label": {
      style() {
        return {
          cssUtilityClass: "m_811560b9 mantine-Button-label"
        };
      }
    },*/

    "button-frame": {
      style(states) {
        let baseClasses;

        if (qx.core.Environment.get("qx.debug")) {
            baseClasses = [
              "mantine-focus-auto",
              "m_77c9d27d",
              "mantine-Button-root",
              "m_87cf2631",
              "mantine-UnstyledButton-root"
            ];
          } else {
            baseClasses = [
              "mantine-focus-auto",
              "m_77c9d27d",
              "m_87cf2631"
            ];
          }

          return {
            cssUtilityClass: baseClasses.join(" ")
          };
        }
    },

    "button": {
      include: "button-frame",
      style(states) {

        const attrs = {};
        const classes = [];
        const styles = {};

        // 1. Disabled / Loading states
        if (states.loading) {
          attrs["data-loading"] = "true";
        }
        if (states.disabled) {
          attrs["data-disabled"] = "true";
        } else {
          classes.push("mantine-active");
        }

        // 2. Full width layout state
        if (states.fullWidth) {
          attrs["data-block"] = "true";
        }

        // 3. Icon position
        if (states.hasIcon) {
          attrs["data-position"] = states["iconPosition-right"] ? "right" : "left";
        }

        // 4. Modifier states ("size-*", "variant-*", "radius-*")
        for (const stateName in states) {
          if (stateName.startsWith("size-")) {
            attrs["data-size"] = stateName.slice(5);
          } else if (stateName.startsWith("variant-")) {
            attrs["data-variant"] = stateName.slice(8);
          } else if (stateName.startsWith("radius-")) {
            styles["--button-radius"] = `var(--mantine-radius-${stateName.slice(7)})`;
          }
        }

        return {
          cssStates: {
            "set-attributes": attrs,
            "set-classes": classes,
            "set-styles": styles
          },
          variant: "default",
          size: "md",
          radius: "sm",
          fullWidth: false,
          iconPosition: "left",
          show: "both"
        };
      }
    },



    /*button: {
      include: "button-frame",
      style(states) {
        let changes = {
          "set-attributes": {},     
          "remove-attributes": [],  
          "set-classes": [],        
          "remove-classes": [],     
          "set-styles": {},         
          "remove-styles": []       
        };

        // 1. Base Interaction States
        if (states.disabled) {
          changes["set-attributes"]["data-disabled"] = true;
          changes["remove-classes"].push("mantine-active");
        } else {
          changes["remove-attributes"].push("data-disabled");
          changes["set-classes"].push("mantine-active");
        }
        if (states["data-loading"]) {
          changes["set-attributes"]["data-loading"] = true;
        } else {
          changes["remove-attributes"].push("data-loading");
        }

        // --- Configuration Mappings ---

        const interpolations = {
          size: { 
            height: 'button-height', 
            'padding-x': 'button-padding-x', 
            fz: 'mantine-font-size' 
          },
          compact: {
            height: 'button-height-compact',
            'padding-x': 'button-padding-x-compact',
            fz: 'mantine-font-size'
          },
          radius: { 
            radius: 'mantine-radius' 
          }
        };

        const variants = {
          default: {
            bg: 'var(--mantine-color-default)',
            hover: 'var(--mantine-color-default-hover)',
            color: 'var(--mantine-color-default-color)',
            bd: 'calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-default-border)'
          },
          filled: {
            bg: 'var(--mantine-primary-color-filled)',
            hover: 'var(--mantine-primary-color-filled-hover)',
            color: 'var(--mantine-color-white)',
            bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
          },
          outline: {
            bg: 'transparent',
            hover: 'var(--mantine-primary-color-outline-hover)',
            color: 'var(--mantine-primary-color-outline)',
            bd: 'calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-primary-color-outline)'
          },
          subtle: {
            bg: 'transparent',
            hover: 'var(--mantine-primary-color-light-hover)',
            color: 'var(--mantine-primary-color-light-color)',
            bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
          },
          light: {
            bg: 'var(--mantine-primary-color-light)',
            hover: 'var(--mantine-primary-color-light-hover)',
            color: 'var(--mantine-primary-color-light-color)',
            bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
          },
          transparent: {
            bg: 'transparent',
            hover: 'transparent',
            color: 'var(--mantine-primary-color-light-color)',
            bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
          },
          white: {
            bg: 'var(--mantine-color-white)',
            hover: 'rgba(252, 252, 252, 1)',
            color: 'var(--mantine-primary-color-filled)',
            bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
          }
        };

        const scales = ['xs', 'sm', 'md', 'lg', 'xl'];

        // --- State Resolution ---

        // 1. Process size, compact, and radius (Interpolated mapping)
        for (const group of Object.keys(interpolations)) {
          for (const scale of scales) {
            if (states[`${group}-${scale}`]) {
              const properties = interpolations[group];
              for (const prop of Object.keys(properties)) {
                changes['set-styles'][`--button-${prop}`] = `var(--${properties[prop]}-${scale})`;
              }
              break; // Mutually exclusive within its group (e.g., size-xs overrides size-lg)
            }
          }
        }

        // 2. Process variants (Explicit value mapping)
        for (const vKey of Object.keys(variants)) {
          if (states[`variant-${vKey}`]) {
            changes['set-attributes']['data-variant'] = vKey;
            
            const vStyles = variants[vKey];
            for (const sKey of Object.keys(vStyles)) {
              changes['set-styles'][`--button-${sKey}`] = vStyles[sKey];
            }
            break; // Mutually exclusive
          }
        }

        return {
          cssStates: changes
        };
      }
    },*/

    "toggle-button": {
      style(states) {
        //console.log(states);

        let changes = {
          "set-attributes": {},     
          "remove-attributes": [],  
          "set-classes": [],        
          "remove-classes": [],     
          "set-styles": {},         
          "remove-styles": []       
        };

        // 1. Base Interaction States
        if (states.disabled) {
          changes["set-attributes"]["data-disabled"] = true;
        } else {
          changes["remove-attributes"].push("data-disabled");
        }
        if (states.checked) {
          changes["set-attributes"]["data-active"] = true;
        } else {
          changes["remove-attributes"].push("data-active");
        }

        return {
          cssStates: changes,
          cssUtilityClass: `mantine-focus-auto m_ba2e839b${qx.core.Environment.get("qx.debug") ? ' mantine-Toggle-root' : ''}`
        };
      }
    },

    "hover-button": "button",

    menubutton: {
      include: "button",
      style(states) {
        return {
          cssStates: {
            "set-attributes": {
              "data-expanded": states.pressed ? "true" : null
            }
          }
        };
      }
    },

    /*menubutton: {
    include: "button-frame",

      style(states) {
        let changes = {
          "set-attributes": {},     
          "remove-attributes": [],  
          "set-classes": [],        
          "remove-classes": [],     
          "set-styles": {},         
          "remove-styles": []       
        };

        // 1. Base Interaction States
        if (states.disabled) {
          changes["set-attributes"]["data-disabled"] = true;
          changes["remove-classes"].push("mantine-active");
        } else {
          changes["remove-attributes"].push("data-disabled");
          changes["set-classes"].push("mantine-active");
        }
      
        // 2a. Size Modifiers (Driven entirely by CSS Variables, no data-attribute)
        if (states["size-xs"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-xs)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-xs)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-xs)";
        } else if (states["size-md"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-md)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-md)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-md)";
        } else if (states["size-lg"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-lg)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-lg)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-lg)";
        } else if (states["size-xl"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-xl)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-xl)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-xl)";
        } else if (states["size-sm"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-sm)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-sm)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-sm)";
        }

        // 2b. Size Modifiers (Driven entirely by CSS Variables, no data-attribute)
        if (states["compact-xs"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-compact-xs)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-compact-xs)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-xs)";
        } else if (states["compact-md"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-compact-md)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-compact-md)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-md)";
        } else if (states["compact-lg"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-compact-lg)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-compact-lg)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-lg)";
        } else if (states["compact-xl"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-compact-xl)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-compact-xl)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-xl)";
        } else if (states["compact-sm"]) {
          changes["set-styles"]["--button-height"] = "var(--button-height-compact-sm)";
          changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-compact-sm)";
          changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-sm)";
        }

        // 3. Radius Modifiers (Driven entirely by CSS Variables, no data-attribute)
        if (states["radius-xs"]) {
          changes["set-styles"]["--button-radius"] = "var(--mantine-radius-xs)";
        } else if (states["radius-sm"]) {
          changes["set-styles"]["--button-radius"] = "var(--mantine-radius-sm)";
        } else if (states["radius-md"]){
          changes["set-styles"]["--button-radius"] = "var(--mantine-radius-md)";
        } else if (states["radius-lg"]) {
          changes["set-styles"]["--button-radius"] = "var(--mantine-radius-lg)";
        } else if (states["radius-xl"]) {
          changes["set-styles"]["--button-radius"] = "var(--mantine-radius-xl)";
        }

        // 4. Variant Modifiers & CSS Variable Assignments
        if (states["variant-filled"]) {
          changes["set-attributes"]["data-variant"] = "filled";
          changes["set-styles"]["--button-bg"] = "var(--mantine-color-blue-filled)";
          changes["set-styles"]["--button-color"] = "var(--mantine-color-white)";
          changes["set-styles"]["--button-hover"] = "var(--mantine-color-blue-filled-hover)";
          changes["set-styles"]["--button-bd"] = "calc(0.0625rem * var(--mantine-scale)) solid transparent";
        } else if (states["variant-outline"]) {
          changes["set-attributes"]["data-variant"] = "outline";
          changes["set-styles"]["--button-bg"] = "transparent";
          changes["set-styles"]["--button-hover"] = "var(--mantine-color-blue-outline-hover)";
          changes["set-styles"]["--button-color"] = "var(--mantine-color-blue-outline)";
          changes["set-styles"]["--button-bd"] = "calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-blue-outline)";
        } else if (states["variant-subtle"]) {
          changes["set-attributes"]["data-variant"] = "subtle";
          changes["set-styles"]["--button-bg"] = "transparent";
          changes["set-styles"]["--button-color"] = "var(--mantine-color-blue-filled)";
          changes["set-styles"]["--button-hover"] = "var(--mantine-color-blue-light-hover)";
          changes["set-styles"]["--button-bd"] = "calc(0.0625rem * var(--mantine-scale)) solid transparent";
        } else if (states["variant-default"]) {
          changes["set-attributes"]["data-variant"] = "default";
          changes["set-styles"]["--button-bg"] = "var(--mantine-color-default)";
          changes["set-styles"]["--button-color"] = "var(--mantine-color-default-color)";
          changes["set-styles"]["--button-hover"] = "var(--mantine-color-default-hover)";
          changes["set-styles"]["--button-bd"] = "calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-default-border)";
        }

        return {
          cssStates: changes
        };
      }
    },*/
    

    /*
    ---------------------------------------------------------------------------
      SPLIT BUTTON
    ---------------------------------------------------------------------------
    */
    splitbutton: {},

    "splitbutton/button": "atom",

    "splitbutton/arrow": {},

    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */

    groupbox: {},

    "groupbox/legend": "atom",

    "groupbox/frame": {},

    "check-groupbox": "groupbox",

    "check-groupbox/legend": "checkbox",

    "radio-groupbox": "groupbox",

    "radio-groupbox/legend": "radiobutton",

    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree-folder/open": "image",

    "tree-folder": {},

    "tree-folder/icon": "image",

    "tree-folder/label": {},

    "tree-file": "tree-folder",

    tree: "list",

    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    window: {},

    "window-resize-frame": "resize-frame",

    "window/pane": {},

    "window/captionbar": {},

    "window/icon": {},

    "window/title": {},

    "window/minimize-button": "button",

    "window/restore-button": "button",

    "window/maximize-button": "button",

    "window/close-button": "button",

    "window/statusbar": {},

    "window/statusbar-text": "label",

    /*
    ---------------------------------------------------------------------------
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    datechooser: {},

    "datechooser/navigation-bar": {},

    "datechooser/last-year-button-tooltip": "tooltip",
    "datechooser/last-month-button-tooltip": "tooltip",
    "datechooser/next-year-button-tooltip": "tooltip",
    "datechooser/next-month-button-tooltip": "tooltip",

    "datechooser/last-year-button": "datechooser/button",
    "datechooser/last-month-button": "datechooser/button",
    "datechooser/next-year-button": "datechooser/button",
    "datechooser/next-month-button": "datechooser/button",
    "datechooser/button/icon": {},

    "datechooser/button": {},

    "datechooser/month-year-label": {},

    "datechooser/date-pane": {},

    "datechooser/weekday": {},

    "datechooser/day": {},

    "datechooser/week": {},

    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */
    progressbar: {},

    "progressbar/progress": {},

    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    toolbar: {},

    "toolbar/part": {},

    "toolbar/part/container": {},
    "toolbar/part/handle": {},

    "toolbar-separator": {},

    "toolbar-button": "atom",

    "toolbar-menubutton": "toolbar-button",

    "toolbar-menubutton/arrow": "image",
    "toolbar-splitbutton": {},
    "toolbar-splitbutton/button": "toolbar-button",

    "toolbar-splitbutton/arrow": "toolbar-button",

    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    tabview: {},

    "tabview/bar": "slidebar",

    "tabview/bar/button-forward": "button",

    "tabview/bar/button-backward": "button",

    "tabview/pane": {},

    "tabview-page": "widget",

    "tabview-page/button": "button",

    "tabview-page/button/label": "label",

    "tabview-page/button/icon": "image",
    "tabview-page/button/close-button": "atom",


    /*
    ---------------------------------------------------------------------------
      COLOR POPUP
    ---------------------------------------------------------------------------
    */

    colorpopup: "popup",

    "colorpopup/field": {},

    "colorpopup/selector-button": "button",
    "colorpopup/auto-button": "button",

    "colorpopup/preview-pane": "groupbox",

    "colorpopup/current-preview": {},

    "colorpopup/selected-preview": {},

    "colorpopup/colorselector-okbutton": "button",

    "colorpopup/colorselector-cancelbutton": "button",

    /*
    ---------------------------------------------------------------------------
      COLOR SELECTOR
    ---------------------------------------------------------------------------
    */

    colorselector: "widget",
    "colorselector/control-bar": "widget",
    "colorselector/visual-pane": "groupbox",
    "colorselector/control-pane": "widget",
    "colorselector/preset-grid": "widget",

    "colorselector/colorbucket": {},

    "colorselector/preset-field-set": "groupbox",
    "colorselector/input-field-set": "groupbox",

    "colorselector/preview-field-set": "groupbox",

    "colorselector/hex-field-composite": "widget",
    "colorselector/hex-field": "textfield",

    "colorselector/rgb-spinner-composite": "widget",
    "colorselector/rgb-spinner-red": "spinner",
    "colorselector/rgb-spinner-green": "spinner",
    "colorselector/rgb-spinner-blue": "spinner",

    "colorselector/hsb-spinner-composite": "widget",
    "colorselector/hsb-spinner-hue": "spinner",
    "colorselector/hsb-spinner-saturation": "spinner",
    "colorselector/hsb-spinner-brightness": "spinner",

    "colorselector/preview-content-old": {},

    "colorselector/preview-content-new": {},

    "colorselector/hue-saturation-field": {},

    "colorselector/brightness-field": {},

    "colorselector/hue-saturation-pane": "widget",
    "colorselector/hue-saturation-handle": "widget",
    "colorselector/brightness-pane": "widget",
    "colorselector/brightness-handle": "widget",

    /*
    ---------------------------------------------------------------------------
      APPLICATION
    ---------------------------------------------------------------------------
    */

    "app-header" : {},

    "app-header-label": {},

    "app-splitpane": "splitpane",

    /*
      --------------------
      VIRTUAL SELECTBOX 
      --------------------
    */

    "list-search-highlight": {}
  }
});
