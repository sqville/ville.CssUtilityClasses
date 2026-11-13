/**
 * Button
 * 
 * @childControl label {ville.ui.basic.Label} label part
 * @childControl icon {ville.ui.basic.Image|ville.ui.core.Widget} icon part
 * 
 */
qx.Class.define("ville.ui.form.Button", {
    extend: ville.ui.core.Widget,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],

    /**
    * @param label {String} Label to use.
    * @param icon {String|ville.ui.core.Widget?null} Icon to use.
    * @param command {ville.ui.command.Command?null} Command instance to connect with.
    * @param component {"button"|"a" ? "button"} The HTML tag to render.
    */
    construct(label, icon, command, component) {
        
        if (qx.core.Environment.get("qx.debug")) {
            if (component !== undefined) {
                qx.core.Assert.assertInArray(
                component, 
                ["button", "a"], 
                `Invalid component tag '${component}'. Allowed tags are 'button' or 'a'.`
                );
            }
        }

        if (component) {
            this.__contentElementTag = component;
        }

        super();

        if (label != null) {
            this.setLabel(label);
        }

        if (icon !== undefined) {
            this.setIcon(icon);
        }

        if (command != null)
            this.setCommand(command);
        
    },

    properties: {

        appearance: {
            refine: true,
            init: "button"
        },

        /**
         * The label/caption/text of the Atom instance.
         */
        label: {
            check: "String",
            apply: "_applyLabel",
            nullable: true,
            themeable: true
        },

        /**
         * Any URI String supported by qx.ui.basic.Image or a {ville.ui.core.Widget} to display an icon.
         * @type {String|ville.ui.core.Widget}
         */
        icon: {
            check(value) {
                return typeof value === "string" || value instanceof ville.ui.core.Widget;
            },
            apply: "_applyIcon",
            nullable: true,
            themeable: true
        },

        /**
         * Configure which parts are visible.
         */
        show: {
            check: ["both", "label", "icon"],
            init: "both",
            nullable: false,
            themeable: true,
            apply: "_applyShow"
        },

        size: {
            check: [
                "xs", "sm", "md", "lg", "xl",
                "compact-xs", "compact-sm", "compact-md", "compact-lg", "compact-xl"
            ],
            nullable: true,
            themeable: true,
            apply: "_applySize"
        },

        radius: {
            check: ["xs", "sm", "md", "lg", "xl"],
            nullable: true,
            themeable: true,
            apply: "_applyRadius"
        },

        fullWidth: {
            check: "Boolean",
            init: false,
            themeable: true,
            apply: "_applyFullWidth"
        },

        iconPosition: {
            check: ["left", "right"],
            init: "left",
            themeable: true,
            apply: "_applyIconPosition"
        }

    },

    members: {

        __contentElementTag : "button",

        __textNode: null,

        /**
         * @lint ignoreReferenceField(_forwardStates)
         */
        _forwardStates: {
            disabled: true,
            hovered: true,
            pressed: true,
            focused: true
        },

         // overridden
        _createContentElement() {
            return new qx.html.Element(this.__contentElementTag);
        },

        _createChildControlImpl(id, hash) {
            let control;

            switch (id) {
                case "label":
                    const initialText = this.getLabel();
                    control = new ville.ui.basic.Label(initialText);
                    control.setAnonymous(true);

                    // 1. Create and cache the lightweight qx.html.Text node
                    this.__textNode = new qx.html.Text(initialText);

                    // 2. Sync qx.html.Text whenever the Label's value changes
                    control.addListener("changeValue", (e) => {
                        if (this.__textNode) {
                            const nextVal = e.getData();
                            this.__textNode.setText(nextVal);
                        }
                    });

                    const contentEl = this.getContentElement();
                    const hasLeftIcon = this.hasChildControl("icon") && this.getIconPosition() === "left";

                    if (hasLeftIcon) {
                        contentEl.add(this.__textNode);
                    } else {
                        contentEl.addAt(this.__textNode, 0);
                    }

                    break;
                

                case "icon":
                    const iconVal = this.getIcon();
                    if (iconVal instanceof ville.ui.core.Widget) {
                        control = iconVal;
                    } else {
                        control = new ville.ui.basic.Image(iconVal);
                    }
                    control.setAnonymous(true);

                    // Deterministic insertion relative to __textNode:
                    // Left icon -> index 0 (before __textNode)
                    // Right icon -> append at end (after __textNode)
                    if (this.getIconPosition() === "right") {
                        this._add(control);
                    } else {
                        this._addAt(control, 0);
                    }

                    break;
                
            }

            return control || super._createChildControlImpl(id, hash);
        },

        // --- Label & Icon Property Appliers ---

        _applyLabel(value, old) {
            if (value != null) {
                // Force creation of the "label" child control if initial label was null
                const label = this.getChildControl("label");
                label.setValue(value);
            } else {
                const label = this.getChildControl("label", true);
                if (label) {
                    label.setValue("");
                }
            }
            this._syncShowVisibility();
        },

        _applyIcon(value, old) {
            if (value != null) {
                const icon = this.getChildControl("icon");
                if (value instanceof ville.ui.core.Widget) {
                // Handle swapping an existing icon widget if replaced at runtime
                if (old && old !== value) {
                    const contentEl = this.getContentElement();
                    const children = contentEl.getChildren();
                    const idx = children ? children.indexOf(old.getContentElement()) : -1;
                    this._remove(old);
                    if (idx !== -1) {
                        this._addAt(value, idx);
                    } else {
                        this._add(value);
                    }
                }
                } else {
                    icon.setSource(value);
                }
            } else {
                const icon = this.getChildControl("icon", true);
                if (icon && typeof icon.setSource === "function") {
                    icon.setSource(null);
                }
            }
            this._syncShowVisibility();
        },

        _applyShow(value, old) {
            this._syncShowVisibility();
        },

        _syncShowVisibility() {
            const show = this.getShow();
            const hasLabel = this.getLabel() != null;
            const hasIcon = this.getIcon() != null;

            const label = this.getChildControl("label", true);
            if (label) {
                const visible = hasLabel && (show === "both" || show === "label");
                label.setVisibility(visible ? "visible" : "excluded");
            }

            const icon = this.getChildControl("icon", true);
            if (icon) {
                const visible = hasIcon && (show === "both" || show === "icon");
                icon.setVisibility(visible ? "visible" : "excluded");
            }
        },

        _applySize(value, old) {
            this._syncModifierState("size", value, old);
        },

        _applyRadius(value, old) {
            this._syncModifierState("radius", value, old);
        },

        _applyIconPosition(value, old) {
            this._syncModifierState("iconPosition", value, old);
        },

        _applyFullWidth(value, old) {
            value ? this.addState("fullWidth") : this.removeState("fullWidth");
        },

        _applyLoading(value, old) {
            if (value) {
                this.reset();
                this.addState("loading");
            } else {
                this.removeState("loading");
            }
            this.__syncDisabledState();
        },

        __syncDisabledState() {
            const el = this.getContentElement();
            const isDisabled = !this.getEnabled() || this.getLoading();

            if (isDisabled) {
                this.addState("disabled");
                this.setAriaState("disabled", true);
                if (this._contentElementTag === "button") {
                el.setAttribute("disabled", "disabled");
                }
            } else {
                this.removeState("disabled");
                this.setAriaState("disabled", null);
                if (this._contentElementTag === "button") {
                el.removeAttribute("disabled");
                }
            }
        },

        destruct() {
            if (this.__textNode) {
            this.__textNode.dispose();
            this.__textNode = null;
            }
        }

    },

  });
