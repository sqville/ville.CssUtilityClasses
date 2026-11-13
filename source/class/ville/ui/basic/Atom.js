/**
 * A multi-purpose widget combining a label with an icon.
 *
 * @childControl label {ville.ui.experimental.Label} label part of the atom
 * @childControl icon {ville.ui.basic.Image|ville.ui.core.Widget} icon part of the atom
 */
qx.Class.define("ville.ui.basic.Atom", {
  extend: ville.ui.core.Widget,

  /**
   * @param label {String} Label to use
   * @param icon {String|ville.ui.core.Widget?null} Icon to use
   */
  construct(label, icon) {
    if (qx.core.Environment.get("qx.debug")) {
      this.assertArgumentsCount(arguments, 0, 2);
    }

    super();

    if (label != null) {
      this.setLabel(label);
    }

    if (icon !== undefined) {
      this.setIcon(icon);
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "atom"
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
     * Configure which parts of the atom are visible.
     */
    show: {
      check: ["both", "label", "icon"],
      init: "both",
      nullable: false,
      themeable: true,
      apply: "_applyShow"
    }
  },

  members: {
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      disabled: true,
      hovered: true,
      pressed: true,
      focused: true
    },

    // --- Child Control Factory ---

    _createChildControlImpl(id, hash) {
      let control;

      switch (id) {
        case "label":
          control = new ville.ui.experimental.Label(this.getLabel());
          control.setAnonymous(true);
          this._add(control);
          break;

        case "icon":
          const iconVal = this.getIcon();
          if (iconVal instanceof ville.ui.core.Widget) {
            control = iconVal;
          } else {
            control = new ville.ui.basic.Image(iconVal);
          }
          control.setAnonymous(true);
          this._addAt(control, 0);
          break;
      }

      const result = control || super._createChildControlImpl(id);
      this._syncShowVisibility();
      return result;
    },

    // --- Property Apply Methods ---

    _applyLabel(value, old) {
      if (value) {
        // Remove the 'true' flag to FORCE creation of the label widget
        const label = this.getChildControl("label"); 
        label.setValue(value);
      } else {
        // If the value is being cleared, it's safe to use notcreate (true)
        const label = this.getChildControl("label", true);
        if (label) {
          label.setValue("");
        }
      }
      
      this._syncShowVisibility(); // Uncomment this
    },

    _applyIcon(value, old) {
      if (value) {
        // Remove the 'true' flag to FORCE creation of the icon widget
        const icon = this.getChildControl("icon");
        if (value instanceof ville.ui.core.Widget) {
          // Future swap logic goes here
        } else {
          icon.setSource(value);
        }
      } else {
        // If the value is being cleared, it's safe to use notcreate (true)
        const icon = this.getChildControl("icon", true);
        if (icon) {
          icon.setSource(null);
        }
      }
      
      this._syncShowVisibility(); // Uncomment this
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
    }

  }
});
