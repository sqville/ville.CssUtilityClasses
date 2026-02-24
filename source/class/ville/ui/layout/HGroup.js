/**
 * Horizontal flex layout
 * @external(mantine/core/styles/Group.css)
 */
qx.Class.define("ville.ui.layout.HGroup", {
    
    extend: ville.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct(justify) {

        super();

        if (justify != null) {
            this.setJustify(justify);
        } else {
            this.initJustify();
        }

        this._setLayout(new qx.ui.layout.HBox());

        this.setCssUtilityClass("m_4081bf90 mantine-Group-root");

    },

    properties: {

        justify: {
            init: "flex-start",
            check: ["center", "flex-start", "flex-end", "space-between", "space-around"],
            apply: "_applyJustify",
            nullable: true,
            themeable: true,
            event: "changeJustify"
        },

        gap: {
            init: "md",
            check: ["xs", "sm", "md", "lg", "xl"],
            apply: "_applyGap",
            themeable: true,
            nullable: true,
            event: "changeGap"
        },
        
        grow: {
            init: false,
            check: "Boolean",
            apply: "_applyGrow",
            nullable: true,
            themeable: true,
            event: "changeGrow"
        }

    },

    members: {

        _applyJustify(value, old) {
            if (value) {
                this.getContentElement().setStyle("--group-justify", value);
            } else if (old && value == null) {
                this.getContentElement().removeStyle("--group-justify");
            }
        },

        _applyGap(value, old) {
            if (value) {
                this.setStyle("--group-gap", `var(--mantine-spacing-${value})`);
            } else if (old && value == null) {
                this.removeStyle("--group-gap");
            }
        },
        
        _applyGrow(value, old) {
            var elem = this.getContentElement();
            if (value) {
                elem.setAttribute("data-grow", "true");
                if (this.hasChildren()) {
                    const childcount = this.getChildren().length;
                    const percent = 100/childcount;
                    const gap = this.getGap();
                    const newstr = `calc(${percent}% - (var(--mantine-spacing-${gap}) - var(--mantine-spacing-${gap}) / ${childcount}))`;
                    elem.setStyle("--group-child-width", newstr);
                }
                
            } else {
                elem.removeAttribute("data-grow");
                elem.removeStyles("--group-child-width");
            }
        }

    }
  });
