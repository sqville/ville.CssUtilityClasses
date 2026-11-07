/**
 * Paper
 * Paper is the most basic ui component. 
 * Use it to create cards, dropdowns, modals and other components that require background with shadow
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
