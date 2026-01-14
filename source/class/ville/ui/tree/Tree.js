 /**
 * @external(mantine/core/styles/Tree.css)
 */
qx.Class.define("ville.ui.tree.Tree", {
  extend: qx.ui.tree.Tree,

  include: ville.ui.core.MWidget,

  construct() {
    super();

    this.__content.setExcludeBoundsFromDom(true);
    this.__content.setClearAllInlineStyles(true);
  },

  members: {

    // overridden
    _createChildControlImpl(id, hash) {
      var control;

      switch (id) {
        case "pane":
          control = new ville.ui.layout.Container();
          this._add(control);
          break;

      }

      return control || super._createChildControlImpl(id);
    }

  }
});