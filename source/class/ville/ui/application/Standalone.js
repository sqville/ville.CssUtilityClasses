/**
 * Concrete Mode 3 standalone application base class (`ville.ui.application.Standalone`).
 *
 * Sets `ville.cssLayout` to `true` and mounts a pure DOM root widget
 * (`ville.ui.root.Application`) inside `<div id="ville-app">` without loading
 * Qooxdoo's legacy layout engine or DOM event handlers.
 *
 * @example
 * qx.Class.define("myapp.Application", {
 *   extend: ville.ui.application.Standalone,
 *   members: {
 *     main() {
 *       super.main();
 *       const btn = new ville.ui.form.Button("Hello Mode 3");
 *       this.getRoot().add(btn);
 *     }
 *   }
 * });
 */
qx.Class.define("ville.ui.application.Standalone", {
  extend: ville.ui.application.AbstractGui,

  environment: {
    "ville.cssLayout": true
  },

  members: {
    /**
     * Initializes Mode 3 runtime environment rules and delegates root
     * creation to `super.main()`.
     *
     * @this {ville.ui.application.Standalone}
     */
    main() {
      if (qx.core.Environment.get("ville.cssEngine") == "mantine") {
        // Hook for optional Mantine-specific application initialization
      }

      super.main();
    },

    /**
     * Instantiates the Mode 3 `ville.ui.root.Application` bound to `document`.
     *
     * @returns {ville.ui.root.Application} Application root widget.
     * @protected
     */
    _createRootWidget() {
      return new ville.ui.root.Application(document);
    }
  }
});
