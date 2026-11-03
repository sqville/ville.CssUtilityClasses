qx.Class.define("carbonapp.components.Link", {
    extend: qx.ui.form.ToggleButton,

    construct(label, href) {

        super();

        if (label != null) {
            this.setLabel(label);
        }

        if (href) {
            this.setHref(href);
        } else {
            this.initHref();
        }
    },

    properties: {
        href: {
            apply: "_applyHref",
            init: ".",
            nullable: false,
            check: "String"
        }
    },

    members: {
        // property apply
        _applyHref(value) {
            if (value) {
                this.getContentElement().setAttribute("href", value);
                this.addListener("click", (e) => {e.preventDefault()});
            }
        },

        // overridden
        _applyLabel(value, old) {
            if (value) {
                this.getContentElement().setAttribute("html", value);
            }
        },

        // overridden
        _createContentElement() {
            return new qx.html.Element("a");
        }
    }
  });
