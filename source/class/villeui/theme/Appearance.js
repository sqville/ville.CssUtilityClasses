/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

qx.Theme.define("villeui.theme.Appearance",
{
  extend : qx.theme.indigo.Appearance,

  appearances :
  {

    root: {
      style(states) {
        return {
          //backgroundColor: "background",
          //textColor: "text",
          font: "default"
        };
      }
    },

    label: {},
    
    "vui-button": {
      style(states) {
        return {
          padding: [6, 18],
          cursor: states.disabled ? undefined : "pointer",
          minWidth: 5,
          minHeight: 5,
          center: true
        };
      }
    },

    "vui-button/label": "label",

    "vui-button/icon": "icon",

    "vui-textfield": {
      style(states) {
        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = undefined;
        }

        var decorator;
        var padding;
        if (states.disabled) {
          decorator = "inset";
          padding = [2, 3];
        } else if (states.invalid) {
          decorator = "border-invalid";
          padding = [1, 2];
        } else if (states.focused) {
          decorator = "focused-inset";
          padding = [1, 2];
        } else {
          padding = [2, 3];
          decorator = "inset";
        }

        return {
          padding: [2, 3]
        };
      }
    }

  }
});