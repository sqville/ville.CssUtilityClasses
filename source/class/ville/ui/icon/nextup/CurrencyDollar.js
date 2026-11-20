/**
 * body variable contains path svg from Iconify Icon Sets
 * 
 * Iconify:
 * https://icon-sets.iconify.design/
 * 
 * Iconify's Tabler icons:
 * https://github.com/iconify/icon-sets/blob/master/json/tabler.json
 * 
 * Tabler icon in json - "currency-dollar"
 */
qx.Class.define("ville.ui.icon.CurrencyDollar", {
    extend: ville.ui.icon.Abstract,

    construct() {

        // Taken from Iconify icon-set tabler.json sun.body value
		var body = "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16.7 8A3 3 0 0 0 14 6h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1-2.7-2M12 3v3m0 12v3\"/>";

        this.__fulliconmarkup = `<svg 
            viewBox="${this.getViewBox()}" 
            xmlns="${this.getXmlns()}" 
            fill="${this.getFill()}" 
            stroke-width="${this.getStrokeWidth()}" 
            stroke="${this.getStroke()}" 
            stroke-linecap="${this.getStrokeLinecap()}" 
            stroke-linejoin="${this.getStrokeLinejoin()}">
                ${body}
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
