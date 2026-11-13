qx.Class.define("ville.ui.icon.AbstractOldNew", {
  extend: qx.ui.core.Widget,
  type: "abstract",

  construct(pathMarkup) {
    // Store initial paths to be used during element creation
    this.__initialPathMarkup = pathMarkup || "";
    super();
  },

  properties: {
    xmlns: {
      check: "String",
      init: "http://www.w3.org/2000/svg",
      nullable: false
    },
    viewBox: {
      check: "String",
      init: "0 0 24 24", // Tabler default, override in Fluent classes to "0 0 20 20"
      apply: "_applyViewBox",
      nullable: false
    },
    /**
     * The inner `<path>`, `<circle>`, etc. tags of the SVG.
     */
    pathMarkup: {
      check: "String",
      apply: "_applyPathMarkup",
      nullable: true
    }
  },

  members: {
    __initialPathMarkup: null,

    // 1. Create a pure <svg> root element with no wrapper <div>
    _createContentElement() {
      const viewBox = this.getViewBox();
      const xmlns = this.getXmlns();
      
      // Inherit color from the parent Button automatically via currentColor
      const markup = `<svg xmlns="${xmlns}" viewBox="${viewBox}" fill="currentColor" stroke="none">
                        ${this.__initialPathMarkup}
                      </svg>`;

      const el = new qx.html.Element();
      el.useMarkup(markup);
      
      // Free up memory immediately
      this.__initialPathMarkup = null; 
      
      return el;
    },

    // 2. High-performance visual updates (e.g., changing from regular to filled shape)
    _applyPathMarkup(value, old) {
      const domEl = this.getContentElement().getDomElement();
      if (domEl) {
        // Only update the inner paths, leaving the SVG wrapper intact
        domEl.innerHTML = value;
      } else {
        this.__initialPathMarkup = value;
      }
    },

    _applyViewBox(value, old) {
      const el = this.getContentElement();
      if (el) el.setAttribute("viewBox", value);
    },

    // Allow assigning mantine utility classes directly to the SVG
    _applyCssUtilityClass(value, old) {
      const el = this.getContentElement();
      if (el) el.setAttribute("class", value);
    }
  }
});
