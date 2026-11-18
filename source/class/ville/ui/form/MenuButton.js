// @ts-check

/**
 * Mode 3 Menu Opener Button (`ville.ui.form.MenuButton`) that declaratively controls
 * a `ville.ui.menu.Menu` popover via the native HTML `popovertarget` attribute.
 */
qx.Class.define("ville.ui.form.MenuButton", {
  extend: ville.ui.form.Button,

  /**
   * Creates a new MenuButton opener.
   *
   * @param {string|null} [label] Button caption.
   * @param {string|ville.ui.core.Widget|null} [icon] Button icon.
   * @param {ville.ui.menu.Menu|null} [menu] Attached `ville.ui.menu.Menu` popover.
   */
  construct(label, icon, menu) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(label, icon, null);

    if (menu != null) {
      this.setMenu(menu);
    }
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"menubutton"`).
     */
    appearance: {
      refine: true,
      init: "menubutton"
    },

    /**
     * The `ville.ui.menu.Menu` popover instance controlled by this button.
     */
    menu: {
      check: "ville.ui.menu.Menu",
      nullable: true,
      apply: "_applyMenu",
      event: "changeMenu"
    }
  },

  members: {
    /**
     * Property apply handler for `menu`. Wires `popovertarget` and ARIA menu-button
     * attributes (`aria-haspopup`, `aria-controls`, `aria-expanded`) to the menu's DOM `id`.
     *
     * @this {ville.ui.form.MenuButton}
     * @param {ville.ui.menu.Menu|null} value New menu popover.
     * @param {ville.ui.menu.Menu|null} old Previous menu popover.
     * @protected
     */
    _applyMenu(value, old) {
      if (old) {
        old.removeListener("changeOpen", this._onMenuOpenChange, this);
        old.resetOpener();
      }

      const contentEl = this.getContentElement();
      if (!contentEl) {
        return;
      }

      if (value) {
        value.setOpener(this);
        value.removeState("submenu");
        value.removeState("contextmenu");
        value.addListener("changeOpen", this._onMenuOpenChange, this);

        const menuId = value.getContentElement().getAttribute("id");
        contentEl.setAttribute("popovertarget", menuId);
        contentEl.setAttribute("aria-haspopup", "menu");
        contentEl.setAttribute("aria-controls", menuId);
        contentEl.setAttribute("aria-expanded", String(value.getOpen()));
      } else {
        contentEl.removeAttribute("popovertarget");
        contentEl.removeAttribute("aria-haspopup");
        contentEl.removeAttribute("aria-controls");
        contentEl.removeAttribute("aria-expanded");
      }
    },

    /**
     * Programmatically opens the attached menu popover and optionally selects
     * the first enabled item.
     *
     * @this {ville.ui.form.MenuButton}
     * @param {boolean} [selectFirst=false] Whether to select the first enabled item.
     */
    open(selectFirst = false) {
      const menu = this.getMenu();
      if (!menu) {
        return;
      }

      menu.setOpener(this);
      menu.open();

      if (selectFirst) {
        const first = menu.getSelectables()[0];
        if (first) {
          menu.setSelectedButton(first);
        }
      }
    },

    /**
     * Synchronizes the button's `"pressed"` state and `aria-expanded` attribute
     * whenever the attached `Menu` popover opens or closes.
     *
     * @this {ville.ui.form.MenuButton}
     * @param {qx.event.type.Data} e `changeOpen` data event from `ville.ui.menu.Menu`.
     * @protected
     */
    _onMenuOpenChange(e) {
      const isOpen = Boolean(e.getData());
      if (isOpen) {
        this.addState("pressed");
      } else {
        this.removeState("pressed");
      }
      this.getContentElement().setAttribute("aria-expanded", String(isOpen));
    }
  }
});
