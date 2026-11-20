/**
 * Mode 3 Menu Item Button (`ville.ui.menu.Button`) rendered as `<button role="menuitem">`
 * inside a `ville.ui.menu.Menu` popover.
 *
 * @childControl shortcut {ville.ui.basic.Label} Displays the bound command shortcut text.
 * @childControl arrow {ville.ui.basic.Image|ville.ui.core.Widget} Submenu indicator icon on the right.
 */
qx.Class.define("ville.ui.menu.Button", {
  extend: ville.ui.core.AbstractButton,

  /**
   * Creates a new Menu Button instance.
   *
   * @param {string|null} [label] Menu item text caption.
   * @param {string|ville.ui.core.Widget|null} [icon] Left icon URI string or widget.
   * @param {ville.ui.command.Command|null} [command] Command instance bound via `ville.ui.core.MExecutable`.
   * @param {ville.ui.menu.Menu|null} [menu] Optional submenu popover.
   * @param {string|ville.ui.core.Widget|null} [arrow] Optional right arrow icon for submenus.
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
     *
     * @type {string|ville.ui.core.Widget|null}
     */
    arrow: {
      check(value) {
        return typeof value === "string" || value instanceof ville.ui.core.Widget;
      },
      apply: "_applyArrow",
      nullable: true,
      themeable: true
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
     * @override
     * @type {Record<string, boolean>}
     * @protected
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      disabled: true,
      selected: true
    },

    /**
     * Instantiates `"shortcut"` and `"arrow"` child controls in addition to
     * `AbstractButton`'s `"label"` and `"icon"`.
     *
     * @this {ville.ui.menu.Button}
     * @param {string} id Child control identifier.
     * @param {Record<string, any>} [hash] Optional configuration map.
     * @returns {ville.ui.core.Widget|null} Created child control.
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control = null;

      switch (id) {
        case "shortcut":
          control = new ville.ui.basic.Label();
          control.setAnonymous(true);
          if (!this.getShowCommandLabel()) {
            control.exclude();
          }
          this._add(control);
          break;

        case "arrow": {
          const arrowVal = this.getArrow();
          if (arrowVal instanceof ville.ui.core.Widget) {
            control = arrowVal;
          } else {
            control = new ville.ui.basic.Image(arrowVal);
          }
          control.setAnonymous(true);
          this._add(control);
          break;
        }
      }

      return control || super._createChildControlImpl(id, hash);
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIERS
    ---------------------------------------------------------------------------
    */

    /**
     * Property apply handler for `arrow`.
     *
     * @this {ville.ui.menu.Button}
     * @param {string|ville.ui.core.Widget|null} value Arrow icon widget or URI.
     * @param {string|ville.ui.core.Widget|null} old Previous arrow icon.
     * @protected
     */
    _applyArrow(value, old) {
      if (value != null) {
        const arrowCtrl = this.getChildControl("arrow");
        if (value instanceof ville.ui.core.Widget) {
          if (old instanceof ville.ui.core.Widget && old !== value) {
            this._remove(old);
            this._add(value);
          }
        } else if (typeof arrowCtrl.setSource === "function") {
          arrowCtrl.setSource(value);
        }
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
        if (this.getArrow() != null) {
          this._showChildControl("arrow");
        }
        value.addState("submenu");
        value.setOpener(this);
        value.addListener("changeOpen", this._onMenuOpenChange, this);

        const menuId = value.getContentElement().getAttribute("id");
        contentEl.setAttribute("popovertarget", menuId);
        contentEl.setAttribute("aria-haspopup", "menu");
        contentEl.setAttribute("aria-controls", menuId);
        contentEl.setAttribute("aria-expanded", String(value.getOpen()));
      } else {
        this._excludeChildControl("arrow");
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
      if (value && this.getCommand() != null) {
        this._showChildControl("shortcut");
      } else {
        this._excludeChildControl("shortcut");
      }
    },

    /**
     * Handles native `"click"` on a menu item. If this item is a leaf action (no submenu),
     * fires `execute()` and closes the enclosing parent menu stack.
     *
     * @override
     * @this {ville.ui.menu.Button}
     * @param {qx.event.type.Native} e Native click event wrapper.
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
     * Updates the `"shortcut"` child control whenever `command` changes.
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

      if (command == null) {
        this._excludeChildControl("shortcut");
        return;
      }

      const cmdString = command.toString();
      const shortcut = this.getChildControl("shortcut");
      shortcut.setValue(cmdString);
      if (this.getShowCommandLabel() && cmdString) {
        shortcut.show();
      } else {
        shortcut.exclude();
      }
    },

    /**
     * Updates the shortcut label on locale changes.
     */
    _onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
      true() {
        const command = this.getCommand();
        if (command != null) {
          this.getChildControl("shortcut").setValue(command.toString());
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
  }
});
