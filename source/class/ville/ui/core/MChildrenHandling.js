/**
 * Exposes public child-widget management methods (`add`, `addAt`, `addBefore`,
 * `addAfter`, `remove`, `removeAt`, `removeAll`, `getChildren`, `hasChildren`,
 * `indexOf`) for Mode 3 container widgets extending `ville.ui.core.Widget`.
 *
 * Unlike `qx.ui.core.MChildrenHandling`, this mixin omits `QxLayout` layout
 * option maps—child order in the widget tree corresponds directly to DOM
 * element order so CSS Flexbox and CSS Grid handle positioning natively.
 *
 * Can only be included in classes extending `ville.ui.core.Widget`.
 *
 * @example
 * qx.Class.define("ville.ui.container.Box", {
 *   extend: ville.ui.core.Widget,
 *   include: [ville.ui.core.MChildrenHandling]
 * });
 */
qx.Mixin.define("ville.ui.core.MChildrenHandling", {
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * Returns the ordered list of child widgets.
     * Note: Returns the internal array reference—do not mutate it in place.
     *
     * @returns {ville.ui.core.Widget[]} Ordered array of child widgets.
     */
    getChildren() {
      return this._getChildren();
    },

    /**
     * Checks whether this container currently holds one or more child widgets.
     *
     * @returns {boolean} `true` if at least one child widget is attached.
     */
    hasChildren() {
      return this._hasChildren();
    },

    /**
     * Returns the zero-based index of `child` within this container's children list,
     * or `-1` if `child` is not a direct child.
     *
     * @param {ville.ui.core.Widget} child Child widget to locate.
     * @returns {number} Zero-based child index, or `-1` if not found.
     */
    indexOf(child) {
      return this._indexOf(child);
    },

    /**
     * Appends a child widget to the end of this container and its root DOM element.
     * If `child` already belongs to a parent widget, it is detached first.
     *
     * @param {ville.ui.core.Widget} child Child widget to append.
     */
    add(child) {
      this._add(child);
    },

    /**
     * Inserts a child widget at the specified zero-based index in both the
     * widget hierarchy and the underlying `qx.html.Element`.
     *
     * @param {ville.ui.core.Widget} child Child widget to insert.
     * @param {number} index Zero-based insertion index.
     */
    addAt(child, index) {
      this._addAt(child, index);
    },

    /**
     * Inserts `child` immediately before an existing `before` child widget.
     *
     * @param {ville.ui.core.Widget} child Child widget to insert.
     * @param {ville.ui.core.Widget} before Existing sibling widget to insert before.
     */
    addBefore(child, before) {
      this._addBefore(child, before);
    },

    /**
     * Inserts `child` immediately after an existing `after` child widget.
     *
     * @param {ville.ui.core.Widget} child Child widget to insert.
     * @param {ville.ui.core.Widget} after Existing sibling widget to insert after.
     */
    addAfter(child, after) {
      this._addAfter(child, after);
    },

    /**
     * Removes a direct child widget from this container and detaches its DOM element.
     *
     * @param {ville.ui.core.Widget} child Child widget to remove.
     */
    remove(child) {
      this._remove(child);
    },

    /**
     * Removes and returns the child widget at the specified zero-based index.
     *
     * @param {number} index Zero-based index of the child widget to remove.
     * @returns {ville.ui.core.Widget|null} The removed child widget, or `null` if out of bounds.
     */
    removeAt(index) {
      return this._removeAt(index);
    },

    /**
     * Removes all child widgets from this container and returns them in an array.
     *
     * @returns {ville.ui.core.Widget[]} Array of removed child widgets.
     */
    removeAll() {
      return this._removeAll();
    }
  }
});
