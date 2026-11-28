/**
 * Extension of `{ville.ui.tabview.Page}` that enables native vertical overflow scrolling
 * on the tab panel content.
 */
qx.Class.define("ville.ui.tabview.ScrollingPage", {
  extend: ville.ui.tabview.Page,

  construct(label, icon) {
    super(label, icon);
    this.setStyles({
      overflowY: "auto",
      overflowX: "hidden"
    });
  }
});
