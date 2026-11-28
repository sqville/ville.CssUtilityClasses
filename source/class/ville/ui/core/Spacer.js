/**
 * A Spacer is a lightweight empty widget used inside layouts (`HBox`, `VBox`, `Grid`, `ToolBar`)
 * to occupy flexible or fixed empty space.
 */
qx.Class.define("ville.ui.core.Spacer", {
  extend: ville.ui.core.Widget,

  /**
   * @param {number|string|null} [width=null] Optional explicit width
   * @param {number|string|null} [height=null] Optional explicit height
   */
  construct(width = null, height = null) {
    // @ts-ignore
    super();

    this._setAttribute("aria-hidden", "true");
    if (width !== null) {
      this.setWidth(width);
    }
    if (height !== null) {
      this.setHeight(height);
    }
  }
});
