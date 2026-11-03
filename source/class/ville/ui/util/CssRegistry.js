/**
 * Global registry ensuring stylesheets are injected exactly once.
 */
qx.Class.define("ville.ui.util.CssRegistry", {
  extend: qx.core.Object,
  type: "singleton",

  statics: {
    __loaded: new Set(),

    loadGroup(resourcePaths) {
        resourcePaths.forEach((resource) => {
            this.load(resource);
        });
    },

    /**
     * Includes a stylesheet file via qx.bom.Stylesheet.
     * @param {String} resourcePath - The namespaced resource path
     */
    load(resourcePath) {
      
      if (this.__loaded.has(resourcePath)) {
        return;
      }
      this.__loaded.add(resourcePath);

      // 2. Inject immediately
      const rm = qx.util.ResourceManager.getInstance();
      qx.bom.Stylesheet.includeFile(rm.toUri(resourcePath));
    }
  }
});
