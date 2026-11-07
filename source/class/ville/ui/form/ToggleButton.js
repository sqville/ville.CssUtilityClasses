/**
 * Toggle Button
 */
qx.Class.define("ville.ui.form.ToggleButton", {
    extend: qx.ui.form.ToggleButton,

    construct(label, icon) {

        this._contentElementTag = "button";
        
        super();

        if (label != null)
            this.setLabel(label);

        if (icon != null) {
            if (qx.lang.Type.isString(icon)) {
                this.setIcon(icon);
            } else {
                this.setInlineIcon(icon);
                this._createChildControl("inlineicon");
            }
        }
    },

    properties: {

        inlineIcon: {
            check: "qx.ui.core.Widget",
            apply: "_applyInlineIcon",
            nullable: true,
            themeable: true,
            event: "changeInlineIcon"
        }
    },

    members : {

        __textNode: null,

        // overridden
        _createChildControlImpl(id, hash) {
            var control;

            switch (id) {

                case "label":
                    control = new qx.ui.basic.Label(this.getLabel());
                    control.setAnonymous(true);
                    this.__textNode = new qx.html.Text(this.getLabel());
                    this.getContentElement().add(this.__textNode);
                    control.addListener("changeValue", function(e) {
                        this.__textNode.setText(e.getData(), true);
                    }, this);
                    break;

                case "inlineicon":
                    control = this.getInlineIcon();
                    control.setAnonymous(true);
                    this._addAt(control, 0);
                    if (control == null || this.getShow() === "label") {
                        control.exclude();
                    }
                    break;
                
            }

            return control || super._createChildControlImpl(id);
        }

    }

  });
