/**
 * Mode 3 Menu widget (`ville.ui.menu.Menu`) backed by the native HTML Popover API
 * (`popover="auto"`).
 *
 * Eliminates `qx.ui.menu.Manager`, `MPlacement`, `Blocker`, and `MenuSlideBar` in favor
 * of top-layer popover promotion, native light-dismiss, and CSS overflow scrolling.
 * 
 * @external(ville/ville-menu.css)
 */
qx.Class.define("ville.ui.menu.Menu", {
  extend: ville.ui.core.Box,

  construct() {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    qx.core.Init.getApplication().getRoot().add(this);

    /*const app = qx.core.Init.getApplication();
    if (app && typeof app.getRoot === "function") {
      app.getRoot().add(this);
    }*/

    this.setAriaRole("menu");

    const contentEl = this.getContentElement();
    contentEl.setAttribute("id", "menu-" + this.toHashCode());
    contentEl.setAttribute("popover", "auto");

    contentEl.addListener("toggle", this._onPopoverToggle, this);
    this.addListener("pointerover", this._onPointerOver, this);
    this.addListener("pointerout", this._onPointerOut, this);
  },

  events: {
    /**
     * Fired when the native popover `toggle` event transitions between `"open"` and `"closed"`.
     * Data payload: `{ newState: "open"|"closed", oldState: "open"|"closed", open: boolean }`.
     */
    toggle: "qx.event.type.Data"
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"menu"`).
     */
    appearance: {
      refine: true,
      init: "menu"
    },

    /**
     * Whether the menu popover is currently open in the browser's top layer.
     */
    open: {
      check: "Boolean",
      init: false,
      apply: "_applyOpen",
      event: "changeOpen"
    },

    /**
     * The currently highlighted/selected menu button.
     */
    selectedButton: {
      check: "ville.ui.core.AbstractButton",
      nullable: true,
      apply: "_applySelectedButton",
      event: "changeSelectedButton"
    },

    /**
     * The menu button whose submenu is currently open.
     */
    openedButton: {
      check: "ville.ui.core.AbstractButton",
      nullable: true,
      apply: "_applyOpenedButton",
      event: "changeOpenedButton"
    },

    /**
     * Button widget that opened this menu (`ville.ui.form.MenuButton` or `ville.ui.menu.Button`).
     */
    opener: {
      check: "ville.ui.core.AbstractButton",
      nullable: true,
      apply: "_applyOpener",
      event: "changeOpener"
    }
  },

  members: {
    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Opens the menu popover in the browser top layer.
     *
     * @this {ville.ui.menu.Menu}
     */
    open() {
      this.setOpen(true);
    },

    /**
     * Closes the menu popover.
     *
     * @this {ville.ui.menu.Menu}
     */
    close() {
      this.setOpen(false);
    },

    /**
     * Opens the menu as a context menu at the pointer's viewport coordinates
     * using CSS custom properties (`--menu-x`, `--menu-y`).
     *
     * @this {ville.ui.menu.Menu}
     * @param {qx.event.type.Pointer|MouseEvent} e Pointer or native `contextmenu` event.
     */
    openAtPointer(e) {
      const x = typeof e.getDocumentLeft === "function" ? e.getDocumentLeft() : e.clientX;
      const y = typeof e.getDocumentTop === "function" ? e.getDocumentTop() : e.clientY;
      this.openAtPoint({ left: x, top: y });
    },

    /**
     * Opens the menu at explicit `{ left, top }` viewport coordinates.
     *
     * @this {ville.ui.menu.Menu}
     * @param {{ left: number, top: number }} point Viewport coordinates.
     */
    openAtPoint(point) {
      const contentEl = this.getContentElement();
      contentEl.setStyle("--menu-x", `${point.left}px`);
      contentEl.setStyle("--menu-y", `${point.top}px`);
      this.addState("contextmenu");
      this.setOpen(true);
    },

    /**
     * Appends a Mode 3 `ville.ui.core.Divider` separator to the menu.
     *
     * @this {ville.ui.menu.Menu}
     * @returns {ville.ui.core.Divider} The added divider widget.
     */
    addSeparator() {
      const separator = new ville.ui.core.Divider();
      separator.setAppearance("menu-separator");
      this.add(separator);
      return separator;
    },

    /**
     * Returns all enabled `AbstractButton` items inside this menu.
     *
     * @this {ville.ui.menu.Menu}
     * @returns {ville.ui.core.AbstractButton[]} Selectable menu buttons.
     */
    getSelectables() {
      const result = [];
      const children = this.getChildren();

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child instanceof ville.ui.core.AbstractButton && child.isEnabled()) {
          result.push(child);
        }
      }

      return result;
    },

    /**
     * Returns the enclosing parent `ville.ui.menu.Menu` if this menu is a submenu,
     * or `null` if it is a root menu.
     *
     * @this {ville.ui.menu.Menu}
     * @returns {ville.ui.menu.Menu|null} Enclosing parent menu or `null`.
     */
    getParentMenu() {
      let widget = /** @type {ville.ui.core.Widget|null} */ (this.getOpener());
      if (!widget) {
        return null;
      }

      while (widget && !(widget instanceof ville.ui.menu.Menu)) {
        widget = widget.getParent();
      }
      return /** @type {ville.ui.menu.Menu|null} */ (widget);
    },


    /*
    ---------------------------------------------------------------------------
      POPOVER SYNCHRONIZATION & PROPERTY APPLIERS
    ---------------------------------------------------------------------------
    */

    /**
     * Synchronizes native `ToggleEvent` state changes (`newState === "open"`)
     * back into the `open` property and parent menu state.
     *
     * @this {ville.ui.menu.Menu}
     * @param {qx.event.type.Native} e Native `toggle` event wrapper.
     * @protected
     */
    _onPopoverToggle(e) {
      const nativeEvent = /** @type {ToggleEvent} */ (e.getNativeEvent());
      const newState = nativeEvent.newState;
      const oldState = nativeEvent.oldState;
      const isOpen = newState === "open";

      if (this.getOpen() !== isOpen) {
        this.setOpen(isOpen);
      }

      const parentMenu = this.getParentMenu();
      if (isOpen) {
        if (parentMenu) {
          parentMenu.setOpenedButton(this.getOpener());
        }
      } else {
        if (parentMenu && parentMenu.getOpenedButton() === this.getOpener()) {
          parentMenu.resetOpenedButton();
        }
        this.resetOpenedButton();
        this.resetSelectedButton();
      }

      this.fireDataEvent("toggle", {
        newState,
        oldState,
        open: isOpen
      });
    },

    /**
     * Property apply handler for `open`. Calls `showPopover()` / `hidePopover()`
     * only when out of sync with `:popover-open`.
     *
     * @this {ville.ui.menu.Menu}
     * @param {boolean} value Whether the menu should be open.
     * @protected
     */
    _applyOpen(value) {
      if (value) {
        this.addState("open");
      } else {
        this.removeState("open");
      }

      const domEl = /** @type {HTMLElement|null} */ (
        this.getContentElement().getDomElement()
      );
      if (!domEl || !domEl.isConnected) {
        return;
      }

      const isCurrentlyOpen = domEl.matches(":popover-open");
      if (value && !isCurrentlyOpen) {
        domEl.showPopover();
      } else if (!value && isCurrentlyOpen) {
        domEl.hidePopover();
      }
    },

    /**
     * Property apply handler for `selectedButton`.
     *
     * @this {ville.ui.menu.Menu}
     * @param {ville.ui.core.AbstractButton|null} value Newly selected item.
     * @param {ville.ui.core.AbstractButton|null} old Previously selected item.
     * @protected
     */
    _applySelectedButton(value, old) {
      if (old) {
        old.removeState("selected");
      }
      if (value) {
        value.addState("selected");
      }

      const opener = this.__getRootOpener();
      const contentEl = opener
        ? opener.getContentElement()
        : this.getContentElement();
      if (!contentEl) {
        return;
      }

      const valueContentEl = value ? value.getContentElement() : null;
      const itemId = valueContentEl ? valueContentEl.getAttribute("id") : null;
      if (itemId) {
        contentEl.setAttribute("aria-activedescendant", itemId);
      } else {
        contentEl.removeAttribute("aria-activedescendant");
      }
    },

    /**
     * Property apply handler for `openedButton`.
     *
     * @this {ville.ui.menu.Menu}
     * @param {ville.ui.core.AbstractButton|null} value Menu button whose submenu is opening.
     * @param {ville.ui.core.AbstractButton|null} old Previous menu button whose submenu was open.
     * @protected
     */
    _applyOpenedButton(value, old) {
      if (old && typeof old.getMenu === "function" && old.getMenu()) {
        old.getMenu().close();
      }
      if (value && typeof value.getMenu === "function" && value.getMenu()) {
        value.getMenu().open();
      }
    },

    /**
     * Property apply handler for `opener`. Links `aria-labelledby` to the opener's `id`.
     *
     * @this {ville.ui.menu.Menu}
     * @param {ville.ui.core.AbstractButton|null} value Opener button.
     * @protected
     */
    _applyOpener(value) {
      const contentEl = this.getContentElement();
      if (!contentEl) {
        return;
      }

      if (value && value.getContentElement()) {
        const openerEl = value.getContentElement();
        let openerId = openerEl.getAttribute("id");
        if (!openerId) {
          openerId = "menu-opener-" + value.toHashCode();
          openerEl.setAttribute("id", openerId);
        }
        contentEl.setAttribute("aria-labelledby", openerId);
      } else {
        contentEl.removeAttribute("aria-labelledby");
      }
    },

    /*
    ---------------------------------------------------------------------------
      POINTER HOVER SELECTION & SUBMENU COORDINATION
    ---------------------------------------------------------------------------
    */

    /**
     * Highlights hovered menu buttons and opens/closes nested submenus directly.
     *
     * @this {ville.ui.menu.Menu}
     * @param {qx.event.type.Pointer} e Pointerover event.
     * @protected
     */
    _onPointerOver(e) {
      const target = e.getTarget();
      if (
        target instanceof ville.ui.core.AbstractButton &&
        target.isEnabled()
      ) {
        this.setSelectedButton(target);

        const subMenu =
          typeof target.getMenu === "function" ? target.getMenu() : null;
        if (subMenu) {
          this.setOpenedButton(target);
        } else if (this.getOpenedButton()) {
          this.resetOpenedButton();
        }
      } else if (!this.getOpenedButton()) {
        this.resetSelectedButton();
      }
    },

    /**
     * Clears highlight selection when the pointer leaves the menu unless a
     * submenu remains open.
     *
     * @this {ville.ui.menu.Menu}
     * @param {qx.event.type.Pointer} e Pointerout event.
     * @protected
     */
    _onPointerOut(e) {
      const related = e.getRelatedTarget();
      if (related instanceof ville.ui.core.Widget && related.getParent() === this) {
        return;
      }
      const opened = this.getOpenedButton();
      if (opened) {
        this.setSelectedButton(opened);
      } else {
        this.resetSelectedButton();
      }
    },


    /**
     * Walks up the parent menu chain to find the root opener button.
     *
     * @this {ville.ui.menu.Menu}
     * @returns {ville.ui.core.AbstractButton|null} Root opener widget.
     * @private
     */
    __getRootOpener() {
      let parentMenu = this.getParentMenu();
      if (!parentMenu) {
        return this.getOpener();
      }
      let opener = null;
      while (parentMenu) {
        opener = parentMenu.getOpener();
        parentMenu = parentMenu.getParentMenu();
      }
      return opener;
    }
  },

  destruct() {
    const contentEl = this.getContentElement();
    if (contentEl) {
      contentEl.removeListener("toggle", this._onPopoverToggle, this);
    }
    this.removeListener("pointerover", this._onPointerOver, this);
    this.removeListener("pointerout", this._onPointerOut, this);
  }
});
