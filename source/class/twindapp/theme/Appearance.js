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

    root: {},

    "selectbox-arrow-button": {},

    "exp-tabview-page": "widget",

    "tabview/pane": {},

    "exp-tabview-page/button": {
      style(states) {
        return {
          cssUtilityClass: states.checked ? "group flex items-center py-3 mb-4 text-white" : "group text-indigo-300 flex items-center py-3 mb-4", 
          excludeBoundsFromDom: true,
          clearAllInlineStyles: true
        };
      }
    },

    "exp-tabview-page/button/label": {
      alias: "label",

      style(states) {
        return {
          excludeBoundsFromDom: true,
          clearAllInlineStyles: true,
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

    "ping-exp-checkbox/icon": {}
  }
});