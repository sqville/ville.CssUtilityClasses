/**
 * Mode 3 CSS-driven Divider widget (`ville.ui.core.Divider`) that renders a
 * horizontal or vertical separator with an optional centered, left-, or
 * right-aligned `ville.ui.basic.Label` child control.
 *
 * @example
 * const divider = new ville.ui.core.Divider("OR");
 * divider.setLabelPosition("center");
 * divider.setVariant("dashed");
 */
qx.Class.define("ville.ui.core.Divider", {
  extend: ville.ui.core.Widget,

  /**
   * Creates a new Divider widget instance.
   *
   * @param {string|null} [label] Optional divider label text.
   */
  construct(label) {
    super();

    this.setAriaRole("separator");

    this.initOrientation();
    this.initVariant();
    this.initSize();
    this.initSpacing();
    this.initLabelPosition();

    if (label != null) {
      this.setLabel(label);
    }
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"divider"`).
     */
    appearance: {
      refine: true,
      init: "divider"
    },

    /**
     * Optional plain-text or localized label displayed along the divider line.
     *
     * @type {string|null}
     */
    label: {
      check: "String",
      apply: "_applyLabel",
      nullable: true,
      event: "changeLabel"
    },

    /**
     * Horizontal alignment of the divider label (`"left"`, `"center"`, or `"right"`).
     */
    labelPosition: {
      init: "center",
      check: ["left", "center", "right"],
      apply: "_applyLabelPosition",
      themeable: true,
      nullable: true,
      event: "changeLabelPosition"
    },

    /**
     * Divider axis orientation (`"horizontal"` or `"vertical"`).
     */
    orientation: {
      init: "horizontal",
      check: ["horizontal", "vertical"],
      apply: "_applyOrientation",
      themeable: true,
      nullable: false,
      event: "changeOrientation"
    },

    /**
     * Border stroke style modifier (`"dashed"`, `"dotted"`, or `null` for solid).
     */
    variant: {
      init: null,
      check: ["dashed", "dotted"],
      apply: "_applyVariant",
      themeable: true,
      nullable: true,
      event: "changeVariant"
    },

    /**
     * Divider line thickness scale (`"xs"`–`"xl"`).
     */
    size: {
      init: "xs",
      check: ["xs", "sm", "md", "lg", "xl"],
      apply: "_applySize",
      nullable: true,
      themeable: true,
      event: "changeSize"
    },

    /**
     * Outer block/inline margin spacing scale (`"xs"`–`"xl"`).
     */
    spacing: {
      init: "xs",
      check: ["xs", "sm", "md", "lg", "xl"],
      apply: "_applySpacing",
      nullable: true,
      themeable: true,
      event: "changeSpacing"
    }
  },

  members: {
    /**
     * Instantiates internal sub-controls (`"label"` -> `ville.ui.basic.Label`).
     *
     * @param {string} id Sub-control identifier.
     * @param {Record<string, any>} [hash] Optional creation hints.
     * @returns {ville.ui.core.Widget|null} Created child control.
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control = null;

      switch (id) {
        case "label": {
          const initialText = this.getLabel();
          control = new ville.ui.basic.Label(initialText);
          control.setAnonymous(true);
          const pos = this.getLabelPosition();
          if (pos) {
            control.addState("position-" + pos);
          }
          this._add(control);
          break;
        }
      }

      return control || super._createChildControlImpl(id, hash);
    },

    /**
     * Property apply handler for `label`. Attaches or detaches the `"label"`
     * child control and toggles the `"withLabel"` widget state.
     *
     * @param {string|null} value New label text.
     * @protected
     */
    _applyLabel(value) {
      const hasLabel = value != null && value !== "";

      if (!hasLabel) {
        this.removeState("withLabel");
        const label = this.getChildControl("label", true);
        if (label) {
          label.setValue(null);
        }
      } else {
        this.addState("withLabel");
        const label = this.getChildControl("label");
        if (label) {
          label.setValue(value);
        }
      }
    },

    /**
     * Property apply handler for `labelPosition`. Synchronizes `"labelPosition-<value>"`
     * on the divider and `"position-<value>"` on the `"label"` child control.
     *
     * @param {"left"|"center"|"right"|null} value New label alignment.
     * @param {"left"|"center"|"right"|null} old Previous label alignment.
     * @protected
     */
    _applyLabelPosition(value, old) {
      this._syncModifierState("labelPosition", value, old);

      const label = this.getChildControl("label", true);
      if (label) {
        label._syncModifierState("position", value, old);
      }
    },

    /**
     * Property apply handler for `orientation`. Synchronizes `"orientation-<value>"`
     * and updates `aria-orientation` when vertical.
     *
     * @param {"horizontal"|"vertical"} value New orientation.
     * @param {"horizontal"|"vertical"|undefined} old Previous orientation.
     * @protected
     */
    _applyOrientation(value, old) {
      this._syncModifierState("orientation", value, old);

      if (value === "vertical") {
        this.setAttribute("aria-orientation", "vertical");
      } else {
        this.removeAttribute("aria-orientation");
      }
    },

    /**
     * Property apply handler for `variant`. Synchronizes `"variant-<value>"`.
     *
     * @param {"dashed"|"dotted"|null} value New border variant.
     * @param {"dashed"|"dotted"|null} old Previous border variant.
     * @protected
     */
    _applyVariant(value, old) {
      this._syncModifierState("variant", value, old);
    },

    /**
     * Property apply handler for `size`. Synchronizes `"size-<value>"`.
     *
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} value New thickness token.
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} old Previous thickness token.
     * @protected
     */
    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    /**
     * Property apply handler for `spacing`. Synchronizes `"spacing-<value>"`.
     *
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} value New margin spacing token.
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} old Previous margin spacing token.
     * @protected
     */
    _applySpacing(value, old) {
      this._syncModifierState("spacing", value, old);
    }
  },

  /**
   * Disposes the `"label"` child control on widget destruction.
   */
  destruct() {
    this._disposeChildControl("label");
  }
});
