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
        /**
         * Appearance selector ID resolved against the active theme (defaults to `"button"`)[span_83](start_span)[span_83](end_span).
         */
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
