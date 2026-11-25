/**
 * Exposes public `setLayout(layout)` and `getLayout()` methods on container widgets
 * (`ville.ui.core.Box`, `ville.ui.container.Composite` — `STRAT-LAYOUT-01`).
 */
qx.Mixin.define("ville.ui.core.MLayoutHandling", {
  members: {
    /**
     * Sets the Standards-Backed `QxLayout` manager (`HBox`, `VBox`, `Grid`, `Dock`,
     * `Canvas`, `Flow`, `Grow`, or a custom `ResizeObserver`-backed `Abstract` layout)
     * for this container.
     *
     * @param {ville.ui.layout.Abstract|null} layout Layout manager instance.
     * @returns {this} This container instance for chaining.
     */
    setLayout(layout) {
      this._setLayout(layout);
      return this;
    },

    /**
     * Returns the layout manager currently assigned to this container, or `null`.
     *
     * @returns {ville.ui.layout.Abstract|null} Active layout manager.
     */
    getLayout() {
      return this._getLayout();
    }
  }
});
