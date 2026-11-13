qx.Class.define("ville.ui.basic.Label", {
    extend: ville.ui.core.Widget,
    implement: [qx.ui.form.IStringForm],

    /**
    * @param text {String} Label text.
    * @param component {"span"|"div" ? "span"} The HTML tag to render.
    */
    construct(text, component) {

        if (qx.core.Environment.get("qx.debug")) {
            if (component !== undefined) {
                qx.core.Assert.assertInArray(
                component, 
                ["span", "div"], 
                `Invalid component tag '${component}'. Allowed tags are 'span' or 'div'.`
                );
            }
        }

        if (component) {
            this.__contentElementTag = component;
        }
        
        super();

        if (text) {
            this.setValue(text);
        }

        if (qx.core.Environment.get("qx.dynlocale")) {
            this.__changeLocaleLabelListenerId = qx.locale.Manager.getInstance().addListener(
                "changeLocale",
                this._onChangeLocale,
                this
            );
        }
    },

    properties: {

        value: {
            check: "String",
            apply: "_applyValue",
            event: "changeValue",
            nullable: true
        }
    },

    members: {

        __contentElementTag: "span",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__contentElementTag);
        },

        /**
         * Locale change event handler
         *
         * @signature function(e)
         * @param e {Event} the change event
         */
        _onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
        true(e) {
            var content = this.getValue();
            if (content && content.translate) {
            this.setValue(content.translate());
            }
        },

        false: null
        }),

        // overridden
        _applyValue: qx.core.Environment.select("qx.dynlocale", {
            true(value, old) {
                // Sync with content element
                if (value && value.translate) {
                    this.getContentElement().setAttribute("html", value.translate());
                } else {
                    this.getContentElement().setAttribute("html", value);
                }
            },
            false(value, old) {
                this.getContentElement().setAttribute("html", value);
            }
        }),

        destruct() {
            if (qx.core.Environment.get("qx.dynlocale") && this.__changeLocaleLabelListenerId) {
                qx.locale.Manager.getInstance().removeListenerById(
                    this.__changeLocaleLabelListenerId
                );
            }
        }
    }
  });
