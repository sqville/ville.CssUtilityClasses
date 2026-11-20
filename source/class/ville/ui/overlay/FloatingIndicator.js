/**
 * 
 */
qx.Class.define("ville.ui.overlay.FloatingIndicator", {
    
    extend: ville.ui.core.Box,

    construct(component) {

        super(component);

    },

    properties: {

        // overridden
        appearance: {
            refine: true,
            init: "floatingindicator"
        }

    }

  });
