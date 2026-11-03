/* ************************************************************************

   Copyright: 2025 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

qx.Theme.define("carbonapp.theme.Appearance",
{
  extend : ville.cssuc.theme.blankslate.Appearance,

  appearances :
  {
    "tabview-page/button": {
      style(states) {
        return {
          cssUtilityClass: states.checked 
            ? "cds--tabs__nav-item cds--tabs__nav-link cds--tabs__nav-item--selected" 
            : "cds--tabs__nav-item cds--tabs__nav-link" 
        };
      }
    },

    "tabview-page/button/label": {
      alias: "label",

      style(states) {
        return {
          cssUtilityClass: states.checked ? "cds--tabs__nav-item-label" : "cds--tabs__nav-item-label"
        };
      }
    }
  }
});