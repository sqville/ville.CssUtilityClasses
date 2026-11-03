/**
 * Used as a base component or as a replacement for HTML elements
 */
qx.Class.define("ville.ui.basic.Image", {
    
    extend: qx.ui.basic.Image,

    construct(component) {
        
        this._contentElementTag = component ?? "img";

        super();

    }

  });
