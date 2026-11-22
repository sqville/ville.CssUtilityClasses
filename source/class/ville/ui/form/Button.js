/**
 * Mode 3 standard action Button (`ville.ui.form.Button`).
 *
 * @example
 * const btn = new ville.ui.form.Button("Save Changes", new ville.ui.icon.tabler.Check());
 * btn.setVariant("filled");
 * btn.setSize("md");
 * btn.addListener("execute", () => console.log("Saved!"));
 */
qx.Class.define("ville.ui.form.Button", {
  extend: ville.ui.core.AbstractButton,

  /**
   * Creates a new Button instance.
   *
   * @param {string|null} [label] Button text caption.
   * @param {string|ville.ui.core.Widget|null} [icon] Image URI string or `ville.ui.core.Widget` icon instance.
   * @param {ville.ui.command.Command|null} [command] Command instance bound via `ville.ui.core.MExecutable`.
   */
  construct(label, icon, command) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(label, icon, command);
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"button"`).
     */
    appearance: {
      refine: true,
      init: "button"
    },

    /**
     * Visual button style variant.
     */
    variant: {
      init: "default",
      check: ["default", "filled", "light", "outline", "subtle", "transparent", "white"],
      apply: "_applyVariant",
      themeable: true,
      event: "changeVariant"
    },

    /**
     * Button size scale (`"xs"`–`"xl"` or `"compact-xs"`–`"compact-xl"`).
     */
    size: {
      check: [
        "xs", "sm", "md", "lg", "xl",
        "compact-xs", "compact-sm", "compact-md", "compact-lg", "compact-xl"
      ],
      nullable: true,
      themeable: true,
      apply: "_applySize"
    },

    /**
     * Border radius scale (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`).
     */
    radius: {
      check: ["xs", "sm", "md", "lg", "xl"],
      nullable: true,
      themeable: true,
      apply: "_applyRadius"
    },

    /**
     * Whether the button expands to fill 100% of its container width (`data-block="true"`).
     */
    fullWidth: {
      check: "Boolean",
      init: false,
      themeable: true,
      apply: "_applyFullWidth"
    },

    /**
     * Placement of the icon relative to the label (`"left"` or `"right"`).
     */
    iconPosition: {
      check: ["left", "right"],
      init: "left",
      themeable: true,
      apply: "_applyIconPosition"
    },

    /**
     * Whether the button is in an active loading state.
     */
    loading: {
      check: "Boolean",
      init: false,
      themeable: true,
      apply: "_applyLoading",
      event: "changeLoading"
    }
  },

  members: {
    /**
     * @override
     * @this {ville.ui.form.Button}
     * @returns {boolean} `true` if `iconPosition === "right"`.
     * @protected
     */
    _isIconRight() {
      return this.getIconPosition() === "right";
    },

    /**
     * @override
     * @this {ville.ui.form.Button}
     * @returns {boolean} `true` when disabled or loading.
     * @protected
     */
    _isInteractionLocked() {
      return !this.getEnabled() || this.getLoading();
    },

    /**
     * Property apply handler for `variant`.
     *
     * @this {ville.ui.form.Button}
     * @param {string|null} value New variant.
     * @param {string|null} old Previous variant.
     * @protected
     */
    _applyVariant(value, old) {
      this._syncModifierState("variant", value, old);
    },

    /**
     * Property apply handler for `size`.
     *
     * @this {ville.ui.form.Button}
     * @param {string|null} value New size token.
     * @param {string|null} old Previous size token.
     * @protected
     */
    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    /**
     * Property apply handler for `radius`.
     *
     * @this {ville.ui.form.Button}
     * @param {string|null} value New radius token.
     * @param {string|null} old Previous radius token.
     * @protected
     */
    _applyRadius(value, old) {
      this._syncModifierState("radius", value, old);
    },

    /**
     * Property apply handler for `fullWidth`.
     *
     * @this {ville.ui.form.Button}
     * @param {boolean} value Whether full-width block mode is enabled.
     * @protected
     */
    _applyFullWidth(value) {
      value ? this.addState("fullWidth") : this.removeState("fullWidth");
    },

    /**
     * Property apply handler for `iconPosition`.
     *
     * @this {ville.ui.form.Button}
     * @param {"left"|"right"} value New icon position.
     * @param {"left"|"right"} old Previous icon position.
     * @protected
     */
    _applyIconPosition(value, old) {
      this._syncModifierState("iconPosition", value, old);
    },

    /**
     * Property apply handler for `loading`. Toggles `"loading"` state
     * and locks interactive disabled attributes.
     *
     * @this {ville.ui.form.Button}
     * @param {boolean} value Whether loading state is active.
     * @protected
     */
    _applyLoading(value) {
      if (value) {
        this.addState("loading");
      } else {
        this.removeState("loading");
      }
      this._syncDisabledState();
    }
  }
});
