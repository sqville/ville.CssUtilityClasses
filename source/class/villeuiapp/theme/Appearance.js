/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */
qx.Theme.define("villeuiapp.theme.Appearance",
{
  extend : ville.cssuc.theme.mantine.Appearance,

  appearances :
  {
    appshell: {
      style() {
        return {
          cssUtilityClass: "m_89ab340 mantine-AppShell-root ville-mantineapp-Application",
          cssStates: {
            "set-attributes": {
              "data-mode": "fixed"
            }
          }
        };
      }
    },

    "appshell-header": {
      style() {
        return {
          cssUtilityClass: "m_3b16f56b mantine-AppShell-header right-scroll-bar-position",
          cssStates: {
            "set-attributes": {
              "data-with-border": "true"
            },
            "set-styles": {
              "--app-shell-header-z-index": "100"
            }
          }
        };
      }
    },

    "appshell-header-inner": {
      include: "hgroup",
      style() {
        return {
          cssStates: {
            "set-styles": {
              "--container-size": "var(--container-size-xl)",
              "padding-inline": "var(--mantine-spacing-md)",
              "height": "100%"
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
              "font-weight": "bold",
              "font-style": "normal",
              "color": "inherit",
              "font-size": "20px"
            }
          }
        };
      }
    },

    "appshell-main": {
      style() {
        return {
          cssUtilityClass: "m_8983817 mantine-AppShell-main"
        };
      }
    }
  }
});
