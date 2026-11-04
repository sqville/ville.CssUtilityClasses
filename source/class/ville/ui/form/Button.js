/**
 * Button
 * 
 * Required CSS files:
 * EXTERNAL - mantine/core/styles/UnstyledButton.css
 * EXTERNAL - mantine/core/styles/Button.css
 * 
 * Data attributes:
 * data-variant
 * data-disabled
 * data-loading
 * data-block
 * 
 * @childControl inlineicon {qx.ui.core.Widget}
 * 
 */
qx.Class.define("ville.ui.form.Button", {
    
    extend: qx.ui.form.Button,

    construct(label, icon, command, variant, component) {
        
        this._contentElementTag = component ?? "button";

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

        if (command != null)
            this.setCommand(command);
        

        if (variant != null) {
            this.setVariant(variant);
        } else {
            this.initVariant();
        }
        
    },

    properties: {

        variant: {
            init: "default",
            check: ["default", "filled", "light", "outline", "subtle", "transparent", "white"],
            apply: "_applyVariant",
            themeable: true,
            event: "changeVariant"
        },

        inlineIcon: {
            check: "qx.ui.core.Widget",
            apply: "_applyInlineIcon",
            nullable: true,
            themeable: true,
            event: "changeInlineIcon"
        }
    },

    members: {

        __textNode: null,

        // overridden
        _createChildControlImpl(id, hash) {
            var control;

            switch (id) {

                case "label":
                    control = new qx.ui.basic.Label(this.getLabel()); //new ville.ui.basic.LabelFlat(this.getLabel());
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
        },

        // property apply
        _applyInlineIcon (value, old) 
        {
            if (this.getIcon() != null) {
                value.exclude();
            } else {
                if (old)
                    this._removeAt(0);
                    
                if (value)
                    this.getChildControl("inlineicon", true);

            }
        },

        // property apply
        /*_applyLabel(value, old) {
            if (qx.core.Environment.get("ville.tagLabel.button")){
                
            } else {
                var label = this.getChildControl("label", true);
                if (label) {
                    label.setValue(value);
                }

                this._handleLabel();
            }
            
        },*/

        // overridden
        _handleIcon() {
            if (this.getIcon() == null || this.getShow() === "label") {
                this._excludeChildControl("icon");
            } else {
                this._showChildControl("icon");
            }

            if (this.getInlineIcon() == null || this.getShow() === "label") {
                this._excludeChildControl("inlineicon");
            } else {
                if (this.getIcon() == null)
                    this._showChildControl("inlineicon");
            }
        },

        // property apply
        _applyVariant(value, old) {
            if (value) {
                this.getContentElement().setAttribute("data-variant", value);
            }
        }

    }
  });
