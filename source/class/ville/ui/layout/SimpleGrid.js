/**
 * Base Container
 * external(mantine/core/styles/SimpleGrid.css)
 */
qx.Class.define("ville.ui.layout.SimpleGrid", {
    
    extend: ville.ui.core.Box,

    construct(component) {
        
        super(component);

    },

    properties: {

        // overridden
        appearance: {
            refine: true,
            init: "simplegrid"
        }
    }

  });
