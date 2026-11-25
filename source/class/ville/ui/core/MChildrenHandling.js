/**
 * Exposes public child-widget management methods (`add`, `addAt`, `addBefore`,
 * `addAfter`, `remove`, `removeAt`, `removeAll`, `getChildren`, `hasChildren`,
 * `indexOf`) for Ville UI container widgets extending `ville.ui.core.Widget`.
 *
 * Supports BOTH:
 * 1. Qooxdoo `QxLayout` per-child layout options: `container.add(child, { flex: 1, row: 0, column: 1 })`
 * 2. Modern variadic child addition (`STRAT-BUILD-06`): `container.add(child1, child2, child3)`
 *    (returning `this` for method chaining).
 */
qx.Mixin.define("ville.ui.core.MChildrenHandling", {
  members: {
    /**
     * Returns the ordered list of child widgets.
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
     * Appends one or more child widgets to this container.
     * - When called as `add(child, { flex: 1 })` (where the second argument is a plain
     *   layout options map), applies those `QxLayout` properties to `child`.
     * - When called as `add(child1, child2, child3)` (where arguments are `Widget` instances),
     *   appends all children in order.
     *
     * @param {ville.ui.core.Widget} childOrFirst First child widget to append.
     * @param {...(ville.ui.core.Widget|Object<string, *>)} rest Optional layout options map or additional child widgets.
     * @returns {this} This container instance for chaining.
     */
    add(childOrFirst, ...rest) {
      if (!childOrFirst) {
        return this;
      }
      if (
        rest.length === 1 &&
        rest[0] &&
        typeof rest[0] === "object" &&
        !(rest[0] instanceof ville.ui.core.Widget)
      ) {
        this._add(childOrFirst, /** @type {Object<string, *>} */ (rest[0]));
        return this;
      }

      this._add(childOrFirst);
      for (let i = 0; i < rest.length; i++) {
        const nextChild = rest[i];
        if (nextChild instanceof ville.ui.core.Widget) {
          this._add(nextChild);
        }
      }
      return this;
    },

    /**
     * Inserts a child widget at the specified zero-based index with optional layout properties.
     *
     * @param {ville.ui.core.Widget} child Child widget to insert.
     * @param {number} index Zero-based insertion index.
     * @param {Object<string, *>} [options] Optional per-child layout properties.
     * @returns {this} This container instance for chaining.
     */
    addAt(child, index, options) {
      this._addAt(child, index, options);
      return this;
    },

    /**
     * Inserts `child` immediately before an existing `before` child widget.
     *
     * @param {ville.ui.core.Widget} child Child widget to insert.
     * @param {ville.ui.core.Widget} before Existing sibling widget to insert before.
     * @param {Object<string, *>} [options] Optional per-child layout properties.
     * @returns {this} This container instance for chaining.
     */
    addBefore(child, before, options) {
      this._addBefore(child, before, options);
      return this;
    },

    /**
     * Inserts `child` immediately after an existing `after` child widget.
     *
     * @param {ville.ui.core.Widget} child Child widget to insert.
     * @param {ville.ui.core.Widget} after Existing sibling widget to insert after.
     * @param {Object<string, *>} [options] Optional per-child layout properties.
     * @returns {this} This container instance for chaining.
     */
    addAfter(child, after, options) {
      this._addAfter(child, after, options);
      return this;
    },

    /**
     * Removes a direct child widget from this container and detaches its DOM element.
     *
     * @param {ville.ui.core.Widget} child Child widget to remove.
     * @returns {this} This container instance for chaining.
     */
    remove(child) {
      this._remove(child);
      return this;
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
