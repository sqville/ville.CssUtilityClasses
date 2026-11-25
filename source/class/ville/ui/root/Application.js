/**
 * Root application widget for Mode 3 (`ville.ui.*`) standalone applications.
 *
 * Mounts a `ville.html.Root` wrapper on a dedicated `<div id="ville-app">` element
 * inside `document.body` (reusing an existing `#ville-app` container from
 * `boot/index.html`, SSG, or Node.js SSR when present).
 *
 * @example
 * const root = new ville.ui.root.Application(document);
 * root.add(new ville.ui.form.Button("Click me"));
 */
qx.Class.define("ville.ui.root.Application", {
  extend: ville.ui.root.Abstract,

  /**
   * Creates a new application root bound to the target DOM `Document`.
   *
   * @param {Document} doc Browser `document` object hosting the application.
   */
  construct(doc) {
    this.__doc = doc;

    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    // Eagerly materialize and bind the ville.html.Root element
    this.getContentElement();
  },

  members: {
    /** @type {Document|null} @private */
    __doc: null,

    /**
     * Creates or binds the root `ville.html.Root` element mounted on the
     * `<div id="ville-app">` container inside `document.body`.
     *
     * @this {ville.ui.root.Application}
     * @returns {ville.html.Root} Root HTML element wrapper.
     * @protected
     */
    _createContentElement() {
      const doc = /** @type {Document} */ (this.__doc);

      let elem = doc.getElementById("ville-app");
      if (!elem) {
        elem = doc.createElement("div");
        elem.id = "ville-app";
        doc.body.appendChild(elem);
      }

      const root = new ville.html.Root(elem);
      root.connectObject(this);

      ville.html.Element.flush();

      return root;
    },

    /**
     * Removes the root DOM node and disposes the root widget instance.
     *
     * @this {ville.ui.root.Application}
     */
    destroy() {
      if (this.isDisposed()) {
        return;
      }

      const domEl = this.getContentElement().getDomElement();
      if (domEl) {
        domEl.remove();
      }
      super.destroy();
    }
  },

  /**
   * Releases references to the browser `Document` object.
   */
  destruct() {
    this.__doc = null;
  }
});
