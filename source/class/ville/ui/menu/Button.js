/**
 * Menu Button
 * @ai-instructions Since popovers are involved this must be a button. Do not include component logic
 * @ai-instructions Icon child control will always be to the left of the label. Do not include IconPosition
 * @ai-instructions This is the firt time I am extending an existing ville.ui widget. 
 * 
 * @childControl shortcut {ville.ui.basic.Label} shows if specified the shortcut
 * @childControl arrow {ville.ui.basic.Image|ville.ui.core.Widget|null} [icon] shows the arrow to show an additional widget (e.g. popup or submenu)
 */
qx.Class.define("ville.ui.menu.Button", {
  extend: ville.ui.form.Button,

  /**
   * Creates a new Button instance.
   *
   * @param {string|null} [label] Button text caption.
   * @param {string|ville.ui.core.Widget|null} [icon] Image URI string or `ville.ui.core.Widget` icon instance (e.g., `ville.ui.icon.Abstract` subclass).
   * @param {ville.ui.command.Command|null} [command] Command instance bound via `MExecutable`.
   * @param {ville.ui.menu.Menu|null}.
   * @param {string|ville.ui.core.Widget|null} [arrow] Image URI string or `ville.ui.core.Widget` icon instance (e.g., `ville.ui.icon.Abstract` subclass).
   */
  construct(label, icon, command, menu, arrow) {

    super(label, icon, command, "button");

    if (menu != null) {
        this.setMenu(menu);
    }

    if (arrow !== undefined) {
      this.setArrow(arrow);
    }

    // Set default accessible role
    this.setAriaRole("button");
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
     * Whether the button expands to fill 100% of its container width (`data-block="true"`).
     * Toggles the `"fullWidth"` widget state.
     */
    fullWidth: {
      refine: true,
      init: true
    },

    /** Whether a sub menu should be shown and which one */
    menu: {
      check: "ville.ui.menu.Menu",
      apply: "_applyMenu",
      nullable: true,
      dereference: true,
      event: "changeMenu"
    },

    /**
     * Arrow Icon displayed to the far right of the button label. Accepts either an image URI string
     * (rendered via `ville.ui.basic.Image`) or a `ville.ui.core.Widget` instance
     * (such as an inline SVG `ville.ui.icon.Abstract` subclass).
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

    /** Indicates whether the label for the command (shortcut) should be visible or not. */
    showCommandLabel: {
      check: "Boolean",
      apply: "_applyShowCommandLabel",
      themeable: true,
      init: true,
      event: "changeShowCommandLabel"
    }

  },

  members: {

     /*
    ---------------------------------------------------------------------------
      USER API - overridden
    ---------------------------------------------------------------------------
    */

    /**
     * overridden
     * Not used by Menu Buttons
     */
    press() {throw new Error("press is not supported in ville.ui.menu.Button.")},
    release() {throw new Error("release is not supported in ville.ui.menu.Button.")},
    reset() {throw new Error("reset is not supported in ville.ui.menu.Button.")},

    /**
     * ovrridden
     * States automatically forwarded from the button to its `label` and `icon` child controls.
     *
     * @type {Object<string, boolean>}
     * @protected
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      disabled: true,
      selected: 1
    },

    /**
     * Instantiates internal child controls (`"label"` and `"icon"`) on demand.
     *
     * - `"label"`: Creates an anonymous `ville.ui.basic.Label` and binds its
     *   `changeValue` event to a lightweight `qx.html.Text` node.
     * - `"icon"`: Uses the provided `ville.ui.core.Widget` or creates a
     *   `ville.ui.basic.Image`, inserting it before or after `__textNode`.
     *
     * @param {string} id Child control identifier (`"label"` or `"icon"`).
     * @param {*} [hash] Optional configuration map.
     * @returns {ville.ui.core.Widget|null} Created child control instance.
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control;

      switch (id) {

      case "shortcut":
          control = new ville.ui.basic.Label();
          control.setAnonymous(true);
          if (!this.getShowCommandLabel()) {
            control.exclude();
          }
          this._add(control);
          break;

        case "arrow":
          const arrowiconVal = this.getArrow();
          if (arrowiconVal instanceof ville.ui.core.Widget) {
            control = arrowiconVal;
          } else {
            control = new ville.ui.basic.Image(arrowiconVal);
          }
          control.setAnonymous(true);
          this._add(control);
          break;

        
      }

      return control || super._createChildControlImpl(id, hash);
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIERS
    ---------------------------------------------------------------------------
    */

    /**
     * overridden
     * Property apply handler for `iconPosition`.
     * @protected
     */
    _applyIconPosition(value, old) {
        // @ai-todo Not sure how to best make sure that this says left for all menu button icons
      this._syncModifierState("iconPosition", "left", old);
    },

    /**
     * Property apply handler for `fullWidth`.
     * @protected
     */
    _applyFullWidth(value, old) {
        // @ai-todo I believe this should always stay at fullWidth within it's Menu
      value ? this.addState("fullWidth") : this.removeState("fullWidth");
    },

    /**
     * overridden
     * Property apply handler for `loading`. Resets active press states, toggles
     * `"loading"`, and locks interactive disabled attributes.
     * @protected
     */
    _applyLoading(value, old) {
        // @ai-todo Not sure how best to override since Menu buttons do not have a loading state.
    },

    // property apply
    // @ai-todo Need to determine if Popover API fully covers this, besides adding/removing States
    _applyMenu(value, old) {
      if (old) {
        old.removeListener("changeVisibility", this._onMenuChange, this);
        
        // @ai-todo Handled by Popover API?
        old.resetOpener();

        old.removeState("submenu");
      }

      if (value) {
        this._showChildControl("arrow");

        value.addListener("changeVisibility", this._onMenuChange, this);

        // @ai-todo Handled by Popover API?
        value.setOpener(this);

        value.addState("submenu");
      } else {
        this._excludeChildControl("arrow");
      }

      // ARIA attrs
      // @ai-todo Need to determine if these aira values should be set via set remove Attribute since they get changed often (Property may be too heavy)
      // @ai-todo Need to determin if id attribute should be Property or not.
      const contentEl = this.getContentElement();
      if (!contentEl) {
        return;
      }
      if (value) {
        contentEl.setAttribute("aria-haspopup", "menu");
        contentEl.setAttribute("aria-expanded", value.isVisible());
        contentEl.setAttribute(
          "aria-controls",
          value.getContentElement().getAttribute("id")
        );
      } else {
        contentEl.removeAttribute("aria-haspopup");
        contentEl.removeAttribute("aria-expanded");
        contentEl.removeAttribute("aria-controls");
      }
    },

    /**
     * Listener for visibility property changes of the attached menu
     *
     * @param e {qx.event.type.Data} Property change event
     * // @ai-todo Determine if this is needed at all since Popover API handles showing and hidding
     */
    _onMenuChange(e) {
      // ARIA attrs
      this.getContentElement().setAttribute(
        "aria-expanded",
        this.getMenu().isVisible()
      );
    },

    // property apply
    _applyShowCommandLabel(value, old) {
      if (value) {
        this._showChildControl("shortcut");
      } else {
        this._excludeChildControl("shortcut");
      }
    },

    /*
    ---------------------------------------------------------------------------
      EVENT BRIDGE INFRASTRUCTURE
    ---------------------------------------------------------------------------
    */

    /**
     * overridden
     * Registers DOM pointer, focus, and keyboard listeners on the button via
     * `Widget`'s transparent event delegation to synchronize interactive Qooxdoo
     * states (`hovered`, `pressed`, `focused`) and trigger `execute()`.
     *
     * @protected
     */
    _initEventBridge() {
        // Add listeners
        this.addListener("tap", this._onTap);
        this.addListener("keypress", this._onKeyPress);

        // Add command listener
        this.addListener("changeCommand", this._onChangeCommand, this);
    },

    // overridden
    _onTap(e) {
      if (e.isLeftPressed() && this.getMenu()) {
        this.execute();
        // don't close menus if the button is a sub menu button
        this.getMenu().open();
        return;
      }

      super._onTap(e);
    },

    /**
     * Event listener for keypress event
     *
     * @param e {qx.event.type.KeySequence} keypress event
     */
    _onKeyPress(e) {
      this.execute();
    },

    /**
     * Event listener for command changes. Updates the text of the shortcut.
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onChangeCommand(e) {
      var command = e.getData();

      // do nothing if no command is set
      if (command == null) {
        return;
      }

      if (qx.core.Environment.get("qx.dynlocale")) {
        var oldCommand = e.getOldData();
        if (!oldCommand) {
          this.__changeLocaleCommandListenerId = qx.locale.Manager.getInstance().addListener(
            "changeLocale",
            this._onChangeLocale,
            this
          );
        }
        if (!command && this.__changeLocaleCommandListenerId) {
          qx.locale.Manager.getInstance().removeListenerById(
            this.__changeLocaleCommandListenerId
          );
        }
      }

      var cmdString = command != null ? command.toString() : "";
      this.getChildControl("shortcut").setValue(cmdString);
    },

    /**
     * Update command string on locale changes
     */
    _onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
      true(e) {
        var command = this.getCommand();
        if (command != null) {
          this.getChildControl("shortcut").setValue(command.toString());
        }
      },

      false: null
    })

  },

  /**
   * Disposes the internal `qx.html.Text` node on widget destruction.
   * @ai-todo Determine if a destruct is needed for this widget.
   */
  destruct() {
    if (this.__textNode) {
      this.__textNode.dispose();
      this.__textNode = null;
    }
  }
});
