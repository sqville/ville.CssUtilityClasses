/**
 * Menu Button
 * 
 */
qx.Class.define("ville.ui.component.MenuButton", {
    
    extend: qx.ui.form.MenuButton,

    construct(label, icon, menu, variant) {

        this._contentElementTag = "button";

        if (icon != null) {
            if (qx.lang.Type.isString(icon)) {
                super(label, icon, menu);
            } else {
                super(label, null, menu);
                this.setInlineIcon(icon);
                this._createChildControl("inlineicon");
            }
        } else {
            super(label, null, menu);
        }

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

        // overridden
        _createChildControlImpl(id, hash) {
            var control;
            //var innerwrapper;

            switch (id) {

                case "label":
                    this.setAttribute("html", this.getLabel());
                    break;
                
                case "inlineicon":
                    control = this.getInlineIcon();
                    control.setAnonymous(true);
                    this._addAt(control, 0);
                    if (control == null || this.getShow() === "label")
                        control.exclude();
                    
                    break;

            }

            return control || super._createChildControlImpl(id);
        },

        // property apply
        _applyVariant(value, old) {
            if (value)
                this.setAttribute("data-variant", value);
        },

        // overridden
        _applyEnabled(value, old) {
            super._applyEnabled(value, old);
            if (value === false) {
                this.setAttribute("data-disabled", true);
            } else {
                this.removeAttribute("data-disabled");
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
        // Replaced by Section Left and Right
        //_applyIcon(value, old) {},

        // overridden
        //_applyShow(value, old) {},

        // property apply
        _applyLabel(value, old) {
            
            if (value) {
                this.setAttribute("html", value);
            }

            //this._handleLabel();
            
        },

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
