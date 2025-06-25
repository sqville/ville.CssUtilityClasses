/**
 * CheckBox
 * 
 * Data Attributes (defaults)
 *  data-label-position="right"
 *  data-size="sm"
 * 
 * @external(mantine/core/styles/Checkbox.css)
 */
qx.Class.define("ville.ui.form.CheckBox", {
    extend: qx.ui.form.CheckBox,

    include: [qx.ui.core.MChildrenHandling, ville.ui.core.MWidget],

    construct(label, variant) {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setExcludeInlineStyles(["position"]);
        this.setCssUtilityClass("m_bf2d988c mantine-Checkbox-root m_5f75b09e");

        this._createChildControl("input");
        this._createChildControl("icon");

        if (label) {
            this._createChildControl("label");
        }

        // Set attributes
        this.setAttributes({
            "data-label-position" : "right",
            "data-size" : "sm",
            "data-variant" : "filled"
        });

        this.initNestLabel();

        if (variant) {
            this.setVariant(variant);
        }
    },

    properties: {

        variant: {
            init: "filled",
            check: ["filled", "outline"],
            apply: "_applyVariant",
            themeable: true,
            event: "changeVariant"
        },

        nestLabel: {
            check: "Boolean",
            init: true,
            nullable: false,
            themeable: true,
            apply: "_applyNestLabel"
        }

    },

    members: {

        // overridden
        _createChildControlImpl(id, hash) {
            var control;
            var cbbody;
            var cbinnerwrapper;
            var cblabelwrapper;

            switch (id) {
                case "checkboxbody":
                    control = new ville.ui.core.InnerWrapper("div");
                    control.setCssUtilityClass("m_5f6e695e mantine-Checkbox-body");
                    this._add(control);
                    break;  

                case "checkboxinnerwrapper":
                    control = new ville.ui.core.InnerWrapper("div");
                    control.setCssUtilityClass("m_26062bec mantine-Checkbox-inner");
                    cbbody = this.getChildControl("checkboxbody");
                    cbbody.add(control);
                    break; 

                case "checkboxlabelwrapper":
                    control = new ville.ui.core.InnerWrapper("div");
                    control.setCssUtilityClass("m_d3ea56bb mantine-Checkbox-labelWrapper");
                    cbbody = this.getChildControl("checkboxbody");
                    cbbody.add(control);
                    break;

                case "input":
                    control = new ville.ui.core.BaseWidget("input");
                    control.setAttribute("type", "checkbox");
                    control.setCssUtilityClass("mantine-focus-auto m_26063560 mantine-Checkbox-input");
                    cbinnerwrapper = this.getChildControl("checkboxinnerwrapper");
                    cbinnerwrapper.add(control);
                    break;
                
                case "icon":
                    control = new ville.ui.icon.CheckBoxIcon();
                    cbinnerwrapper = this.getChildControl("checkboxinnerwrapper");
                    cbinnerwrapper.add(control);
                    break;

                case "label":
                    control = new ville.ui.basic.Label();
                    control.setAnonymous(true);
                    control.setSelectable(this.getSelectable());
                    control.setCssUtilityClass("m_8ee546b8 mantine-Checkbox-label");
                    cblabelwrapper = this.getChildControl("checkboxlabelwrapper");
                    cblabelwrapper.add(control);
                    break;
                
            }

            return control || super._createChildControlImpl(id);
        },

        // property apply
        _applyVariant(value, old) {
            if (value) {
                this.setAttribute("data-variant", value);
                var input = this.getChildControl("input");
                if (input) {
                    // m_215c4542 - outline
                    if (value = "outline") {
                        input.getContentElement().addClass("m_215c4542");
                    } else {
                        input.getContentElement().removeClass("m_215c4542");
                    }
                }
            }
        },

        // overridden
        _applyIcon() {},

        // property apply
        _applyNestLabel(value, old) {
            if (value) {
                var label = this.getChildControl("label");
                if (label) {
                    var cbinnerwrapper = this.getChildControl("checkboxinnerwrapper");
                    if (cbinnerwrapper) {
                        label.add(cbinnerwrapper);
                    }
                }
            }
        }
    }
  });
