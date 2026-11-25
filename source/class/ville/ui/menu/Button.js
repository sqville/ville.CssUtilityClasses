/**
 * Mode 3 Menu Item Button (`ville.ui.menu.Button`) rendered as `<button role="menuitem">`
 * inside a `ville.ui.menu.Menu` popover.
 *
 * Uses native `ville.html.Element` for its submenu right-arrow indicator (defaulting to
 * `ville.ui.icon.Default.GLYPHS.CHEVRON_RIGHT` via sprite deduplication) and a lightweight
 * `<span class="ville-menu-item-shortcut">` element for keyboard shortcuts—eliminating
 * child `Widget` instance overhead per menu item.
 */
qx.Class.define("ville.ui.menu.Button", {
  extend: ville.ui.core.AbstractButton,

  /**
   * Creates a new Menu Button instance.
   *
   * @param {string|null} [label] Menu item text caption.
   * @param {string|Object|ville.html.Element|ville.ui.core.Widget|null} [icon] Left icon key, Iconify CSS class, URI, or element.
   * @param {ville.ui.command.Command|null} [command] Command instance bound via `ville.ui.core.MExecutable`.
   * @param {ville.ui.menu.Menu|null} [menu] Optional submenu popover.
   * @param {string|Object|ville.html.Element|null} [arrow="CHEVRON_RIGHT"] Optional right arrow icon for submenus.
   */
  construct(label, icon, command, menu, arrow) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(label, icon, command);

    const contentEl = this.getContentElement();
    contentEl.setAttribute("id", "menu-item-" + this.toHashCode());
    this.setAriaRole("menuitem");

    this.addListener("changeCommand", this._onChangeCommand, this);

    if (arrow !== undefined) {
      this.setArrow(arrow);
    }

    if (menu != null) {
      this.setMenu(menu);
    }
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"menu-button"`).
     */
    appearance: {
      refine: true,
      init: "menu-button"
    },

    /**
     * Optional submenu popover (`ville.ui.menu.Menu`) controlled by this menu item.
     */
    menu: {
      check: "ville.ui.menu.Menu",
      apply: "_applyMenu",
      nullable: true,
      dereference: true,
      event: "changeMenu"
    },

    /**
     * Arrow icon displayed on the far right when a submenu is attached.
     * Defaults to `"CHEVRON_RIGHT"` from `ville.ui.icon.Default`.
     *
     * @type {string|Object|ville.html.Element|null}
     */
    arrow: {
      init: "CHEVRON_RIGHT",
      nullable: true,
      themeable: true,
      apply: "_applyArrow"
    },

    /**
     * Whether the keyboard shortcut label from `command` is displayed.
     */
    showCommandLabel: {
      check: "Boolean",
      apply: "_applyShowCommandLabel",
      themeable: true,
      init: true,
      event: "changeShowCommandLabel"
    }
  },

  members: {
    /** @type {any} @private */
    __changeLocaleCommandListenerId: null,

    /**
     * Native `<span class="ville-menu-item-shortcut">` element for command shortcut display.
     *
     * @type {ville.html.Element|null}
     * @private
     */
    __shortcutElement: null,

    /**
     * Native `<svg class="ville-menu-item-arrow">` element for submenu arrow indicator.
     *
     * @type {ville.html.Element|null}
     * @private
     */
    __arrowElement: null,

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIERS
    ---------------------------------------------------------------------------
    */

    /**
     * Property apply handler for `arrow`.
     *
     * @this {ville.ui.menu.Button}
     * @param {string|Object|ville.html.Element|null} value Arrow icon key, token, or element.
     * @protected
     */
    _applyArrow(value) {
      const contentEl = this.getContentElement();
      if (this.__arrowElement && this.__arrowElement.getParent() === contentEl) {
        contentEl.remove(this.__arrowElement);
      }
      this.__arrowElement = null;

      if (value != null && this.getMenu() != null) {
        this.__ensureArrowElement();
      }
    },

    /**
     * Ensures the native submenu arrow element is created and attached at the end of `<button>`.
     *
     * @this {ville.ui.menu.Button}
     * @private
     */
    __ensureArrowElement() {
      const arrowSpec = this.getArrow();
      if (!arrowSpec) {
        return;
      }
      const contentEl = this.getContentElement();
      if (!this.__arrowElement) {
        this.__arrowElement = ville.ui.icon.Default.createElement(arrowSpec, {
          cssClass: "ville-menu-item-arrow",
          useSprite: true
        });
      }
      if (this.__arrowElement && this.__arrowElement.getParent() !== contentEl) {
        contentEl.add(this.__arrowElement);
      }
    },

    /**
     * Property apply handler for `menu`. Wires native `popovertarget` and ARIA
     * attributes (`aria-haspopup`, `aria-expanded`, `aria-controls`) to the submenu.
     *
     * @this {ville.ui.menu.Button}
     * @param {ville.ui.menu.Menu|null} value Submenu popover instance.
     * @param {ville.ui.menu.Menu|null} old Previous submenu popover instance.
     * @protected
     */
    _applyMenu(value, old) {
      if (old) {
        old.removeListener("changeOpen", this._onMenuOpenChange, this);
        old.resetOpener();
        old.removeState("submenu");
      }

      const contentEl = this.getContentElement();

      if (value) {
        this.__ensureArrowElement();
        value.addState("submenu");
        value.setOpener(this);
        value.addListener("changeOpen", this._onMenuOpenChange, this);

        const menuId = value.getContentElement().getAttribute("id");
        contentEl.setAttribute("popovertarget", menuId);
        contentEl.setAttribute("aria-haspopup", "menu");
        contentEl.setAttribute("aria-controls", menuId);
        contentEl.setAttribute("aria-expanded", String(value.getOpen()));
      } else {
        if (this.__arrowElement && this.__arrowElement.getParent() === contentEl) {
          contentEl.remove(this.__arrowElement);
        }
        contentEl.removeAttribute("popovertarget");
        contentEl.removeAttribute("aria-haspopup");
        contentEl.removeAttribute("aria-controls");
        contentEl.removeAttribute("aria-expanded");
      }
    },

    /**
     * Synchronizes `aria-expanded` whenever the attached submenu's `open` state changes.
     *
     * @this {ville.ui.menu.Button}
     * @param {qx.event.type.Data} e `changeOpen` data event from `ville.ui.menu.Menu`.
     * @protected
     */
    _onMenuOpenChange(e) {
      const isOpen = Boolean(e.getData());
      this.getContentElement().setAttribute("aria-expanded", String(isOpen));
    },

    /**
     * Property apply handler for `showCommandLabel`.
     *
     * @this {ville.ui.menu.Button}
     * @param {boolean} value Whether the shortcut label is visible.
     * @protected
     */
    _applyShowCommandLabel(value) {
      if (!this.__shortcutElement) {
        return;
      }
      if (value && this.getCommand() != null) {
        this.__shortcutElement.include();
      } else {
        this.__shortcutElement.exclude();
      }
    },

    /**
     * Handles native `"click"` on a menu item. If this item is a leaf action (no submenu),
     * fires `execute()` and closes the enclosing parent menu stack.
     *
     * @override
     * @this {ville.ui.menu.Button}
     * @param {Object} e Native click event wrapper.
     * @protected
     */
    _onClick(e) {
      if (this.hasState("disabled")) {
        return;
      }

      if (this.getMenu()) {
        // Submenu trigger: native `popovertarget` handles toggling the submenu popover
        return;
      }

      this.execute();

      // Close enclosing root menu (which closes any nested submenus in the top layer)
      let parent = this.getParent();
      while (parent instanceof ville.ui.menu.Menu) {
        const nextParent = parent.getParent();
        parent.close();
        parent = nextParent;
      }
    },

    /**
     * Updates the native shortcut `<span class="ville-menu-item-shortcut">` element
     * whenever `command` changes.
     *
     * @this {ville.ui.menu.Button}
     * @param {qx.event.type.Data} e Property change event.
     * @protected
     */
    _onChangeCommand(e) {
      const command = e.getData();

      if (qx.core.Environment.get("qx.dynlocale")) {
        const oldCommand = e.getOldData();
        if (command && !oldCommand) {
          this.__changeLocaleCommandListenerId =
            qx.locale.Manager.getInstance().addListener(
              "changeLocale",
              this._onChangeLocale,
              this
            );
        } else if (!command && this.__changeLocaleCommandListenerId) {
          qx.locale.Manager.getInstance().removeListenerById(
            this.__changeLocaleCommandListenerId
          );
          this.__changeLocaleCommandListenerId = null;
        }
      }

      const contentEl = this.getContentElement();

      if (command == null) {
        if (this.__shortcutElement) {
          this.__shortcutElement.exclude();
        }
        return;
      }

      const cmdString = command.toString();
      if (!this.__shortcutElement) {
        this.__shortcutElement = new ville.html.Element("span");
        this.__shortcutElement.setAttribute("class", "ville-menu-item-shortcut");
        contentEl.add(this.__shortcutElement);
      }
      this.__shortcutElement.removeAll();
      if (cmdString) {
        this.__shortcutElement.add(new ville.html.Text(cmdString));
      }

      if (this.getShowCommandLabel() && cmdString) {
        this.__shortcutElement.include();
      } else {
        this.__shortcutElement.exclude();
      }
    },

    /**
     * Updates the shortcut label on locale changes.
     */
    _onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
      true() {
        const command = this.getCommand();
        if (command != null && this.__shortcutElement) {
          this.__shortcutElement.removeAll();
          this.__shortcutElement.add(new ville.html.Text(command.toString()));
        }
      },
      false: null
    })
  },

  destruct() {
    if (
      qx.core.Environment.get("qx.dynlocale") &&
      this.__changeLocaleCommandListenerId
    ) {
      qx.locale.Manager.getInstance().removeListenerById(
        this.__changeLocaleCommandListenerId
      );
      this.__changeLocaleCommandListenerId = null;
    }
    if (this.__shortcutElement) {
      this.__shortcutElement.dispose();
      this.__shortcutElement = null;
    }
    if (this.__arrowElement) {
      this.__arrowElement.dispose();
      this.__arrowElement = null;
    }
  }
});
