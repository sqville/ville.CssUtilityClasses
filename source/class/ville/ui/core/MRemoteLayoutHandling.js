/**
 * Redirects `setLayout(layout)` and `getLayout()` calls to the inner child
 * container returned by `this.getChildrenContainer()` (e.g. `Window`, `Card`,
 * `FieldSet`, `TabView.Page` — `STRAT-CORE-09` #5).
 */
qx.Mixin.define("ville.ui.core.MRemoteLayoutHandling", {
  members: {
    /**
     * Sets the layout manager on the inner children container (`getChildrenContainer()`).
     *
     * @param {ville.ui.layout.Abstract} layout Layout manager instance.
     * @returns {this} This widget for chaining.
     */
    setLayout(layout) {
      const container = this.getChildrenContainer();
      if (container === this) {
        this._setLayout(layout);
      } else {
        container.setLayout(layout);
      }
      return this;
    },

    /**
     * Returns the layout manager from the inner children container (`getChildrenContainer()`).
     *
     * @returns {ville.ui.layout.Abstract|null} Active layout manager.
     */
    getLayout() {
      const container = this.getChildrenContainer();
      if (container === this) {
        return this._getLayout();
      }
      return container.getLayout();
    }
  }
});
