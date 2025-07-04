/**
 * 
 * @external(mantine/core/styles/Anchor.css)
 */
qx.Class.define("ville.ui.form.Anchor", {
    extend: qx.ui.form.Button,

    include: ville.ui.core.MWidget,

    construct(label, component) {
        if (component) {
            this.__componenttag = component;
        }
        
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setExcludeInlineStyles(["position"]);
        this.setCssUtilityClass("m_849cf0da m_b6d8b162 mantine-Text-root mantine-Anchor-root");
        this.setSelectable(null);
        
        if (component)
            if (component = "button")
                this.getContentElement().setAttribute('type', 'button');

        if (label) {
            this.setLabel(label);
        }

        this.initUnderline();
     
    },

    properties: {
        
        underline: {
            init: "hover",
            check: ["always", "hover", "not-hover", "never"],
            apply: "_applyUnderline",
            themeable: true,
            event: "changeUnderline"
        },

        size: {
            init: "md",
            check: ["xs", "sm", "md", "lg", "xl"],
            apply: "_applySize",
            nullable: true,
            themeable: true,
            event: "changeSize"
        },
        
        href: {
            apply: "_applyHref",
            nullable: true,
            check: "String"
        },

        target: {
            apply: "_applyTarget",
            nullable: true,
            check: "String"
        }
    },

    members: {

        __componenttag : "a",
        
        __clickpreventListnerId : null,

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        },

        // overridden
        _applyLabel(value, old) {
            if (value) {
                this.getContentElement().setAttribute("html", value);
            }
        },

         _applySize(value, old) {
            if (value) {
                this.getContentElement().setAttribute("data-size", value);
                this.getContentElement().setStyles({
                    "--text-lh" : `var(--input-height-${value})`, 
                    "--text-fz" : `var(--mantine-font-size-${value})`
                });
            }
        },

        _applyUnderline(value, old) {
            if (value) {
                this.getContentElement().setAttribute("data-underline", value);
            }
        },

        // property apply
        _applyHref(value) {
            if (value) {
                this.getContentElement().setAttribute("href", value);
                this.__clickpreventListnerId = this.addListener("click", (e) => {e.preventDefault()});
            } else {
                this.getContentElement().removeAttribute("href");
                if (this.__clickpreventListnerId != null)
                    this.removeListener(this.__clickpreventListnerId);
            }
        },

        // property apply
        _applyTarget(value) {
            if (value) {
                this.getContentElement().setAttribute("target", value);
            } else {
                this.getContentElement().removeAttribute("target");
            }
        }
    }
  });
