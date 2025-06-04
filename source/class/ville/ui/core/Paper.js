/**
 * This is the most basic ui component
 * @external(mantine/core/styles/Paper.css)
 */
qx.Class.define("ville.ui.core.Paper", {
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct() {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        //this.setClearAllInlineStyles(true);
        this.setExcludeInlineStyles([
            "position", "overflowX", "overflowY", "touch-action", "-ms-touch-action", "zIndex", "boxSizing", "userSelect"
        ]);
        this.setCssUtilityClass("m_1b7284a3 mantine-Paper-root");
    },

    properties: {

        withBorder: {
            init: "false",
            check: "Boolean",
            apply: "_applyWithBorder",
            themeable: true,
            event: "changeWithBorder"
        },

        radius: {
            init: null,
            check: ["xs", "sm", "md", "lg", "xl"],
            apply: "_applyRadius",
            themeable: true,
            nullable: true,
            event: "changeRadius"
        },

        shadow: {
            init: null,
            check: ["xs", "sm", "md", "lg", "xl"],
            apply: "_applyShadow",
            themeable: true,
            nullable: true,
            event: "changeShadow"
        }
    },

    members: {
        // property apply
        _applyWithBorder(value, old) {
            if (value) {
                this.getContentElement().setAttribute("data-with-border", "true");
            } else {
                this.getContentElement().removeAttribute("data-with-border");
            }
        },

        // property apply --paper-radius:var(--mantine-radius-md);
        _applyRadius(value, old) {
            if (value) {
                this.getContentElement().setStyle("--paper-radius", `var(--mantine-radius-${value})`);
            } else {
                this.getContentElement().removeStyle("--paper-radius");
            }
        },

        // property apply
        _applyShadow(value, old) {
            if (value) {
                this.getContentElement().setStyle("--paper-shadow", `var(--mantine-shadow-${value})`);
            } else {
                this.getContentElement().removeStyle("--paper-shadow");
            }
        },

        addClass(value) {
            if (value) {
                this.getContentElement().addClass(value);
            }
        }
    }
  });
