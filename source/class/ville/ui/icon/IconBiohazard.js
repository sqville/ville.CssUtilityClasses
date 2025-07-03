qx.Class.define("ville.ui.icon.IconBiohazard", {
    extend: ville.ui.icon.Abstract,

    construct(size) {

        var paths = `<path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M11.939 14c0 .173 .048 .351 .056 .533l0 .217a4.75 4.75 0 0 1 -4.533 4.745l-.217 0m-4.75 -4.75a4.75 4.75 0 0 1 7.737 -3.693m6.513 8.443a4.75 4.75 0 0 1 -4.69 -5.503l-.06 0m1.764 -2.944a4.75 4.75 0 0 1 7.731 3.477l0 .217m-11.195 -3.813a4.75 4.75 0 0 1 -1.828 -7.624l.164 -.172m6.718 0a4.75 4.75 0 0 1 -1.665 7.798" />`;

        this.__fulliconmarkup = `<svg 
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

        if (size) {
            this.setSize(size);
        }
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
