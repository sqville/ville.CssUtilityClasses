/**
 * Mode 3 Icon-Only Action Button (`ville.ui.form.ActionIcon` — `STRAT-WIDGET-03`, `STRAT-WIDGET-07`).
 *
 * Extends `ville.ui.form.Button` with `appearance: "actionicon"` and `show: "icon"`,
 * rendering a single semantic `<button type="button">` containing a native `<svg>`
 * or Iconify `<span>` icon element with **zero child `Widget` or `InnerWrapper` overhead**.
 *
 * @example
 * const settingsBtn = new ville.ui.form.ActionIcon("CHECK", "subtle");
 * settingsBtn.setAriaLabel("Confirm");
 */
qx.Class.define("ville.ui.form.ActionIcon", {
  extend: ville.ui.form.Button,

  /**
   * @param {string|Object|ville.html.Element|null} [icon] Built-in glyph key (`"CHECK"`), Iconify class (`"i-tabler-settings"`), or `<svg>`.
   * @param {"default"|"filled"|"light"|"outline"|"subtle"|"transparent"|"white"} [variant="default"] Visual variant.
   * @param {ville.ui.command.Command|null} [command] Optional bound command.
   */
  construct(icon, variant, command) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(null, icon, command);

    this.initShow();
    if (variant) {
      this.setVariant(variant);
    }
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
     * Accessible `aria-label` required for icon-only buttons.
     */
    ariaLabel: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyAriaLabel"
    }
  },

  members: {
    _applyAriaLabel(value) {
      this._setAttribute("aria-label", value);
    }
  }
});
