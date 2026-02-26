/**
 * 
 */
qx.Class.define("ville.ui.container.Composite", {
    
    extend: qx.ui.container.Composite,

    include: ville.ui.core.MWidget,

    construct(layout, component) {
        
        if (component != null) {
            this.__componenttag = component;
        }

        this.setExcludeBoundsFromDom(true);

        if (layout != null)
            super(layout);
        else
            super();

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
