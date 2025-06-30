qx.Class.define("ville.ui.experimental.Widget", {
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct() {
        super();

        this._setLayout(new qx.ui.layout.Basic());

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
    },

    members: {

        // overridden
        _createContentElement() {
            return new qx.html.Element("VilleTag");
        }
    }
  });
