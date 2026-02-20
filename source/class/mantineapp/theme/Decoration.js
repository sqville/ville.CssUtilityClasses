/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

qx.Theme.define("mantineapp.theme.Decoration",
{
  extend : qx.theme.indigo.Decoration,

  decorations :
  {
    // overridden
    "menu-popup" : 
    {
      include : "popup",
      style :
      {
        transitionProperty: ['display', 'top', 'left'],
        transitionDuration: "350ms",
        transitionTimingFunction : "ease"
      }
    }
  }
});