/**
 * Mode 3 abstract base class for GUI applications (`ville.ui.application.AbstractGui`),
 * decoupled from `qx.ui.core.queue.Manager` and legacy Qooxdoo layout engines.
 *
 * @require(qx.core.Init)
 */
qx.Class.define("ville.ui.application.AbstractGui", {
  type: "abstract",
  extend: qx.core.Object,
  implement: [qx.application.IApplication],
  include: [qx.locale.MTranslation],

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /** @type {ville.ui.core.Widget|null} The root widget */
    __root: null,

    /**
     * Create the root widget. This method is abstract and must be overridden
     * by subclasses.
     *
     * @returns {ville.ui.core.Widget} The root widget.
     * @protected
     */
    _createRootWidget() {
      throw new Error("Abstract method call");
    },

    /**
     * Returns the application's root widget.
     *
     * @returns {ville.ui.core.Widget|null} The application's root widget.
     */
    getRoot() {
      return this.__root;
    },

    // interface method
    main() {
      // Initialize configured Meta/Appearance themes
      qx.theme.manager.Meta.getInstance().initialize();

      this.__root = this._createRootWidget();

      // Ensure initial viewport starts at top-left
      window.scrollTo(0, 0);
    },

    // interface method
    finalize() {
      this.render();
    },

    /**
     * Flushes buffered `qx.html.Element` virtual DOM mutations to the live DOM.
     */
    render() {
      qx.html.Element.flush();
    },

    /**
     * Called before the application closes.
     *
     * @param {string} [val] Optional unload value.
     * @returns {string|undefined} Optional browser confirmation prompt text.
     */
    close(val) {
      return undefined;
    },

    // interface method
    terminate() {
      // empty
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this._disposeObjects("__root");
  }
});
