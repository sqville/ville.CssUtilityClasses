/**
 * Concrete Mode 3 standalone application base class (`ville.ui.application.Standalone`)[span_181](start_span)[span_181](end_span).
 *
 * Sets `ville.cssLayout` to `true`, registers global CSS Anchor Positioning rules
 * for `.ville-popover` floating elements, and mounts a pure DOM root widget
 * (`ville.ui.root.Application`) bound directly to `document.body` without loading
 * Qooxdoo's legacy layout engine[span_182](start_span)[span_182](end_span).
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

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * Initializes Mode 3 runtime environment rules, injects native CSS Anchor
     * Positioning styles for `.ville-popover` overlays, and delegates root
     * creation to `super.main()`[span_183](start_span)[span_183](end_span).
     */
    main() {
      /* Commented out for Full ville.ui.core.Widget testing (Mode 2 patches)[span_184](start_span)[span_184](end_span)
        qx.Class.patch(qx.ui.core.LayoutItem, ville.cssuc.patch.MLayoutItem);
        qx.Class.patch(qx.ui.core.queue.Layout, ville.cssuc.patch.MLayoutQueue);
        qx.Class.patch(qx.ui.core.Widget, ville.cssuc.patch.MWidget);
        qx.Class.patch(qx.html.Label, ville.cssuc.patch.MLabel);
      */

      if (qx.core.Environment.get("ville.cssEngine") == "mantine") {
        // Hook for optional Mantine-specific application initialization[span_185](start_span)[span_185](end_span)
      }

      // Inject CSS Anchor Positioning rules for HTML Popover API overlays[span_186](start_span)[span_186](end_span)
      var rules = [
        "margin: 0;",
        "inset: auto;",
        "position-area: var(--ville-popover-position-area, bottom center);",
        "position-try-fallbacks: var(--ville-popover-position-try-fallbacks, flip-block);",
        "position-try-order: var(--ville-popover-position-try-order, most-height);"
      ];
      var cssstr = rules.join(" ");
      qx.ui.style.Stylesheet.getInstance().addRule(".ville-popover", cssstr);

      // Call super class[span_187](start_span)[span_187](end_span)
      super.main();
    },

    /**
     * Instantiates the Mode 3 `ville.ui.root.Application` bound to `document`[span_188](start_span)[span_188](end_span).
     *
     * @returns {ville.ui.root.Application} Application root widget[span_189](start_span)[span_189](end_span).
     * @protected
     */
    _createRootWidget() {
      var rootwidget = new ville.ui.root.Application(document);
      return rootwidget;
    }
  }
});
