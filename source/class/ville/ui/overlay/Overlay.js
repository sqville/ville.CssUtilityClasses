/**
 * Overlay
 * @external(mantine/core/styles/Overlay.css)
 */
qx.Class.define("ville.ui.overlay.Overlay", {
    
    extend: ville.ui.core.Widget,

    construct(component) {
        
        if (component) {
            this.__componenttag = component;
        }
        super();

        this.setCssUtilityClass("m_9814e45f mantine-Overlay-root");

    },

    members: {

        __componenttag: "div",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        }

    }
  });
