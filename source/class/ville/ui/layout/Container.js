/**
 * Base Container
 */
qx.Class.define("ville.ui.layout.Container", {
    extend: qx.ui.core.Box,

    construct(component) {
        
        super(component);

    },

    properties: {

        appearance: {
            refine: true,
            init: "layout-container"
        }

    }

  });
