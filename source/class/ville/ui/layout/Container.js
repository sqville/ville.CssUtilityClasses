/**
 * Base Container
 */
qx.Class.define("ville.ui.layout.Container", {
    extend: qx.ui.core.Widget,

    include: [qx.ui.core.MChildrenHandling, ville.ui.core.MWidget],

    construct() {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setSelectable(null);
        this.setExcludeInlineStyles(["position"]);

    },

    members: {

        // overridden
        _createContentElement() {
            return new qx.html.Element("div");
        }

    }
  });
