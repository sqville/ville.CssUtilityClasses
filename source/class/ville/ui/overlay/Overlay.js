/**
 * Overlay
 */
qx.Class.define("ville.ui.overlay.Overlay", {
    
    extend: ville.ui.core.Box,

    construct(component) {

        super(component);

    },

    properties: {

        // overridden
        appearance: {
            refine: true,
            init: "overlay"
        }

    }

  });
