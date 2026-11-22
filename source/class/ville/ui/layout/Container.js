/**
 * Mode 3 Container layout (`ville.ui.layout.Container`).
 */
qx.Class.define("ville.ui.layout.Container", {
  extend: ville.ui.core.Box,

  /**
   * @param {string} [component="div"] Root HTML tag name.
   */
  construct(component) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(component);
  },

  properties: {
    appearance: {
      refine: true,
      init: "layout-container"
    },

    /**
     * Container max-width size scale (`"xs"`–`"xl"`).
     */
    size: {
      check: ["xs", "sm", "md", "lg", "xl"],
      nullable: true,
      themeable: true,
      apply: "_applySize",
      event: "changeSize"
    },

    /**
     * Whether the container spans 100% width (`"fluid"` state).
     */
    fluid: {
      check: "Boolean",
      init: false,
      themeable: true,
      apply: "_applyFluid",
      event: "changeFluid"
    }
  },

  members: {
    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    _applyFluid(value) {
      value ? this.addState("fluid") : this.removeState("fluid");
    }
  }
});
