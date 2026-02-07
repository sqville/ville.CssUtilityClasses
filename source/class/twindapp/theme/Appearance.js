/* ************************************************************************

   Copyright: 2024 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

qx.Theme.define("twindapp.theme.Appearance",
{
  extend : qx.theme.indigo.Appearance,

  appearances :
  {

    // New - include for repeating items
    excludeclear: {
      style() {
        return {
          excludeBoundsFromDom: true,
          clearAllInlineStyles: true
        };
      }
    },
    // Overridden
    root: {
      include: "excludeclear",
      style() {
        return {
          cssUtilityClass: "md:flex md:flex-col"
        };
      }
    },

    // New entry - App specific
    appdoclayout: {
      include: "excludeclear",
      style() {
        return {
          cssUtilityClass: "md:flex md:flex-col md:h-screen"
        };
      }
    },

    // New entry - App specific
    appheader: {
      include: "excludeclear",
      style() {
        return {
          cssUtilityClass: "md:flex md:shrink-0"
        };
      }
    },

    "exp-tabview": {
      include: "excludeclear",
      alias: "tabview",
      style() {
        return {
          cssUtilityClass: "md:flex md:grow md:overflow-hidden"
        };
      }
    },

    "exp-tabview/bar": {
      include: "excludeclear",
      style() {
        return {
          cssUtilityClass: "hidden shrink-0 p-12 w-56 bg-indigo-800 overflow-y-auto md:block"
        };
      }
    },

    "exp-tabview/bar/scrollpane": "excludeclear",

    "exp-tabview/bar/content": "excludeclear",

    "exp-tabview/pane": {
      include: "excludeclear",
      style() {
        return {
          cssUtilityClass: "md:flex md:grow md:overflow-hidden",
          removeCssClasses: ["qx-main"],
          backgroundColor: null
        };
      }
    },

    "exp-tabview-page": {
      include: "excludeclear",
      style() {
        return {
          cssUtilityClass: "px-4 py-8 md:flex-1 md:p-12 md:overflow-y-auto"
        };
      }
    },

    "exp-tabview-page/button": {
      include: "excludeclear",
      style(states) {
        return {
          cssUtilityClass: states.checked ? "group flex items-center py-3 mb-4 text-white" : "group text-indigo-300 flex items-center py-3 mb-4"
        };
      }
    },

    "exp-tabview-page/button/label": {
      include: "excludeclear",
      alias: "label",
      style(states) {
        return {
          cssUtilityClass: states.checked ? "text-white" : "text-indigo-300 group-hover:text-white"
        };
      }
    },
    
    "exp-tabview-page/button/icon": "image",

    "ping-exp-menubutton": {
      style() {
        return {
          icon: qx.theme.simple.Image.URLS["arrow-down"],
          iconPosition: "right"
        };
      }
    },
    
    // TextField
    "ping-textfield" : {},

    "ping-exp-textfield" : {
      style() {
        return {
          cssUtilityClass : "form-input",
          removeCssClasses : ["qx-abstract-field", "qx-placeholder-color"],
          excludeBoundsFromDom : true,
          excludeInlineStyles : ["position", "zIndex", "touch-action", "boxSizing"]
        };
      }
    },

    "ping-button" : {},

    "ping-exp-button" : {
      style(states) {
        return {
          cursor : null,
          excludeBoundsFromDom : true,
          clearAllInlineStyles: true
        };
      }
    },

    "ping-exp-button/label" : {
      style(states) {
        return {
          excludeBoundsFromDom : true,
          clearAllInlineStyles: true
        };
      }
    },

    "ping-exp-closebutton" : "ping-exp-button",

    "ping-exp-closebutton/label" : {
      include: "ping-exp-button/label",
      style(states) {
        return {
          cssUtilityClass : "group-hover:text-white"
        };
      }
    },

    "ping-label": {
      include: "label",

      style(states) {
        return {
          textColor: states.disabled ? "green" : "red"
        };
      }
    },

    "ping-exp-selectbox": {
      style() {
        return {
          cssUtilityClass : "form-select",
          excludeBoundsFromDom : true,
          clearAllInlineStyles : true
        };
      }
    },

    "ping-exp-selectbox/atom": {
      style() {
        return {
          excludeBoundsFromDom : true,
          clearAllInlineStyles : true
        };
      }
    },

    "ping-exp-selectbox/atom/label": {
      alias: "atom/label",
      style() {
        return {
          excludeBoundsFromDom : true,
          clearAllInlineStyles : true
        };
      }
    },

    "ping-exp-selectbox/arrow": {
      include: "image",

      style(states) {
        return {
          source: ""
        };
      }
    },

    "ping-exp-checkbox": {
      style() {
        return {
          icon: ""
        };
      }
    },

    "ping-exp-checkbox/icon": {},

    "selectbox-arrow-button": {}
  }
});