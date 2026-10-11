/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

qx.Theme.define("villeui.theme.Font",
{
  extend : qx.theme.indigo.Font,

  fonts :
  {
    default :
    {
      family : ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji"],
      size : 14,
      weight : "400",
      lineHeight : 1.55
    },

    bold :
    {
      include : "default",
      weight : "700"
    },

    monospace :
    {
      family : ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      color : "text",
      size : 14,
      weight : "400"
    },

    button : 
    {
      include : "default",
      weight : "700"
    }
    
  }
});