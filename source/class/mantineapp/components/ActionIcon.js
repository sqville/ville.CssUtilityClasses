qx.Class.define("mantineapp.components.ActionIcon", {
    extend: qx.ui.form.ToggleButton,

    include: qx.ui.core.MChildrenHandling,

    construct(icon) {
        super();

        this._setLayout(new qx.ui.layout.Basic());

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);

        if (icon) {
            this.setIcon(icon);
        }
    },

    members: {

        // internal span wrapper
        __aiwrapper : null,

        // property apply
        _applyIcon(value) {
            if (value) {
                if (this.__aiwrapper) {
                    this.getContentElement().getChild(0).setAttribute("html", value);
                } else {
                    this.__aiwrapper = new qx.html.Element("span", null, {class : "m_8d3afb97 mantine-ActionIcon-icon", html : value});
                    this.getContentElement().add(this.__aiwrapper);
                }
            }
        },

        // overridden
        _createContentElement() {
            return new qx.html.Element("button");
        }
    }
  });
