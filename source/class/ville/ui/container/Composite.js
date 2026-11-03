/**
 * 
 */
qx.Class.define("ville.ui.container.Composite", {
    
    extend: qx.ui.container.Composite,

    construct(component) {
        
        if (component != null)
            this._contentElementTag = component;

        super();

    }

  });
