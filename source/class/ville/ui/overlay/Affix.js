/**
 * 
 */
qx.Class.define("ville.ui.overlay.Affix", {
    
    extend: ville.ui.core.Box,

    construct(component) {

        super(component);

    },

    properties: {

        // overridden
        appearance: {
            refine: true,
            init: "affix"
        }

    }

  });
