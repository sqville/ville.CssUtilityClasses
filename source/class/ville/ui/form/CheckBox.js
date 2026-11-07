/**
 * CheckBox
 * 
 * @require(ville.ui.icon.IconCheck)
 * @require(ville.ui.icon.IconIndeterminate)
 */
qx.Class.define("ville.ui.form.CheckBox", {
    extend: qx.ui.form.CheckBox,

    construct(label, alticon, altindeterminateicon) {

        super();

        var cbinput = this.getChildControl("input");

        if (alticon)
            this.setInlineIcon(alticon);

        if (altindeterminateicon)
            this.setIndeterminateIcon(altindeterminateicon);

        this._createChildControl("icon");
        this._createChildControl("indeterminateicon");

        // Helper to centralize DOM and icon synchronization
        const syncCheckboxState = (value, old) => {
            var cbbody = this.getChildControl("body");
            var cbinputelem = cbinput.getContentElement();
            var cbinputdom = cbinputelem.getDomElement();
            var isTS = this.isTriState();

            if (isTS) {
                if (value === null) {
                    cbinputelem.setAttribute("data-indeterminate", "true");
                    cbbody.remove(this.getInlineIcon());
                    cbbody.add(this.getIndeterminateIcon());
                    cbinputdom.indeterminate = true;
                } else {
                    cbinputelem.removeAttribute("data-indeterminate");
                    
                    // Only swap icons if we are transitioning away from the indeterminate state
                    if (old === null) {
                        cbbody.remove(this.getIndeterminateIcon());
                        cbbody.add(this.getInlineIcon());
                    }
                    
                    cbinputdom.indeterminate = false;
                    cbinputdom.checked = Boolean(value);
                }
                return;
            }

            // Standard Checkbox Logic
            cbinputelem.removeAttribute("data-indeterminate");
            cbinputdom.indeterminate = false;
            cbinputdom.checked = Boolean(value);
        };

        // 1. Sync up input on initial load
        this.addListenerOnce("appear", () => {
            syncCheckboxState(this.getValue(), null);
        });

        // 2. Keep input in sync on value change
        this.addListener("changeValue", (e) => {
            syncCheckboxState(e.getData(), e.getOldData());
        });

    },

    properties: {

        inlineIcon: {
            check: "qx.ui.core.Widget",
            init: null,
            nullable: true,
            themeable: true
        },

        indeterminateIcon: {
            check: "qx.ui.core.Widget",
            init: null,
            nullable: true,
            themeable: true
        }

    },

   members: {

        // overridden
        _forwardStates: {
            invalid: true,
            undetermined: true,
            checked: true
        },

        // overridden
        _createChildControlImpl(id, hash) {
            var control;
            var cbbody;

            switch (id) {
                case "body":
                    control = new ville.ui.core.InnerWrapper("div");
                    control.setAnonymous(true);
                    control.setCssUtilityClass("m_5f6e695e mantine-Checkbox-body");
                    this._add(control);
                    break;

                case "input":
                    control = new ville.ui.core.BaseWidget({ "basetag" : "input", "type" : "checkbox" });
                    control.setAnonymous(true);
                    cbbody = this.getChildControl("body");
                    cbbody.add(control);
                    break;

                case "icon":
                    // check to see if there is an alternative icon, otherwise use default
                    if (!this.getInlineIcon()) {
                        control = new ville.ui.icon.IconCheck();
                        control.setViewBox("0 0 10 7");
                        this.setInlineIcon(control);
                    } else {
                        control = this.getInlineIcon();
                    }
                    control.setCssUtilityClass("m_bf295423 mantine-Checkbox-icon");
                    control.getContentElement().setAttribute("aria-hidden", "true");
                    control.setAnonymous(true);
                    cbbody = this.getChildControl("body");
                    cbbody.add(control);
                    break;

                case "indeterminateicon":
                    // check to see if there is an alternative icon, otherwise use default
                    if (!this.getIndeterminateIcon()) {
                        control = new ville.ui.icon.IconIndeterminate();
                        control.setViewBox("0 0 32 6");
                        this.setIndeterminateIcon(control);
                    } else {
                        control = this.getIndeterminateIcon();
                    }
                    control.setCssUtilityClass("m_bf295423 mantine-Checkbox-icon");
                    control.getContentElement().setAttribute("aria-hidden", "true");
                    control.setAnonymous(true);
                    break;

            }

            return control || super._createChildControlImpl(id);
        },

        // overridden
        _applyIcon() {}

    }
  });
