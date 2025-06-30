/**
 * Base widget
 */
qx.Class.define("ville.ui.core.BaseWidget", {
    extend: qx.ui.core.Widget,

    include: ville.ui.core.MWidget,

    construct(component) {
        if (component) {
            this.__componentmap = component;
        }
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setSelectable(null);
        this.setExcludeInlineStyles(["position"]);
    },

    members: {

        __componentmap: {"basetag" : "div", "type" : "na"},

        // overridden
        _createContentElement() {
            var newelem;
            if (this.__componentmap.basetag = "input") {
                newelem = new qx.html.Input(this.__componentmap.type);
            } else {
                newelem = new qx.html.Element(this.__componentmap.basetag);
            }
            return newelem; 
        }
    }
  });
