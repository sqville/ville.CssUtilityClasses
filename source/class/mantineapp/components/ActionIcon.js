qx.Class.define("mantineapp.components.ActionIcon", {
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct(icon) {
        super();

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        
        if (icon) {
            this.setIcon(icon);
        }
    },

    properties: {
        icon: {
            apply: "_applyIcon",
            nullable: true,
            check: "String"
        }
    },

    members: {
        // property apply
        _applyIcon(value) {
            if (value) {
                var iconsvg = mantineapp.components.Icons[value];
                this.getContentElement().setAttribute("html", iconsvg);
            }
        },

        // overridden
        _createContentElement() {
            return new qx.html.Element("span");
        }
    }
  });
