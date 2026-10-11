qx.Class.define("qxapp.theme.icon.phosphor.AbstractOld", {
    
    type: "abstract", 
  
    extend : qx.ui.embed.Html,

    /**
     * @param size {Integer} The size of the icon in px. Sets width and height to this value.
     * @param color {String?"currentColor"} TextColor of the svg icon. Default is set to currentColor.
     * @param iconstyle {String?"regular"} Default is regular. Other allowed value is filled.
     * @param title {String} If included, adds a title tag to the svg root tag. 
     */
    construct (size, color) {

        super();

        //this.setAllowStretchX(false);
        //this.setAllowStretchY(false);

        if (size != null) {
            this.setWidth(size);
            this.setHeight(size);
        }
    
        if (color != null)
            this.setTextColor(color);
        else
            this.getContentElement().setStyle("color", "currentColor");

    },

    properties: {

        xmlns: {
            check: "String",
            init: "http://www.w3.org/2000/svg",
            nullable: false,
        },

        viewBox: {
            check: "String",
            init: "0 0 256 256",
            apply: "_applyViewBox",
            nullable: false,
            themeable: true,
            event: "changeViewBox"
        },

        fill: {
            check: "String",
            init: "none",
            apply: "_applyFill",
            nullable: true,
            themeable: true,
            event: "changeFill"
        },

        strokeWidth: {
            check: "Number",
            init: "1",
            apply: "_applyStrokeWidth",
            nullable: true,
            themeable: true,
            event: "changeStrokeWidth"
        },

        stroke: {
            check: "String",
            init: "currentColor",
            nullable: true,
            themeable: true,
            event: "changeStroke"
        },

        strokeLinecap: {
            check: "String",
            init: "round",
            nullable: true,
            themeable: true,
            event: "changeStrokeLinecap"
        },

        strokeLinejoin: {
            check: "String",
            init: "round",
            nullable: true,
            themeable: true,
            event: "changeStrokeLinejoin"
        }

    },

    members: {

        __fulliconmarkup : null,

        _applyViewBox(value, old) {
            if (value)
                this.getContentElement().setAttribute("viewBox", value);

        },

        _applyFill(value, old) {
            if (value)
                this.getContentElement().setAttribute("fill", value);

        },

        _applyStrokeWidth(value, old) {
            if (value)
                this.getContentElement().setAttribute("stroke-width", value);

        },

        // overridden
        /*_applyCssUtilityClass(value, old) {
            if (value)
                this.getContentElement().getDomElement().setAttribute("class", value);
          
        }*/

    },

    destruct() {
        this._disposeObjects("__fulliconmarkup");
    }
  });
