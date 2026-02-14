/**
 * @external(mantine/core/styles/Container.css)
 */
qx.Class.define("ville.ui.container.Composite", {
    
    extend: ville.ui.container.Composite,

    include: qx.ui.core.MWidget,

    construct(component) {
        
        if (component) {
            this.__componenttag = component;
        }
        
        super();

        this.setCssUtilityClass("m_7485cace mantine-Container-root");

    },

    members: {

        __componenttag: "div",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        }

    }
  });
