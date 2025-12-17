/**
 * default node is <p>
 * @external(mantine/core/styles/Title.css)
 */
qx.Class.define("ville.ui.typography.Title", {
    
    extend: qx.ui.core.Widget,

    include: [qx.ui.core.MChildrenHandling, ville.ui.core.MWidget],

    construct(order, text) {
        
        if (order >= 1 && order <= 6) {
            this.__componenttag = "h" + order;
        }
        
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setExcludeInlineStyles(["position"]);
        this.setCssUtilityClass("m_8a5d1357 mantine-Title-root");
        
        if (text) 
            this.setText(text);
        
    },

    properties: {
        
        text: {
            apply: "_applyText",
            nullable: true,
            check: "String"
        }

    },

    members: {

        __componenttag : "div",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        },

        // property apply
        _applyText(value) {
            if (value) {
                this.getContentElement().setAttribute("html", value);
            }
        }

    }
  });
