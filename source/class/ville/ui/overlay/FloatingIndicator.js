/**
 * Base Container
 */
qx.Class.define("ville.ui.overlay.FloatingIndicator", {
    
    extend: qx.ui.core.Widget,

    construct(component) {
        
        if (component != null)
            this._contentElementTag = component;

        super();

    },

    properties: {

        // overridden
        appearance: {
            refine: true,
            init: "floatingindicator"
        }

    }

  });
