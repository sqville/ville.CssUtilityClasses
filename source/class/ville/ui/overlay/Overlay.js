/**
 * Overlay
 */
qx.Class.define("ville.ui.overlay.Overlay", {
    
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
            init: "affix"
        }

    }

  });
