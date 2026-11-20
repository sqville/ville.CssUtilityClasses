/**
 * Used as a base component or as a replacement for HTML elements
 * 
 */
qx.Class.define("ville.ui.basic.Element", {
    
    extend: ville.ui.core.Widget,

    include: ville.ui.core.MChildrenHandling,

    construct(component) {
        
        //this._contentElementTag = component ?? "div";
        
        super();
    }
  });
