/**
 * Used as a base component or as a replacement for HTML elements
 * 
 */
qx.Class.define("ville.ui.core.Box", {
    
    extend: ville.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct(component) {
        if (component) {
            this.__componenttag = component;
        }
        super();

        /*this.addListener("appear", () => {
            var elemDims = qx.bom.element.Dimension.getSize(this.getContentElement().getDomElement());
            this.setUserBounds(this.getBounds().left, this.getBounds().top, this.getBounds().width, elemDims.height);
        });*/
    },

    members: {

        __componenttag: "div",

        // overridden
        _createContentElement() {
            return new qx.html.Element(this.__componenttag);
        }
    }
  });
