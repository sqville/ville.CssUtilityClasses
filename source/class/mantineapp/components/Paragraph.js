qx.Class.define("mantineapp.components.Paragraph", {
    extend: qx.ui.core.Widget,

    construct(text) {
        super();

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        
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
