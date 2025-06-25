/**
 * Base widget
 */
qx.Class.define("ville.ui.core.BaseWidget", {
    extend: qx.ui.core.Widget,

    include: ville.ui.core.MWidget,

    construct(component) {
        if (component) {
            this.__componenttag = component;
        }
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setSelectable(null);
        this.setExcludeInlineStyles(["position"]);
    },

    members: {

        __componenttag: "div",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        }
    }
  });
