qx.Class.define("ville.ui.form.Label", {
    extend: ville.ui.core.Widget,
    implement: [qx.ui.form.IStringForm],

    /**
     * @param text {String} Label to use
     */
    construct(text) {
        
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
        
        size: {
            init: "xs",
            check: ["xs", "sm", "md", "lg", "xl"],
            apply: "_applySize",
            nullable: true,
            themeable: true,
            event: "changeSize"
        },

        value: {
            check: "String",
            apply: "_applyValue",
            event: "changeValue",
            nullable: true
        }
    },

    members: {

        __contentElementTag: "label",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__contentElementTag);
        },

        _applySize(value, old) {
            if (value) {
                this.setAttribute("data-size", value);
                this.setStyle("--input-label-size", `var(--mantine-font-size-${value})`);
            }
        },

        // overridden
        _applyValue: qx.core.Environment.select("qx.dynlocale", {
            true(value, old) {
                // Sync with content element
                if (value && value.translate) {
                    this.setAttribute("html", value.translate());
                } else {
                    this.setAttribute("html", value);
                }
            },
            false(value, old) {
                this.getContentElement().setAttribute("html", value);
            }
        }),

        /*
        *****************************************************************************
            DESTRUCTOR
        *****************************************************************************
        */

        destruct() {
            if (qx.core.Environment.get("qx.dynlocale") && this.__changeLocaleLabelListenerId) {
                qx.locale.Manager.getInstance().removeListenerById(
                    this.__changeLocaleLabelListenerId
                );
            }
        }
    }
  });
