/**
 * Mode 3 Test Form Renderer (`ville.ui.form.renderer.TestRenderer`).
 *
 * Renders the collected `ville.ui.form.Form` items and buttons into the target
 * semantic HTML structure:
 * ```html
 * <form>
 *   <section>
 *     <h2>Welcome</h2>
 *     <fieldset>
 *       <legend>Mock Login</legend>
 *       <label>Username <input type="text" /></label>
 *       <label>Password <input type="password" /></label>
 *     </fieldset>
 *   </section>
 *   <section>
 *     <button />
 *   </section>
 * </form>
 * ```
 */
qx.Class.define("ville.ui.form.renderer.TestRenderer", {
  extend: ville.ui.form.renderer.AbstractVStackRenderer,

  /**
   * @param {ville.ui.form.Form} form The form to render.
   */
  construct(form) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(form);
  },

  members: {
    // overridden
    _onFormChange() {
      super._onFormChange();
    },

    /**
     * Add a group of form items with the corresponding names. The names are
     * displayed as labels inside a `<section>` and `<fieldset>`.
     *
     * @param {ville.ui.core.Widget[]} items An array of form items to render.
     * @param {string[]} names An array of names for the form items.
     * @param {string|null} [title] Optional title of the group you are adding.
     * @param {Array<Object>|null} [itemsOptions] Optional item options array.
     * @param {Object|null} [headerOptions] Optional group header options.
     */
    addItems(items, names, title, itemsOptions, headerOptions) {
      const itemsSection = new ville.ui.core.Box("section");
      if (title != null) {
        const isectionHeader = new ville.ui.typography.Title(2, title);
        itemsSection.add(isectionHeader);
      }

      const legendText =
        (headerOptions && headerOptions.legend) || "Field Set 1";
      const fieldset = new ville.ui.form.FieldSet(legendText);
      itemsSection.add(fieldset);

      for (let i = 0; i < items.length; i++) {
        const label = new ville.ui.form.Label(names[i]);
        this._labels.push(label);
        label.add(items[i]);
        fieldset.add(label);
      }
      this._add(itemsSection);
    },

    /**
     * Adds a button to the form renderer inside a `<section>`.
     *
     * @param {ville.ui.form.Button} button The button to add.
     * @param {Object|null} [options] Optional button options.
     */
    addButton(button, options) {
      const btnSection = new ville.ui.core.Box("section");
      btnSection.add(button);
      this._add(btnSection);
    }
  }
});
