/**
 * ComboBox
 * @external(mantine/core/styles/Input.css)
 * @external(mantine/core/styles/Combobox.css)
 * @require(ville.ui.icon.ComboBoxChevron)
 */
qx.Class.define("ville.ui.form.SelectBox", {
    
    extend: qx.ui.form.SelectBox,

    include: ville.ui.core.MWidget,

    construct() {

        this.setExcludeBoundsFromDom(true);
        
        super();
        
        //this._setLayout(new qx.ui.layout.Basic());
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_46b77525 mantine-InputWrapper-root mantine-InputBase-root");
        
        this.initVariant();
        this.initSize();
        this.initRadius();

    },

    properties: {

        variant: {
            init: "default",
            check: ["default", "filled", "light", "outline", "subtle", "transparent", "white"],
            apply: "_applyVariant",
            themeable: true,
            event: "changeVariant"
        },

        /*textField: {
            check: "qx.ui.form.AbstractField",
            apply: "_applyTextField",
            nullable: false,
            event: "changeTextField"
        },*/

        size: {
            init: "sm",
            check: ["xs", "sm", "md", "lg", "xl"],
            apply: "_applySize",
            nullable: true,
            themeable: true,
            event: "changeSize"
        },

        radius: {
            init: "md",
            check: ["xs", "sm", "md", "lg", "xl"],
            apply: "_applyRadius",
            nullable: true,
            themeable: true,
            event: "changeRadius"
        }

        /*nestLabel: {
            check: "Boolean",
            init: false,
            nullable: false,
            themeable: true
        },

        label: {
            check: "ville.ui.form.Label",
            apply: "_applyLabel",
            nullable: true,
            event: "changeLabel"
        }*/

    },

    members: {

        // overridden
        _createContentElement() {
            return new qx.html.Element("div");
        },

        // overridden
        _createChildControlImpl(id, hash) {
            var control;

            switch (id) {
                case "textfield":
                control = new ville.ui.form.TextField();
                control.setFocusable(false);
                control.addState("inner");
                control.addListener(
                    "changeValue",
                    this._onTextFieldChangeValue,
                    this
                );

                control.addListener("blur", this.close, this);
                var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper)
                    innerwrapper.add(control);

                break;

                case "sectionright":
                control = new ville.ui.form.InputSection();
                control.setAnonymous(true);
                control.setCssUtilityClass("m_82577fc2 mantine-Input-section mantine-InputBase-section");
                control.setAttribute("data-position", "right");
                this._add(control);
                break;

                case "button":
                control = new ville.ui.form.UnstyledButton();
                control.setFocusable(false);
                control.setKeepActive(true);
                control.addState("inner");
                var defaulticon = new ville.ui.icon.ComboBoxChevron();
                defaulticon.setViewBox("0 0 15 15");
                control.add(defaulticon);
                control.addListener("execute", this.toggle, this);
                var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper) {
                    var sectionright = this.getChildControl("sectionright");
                    if (sectionright) {
                        sectionright.add(control);
                        innerwrapper.add(sectionright);
                    }
                }

                break;

                case "list":
                // Get the list from the AbstractSelectBox
                control = super._createChildControlImpl(id);
                
                // Change selection mode
                control.setSelectionMode("single");
                break;

                case "innerwrapper":
                control = new ville.ui.core.InnerWrapper("div");
                control.setCssUtilityClass("m_6c018570 mantine-Input-wrapper mantine-InputBase-wrapper");
                control.setAttribute("data-with-right-section", "true");
                this._add(control);
                break;

                
            }

            return control || super._createChildControlImpl(id);
        },

        // property apply
        _applyVariant(value, old) {
            if (value) {
                this.setAttribute("data-variant", value);
                var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper) {
                    innerwrapper.setAttribute("data-variant", value);
                }
            }
        },

        // property apply
        /*_applyTextField(value, old) {
            if (value) {
                var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper) {
                    innerwrapper.add(value);
                }
            }
        },*/

        // property apply
        /*_applyLabel(value, old) {
            if (value) {
                var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper) {
                    if (!this.getNestLabel()) {
                        this._add(value);
                        value.getContentElement().moveTo(0);
                    } else {
                        value.add(innerwrapper);
                        this._add(value);
                    }
                }
            }
        },*/

        _applySize(value, old) {
            if (value) {
                //this.setAttribute("data-size", value);
                /*this.setStyles({
                    "--input-height" : `var(--input-height-${value})`, 
                    "--input-fz" : `var(--mantine-font-size-${value})`
                });*/
                var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper) {
                    this.setAttribute("data-size", value);
                    innerwrapper.setAttribute("data-size", value);
                    innerwrapper.setStyles({
                        "--input-height" : `var(--input-height-${value})`, 
                        "--input-fz" : `var(--mantine-font-size-${value})`
                    });
                    /*var label = this.getLabel();
                    if (label) {
                        label.setSize(value);
                    }*/
                }
            }
        },

        _applyRadius(value, old) {
            if (value) {
                //this.setStyle("--input-radius", `var(--mantine-radius-${value})`);
                var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper) {
                    innerwrapper.setStyle("--input-radius", `var(--mantine-radius-${value})`);
                }
            }
        }
    }
  });
