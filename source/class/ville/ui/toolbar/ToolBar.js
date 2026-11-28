/**
 * The ToolBar is the main part of the toolbar widget set.
 *
 * It sits on `ville.ui.core.Box` with an `HBox` layout and semantic `role="toolbar"`,
 * supporting buttons, parts, separators, spacers, and optional overflow handling.
 */
qx.Class.define("ville.ui.toolbar.ToolBar", {
  extend: ville.ui.core.Box,

  construct() {
    super(new ville.ui.layout.HBox());

    this.setAttribute("role", "toolbar");
    this.setAlignY("middle");
    this.__removedItems = [];
  },

  properties: {
    appearance: {
      refine: true,
      init: "toolbar"
    },

    /**
     * Affects the content shown on every child inside the toolbar (`"both"`, `"label"`, `"icon"`).
     */
    show: {
      init: "both",
      check: ["both", "label", "icon"],
      inheritable: true,
      apply: "_applyShow",
      event: "changeShow"
    },

    /** Spacing between every child of the toolbar */
    spacing: {
      nullable: true,
      check: "Integer",
      init: 4,
      themeable: true,
      apply: "_applySpacing"
    },

    /** Widget displayed when toolbar items overflow */
    overflowIndicator: {
      check: "ville.ui.core.Widget",
      nullable: true,
      apply: "_applyOverflowIndicator"
    },

    /** Enables the automatic overflow handling */
    overflowHandling: {
      init: false,
      check: "Boolean"
    },

    /** Currently open menu reference for hover-switching across MenuBarButtons */
    openMenu: {
      check: "ville.ui.menu.Menu",
      event: "changeOpenMenu",
      nullable: true
    }
  },

  events: {
    /** Fired if an item will be hidden by the overflow handling */
    hideItem: "qx.event.type.Data",

    /** Fired if an item will be shown by the overflow handling */
    showItem: "qx.event.type.Data"
  },

  members: {
    __allowMenuOpenHover: false,
    __removedItems: null,

    _setAllowMenuOpenHover(value) {
      this.__allowMenuOpenHover = Boolean(value);
    },

    _isAllowMenuOpenHover() {
      return this.__allowMenuOpenHover;
    },

    _onChildAdd(child) {
      if (typeof child.setShow === "function") {
        child.syncAppearance();
      }
    },

    _applySpacing(value) {
      const layout = this._getLayout();
      if (layout && typeof layout.setSpacing === "function") {
        layout.setSpacing(value == null ? 0 : value);
      }
    },

    _applyShow(value) {
      const children = this._getChildren();
      for (let i = 0; i < children.length; i++) {
        if (typeof children[i].setShow === "function") {
          children[i].setShow(value);
        }
      }
    },

    _applyOverflowIndicator(value, old) {
      if (old) {
        this._remove(old);
      }
      if (value) {
        this._add(value);
        value.exclude();
      }
    },

    /**
     * Adds a separator to the toolbar.
     */
    addSeparator() {
      this.add(new ville.ui.toolbar.Separator());
    },

    /**
     * Adds a flexible spacer to the toolbar (`flex: 1`).
     *
     * @return {ville.ui.core.Spacer} The newly added spacer
     */
    addSpacer() {
      const spacer = new ville.ui.core.Spacer();
      this._add(spacer, { flex: 1 });
      return spacer;
    },

    /**
     * Returns all items inside the toolbar (flattening any `ville.ui.toolbar.Part` children).
     *
     * @return {ville.ui.core.Widget[]}
     */
    getMenuButtons() {
      const children = this.getChildren();
      const menuButtons = [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child instanceof ville.ui.form.MenuButton) {
          menuButtons.push(child);
        } else if (child instanceof ville.ui.toolbar.Part) {
          menuButtons.push.apply(menuButtons, child.getMenuButtons());
        }
      }
      return menuButtons;
    },

    // Public child manipulation delegates
    add(child, options) {
      this._add(child, options);
      this._onChildAdd(child);
    },

    addAt(child, index, options) {
      this._addAt(child, index, options);
      this._onChildAdd(child);
    },

    addBefore(child, before, options) {
      this._addBefore(child, before, options);
      this._onChildAdd(child);
    },

    addAfter(child, after, options) {
      this._addAfter(child, after, options);
      this._onChildAdd(child);
    },

    remove(child) {
      return this._remove(child);
    },

    removeAt(index) {
      return this._removeAt(index);
    },

    removeAll() {
      return this._removeAll();
    },

    getChildren() {
      return this._getChildren();
    },

    hasChildren() {
      return this._hasChildren();
    },

    indexOf(child) {
      return this._indexOf(child);
    }
  },

  destruct() {
    this.__removedItems = null;
  }
});
