/**
 * Used as a base component or as a replacement for HTML elements
 * 
 */
qx.Class.define("ville.ui.core.Box", {
    extend: qx.ui.core.Widget,

    include: [qx.ui.core.MChildrenHandling, ville.ui.core.MWidget],

    construct(component) {
        if (component) {
            this.__componenttag = component;
        }
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setExcludeInlineStyles(["position"]);
        this.setSelectable(null);
    },

    members: {

        __componenttag: "div",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        }
    }
  });
