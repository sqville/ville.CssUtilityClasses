/**
 * Button
 * @external(mantine/core/styles/Button.css)
 */
qx.Class.define("ville.ui.form.Button", {
    extend: ville.ui.form.UnstyledButton,

    include: qx.ui.core.MChildrenHandling,

    construct(variant, label, sectionleft, sectionright) {
        super(); 

        this._setLayout(new qx.ui.layout.Basic());

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);

        this.__buttoninnerwrapper = new ville.ui.core.InnerWrapper();
        this.__buttoninnerwrapper.setCssUtilityClass("m_80f1301b mantine-Button-inner");
        this.add(this.__buttoninnerwrapper);

        if (variant != null) {
            this.setVariant(variant);
        }

        if (label != null) {
            this.setLabel(label);
        }

        if (sectionleft !== undefined) {
            this.setSectionLeft(sectionleft);
        }

        if (sectionright !== undefined) {
            this.setSectionRight(sectionright);
        }

        this.getContentElement().setAttribute('type', 'button');
    },

    properties: {

        sectionLeft: {
            check: "ville.ui.icon.Abstract",
            apply: "_applySectionLeft",
            nullable: true,
            themeable: true,
            event: "changeSectionLeft"
        },

        sectionRight: {
            check: "ville.ui.icon.Abstract",
            apply: "_applySectionRight",
            nullable: true,
            themeable: true,
            event: "changeSectionRight"
        },

        variant: {
            init: "default",
            check: ["default", "filled", "light", "outline", "subtle", "transparent", "white"],
            apply: "_applyVariant",
            themeable: true,
            event: "changeVariant"
        }
    },

    members: {

        // internal span wrapper
        __buttoninnerwrapper : null,

        __buttonsectionleft : null,

        __buttonsectionright : null,

        // overridden
        _createContentElement() {
            return new qx.html.Element("button");
        },

        // overridden
        _createChildControlImpl(id, hash) {
            var control;

            switch (id) {
                case "label":
                    control = new ville.ui.basic.Label(this.getLabel());
                    control.setAnonymous(true);
                    control.setRich(this.getRich());
                    control.setSelectable(this.getSelectable());
                    control.setCssUtilityClass("m_811560b9 mantine-Button-label");
                    this.__buttoninnerwrapper.add(control);
                    if (this.getLabel() == null || this.getShow() === "icon") {
                        control.exclude();
                    }
                    break;

                case "sectionleft":
                    control = new ville.ui.basic.Label();
                    control.setRich(true);
                    control.setAnonymous(true);
                    control.setCssUtilityClass("m_a74036a mantine-Button-section");
                    this.__buttoninnerwrapper.addAt(control, 0);
                    if (this.getShow() === "label") {
                        control.exclude();
                    }
                    break;

                case "sectionright":
                    control = new ville.ui.basic.Label();
                    control.setAnonymous(true);
                    control.setRich(true);
                    control.setCssUtilityClass("m_a74036a mantine-Button-section");
                    //control.getContentElement().insertInto(this.__buttoninnerwrapper);
                    this.__buttoninnerwrapper.add(control);
                    if (this.getShow() === "label") {
                        control.exclude();
                    }
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

        // overridden
        _applyIcon(value, old) {},

        // property apply
        _applyLabel(value, old) {
            var label = this.getChildControl("label", true);
            if (label) {
                label.setValue(value);
            }
        },

        _applySectionLeft(value, old) {
            var section = this.getChildControl("sectionleft", true);
            if (section) {
                if (old) {
                    section.removeAll();
                }

                if (value) {
                    section.add(value);
                }
            }
        },

        _applySectionRight(value, old) {
            var section = this.getChildControl("sectionright", true);
            if (section) {
                if (old) {
                    section.removeAll();
                }

                if (value) {
                    section.add(value);
                }
            }
        }

    }
  });
