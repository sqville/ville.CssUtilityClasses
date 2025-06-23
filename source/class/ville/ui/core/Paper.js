/**
 * This is the most basic ui component
 * @external(mantine/core/styles/Paper.css)
 */
qx.Class.define("ville.ui.core.Paper", {
    extend: qx.ui.core.Widget,

    include: [qx.ui.core.MChildrenHandling, ville.ui.core.MWidget],

    construct(component) {
        if (component) {
            this.__componenttag = component;
        }
        
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setSelectable(null);
        this.setExcludeInlineStyles(["position"]);
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

        __componenttag: "div",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        },

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
        }
    }
  });
