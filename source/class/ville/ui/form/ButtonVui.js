/**
 * ButtonVui
 */
qx.Class.define("ville.ui.form.ButtonVui", {
    
    extend: qx.ui.form.Button,

    construct(label, icon, command, component) {
        
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

    members: {

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

        // overridden
        _applyIconPosition(value, old) {
            const el = this.getContentElement();
            const iconEl = this.getIconElement(); // Assuming you have a getter for your SVG element/node

            // 1. Set the data attribute to trigger the Mantine CSS margins
            el.setAttribute("data-position", value);

            // 2. Visually orient the flex children
            if (value === "right") {
                // Reverses the flow so the text is first, icon is second
                el.setStyle("flex-direction", "row-reverse");
            } else if (value === "top") {
                el.setStyle("flex-direction", "column");
            } else if (value === "bottom") {
                el.setStyle("flex-direction", "column-reverse");
            } else {
                // Default "left"
                el.setStyle("flex-direction", "row");
            }
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
        }

    }
  });
