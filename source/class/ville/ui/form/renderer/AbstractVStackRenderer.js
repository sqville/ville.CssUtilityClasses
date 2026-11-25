/**
 * Abstract renderer for {@link ville.ui.form.Form}. This abstract renderer should
 * be the superclass of all form renderers. It takes the form, which is
 * supplied as constructor parameter and configures itself.
 *
 * Renders a semantic `<form>` root element via `ville.ui.layout.VStack`.
 */
qx.Class.define("ville.ui.form.renderer.AbstractVStackRenderer", {
  type: "abstract",
  extend: ville.ui.layout.VStack,
  implement: [ville.ui.form.IFormRenderer],

  /**
   * @param {ville.ui.form.Form} form The form to render.
   */
  construct(form) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(null, null, null, "form");

    this._labels = [];
    this._form = form;
    this._render();

    form.addListener("change", this._onFormChange, this);
  },

  members: {
    _names: null,
    _form: null,
    _labels: null,

    /**
     * Renders the form: adds the items and buttons.
     *
     * @protected
     */
    _render() {
      const groups = this._form.getGroups();
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        this.addItems(
          group.items,
          group.labels,
          group.title,
          group.options,
          group.headerOptions
        );
      }

      const buttons = this._form.getButtons();
      const buttonOptions = this._form.getButtonOptions();
      for (let i = 0; i < buttons.length; i++) {
        this.addButton(buttons[i], buttonOptions[i]);
      }
    },

    /**
     * Handler responsible for updating the rendered widget as soon as the
     * form changes.
     *
     * @protected
     */
    _onFormChange() {
      this._removeAll();
      for (let i = 0; i < this._labels.length; i++) {
        this._labels[i].dispose();
      }
      this._labels = [];

      this._render();
    },

    /**
     * Helper to bind the item's visibility to the label's visibility.
     *
     * @param {ville.ui.core.Widget} item The form element.
     * @param {ville.ui.form.Label} label The label for the form element.
     * @protected
     */
    _connectVisibility(item, label) {
      item.bind("visibility", label, "visibility");
    },

    // interface implementation
    addItems(items, names, title, itemsOptions, headerOptions) {
      throw new Error("Abstract method call");
    },

    // interface implementation
    addButton(button, options) {
      throw new Error("Abstract method call");
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this._names = null;
    if (this._form) {
      this._form.removeListener("change", this._onFormChange, this);
      this._form = null;
    }
  }
});
