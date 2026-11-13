/**
 * A multi-purpose widget, which combines a label with an icon.
 *
 * @childControl label {ville.ui.basic.Label} label part of the atom
 * @childControl icon {ville.ui.basic.Image} icon part of the atom
 */
qx.Class.define("ville.ui.basic.AtomLast", {
  extend: ville.ui.core.Widget,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

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

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    // overridden
    appearance: {
      refine: true,
      init: "atom"
    },

    /** 
     * The label/caption/text of the qx.ui.basic.Atom instance 
     */
    label: {
      apply: "_applyLabel",
      nullable: true,
      check: "String"
    },

    /**
     * Any URI String supported by qx.ui.basic.Image or a {ville.ui.core.Widget} to display an icon.
     *
     * @type {String|ville.ui.core.Widget}
     */
    icon: {
      check: function(value) {
        return typeof value === "string" || value instanceof ville.ui.core.Widget;
      },
      apply: "_applyIcon",
      nullable: true,
      themeable: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  /* eslint-disable @qooxdoo/qx/no-refs-in-members */
  members: {
    // overridden
    _createChildControlImpl(id, hash) {
      var control;

      switch (id) {
        case "label":
          control = new ville.ui.basic.Label(this.getLabel());
          control.setAnonymous(true);
          this._add(control);
          break;

        case "icon":
          // Handle the union type for initial creation
          const iconVal = this.getIcon();
          if (iconVal instanceof ville.ui.core.Widget) {
            control = iconVal;
          } else {
            control = new ville.ui.basic.Image(iconVal);
          }
          control.setAnonymous(true);
          this._add(control);
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    /**
     * @lint ignoreReferenceField(_forwardStates)
     * @ai-todo Once done with Apperance integration, we need to decide if hovered should always be excluded because :hover is handled completly by css
     */
    _forwardStates: {
      disabled: true,
      hovered: true,
      pressed: true,
      focused: true
    },

    // property apply
    _applyLabel(value, old) {
      const label = this.getChildControl("label", true);
      if (label) {
        label.setValue(value);
      }
    },

    // property apply
    _applyIcon(value, old) {
      const icon = this.getChildControl("icon", true);
      if (icon) {
        // Handle the union type rule we established
        if (value instanceof ville.ui.core.Widget) {
          // Future logic to swap out the child control widget
        } else {
          icon.setSource(value);
        }
      }
    }

  }
});
