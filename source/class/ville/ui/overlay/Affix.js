/**
 * Base Container
 * @external(mantine/core/styles/Affix.css)
 */
qx.Class.define("ville.ui.overlay.Affix", {
    
    extend: qx.ui.core.Widget,

    include: [qx.ui.core.MChildrenHandling, ville.ui.core.MWidget],

    construct(component) {
        
        if (component) {
            this.__componenttag = component;
        }
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setSelectable(null);
        this.setExcludeInlineStyles(["position"]);
        this.setCssUtilityClass("m_7f854edf mantine-Affix-root");

    },

    members: {

        __componenttag: "div",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        }

    }
  });
