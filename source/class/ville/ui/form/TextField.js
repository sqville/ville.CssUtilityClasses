/**
 * Mode 3 TextField widget (`ville.ui.form.TextField`) rendering a single
 * semantic `<input type="text">` element via `ville.ui.form.core.Input`.
 *
 * @example
 * const username = new ville.ui.form.TextField("", "Enter username");
 * username.setRequired(true);
 */
qx.Class.define("ville.ui.form.TextField", {
  extend: ville.ui.form.core.Input,
  implement: [ville.ui.form.IStringForm],

  /**
   * Creates a new TextField (`<input type="text">`).
   *
   * @param {string|null} [value=""] Initial text value.
   * @param {string|null} [placeholder] Optional placeholder text.
   */
  construct(value = "", placeholder = null) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super("text", value, placeholder);
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
