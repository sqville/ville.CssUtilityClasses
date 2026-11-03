/**
 * external(mantine/core/styles/Affix.css)
 */
qx.Class.define("ville.ui.overlay.Affix", {
    
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
            init: "affix"
        }

    }

  });
