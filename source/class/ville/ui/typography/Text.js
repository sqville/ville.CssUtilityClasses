/**
 * default node is <p>
 * @external(mantine/core/styles/Text.css)
 */
qx.Class.define("ville.ui.typography.Text", {
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct(text) {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_b6d8b162 mantine-Text-root");
        
        if (text) {
            this.setParagraphText(text);
        }
    },

    properties: {
        paragraphText: {
            apply: "_applyParagraphText",
            nullable: true,
            check: "String"
        }
    },

    members: {
        // property apply
        _applyParagraphText(value) {
            if (value) {
                this.getContentElement().setAttribute("html", value);
            }
        },

        // overridden
        _createContentElement() {
            return new qx.html.Element("p");
        }
    }
  });
