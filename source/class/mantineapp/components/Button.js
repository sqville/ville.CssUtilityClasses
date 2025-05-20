qx.Class.define("mantineapp.components.Button", {
    extend: qx.ui.form.Button,

    construct(label, rich) {
        super();

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);

        if (label) {
            this.getContentElement().setAttribute("html", label);
        }

        if (rich != undefined) {
            this.setRich(rich);
        }

        this.getContentElement().setAttribute('type', 'button');
    },

    members: {

        // overridden
        _createContentElement() {
            return new qx.html.Element("button");
        }
    }
  });
