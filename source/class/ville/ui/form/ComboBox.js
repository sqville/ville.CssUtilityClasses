/**
 * ComboBox
 * 
 * @external(mantine/core/styles/Input.css)
 */
qx.Class.define("ville.ui.form.ComboBox", {
    
    extend: qx.ui.form.ComboBox,

    include: ville.ui.core.MWidget,

    construct() {

        super();
        
        //this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        //this.setExcludeBoundsFromDomMods(["left", "top", "overflow-x", "overflow-y"]);
        this.setCssUtilityClass("m_6c018570 mantine-Input-wrapper mantine-InputBase-wrapper");
        this.setStyle("position", "relative", true);
        this.setAttributes({ 
            "data-pointer": "true",
            "data-with-right-section": "true"
        }, true);

        var popup = this.getChildControl("popup");
        popup.setDomMove(true);
        popup.setPosition("bottom-left");

        var button = this.getChildControl("button");
        button.addListener("execute", function(e)
        {
            //var popup = this.getChildControl("popup");
            //popup.placeToMouse(e);
            //console.log(e.getTarget());
            var element = e.getTarget().getContentElement().getDomElement();
            const rect = element.getBoundingClientRect();
            console.log('Top (viewport):', rect.top);
            console.log('Left (viewport):', rect.left);
            popup.setPosition("bottom-left");
            popup.placeToElement(element);
            popup.show();
            //popup.show();
            //popup.moveTo(rect.left, rect.top);
        }, this);
        //button.setWidth(16);
        //button.setBackgroundColor("green");
        
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
        /*_createChildControlImpl(id, hash) {
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

                case "button":
                control = new ville.ui.form.Button();
                control.setFocusable(false);
                control.setKeepActive(true);
                control.addState("inner");
                control.addListener("execute", this.toggle, this);
                var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper)
                    innerwrapper.add(control);

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
        },*/

        // property apply
        _applyVariant(value, old) {
            if (value) {
                this.setAttribute("data-variant", value);
                //var innerwrapper = this.getChildControl("innerwrapper");
                //if (innerwrapper) {
                //    innerwrapper.setAttribute("data-variant", value);
                //}
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
                this.setAttribute("data-size", value);
                this.setStyles({
                    "--input-height" : `var(--input-height-${value})`, 
                    "--input-fz" : `var(--mantine-font-size-${value})`
                });
                /*var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper) {
                    this.setAttribute("data-size", value);
                    innerwrapper.setAttribute("data-size", value);
                    innerwrapper.setStyles({
                        "--input-height" : `var(--input-height-${value})`, 
                        "--input-fz" : `var(--mantine-font-size-${value})`
                    });
                    var label = this.getLabel();
                    if (label) {
                        label.setSize(value);
                    }
                }*/
            }
        },

        _applyRadius(value, old) {
            if (value) {
                this.setStyle("--input-radius", `var(--mantine-radius-${value})`);
                /*var innerwrapper = this.getChildControl("innerwrapper");
                if (innerwrapper) {
                    innerwrapper.setStyle("--input-radius", `var(--mantine-radius-${value})`);
                }*/
            }
        }
    }
  });
