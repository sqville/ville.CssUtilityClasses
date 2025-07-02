qx.Class.define("ville.ui.icon.Abstract", {
    extend: qx.ui.core.Widget,

    include: ville.ui.core.MWidget,

    type: "abstract",

    construct(size) {

        super();

        if (size) {
            this.setSize(size);
        }

        this.setExcludeBoundsFromDom(true);
        this.setExcludeInlineStyles(["position"]); 
        this.setSelectable(null);
    },

    properties: {

        size: {
            check: "String",
            apply: "_applySize",
            nullable: true,
            themeable: true,
            event: "changeSize"
        },

        viewBox: {
            check: "String",
            init: "0 0 24 24",
            nullable: false,
            themeable: true,
            event: "changeViewBox"
        },

        fill: {
            check: "String",
            init: "none",
            nullable: true,
            themeable: true,
            event: "changeFill"
        },

        strokeWidth: {
            check: "Number",
            init: "1",
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

        _applySize(value, old) {
            if (value) {
                this.setStyles({width : value, height : value});
            }
        },

        // overridden
        _createContentElement() {
            //var svgmarkup = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"></svg>';
            //var newelem = new qx.html.Element();
            //newelem.useMarkup(svgmarkup);
            //return newelem;
            return new qx.html.Element;
        }
    }
  });
