/**
 * Menu Button
 */
qx.Class.define("ville.ui.form.MenuButton", {
    
    extend: qx.ui.form.MenuButton,

    construct(label, icon, menu, variant) {

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

        if (menu != null)
            this.setMenu(menu);

        if (variant != null)
            this.setVariant(variant);
        else 
            this.initVariant();

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

        __textNode : null,

        // overridden
        _createChildControlImpl(id, hash) {
            var control;
            //var innerwrapper;

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
                    if (control == null || this.getShow() === "label")
                        control.exclude();
                    
                    break;

                /*case "innerwrapper":
                    control = new ville.ui.core.InnerWrapper();
                    control.setCssUtilityClass("m_80f1301b mantine-Button-inner");
                    this._add(control);
                    break;
                
                case "label":
                    control = new ville.ui.basic.Label();
                    control.setAnonymous(true);
                    control.setSelectable(this.getSelectable());
                    control.setCssUtilityClass("m_811560b9 mantine-Button-label");
                    innerwrapper = this.getChildControl("innerwrapper");
                    innerwrapper.add(control);
                    break;*/

            }

            return control || super._createChildControlImpl(id);
        },

        // property apply
        _applyVariant(value, old) {
            if (value)
                this.setAttribute("data-variant", value);
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
        _handleIcon() {
            if (this.getIcon() == null || this.getShow() === "label")
                this._excludeChildControl("icon");
            else
                this._showChildControl("icon");

            if (this.getInlineIcon() == null || this.getShow() === "label") {
                this._excludeChildControl("inlineicon");
            } else {
                if (this.getIcon() == null)
                    this._showChildControl("inlineicon");
            }
        },

        // overridden
        /*_applyLabel(value, old) {
            var innerwrapper = this.getChildControl("innerwrapper");
            if (innerwrapper) {
                var label = this.getChildControl("label");
                if (label) {
                    label.setValue(value);
                }
            }
        },*/

        // overridden
        _applyMenu(value, old) {
            if (old) {
                old.removeListener("changeVisibility", this._onMenuChange, this);
                old.resetOpener();
            }

            if (value) {
                value.addListener("changeVisibility", this._onMenuChange, this);
                value.setOpener(this);

                value.removeState("submenu");
                value.removeState("contextmenu");
            }

            // ARIA attrs
            const contentEl = this.getContentElement();
            if (!contentEl) {
                return;
            }
            if (value) {
                contentEl.setAttribute("aria-haspopup", "menu");
                contentEl.setAttribute("aria-expanded", value.isVisible());
                contentEl.setAttribute(
                "aria-controls",
                value.getContentElement().getAttribute("id")
                );

                if (qx.core.Environment.get("ville.cssLayout")) {
                    /**
                     * Supports Popover API
                     */
                    contentEl.setAttribute("popovertarget", value.getContentElement().getAttribute("id"), true);
                    contentEl.setAttribute("popovertargetaction", "show", true);
                    value.getContentElement().setAttribute("popover", "auto", true);
                }

            } else {
                contentEl.removeAttribute("aria-haspopup");
                contentEl.removeAttribute("aria-expanded");
                contentEl.removeAttribute("aria-controls");

                if (qx.core.Environment.get("ville.cssLayout")) {
                    contentEl.removeAttribute("popovertarget");
                    contentEl.removeAttribute("popovertargetaction");
                }
            }
        }

    }
  });
