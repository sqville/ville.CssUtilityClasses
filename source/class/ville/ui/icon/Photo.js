qx.Class.define("ville.ui.icon.Photo", {
    
    extend: ville.ui.icon.Abstract,

    construct(size) {

        var paths = `<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M15 8h.01" />
            <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
            <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
            <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />`;

         this.__fulliconmarkup = `<svg 
            width="${size}" height="${size}"
            viewBox="${this.getViewBox()}" 
            xmlns="${this.getXmlns()}" 
            fill="${this.getFill()}"
            stroke-width="${this.getStrokeWidth()}" 
            stroke="${this.getStroke()}" 
            stroke-linecap="${this.getStrokeLinecap()}" 
            stroke-linejoin="${this.getStrokeLinejoin()}">
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
