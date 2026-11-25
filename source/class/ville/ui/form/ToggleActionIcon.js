/**
 * Mode 3 Icon-Only Toggle Button (`ville.ui.form.ToggleActionIcon` — `STRAT-WIDGET-03`, `STRAT-WIDGET-07`).
 *
 * Extends `ville.ui.form.ToggleButton` with `appearance: "actionicon"`, `show: "icon"`,
 * and automatic icon swapping between `trueIcon` (when `value === true`) and
 * `falseIcon` (when `value === false`) using `ville.ui.icon.Default` with zero
 * child `Widget` instance overhead.
 *
 * @example
 * const themeToggle = new ville.ui.form.ToggleActionIcon("SUN", "MOON", "default");
 * themeToggle.addListener("changeValue", (e) => { ... });
 */
qx.Class.define("ville.ui.form.ToggleActionIcon", {
  extend: ville.ui.form.ToggleButton,

  /**
   * @param {string|Object|ville.html.Element|null} [trueIcon] Icon displayed when `value === true`.
   * @param {string|Object|ville.html.Element|null} [falseIcon] Icon displayed when `value === false`.
   * @param {"default"|"filled"|"light"|"outline"|"subtle"|"transparent"|"white"} [variant="default"] Visual variant.
   */
  construct(trueIcon, falseIcon, variant) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(null, falseIcon || trueIcon, false);

    this.initShow();

    if (trueIcon !== undefined) {
      this.setTrueIcon(trueIcon);
    }
    if (falseIcon !== undefined) {
      this.setFalseIcon(falseIcon);
    }
    if (variant) {
      this.setVariant(variant);
    }

    this.__syncActiveIcon();
  },

  properties: {
    appearance: {
      refine: true,
      init: "actionicon"
    },

    show: {
      refine: true,
      init: "icon"
    },

    /**
     * Icon specification (`ville.ui.icon.Default` glyph key, Iconify class, or `<svg>`)
     * rendered when `value` is `true`.
     */
    trueIcon: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "__syncActiveIcon"
    },

    /**
     * Icon specification rendered when `value` is `false`.
     */
    falseIcon: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "__syncActiveIcon"
    }
  },

  members: {
    /**
     * @override
     * @param {boolean|null} value New toggle state.
     * @param {boolean|null} old Previous toggle state.
     * @protected
     */
    _applyValue(value, old) {
      super._applyValue(value, old);
      this.__syncActiveIcon();
    },

    /**
     * Updates the button's `icon` property to match the active boolean state.
     *
     * @private
     */
    __syncActiveIcon() {
      const nextIcon = this.getValue()
        ? this.getTrueIcon() || this.getFalseIcon()
        : this.getFalseIcon() || this.getTrueIcon();
      if (nextIcon != null) {
        this.setIcon(nextIcon);
      }
    }
  }
});
