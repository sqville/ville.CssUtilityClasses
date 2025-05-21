qx.Class.define("mantineapp.components.Button", {
    extend: qx.ui.form.Button,

    include: qx.ui.core.MChildrenHandling,

    construct(label) {
        super();

        this._setLayout(new qx.ui.layout.Basic());

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);

        if (label) {
            this.getContentElement().setAttribute("html", label);
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
