/**
 * 
 * @external(mantine/core/styles/Anchor.css)
 */
qx.Class.define("ville.ui.form.Anchor", {
    extend: qx.ui.form.Button,

    construct(label, component, href, target) {
        if (component) {
            this.__componenttag = component;
        }
        
        super();

        this._setLayout(new qx.ui.layout.Basic());

        this.setExcludeBoundsFromDom(true);
        this.setExcludeInlineStyles(["position"]);
        this.setCssUtilityClass("m_849cf0da m_b6d8b162 mantine-Text-root mantine-Anchor-root");

        if (label) {
            this.setLabel(label);
        }

        if (href) {
            this.setHref(href);
        }

        if (target) {
            this.setTarget(target);
        }
     
    },

    properties: {
        
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
