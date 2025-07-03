qx.Class.define("ville.ui.icon.IconIndeterminate", {
    extend: ville.ui.icon.Abstract,

    construct() {

        //<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 6"

        var paths = `<rect 
            width="32" 
            height="6" 
            fill="currentColor" 
            rx="3">
        </rect>`;

        this.__fulliconmarkup = `<svg 
            viewBox="${this.getViewBox()}" 
            xmlns="${this.getXmlns()}" 
            fill="${this.getFill()}">
                ${paths}
        </svg>`;
        
        super();
        
    },

    members: {

        __fulliconmarkup : null,

        // overridden
        _createContentElement() {
            var thiselem = new qx.html.Element();
            thiselem.useMarkup(this.__fulliconmarkup);
            this.__fulliconmarkup = null;  
            return thiselem;
        }
    }
  });
