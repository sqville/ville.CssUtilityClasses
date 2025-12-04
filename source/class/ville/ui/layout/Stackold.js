/**
 * Vertical flex layout
 * @external(mantine/core/styles/Stack.css)
 */
qx.Class.define("ville.ui.layout.Stackold", {
    extend: ville.ui.layout.Container,

    construct(align, justify, gap) {
        super();

        this.setCssUtilityClass("m_6d731127 mantine-Stack-root");

        if (align) {
            this.setAlign(align);
        } else {
            this.initAlign();
        }

        if (justify) {
            this.setJustify(justify);
        } else {
            this.initJustify();
        }

        if (gap) {
            this.setGap(gap);
        } else {
            this.initGap();
        }

    },

    properties: {
        
        align: {
            init: "stretch",
            check: ["stretch", "center", "flex-start", "flex-end"],
            apply: "_applyAlign",
            themeable: true,
            nullable: true,
            event: "changeAlgin"
        },

        gap: {
            init: "md",
            check: ["xs", "sm", "md", "lg", "xl"],
            apply: "_applyGap",
            themeable: true,
            nullable: true,
            event: "changeGap"
        },

        justify: {
            init: "flex-start",
            check: ["center", "flex-start", "flex-end", "space-between", "space-around"],
            apply: "_applyJustify",
            nullable: true,
            themeable: true,
            event: "changeJustify"
        }
    },

    members: {

        _applyAlign(value, old) {
            if (value) {
                this.getContentElement().setStyle("--stack-align", value);
            } else if (old && value == null) {
                this.getContentElement().removeStyle("--stack-align");
            }
        },

        _applyJustify(value, old) {
            if (value) {
                this.getContentElement().setStyle("--stack-justify", value);
            } else if (old && value == null) {
                this.getContentElement().removeStyle("--stack-justify");
            }
        },

        _applyGap(value, old) {
            if (value) {
                this.getContentElement().setStyle("--stack-gap", `var(--mantine-spacing-${value})`);
            } else if (old && value == null) {
                this.getContentElement().removeStyle("--stack-gap");
            }
        }
    }
  });
