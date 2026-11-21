/**
 * Mode 3 root virtual DOM element (`ville.html.Root`) wrapping an existing
 * live root `HTMLElement` (e.g., `<div id="ville-app">`).
 *
 * Replaces `qx.html.Root` with zero dependencies on `qx.html.*`.
 */
qx.Class.define("ville.html.Root", {
  extend: ville.html.Element,

  /**
   * Creates a new root virtual DOM element bound to `elem`.
   *
   * @param {HTMLElement} [elem] Live root DOM element to wrap.
   */
  construct(elem) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super("div");
    this.setRoot(true);

    if (elem) {
      this.useElement(elem);
    }
  }
});
