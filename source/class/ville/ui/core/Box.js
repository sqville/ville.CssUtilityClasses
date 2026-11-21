/**
 * Used as a base component or as a replacement for HTML elements
 * 
 */
qx.Class.define("ville.ui.core.Box", {
    
    extend: ville.ui.core.Widget,
    include: [ville.ui.core.MChildrenHandling],

    construct(component) {

        if (component) {
            this.__contentElementTag = component;
        }

        super();
        
    },

    members: {
        /**
         * Root HTML tag name.
         *
         * @private
         */
        __contentElementTag: "div",

        // overridden
        _createContentElement() {
            return new ville.html.Element(this.__contentElementTag);
        }

    }

  });
