/**
 * Each object, which should support multi selection has to
 * implement this interface.
 */
qx.Interface.define("ville.ui.core.IMultiSelection", {
  extend: ville.ui.core.ISingleSelection,

  members: {
    /**
     * Selects all items of the managed object.
     */
    selectAll() {},

    /**
     * Adds the given item to the existing selection.
     *
     * @param item {ville.ui.core.Widget} Any valid item
     */
    addToSelection(item) {},

    /**
     * Removes the given item from the selection.
     *
     * @param item {ville.ui.core.Widget} Any valid item
     */
    removeFromSelection(item) {}
  }
});
