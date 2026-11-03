/**
 * Menu Button
 */
qx.Class.define("ville.ui.component.menu.Button", {
    
    extend: qx.ui.menu.Button,

    construct(label, icon, command, menu, variant) {
        
        this._contentElementTag = "button";

        if (icon != null) {
            if (qx.lang.Type.isString(icon)) {
                super(label, icon, command, menu);
            } else {
                super(label, null, command, menu);
                this.setInlineIcon(icon);
                this._createChildControl("inlineicon");
            }
        } else {
            super(label, null, command, menu);
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
                    this._add(control, { column: 0 });
                    break;

            }

            return control || super._createChildControlImpl(id);
        },

        // property apply
        _applyVariant(value, old) {
            if (value)
                this.setAttribute("data-variant", value);
        },

        // property apply
        _applyLabel(value, old) {
            
            if (value) {
                this.setAttribute("html", value);
            }

            //this._handleLabel();
            
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
        }
    }
  });
