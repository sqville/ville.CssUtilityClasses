/**
 * Horizontal flex layout
 * 2/10/2026 - removed external call out to "mantine/core/styles/Flex.css"
 * and replaced with addRule call. Too much overhead for one css class with one rule
 * 
 */
qx.Class.define("ville.ui.layout.Flex", {
    extend: qx.ui.core.Box,

    construct(component) {
        
        super(component);

    },

    properties: {

        appearance: {
            refine: true,
            init: "layout-flex"
        }

    }

  });
