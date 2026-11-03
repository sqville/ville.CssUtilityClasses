/**
 * Used as a base component or as a replacement for HTML elements
 * 
 */
qx.Class.define("ville.ui.core.Box", {
    
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct(component) {

        if (component != null)
            this._contentElementTag = component;

        super();
        
    }

  });
