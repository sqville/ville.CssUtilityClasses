/**
 * Mode 3 abstract base class for GUI applications (`ville.ui.application.AbstractGui`),
 * decoupled from `qx.ui.core.queue.Manager` and legacy Qooxdoo layout engines.
 */
qx.Class.define("ville.ui.application.AbstractGui", {
  type: "abstract",
  extend: qx.core.Object,
  implement: [qx.application.IApplication],
  include: [qx.locale.MTranslation],

  members: {
    /** @type {ville.ui.core.Widget|null} The root widget */
    __root: null,

    /**
     * Creates the root widget. Subclasses must override this method.
     *
     * @returns {ville.ui.core.Widget} The root widget.
     * @protected
     */
    _createRootWidget() {
      throw new Error("Abstract method call: _createRootWidget()");
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
      ville.ui.theme.manager.Meta.getInstance().initialize();
      
      this.__root = this._createRootWidget();
      window.scrollTo(0, 0);
    },

    // interface method
    finalize() {
      this.render();
    },

    /**
     * Synchronously flushes buffered `ville.html.Element` virtual DOM mutations
     * to the live DOM (invoked at boot completion via `finalize()`).
     */
    render() {
      ville.html.Element.flush();
    },

    /**
     * Called before the application closes.
     *
     * @param {string} [val] Optional unload value.
     * @returns {string|undefined} Optional browser confirmation prompt text.
     */
    close(val) {},

    // interface method
    terminate() {}
  },

  destruct() {
    this._disposeObjects("__root");
  }
});
