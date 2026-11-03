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
qx.Class.define("ville.ui.component.Button", {
    
    extend: qx.ui.form.Button,

    construct(label, icon, command, variant, component) {
        
        this._contentElementTag = component ?? "button";

        if (icon != null) {
            if (qx.lang.Type.isString(icon)) {
                super(label, icon, command);
            } else {
                super(label, null, command);
                this.setInlineIcon(icon);
                this._createChildControl("inlineicon");
            }
        } else {
            super(label, null, command);
        }

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

        // overridden
        _createChildControlImpl(id, hash) {
            var control;

            switch (id) {

                case "label":
                    this.setAttribute("html", this.getLabel());
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

        // overridden
        _applyEnabled(value, old) {
            super._applyEnabled(value, old);
            if (value === false) {
                this.getContentElement().setAttribute("data-disabled", true);
            } else {
                this.getContentElement().removeAttribute("data-disabled");
            }
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
        _applyLabel(value, old) {
            
            if (value) {
                this.setAttribute("html", value);
            }

            //this._handleLabel();
            
        },

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
                this.setAttribute("data-variant", value);
            }
        }

    }
  });
