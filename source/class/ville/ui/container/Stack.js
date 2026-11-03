/**
 * Stack Container
 */
qx.Class.define("ville.ui.container.Stack", {
    
    extend: qx.ui.container.Stack,

    construct(component) {
        
        if (component != null)
            this._contentElementTag = component;
        
        super();

    }

  });
