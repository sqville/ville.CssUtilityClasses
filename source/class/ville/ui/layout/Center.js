/**
 * Center
 * 
 */
qx.Class.define("ville.ui.layout.Center", {    
    extend: ville.ui.core.Box,

    construct(component) {

        super(component);

    },

    properties: {

        appearance: {
            refine: true,
            init: "layout-center"
        },

        inline: {
            check: "Boolean",
            nullable: true,
            themeable: true,
            apply: "_applyInline"
        }

    },

    members: {
        /**
         * Property apply handler for `inline`.
         *
         * @param {string|null} value New inline token.
         * @param {string|null} old Previous inline token.
         * @protected
         */
        _applyInline(value, old) {
            value ? this.addState("inline") : this.removeState("inline");
        }

    }

  });
