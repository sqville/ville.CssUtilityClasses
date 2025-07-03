qx.Class.define("ville.ui.icon.Abstract", {
    extend: qx.ui.core.Widget,

    include: ville.ui.core.MWidget,

    type: "abstract",

    construct() {

        super();

        this._setLayout(new qx.ui.layout.Basic());

        this.setExcludeBoundsFromDom(true);
        this.setExcludeInlineStyles(["position"]); 
        this.setSelectable(null);
    },

    properties: {

        size: {
            check: "String",
            apply: "_applySize",
            nullable: true,
            themeable: true
        },

        xmlns: {
            check: "String",
            init: "http://www.w3.org/2000/svg",
            nullable: false,
        },

        viewBox: {
            check: "String",
            init: "0 0 24 24",
            apply: "_applyViewBox",
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

        _applyViewBox(value, old) {
            if (value) {
                this.setAttribute("viewBox", value);
            }
        },

        // overridden
        _applyCssUtilityClass(value, old) {
          var content = this.getContentElement().getDomElement();
          if (value) {
            content.setAttribute("class", value);
          }
        }

    }
  });
