/**
 * Path B Menu Separator (`STRAT-WIDGET-03`).
 *
 * Lightweight semantic `<hr role="separator">` menu divider extending
 * `ville.ui.core.Divider`.
 */
qx.Class.define("ville.ui.menu.Separator", {
  extend: ville.ui.core.Divider,

  properties: {
    appearance: {
      refine: true,
      init: "menu-separator"
    }
  }
});
