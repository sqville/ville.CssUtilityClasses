/**
 * Lightweight, non-DOM tree leaf file descriptor (`ville.ui.tree.TreeFile` — `STRAT-WIDGET-08`, `STRAT-CORE-09`).
 *
 * Extends `{ville.ui.tree.TreeFolder}` as a leaf node (`isFolder() === false`, default icon `"FILE"`).
 */
qx.Class.define("ville.ui.tree.TreeFile", {
  extend: ville.ui.tree.TreeFolder,

  /**
   * @param {string} [label=""] File display label.
   * @param {string|null} [icon="FILE"] Optional icon glyph key.
   * @param {*} [model=null] Optional attached data model.
   */
  construct(label = "", icon = "FILE", model = null) {
    // @ts-ignore
    super(label, icon, model);
  },

  properties: {
    icon: {
      refine: true,
      init: "FILE"
    }
  },

  members: {
    /**
     * @override
     * @returns {boolean}
     */
    isFolder() {
      return false;
    }
  }
});
