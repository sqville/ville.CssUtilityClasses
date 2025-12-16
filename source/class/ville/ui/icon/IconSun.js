qx.Class.define("ville.ui.icon.IconSun", {
    extend: ville.ui.icon.Abstract,

    construct() {
        
        var paths = `<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
        <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"></path>`;

        this.__fulliconmarkup = `<svg 
        class="villeuilinkicon" 
        viewBox="${this.getViewBox()}" 
        xmlns="${this.getXmlns()}" 
        fill="${this.getFill()}" 
        stroke-width="${this.getStrokeWidth()}">
            ${paths}
        </svg>`;
        
        super();
    },

    members: {

        // overridden
        _createContentElement() {
            var thiselem = new qx.html.Element();
            thiselem.useMarkup(this.__fulliconmarkup);
            this.__fulliconmarkup = null;  
            return thiselem;
        }
    }
    
  });
