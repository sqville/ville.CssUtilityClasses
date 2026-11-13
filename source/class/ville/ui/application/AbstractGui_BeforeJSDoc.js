/**
 * Abstract base class for GUI applications using qooxdoo widgets.
 *
 * @require(qx.core.Init)
 */
qx.Class.define("ville.ui.application.AbstractGui", {
  type: "abstract",
  extend: qx.core.Object,
  implement: [qx.application.IApplication],
  include: qx.locale.MTranslation,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /** @type {ville.ui.core.Widget} The root widget */
    __root: null,

    /**
     * Create the root widget. This method is abstract and must be overridden
     * by sub classes.
     *
     * @return {ville.ui.core.Widget} The root widget.
     */
    _createRootWidget() {
      throw new Error("Abstract method call");
    },

    /**
     * Returns the application's root widget.
     *
     * @return {ville.ui.core.Widget} The application's root widget.
     */
    getRoot() {
      return this.__root;
    },

    // interface method
    main() {
      // Initialize themes
      qx.theme.manager.Meta.getInstance().initialize();

      // Initialize tooltip manager
      
      // @ai-todo Consider removing since ville.ui uses Popover API
      //qx.ui.tooltip.Manager.getInstance();

      this.__root = this._createRootWidget();

      // make sure we start with a good scroll position
      window.scrollTo(0, 0);
    },

    // interface method
    finalize() {
      this.render();
    },

    /**
     * Updates the GUI rendering
     * @ai-todo Look into the need to have qx.ui.core.queue.Manager.flush();
     */
    render() {
      qx.ui.core.queue.Manager.flush();
    },

    // interface method
    close(val) {
      // empty
    },

    // interface method
    terminate() {
      // empty
    }
  }
});
