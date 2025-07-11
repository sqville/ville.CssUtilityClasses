qx.Class.define("mantineapp.components.Button", {
    extend: qx.ui.form.Button,

    include: qx.ui.core.MChildrenHandling,

    construct(label) {
        super();

        this._setLayout(new qx.ui.layout.Basic());

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);

        if (label) {
            this.__btninnerwrapper = new qx.html.Element("span", null, 
                {class : "m_80f1301b mantine-Button-inner", html : label});
            this.getContentElement().add(this.__btninnerwrapper);
        }

        this.getContentElement().setAttribute('type', 'button');
    },

    members: {

        // internal span wrapper
        __btninnerwrapper : null,

        // overridden
        _createContentElement() {
            return new qx.html.Element("button");
        }
    }
  });
