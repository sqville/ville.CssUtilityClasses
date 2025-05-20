qx.Class.define("mantineapp.components.Link", {
    extend: qx.ui.form.ToggleButton,

    construct(label, icon, href, clean) {
        if (!clean) {
            super(label, icon);
        } else {
            super();
            this.getContentElement().setAttribute("html", label);
        }

        if (href) {
            this.setHref(href);
        }
    },

    properties: {
        href: {
            apply: "_applyHref",
            nullable: true,
            check: "String"
        }
    },

    members: {
        // property apply
        _applyHref(value) {
            if (value) {
                this.getContentElement().setNodeName("a");
                this.getContentElement().setAttribute("href", value);
                this.addListener("click", (e) => {e.preventDefault()});
            }
        }
    }
  });
