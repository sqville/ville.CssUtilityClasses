/**
 * This is the root widget for Ville UI applications with an
 * "application" like behaviour.
 *
 *
 * @require(qx.event.handler.Window)
 * @require(qx.event.handler.Focus)
 * @require(qx.event.handler.Keyboard)
 * @require(qx.event.handler.Mouse)
 * @require(qx.event.handler.Pointer)
 * @require(qx.event.handler.Touch)
 * @require(qx.event.handler.Gesture)
 * 
 */
qx.Class.define("ville.ui.root.Application", {
  extend: ville.ui.root.Abstract,

  construct(doc) {
    this.__window = qx.dom.Node.getWindow(doc);
    this.__doc = doc;

    super();

    this.getContentElement();

    // RESTORED: Activates the global focus manager for this root
    //qx.ui.core.FocusHandler.getInstance().connectTo(this);
  },

  members: {
    __window: null,
    __doc: null,

    _createContentElement() {
      var doc = this.__doc;

      // Hydration/Clean DOM approach: Bind directly to the document body
      // instead of creating an arbitrary child div.
      var root = new qx.html.Root(doc.body);

      // Store reference to the widget in the DOM element
      root.connectObject(this);

      return root;
    },

    // overridden
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

  destruct() {
    this.__window = this.__doc = null;
  }
});
