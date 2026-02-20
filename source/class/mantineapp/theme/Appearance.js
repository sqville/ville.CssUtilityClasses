/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */
/**
 * @asset(mantine/core/styles/Modal.css)
 */
qx.Theme.define("mantineapp.theme.Appearance",
{
  extend : qx.theme.indigo.Appearance,

  appearances :
  {
    // overridden
    root: {},

    // overridden
    popup: {},
    /*popup: {
      style(states) {
        return {
          decorator: "popup"
        };
      }
    },*/

    // overridden
    label: {},

    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    // overridden
    menu: {
      style(states) {
        var result = {
          spacingX: 6,
          spacingY: 1,
          iconColumnWidth: 16,
          arrowColumnWidth: 4,
          placementModeY:
            states.submenu || states.contextmenu ? "best-fit" : "keep-align"
        };

        if (states.submenu) {
          result.position = "right-top";
          result.offset = [-2, -3];
        }

        if (states.contextmenu) {
          result.offset = 4;
        }

        return result;
      }
    },

    "menu-button": "atom",
    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */
   // overridden
    "button-frame": {
      alias: "atom",

      style(states) {
        var decorator = "button-box";

        /*if (!states.disabled) {
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

        return {
          decorator: decorator,
          padding: [3, 8],
          cursor: states.disabled ? undefined : "pointer",
          minWidth: 5,
          minHeight: 5
        };*/
        return {
          minWidth: 5,
          minHeight: 5
        };
      }
    },
    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    window: {
      style() {
        qx.bom.Stylesheet.includeFile(qx.util.ResourceManager.getInstance().toUri("mantine/core/styles/Modal.css"));
        return {
          cssUtilityClass: "m_9df02822 mantine-Modal-root"
        };
      }
    },

    "window-resize-frame": "resize-frame",

    "window/pane": {
      style() {
        return {
          excludeBoundsFromDom: true,
          clearAllInlineStyles: true,
          cssUtilityClass: "m_5df29311 mantine-Modal-body"
        };
      }
    },

    "window/captionbar": {
      style() {
        return {
          excludeBoundsFromDom: true,
          clearAllInlineStyles: true,
          cssUtilityClass: "m_b5489c3c m_d0e2b9cd mantine-Modal-header"
        };
      }
    },

    "window/icon": {
      style(states) {
        return {
          marginRight: 4
        };
      }
    },

    "window/title": {
      style(states) {
        return {
          cursor: "default",
          marginRight: 20,
          alignY: "middle"
        };
      }
    },

    "window/minimize-button": {
      alias: "button",

      style(states) {
        return {
          icon: qx.theme.simple.Image.URLS["window-minimize"],
          padding: [1, 2],
          cursor: states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/restore-button": {
      alias: "button",

      style(states) {
        return {
          icon: qx.theme.simple.Image.URLS["window-restore"],
          padding: [1, 2],
          cursor: states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/maximize-button": {
      alias: "button",

      style(states) {
        return {
          icon: qx.theme.simple.Image.URLS["window-maximize"],
          padding: [1, 2],
          cursor: states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/close-button": {
      alias: "button",

      style(states) {
        return {
          marginLeft: 2,
          icon: qx.theme.simple.Image.URLS["window-close"],
          padding: [1, 2],
          cursor: states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/statusbar": {
      style(states) {
        return {
          padding: [2, 6]
        };
      }
    },

    "window/statusbar-text": "label"
  }
});