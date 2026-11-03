/**
 * 
 * external(mantine/core/styles/Paper.css)
 */
qx.Class.define("ville.ui.core.Paper", {
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct(component) {

        if (component != null)
            this._contentElementTag = component;
        
        super();

    },

    properties: {

        // overridden
        appearance: {
            refine: true,
            init: "paper"
        }

    }

  });
