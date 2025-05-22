qx.Class.define("mantineapp.components.ActionIcon", {
    extend: qx.ui.form.ToggleButton,

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
            check: "String",
            themeable: true
        }
    },

    members: {
        // property apply
        _applyIcon(value) {
            if (value) {
                this.getContentElement().setAttribute("html", value);
            }
        },

        // overridden
        _createContentElement() {
            return new qx.html.Element("button");
        }
    }
  });
