qx.Class.define("mantineapp.components.Label", {
    extend: qx.ui.basic.Label,

    include: qx.ui.core.MChildrenHandling,

    construct(text) {
        super();

        this._setLayout(new qx.ui.layout.Basic());

        if (text) {
            this.setValue(text);
        }

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
    },

    members: {

        // overridden
        _createContentElement() {
            return new qx.html.Element("label");
        },

        // overridden
        _applyValue: qx.core.Environment.select("qx.dynlocale", {
            true(value, old) {
                // Sync with content element
                if (value && value.translate) {
                this.getContentElement().setAttribute("html", value.translate());
                } else {
                this.getContentElement().setAttribute("html", value);
                }

                // Mark text size cache as invalid
                this.__invalidContentSize = true;

                // Update layout
                qx.ui.core.queue.Layout.add(this);
            },

            false(value, old) {
                this.getContentElement().setAttribute("html", value);

                // Mark text size cache as invalid
                this.__invalidContentSize = true;

                // Update layout
                qx.ui.core.queue.Layout.add(this);
            }
            })
    }
  });
