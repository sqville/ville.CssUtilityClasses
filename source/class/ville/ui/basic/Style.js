/**
 * Contains style information for a document, or part of a document.
 * It contains CSS, which is applied to the contents of the document containing the <style> element.
 */
qx.Class.define("ville.ui.basic.Style", {
    
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    /**
     * @param {boolean | null} [blocking] - If true, adds blocking="render" attribute. Does not add the attribute if false or null/undefined.
     */
    construct(blocking) {
        
        this._contentElementTag = "style";

        super();

        if (blocking === true)
            this.setAttribute("blocking", "render");

    }

  });
