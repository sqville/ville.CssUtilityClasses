/**
 * Abstract shared base class for Mode 3 root widgets (`ville.ui.root.*`).
 *
 * Extends `ville.ui.core.Widget` directly and includes `ville.ui.core.MChildrenHandling`
 * to expose the public container API (`add`, `addAt`, `addBefore`, `addAfter`,
 * `remove`, `removeAt`, `removeAll`, `getChildren`, `hasChildren`, `indexOf`)
 * for mounting top-level widgets without legacy layout or focus-handler queues.
 */
qx.Class.define("ville.ui.root.Abstract", {
  type: "abstract",
  extend: ville.ui.core.Widget,
  include: [ville.ui.core.MChildrenHandling],

  /**
   * Initializes the abstract root widget.
   */
  construct() {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();
  },

  properties: {
    /**
     * Appearance selector ID for the root container (defaults to `"root"`).
     */
    appearance: {
      refine: true,
      init: "root"
    },

    /**
     * Whether the root widget and its subtree are enabled.
     */
    enabled: {
      refine: true,
      init: true
    }
  },

  members: {
    /**
     * Identifies this widget as a root container in the widget hierarchy.
     *
     * @returns {boolean} Always `true` for root widgets.
     */
    isRootWidget() {
      return true;
    }
  }
});
