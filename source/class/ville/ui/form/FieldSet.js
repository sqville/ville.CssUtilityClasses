/**
 * Mode 3 semantic `<fieldset>` container widget (`ville.ui.form.FieldSet`) with
 * an optional semantic `<legend>` child control (`"fieldset/legend"`).
 *
 * Routes `variant` (`"default"`, `"filled"`, `"unstyled"`) and `radius` (`"xs"`–`"xl"`)
 * through provider-independent widget states (`variant-*`, `radius-*`) and reflects
 * `enabled` to the native `<fieldset disabled>` attribute.
 *
 * @childControl legend {ville.ui.typography.Text} Semantic `<legend>` element.
 */
qx.Class.define("ville.ui.form.FieldSet", {
  extend: ville.ui.core.Box,

  /**
   * Creates a new FieldSet container.
   *
   * @param {string|null} [legend] Optional legend caption text.
   */
  construct(legend) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super("fieldset");

    this.initVariant();

    if (legend != null) {
      this.setLegend(legend);
    }
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"fieldset"`).
     */
    appearance: {
      refine: true,
      init: "fieldset"
    },

    /**
     * Visual fieldset variant (`"default"`, `"filled"`, or `"unstyled"`).
     */
    variant: {
      init: "default",
      check: ["default", "filled", "unstyled"],
      apply: "_applyVariant",
      themeable: true,
      event: "changeVariant"
    },

    /**
     * Optional `<legend>` caption text displayed at the top of the fieldset.
     */
    legend: {
      check: "String",
      apply: "_applyLegend",
      nullable: true,
      themeable: true,
      event: "changeLegend"
    },

    /**
     * Border radius scale (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`).
     */
    radius: {
      check: ["xs", "sm", "md", "lg", "xl"],
      nullable: true,
      themeable: true,
      apply: "_applyRadius",
      event: "changeRadius"
    }
  },

  members: {
    /**
     * States automatically forwarded from the fieldset to its `"legend"` child control
     * so `"fieldset/legend"` can adapt when `variant === "unstyled"` or `disabled`.
     *
     * @type {Record<string, boolean>}
     * @protected
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      disabled: true,
      "variant-unstyled": true
    },

    /**
     * Reflects `enabled` onto the native HTML `<fieldset disabled>` attribute,
     * which natively disables all descendant form controls in the browser.
     *
     * @override
     * @param {boolean} value Whether the fieldset is enabled.
     * @protected
     */
    _applyEnabled(value) {
      super._applyEnabled(value);
      this._setAttribute("disabled", value ? null : "disabled");
    },

    /**
     * Property apply handler for `variant`.
     *
     * @param {"default"|"filled"|"unstyled"|null} value New variant.
     * @param {"default"|"filled"|"unstyled"|null} old Previous variant.
     * @protected
     */
    _applyVariant(value, old) {
      this._syncModifierState("variant", value, old);
    },

    /**
     * Property apply handler for `radius`.
     *
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} value New radius token.
     * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} old Previous radius token.
     * @protected
     */
    _applyRadius(value, old) {
      this._syncModifierState("radius", value, old);
    },

    /**
     * Property apply handler for `legend`. Creates or updates the semantic
     * `<legend>` child control via `ville.ui.typography.Text#setText`.
     *
     * @param {string|null} value New legend caption.
     * @protected
     */
    _applyLegend(value) {
      if (value != null && value !== "") {
        const legend = /** @type {ville.ui.typography.Text} */ (
          this.getChildControl("legend")
        );
        legend.setText(value);
        legend.setVisibility("visible");
      } else {
        const legend = /** @type {ville.ui.typography.Text|null} */ (
          this.getChildControl("legend", true)
        );
        if (legend) {
          legend.setText("");
          legend.setVisibility("excluded");
        }
      }
    },

    /**
     * Instantiates the semantic `<legend>` child control (`"legend"`) at index `0`.
     *
     * @override
     * @param {string} id Child control identifier.
     * @param {Record<string, any>} [hash] Optional creation hints.
     * @returns {ville.ui.core.Widget|null} Created child control.
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control = null;

      switch (id) {
        case "legend":
          control = new ville.ui.typography.Text(this.getLegend() || "", "legend");
          this._addAt(control, 0);
          break;
      }

      return control || super._createChildControlImpl(id, hash);
    }
  }
});
