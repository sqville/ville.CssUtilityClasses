/**
 * Stack Container
 */
qx.Class.define("ville.ui.container.Stack", {
    
    extend: qx.ui.container.Stack,

    include: ville.ui.core.MWidget,

    construct(component) {
        
        if (component) {
            this.__componenttag = component;
        }
        
        super();

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);

    },

    members: {

        __componenttag: "div",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        }

    }
  });
