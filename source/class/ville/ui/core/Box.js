/**
 * Fundamental container widget (`ville.ui.core.Box`) wrapping any semantic HTML
 * container tag (`"div"`, `"header"`, `"main"`, `"nav"`, `"section"`, `"article"`,
 * `"aside"`, `"footer"`) and supporting both declarative CSS themes and
 * Standards-Backed `QxLayout` layout managers (`setLayout(new Grid())`, `add(child, options)`).
 */
qx.Class.define("ville.ui.core.Box", {
  extend: ville.ui.core.Widget,
  include: [ville.ui.core.MChildrenHandling, ville.ui.core.MLayoutHandling],

  /**
   * @param {string|ville.ui.layout.Abstract} [componentOrLayout="div"] Root HTML tag name (e.g., `"header"`, `"main"`) or a `ville.ui.layout.Abstract` layout manager.
   * @param {Object<string, *>|ville.ui.layout.Abstract} [layoutOrProps] Optional layout manager or initial property bag.
   */
  construct(componentOrLayout, layoutOrProps) {
    let initialLayout = null;
    let initialProps = null;

    if (typeof componentOrLayout === "string") {
      this.__contentElementTag = componentOrLayout;
    } else if (
      componentOrLayout &&
      typeof componentOrLayout === "object" &&
      typeof componentOrLayout.connectToWidget === "function"
    ) {
      initialLayout = componentOrLayout;
    } else if (qx.lang.Type.isPojo(componentOrLayout)) {
      initialProps = componentOrLayout;
    }

    if (
      layoutOrProps &&
      typeof layoutOrProps === "object" &&
      typeof layoutOrProps.connectToWidget === "function"
    ) {
      initialLayout = /** @type {ville.ui.layout.Abstract} */ (layoutOrProps);
    } else if (qx.lang.Type.isPojo(layoutOrProps)) {
      initialProps = layoutOrProps;
    }

    // @ts-ignore
    super(initialProps);

    if (initialLayout) {
      this.setLayout(initialLayout);
    }
  },

  members: {
    /**
     * Root HTML tag name.
     *
     * @type {string}
     * @private
     */
    __contentElementTag: "div",

    // overridden
    _createContentElement() {
      return new ville.html.Element(this.__contentElementTag);
    }
  }
});
