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
  extend : ville.cssuc.theme.blankslate.Appearance,

  appearances :
  {
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