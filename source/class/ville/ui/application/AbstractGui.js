/**
 * Mode 3 abstract base class for GUI applications (`ville.ui.application.AbstractGui`),
 * decoupled from `qx.ui.core.queue.Manager`, `qx.bom.webfonts.*`, and legacy Qooxdoo
 * layout engines (`STRAT-BUILD-07`, `STRAT-CSS-04`).
 *
 * @ignore(FontFace)
 */
qx.Class.define("ville.ui.application.AbstractGui", {
  type: "abstract",
  extend: qx.core.Object,
  implement: [qx.application.IApplication],
  include: [ville.locale.MTranslation],

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

    /**
     * Initializes the active appearance theme, synchronizes `data-ville-app-type`
     * and `data-ville-theme` on `document.documentElement`, and mounts the root widget.
     */
    main() {
      const metaMgr = ville.ui.theme.manager.Meta.getInstance();
      metaMgr.initialize();

      if (typeof document !== "undefined" && document.documentElement) {
        const appType = qx.core.Environment.get("ville.appType") || "web";
        const cssEngine = qx.core.Environment.get("ville.cssEngine") || "mantine";
        const rootEl = document.documentElement;
        rootEl.setAttribute("data-ville-app-type", String(appType));
        rootEl.setAttribute("data-ville-theme", String(cssEngine));
      }

      this.__root = this._createRootWidget();
      if (typeof window !== "undefined" && !window.location.hash) {
        window.scrollTo(0, 0);
      }
    },

    /**
     * Returns the current color scheme (`"light"` or `"dark"`).
     *
     * @returns {"light"|"dark"}
     */
    getColorScheme() {
      return ville.ui.theme.manager.Meta.getInstance().getColorScheme();
    },

    /**
     * Sets the active color scheme (`"light"` or `"dark"`) across Mantine,
     * Obsidian, and shadcn/ui.
     *
     * @param {"light"|"dark"} scheme
     */
    setColorScheme(scheme) {
      ville.ui.theme.manager.Meta.getInstance().setColorScheme(scheme);
    },

    /**
     * Toggles the active color scheme between `"light"` and `"dark"`.
     *
     * @returns {"light"|"dark"} The newly activated color scheme.
     */
    toggleColorScheme() {
      return ville.ui.theme.manager.Meta.getInstance().toggleColorScheme();
    },

    /**
     * Flushes buffered virtual DOM nodes and signals `window.__VILLE_SSG_READY = true`.
     */
    finalize() {
      this.render();
      if (typeof window !== "undefined") {
        window.__VILLE_SSG_READY = true;
      }
    },

    /**
     * Synchronously flushes buffered `ville.html.Element` virtual DOM mutations
     * to the live DOM (invoked at boot completion via `finalize()`).
     */
    render() {
      ville.html.Element.flush();
    },

    /**
     * Returns a Promise that resolves via the browser's native CSS Font Loading API
     * (`document.fonts.ready`) once all active web fonts have finished loading and
     * layout metrics are stable (`STRAT-CSS-04`, replacing `qx.bom.webfonts.*`).
     *
     * @returns {Promise<FontFaceSet|null>} Promise resolving when `document.fonts.ready` settles.
     */
    whenFontsReady() {
      if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
        return document.fonts.ready;
      }
      return Promise.resolve(null);
    },

    /**
     * Dynamically loads and registers a web font family using the native W3C `FontFace`
     * API (`STRAT-CSS-04`).
     *
     * @param {string} family Font family name.
     * @param {string|BufferSource} source CSS `url(...)` string or binary font buffer.
     * @param {FontFaceDescriptors} [descriptors] Optional weight/style/display descriptors.
     * @returns {Promise<FontFace|null>} Loaded `FontFace` instance.
     */
    async loadFont(family, source, descriptors) {
      if (
        typeof FontFace === "undefined" ||
        typeof document === "undefined" ||
        !document.fonts
      ) {
        return null;
      }
      const face = new FontFace(
        family,
        source,
        Object.assign({ display: "swap" }, descriptors || {})
      );
      const loaded = await face.load();
      document.fonts.add(loaded);
      return loaded;
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
