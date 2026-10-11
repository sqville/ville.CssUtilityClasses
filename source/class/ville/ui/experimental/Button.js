/**
 * Button
 * @external(mantine/core/styles/UnstyledButton.css)
 * @external(mantine/core/styles/Button.css)
 */
qx.Class.define("ville.ui.experimental.Button", {
    
    extend: qx.ui.form.Button,

    construct(label, icon, command, variant, sectionLeft, sectionRight, component) {
        
        if (component) {
            this.__componenttag = component;
        }
        
        super();

        this.setCssUtilityClass("m_77c9d27d mantine-Button-root m_87cf2631 mantine-UnstyledButton-root");

        if (icon != null) {
            this.setIcon(icon);
        }

        if (sectionLeft != null) {
            this.setSectionLeft(sectionLeft);
        }

        if (label != null) {
            this.setLabel(label);
        }

        if (command != null) {
            this.setCommand(command);
        }

        if (variant) {
            this.setVariant(variant);
        } else {
            this.initVariant();
        }

        if (sectionRight != null) {
            this.setSectionRight(sectionRight);
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

        sectionLeft: {
            check: "qx.ui.core.Widget",
            apply: "_applySectionLeft",
            nullable: true,
            themeable: true,
            event: "changeSectionLeft"
        },

        sectionRight: {
            check: "qx.ui.core.Widget",
            apply: "_applySectionRight",
            nullable: true,
            themeable: true,
            event: "changeSectionRight"
        }
    },

    members: {

        __componenttag: "button",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        },

        // overridden
        _createChildControlImpl(id, hash) {
            var control;
            //var innerwrapper;

            switch (id) {
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

                case "sectionleft":
                    control = new ville.ui.basic.Label();
                    control.setAnonymous(true);
                    control.setCssUtilityClass("m_a74036a mantine-Button-section");
                    control.getContentElement().setAttribute("data-position", "left");
                    //innerwrapper = this.getChildControl("innerwrapper");
                    this._addAt(control, 0);
                    break;

                case "sectionright":
                    control = new ville.ui.basic.Label();
                    control.setAnonymous(true);
                    control.setCssUtilityClass("m_a74036a mantine-Button-section");
                    control.getContentElement().setAttribute("data-position", "right");
                    //innerwrapper = this.getChildControl("innerwrapper");
                    this._add(control);
                    break;
            }

            return control || super._createChildControlImpl(id);
        },

        // property apply
        _applyVariant(value, old) {
            if (value) {
                this.getContentElement().setAttribute("data-variant", value);
            }
        },

        _applySectionLeft(value, old) {
            var section = this.getChildControl("sectionleft");
            if (section) {
                if (old) {
                    section.removeAll();
                }

                if (value) {
                    section.add(value);
                    this.getContentElement().setAttribute("data-with-left-section", "true");
                } else {
                    this.getContentElement().removeAttribute("data-with-left-section");
                }
            }
        },

        _applySectionRight(value, old) {
            var section = this.getChildControl("sectionright");
            if (section) {
                if (old) {
                    section.removeAll();
                }

                if (value) {
                    section.add(value);
                    this.getContentElement().setAttribute("data-with-right-section", "true");
                } else {
                    this.getContentElement().removeAttribute("data-with-right-section");
                }
            }
        }

    }
  });
