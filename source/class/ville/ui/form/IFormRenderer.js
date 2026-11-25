/**
 * This interface defines the necessary features a form renderer should have.
 * Keep in mind that all renderers have to be widgets.
 */
qx.Interface.define("ville.ui.form.IFormRenderer", {
  members: {
    /**
     * Add a group of form items with the corresponding names. The names should
     * be displayed as hint for the user what to do with the form item.
     * The title is optional and can be used as grouping for the given form
     * items.
     *
     * @param items {ville.ui.core.Widget[]} An array of form items to render.
     * @param names {String[]} An array of names for the form items.
     * @param title {String?} A title of the group you are adding.
     * @param itemsOptions {Array?null} The added additional data.
     * @param headerOptions {Map?null} The options map as defined by the form
     *   for the current group header.
     */
    addItems(items, names, title, itemsOptions, headerOptions) {},

    /**
     * Adds a button to the form renderer.
     *
     * @param button {ville.ui.form.Button} A button which should be added to
     *   the form.
     * @param options {Map?null} The added additional data.
     */
    addButton(button, options) {}
  }
});
