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

    divider: {
      style() {
        return {
          cssUtilityClass: `m_3eebeb36${qx.core.Environment.get("qx.debug") ? ' mantine-Divider-root' : ''}`
        };
      }
    },

    "divider/label": {
      style() {
        return {
          cssUtilityClass: `m_9e365f20${qx.core.Environment.get("qx.debug") ? ' mantine-Divider-label' : ''}`
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

    menu: {
      style() {
        return {
          cssUtilityClass: `m_38a85659 mantine-Menu-dropdown m_dc9b7c9f${qx.core.Environment.get("ville.cssLayout") ? ' ville-popover' : ''}`
        };
      }
    },

    "menu/slidebar": "menu-slidebar",

    "menu-slidebar": "widget",

    "menu-slidebar-button": {},

    "menu-slidebar/button-backward": "menu-slidebar-button",

    "menu-slidebar/button-forward": "menu-slidebar-button",

    "menu-separator": {},

    "menu-button": {
      style() {
        return {
          cssUtilityClass: "mantine-focus-auto m_99ac2aa1 mantine-Menu-item m_87cf2631 mantine-UnstyledButton-root"
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
      CHECK BOX
    ---------------------------------------------------------------------------
    */
    checkbox: "atom",

    "checkbox/icon": {},

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

    "button-frame": {
      alias: "atom",

      style() {

        /* Appearance driven Styles
        var btnstyles = {
          "--button-height" : "var(--button-height-sm)",
          "--button-padding-x" : "var(--button-padding-x-sm)",
          "--button-fz": "var(--mantine-font-size-sm)",
          "--button-radius": "var(--mantine-radius-md)",
          "--button-bg": "var(--mantine-color-blue-filled)",
          "--button-hover": "var(--mantine-color-blue-filled-hover)",
          "--button-color": "var(--mantine-color-white)",
          "--button-bd": "calc(0.0625rem * var(--mantine-scale)) solid transparent"
        }*/

        // m_80f1301b mantine-Button-inner

        return {
          //cssInlineStyles: btnstyles,
          cssUtilityClass: "mantine-focus-auto m_77c9d27d mantine-Button-root m_87cf2631 mantine-UnstyledButton-root"
        };
      }
    },

    "button-frame/label": {
      alias: "atom/label",

      style() {
        return {
          cssUtilityClass: "m_811560b9 mantine-Button-label"
        };
      }
    },

    button: {
      include: "button-frame",

      style(states) {

        /* 
        Qooxdoo Button STATES
        disabled $\rightarrow$ data-disabled="true" and aria-disabled="true"
        pressed $\rightarrow$ data-active="true" (matches Mantine's active button state)
        hovered $\rightarrow$ :hover or data-hovered="true"
        focused $\rightarrow$ :focus-visible or data-focus-visible="true"

        Simple THEME logic
        if (!states.disabled) {
          if (states.hovered && !states.pressed && !states.checked) {
            decorator = "button-box-hovered";
          } else if (states.hovered && (states.pressed || states.checked)) {
            decorator = "button-box-pressed-hovered";
          } else if (states.pressed || states.checked) {
            decorator = "button-box-pressed";
          }
        }

        if (states.invalid && !states.disabled) {
          decorator += "-invalid";
        } else if (states.focused) {
          decorator += "-focused";
        }
        */

        var changes;

        if (states.disabled) {
          changes = {
            "set-attributes" : {"data-disabled" : true},
            "remove-classes" : ["mantine-active"]
          }
        } else {
          changes = {
            "remove-attributes" : ["data-disabled"],
            "set-classes" : ["mantine-active"]
          }
        }

        return {
          cssStates: changes
        };
      }
    },

    "toggle-button": "button",

    "hover-button": "button",

    menubutton: "button",
    

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
