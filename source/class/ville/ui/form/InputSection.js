/**
 * 
 * 
 */
qx.Class.define("ville.ui.form.InputSection", {
    extend: qx.ui.core.Widget,

    include: [qx.ui.core.MChildrenHandling, ville.ui.core.MWidget],

    construct() {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setExcludeInlineStyles(["position"]);
        this.setSelectable(null);
    },

    members: {
        // overridden
        _createContentElement() {
            return new qx.html.Element("div");
        }
    }
  });
