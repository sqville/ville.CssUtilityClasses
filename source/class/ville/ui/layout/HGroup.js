/**
 * Horizontal flex layout
 */
qx.Class.define("ville.ui.layout.HGroup", {
    
    extend: ville.ui.core.Box,

    construct(justify, component) {

        super(component);

        if (justify != null) {
            this.setJustify(justify);
        } else {
            this.initJustify();
        }

    },

    properties: {

        // overridden
        appearance: {
            refine: true,
            init: "hgroup"
        },

        justify: {
            init: "flex-start",
            check: ["center", "flex-start", "flex-end", "space-between", "space-around"],
            apply: "_applyJustify",
            nullable: true,
            themeable: true
        },

        gap: {
            init: "md",
            check: ["xs", "sm", "md", "lg", "xl"],
            apply: "_applyGap",
            themeable: true,
            nullable: true
        },
        
        grow: {
            init: false,
            check: "Boolean",
            apply: "_applyGrow",
            nullable: true,
            themeable: true
        }

    },

    members: {

        _applyJustify(value, old) {
            if (value) {
                this.setStyle("--group-justify", value);
            } else if (old && value == null) {
                this.removeStyle("--group-justify");
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
            if (value) {
                this.setAttribute("data-grow", "true");
                if (this.hasChildren()) {
                    const childcount = this.getChildren().length;
                    const percent = 100/childcount;
                    const gap = this.getGap();
                    const newstr = `calc(${percent}% - (var(--mantine-spacing-${gap}) - var(--mantine-spacing-${gap}) / ${childcount}))`;
                    this.setStyle("--group-child-width", newstr);
                }
                
            } else {
                this.removeAttribute("data-grow");
                this.removeStyles("--group-child-width");
            }
        }

    }
  });
