/**
 * Menu Button
 * @ai-instructions Since popovers are involved this must be a button. Do not include component logic
 * @ai-instructions icon child control will always be to the left of the label. Do not include IconPosition
 */
qx.Class.define("ville.ui.menu.ButtonOld", {
    
    extend: ville.ui.core.Widget,
    include: [qx.ui.core.MExecutable],
    implement: [qx.ui.form.IExecutable],

    construct(label, icon, command, menu, variant) {
        
        super();

        if (label != null) {
            this.setLabel(label);
        }

        if (icon !== undefined) {
            this.setIcon(icon);
        }

        if (command != null) {
            this.setCommand(command);
        }

        if (menu != null) {
            this.setMenu(menu);
        }

        // Set default accessible role
        this.setAriaRole("button");

        // Initialize Event Bridge
        this._initEventBridge();

        /*if (variant != null) {
            this.setVariant(variant);
        } else {
            this.initVariant();
        }*/

    },
    
    properties: {

        /**
         * Appearance selector ID resolved against the active theme (defaults to `"menu-button"`).
         */
        appearance: {
            refine: true,
            init: "menu-button"
        }

    },

    members: {

        /**
         * Root HTML tag name (`"button"`).
         *
         * @type {"button"}
         * @private
         */
        __contentElementTag: "button",

        /**
         * overridden
         * States automatically forwarded from the button to its `label` and `icon` child controls.
         *
         * @type {Object<string, boolean>}
         * @protected
         * @lint ignoreReferenceField(_forwardStates)
         */
        _forwardStates: {
            disabled: true
        },

        /**
         * overridden
         * Creates the root `qx.html.Element` using the configured tag (`"button"` or `"a"`).
         *
         * @returns {qx.html.Element} Root button or anchor element.
         * @protected
         */
        _createContentElement() {
            return new qx.html.Element(this.__contentElementTag);
        },

        // overridden
        _createChildControlImpl(id, hash) {
            var control;

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

                //if (hasLeftIcon) {
                    contentEl.add(this.__textNode);
                //} else {
                //    contentEl.addAt(this.__textNode, 0);
                //}

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
                    //if (this.getIconPosition() === "right") {
                        this._add(control);
                    //} else {
                    //    this._addAt(control, 0);
                    //}

                    break;

            }

            return control || super._createChildControlImpl(id);
        }

        // property apply
        /*_applyVariant(value, old) {
            if (value)
                this.setAttribute("data-variant", value);
        },*/

    }
  });
