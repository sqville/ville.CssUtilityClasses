/**
 * Modal Window
 * @external(mantine/core/styles/Modal.css)
 */
qx.Class.define("ville.ui.window.Modal", {
    
    extend: qx.ui.window.Window,

    include: ville.ui.core.MWidget,

    construct(caption) {

        this.setExcludeBoundsFromDom(true);

        super(caption);

        this.setLayout(new qx.ui.layout.Basic());
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_9df02822 mantine-Modal-root");

        this.set({ 
            allowMaximize : false, 
            showMaximize : false,
            allowMinimize : false,
            showMinimize : false, 
            modal: true, 
            movable: false,
            resizable: false
        });

        /*if (variant) {
            this.setVariant(variant);
        } else {
            this.initVariant();
        }

        if (sectionLeft != null) {
            this.setSectionLeft(sectionLeft);
        }

        if (label != null) {
            this.setLabel(label);
        }

        if (sectionRight != null) {
            this.setSectionRight(sectionRight);
        }*/

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

        // overridden
        _createContentElement() {
            return new qx.html.Element("div");
        },

        // overridden
        _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
            case "statusbar":
            control = new qx.ui.container.Composite(new qx.ui.layout.HBox());
            this._add(control);
            control.add(this.getChildControl("statusbar-text"));
            break;

            case "statusbar-text":
            control = new qx.ui.basic.Label();
            control.setValue(this.getStatus());
            break;

            case "pane":
            control = new qx.ui.container.Composite();
            this._add(control, { flex: 1 });
            break;

            case "captionbar":
            // captionbar
            var layout = new qx.ui.layout.Grid();
            layout.setRowFlex(0, 1);
            layout.setColumnFlex(1, 1);
            control = new qx.ui.container.Composite(layout);
            this._add(control);

            // captionbar events
            control.addListener("dbltap", this._onCaptionPointerDblTap, this);

            // register as move handle
            this._activateMoveHandle(control);
            break;

            case "icon":
            control = new qx.ui.basic.Image(this.getIcon());
            this.getChildControl("captionbar").add(control, {
                row: 0,
                column: 0
            });

            break;

            case "title":
            control = new qx.ui.basic.Label(this.getCaption());
            control.setWidth(0);
            control.setAllowGrowX(true);

            var captionBar = this.getChildControl("captionbar");
            captionBar.add(control, { row: 0, column: 1 });
            break;

            case "minimize-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onMinimizeButtonTap, this);

            this.getChildControl("captionbar").add(control, {
                row: 0,
                column: 2
            });

            break;

            case "restore-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onRestoreButtonTap, this);

            this.getChildControl("captionbar").add(control, {
                row: 0,
                column: 3
            });

            break;

            case "maximize-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onMaximizeButtonTap, this);

            this.getChildControl("captionbar").add(control, {
                row: 0,
                column: 4
            });

            break;

            case "close-button":
            control = new qx.ui.form.Button();
            control.setFocusable(false);
            control.addListener("execute", this._onCloseButtonTap, this);

            this.getChildControl("captionbar").add(control, {
                row: 0,
                column: 6
            });

            break;
        }

        return control || super._createChildControlImpl(id);
        },

        // property apply
        _applyVariant(value, old) {
            if (value) {
                this.setAttribute("data-variant", value);
            }
        },

        // overridden
        // Replaced by Section Left and Right
        _applyIcon(value, old) {},

        // overridden
        _applyShow(value, old) {},

        // overridden
        _applyLabel(value, old) {
            if (value) {
                this.setAttribute("html", value);
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
                    this.setAttribute("data-with-left-section", "true");
                } else {
                    this.removeAttribute("data-with-left-section");
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
                    this.setAttribute("data-with-right-section", "true");
                } else {
                    this.removeAttribute("data-with-right-section");
                }
            }
        }
    }
  });
