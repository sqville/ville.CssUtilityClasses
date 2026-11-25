/**
 * Mode 3 PasswordField widget (`ville.ui.form.PasswordField`) rendering a single
 * semantic `<input type="password">` element via `ville.ui.form.core.Input`.
 *
 * @example
 * const password = new ville.ui.form.PasswordField("", "Enter password");
 * password.setRequired(true);
 */
qx.Class.define("ville.ui.form.PasswordField", {
  extend: ville.ui.form.core.Input,
  implement: [ville.ui.form.IStringForm],

  /**
   * Creates a new PasswordField (`<input type="password">`).
   *
   * @param {string|null} [value=""] Initial password value.
   * @param {string|null} [placeholder] Optional placeholder text.
   */
  construct(value = "", placeholder = null) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super("password", value, placeholder);
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"textfield"`).
     */
    appearance: {
      refine: true,
      init: "textfield"
    }
  }
});
