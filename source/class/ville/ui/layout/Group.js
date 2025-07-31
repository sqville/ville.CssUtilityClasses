/**
 * Horizontal flex layout
 * @external(mantine/core/styles/Group.css)
 */
qx.Class.define("ville.ui.layout.Group", {
    extend: ville.ui.layout.Container,

    construct() {
        //align, justify, gap, wrap, grow
        super();

        this.setCssUtilityClass("m_4081bf90 mantine-Group-root");

        /*if (align) {
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

        if (wrap) {
            this.setWrap(wrap);
        } else {
            this.initWrap();
        }

        if (grow) {
            this.setGrow(grow);
        }*/
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
        },

        wrap: {
            init: "wrap",
            check: ["wrap", "nowrap", "wrap-reverse"],
            apply: "_applyWrap",
            nullable: false,
            themeable: true,
            event: "changeWrap"
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

        _applyAlign(value, old) {
            if (value) {
                this.getContentElement().setStyle("--group-align", value);
            } else if (old && value == null) {
                this.getContentElement().removeStyle("--group-align");
            }
        },

        _applyJustify(value, old) {
            if (value) {
                this.getContentElement().setStyle("--group-justify", value);
            } else if (old && value == null) {
                this.getContentElement().removeStyle("--group-justify");
            }
        },

        _applyWrap(value, old) {
            if (value) {
                this.getContentElement().setStyle("--group-wrap", value);
            }
        },

        _applyGap(value, old) {
            if (value) {
                this.getContentElement().setStyle("--group-gap", `var(--mantine-spacing-${value})`);
            } else if (old && value == null) {
                this.getContentElement().removeStyle("--group-gap");
            }
        },

        _applyGrow(value, old) {
            var elem = this.getContentElement();
            if (value) {
                elem.setAttribute("data-grow", "true");
                if (this.hasChildren()) {
                    var childcount = this.getChildren().length;
                    var percent = 100/childcount;
                    var gap = this.getGap();
                    var newstr = `calc(${percent}% - (var(--mantine-spacing-${gap}) - var(--mantine-spacing-${gap}) / ${childcount}))`;
                    elem.setStyle("--group-child-width", newstr);
                }
                
            } else {
                elem.removeAttribute("data-grow");
                elem.removeStyles("--group-child-width");
            }
        }
    }
  });
