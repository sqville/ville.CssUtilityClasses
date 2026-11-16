/**
 * The menu is a popup like control which supports buttons. It comes
 * with full keyboard navigation and an improved timeout based pointer
 * control behavior.
 *
 */
qx.Class.define("ville.ui.menu.Menu", {
  extend: ville.ui.core.Box,

  construct() {
    super();

    // Automatically add to application's root
    var root = this.getApplicationRoot();
    root.add(this);

    // ARIA attrs
    this.setAriaRole("menu");

    // @ai-todo Should we have id as a property?
    this.getContentElement().setAttribute("id", "menu-" + this.toHashCode());

    // Register pointer listeners
    this.addListener("pointerover", this._onPointerOver);
    this.addListener("pointerout", this._onPointerOut);

    // add resize listener
    //this.addListener("resize", this._onResize, this);
    //root.addListener("resize", this._onResize, this);

    //this._blocker = new qx.ui.core.Blocker(root);

    // Initialize properties
    this.initVisibility();
   // this.initKeepFocus();
   // this.initKeepActive();
  },

  properties: {
    /*
    ---------------------------------------------------------------------------
      WIDGET PROPERTIES
    ---------------------------------------------------------------------------
    */

    // overridden
    appearance: {
      refine: true,
      init: "menu"
    },

    // overridden
    visibility: {
      refine: true,
      init: "excluded"
    },

    // overridden
    /*keepFocus: {
      refine: true,
      init: true
    },

    // overridden
    keepActive: {
      refine: true,
      init: true
    },*/


    /*
    ---------------------------------------------------------------------------
      FUNCTIONALITY PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** The currently selected button */
    selectedButton: {
      check: "ville.ui.core.Widget",
      nullable: true,
      apply: "_applySelectedButton"
    },

    /** The currently opened button (sub menu is visible) */
    openedButton: {
      check: "ville.ui.core.Widget",
      nullable: true,
      apply: "_applyOpenedButton"
    },

    /** Widget that opened the menu */
    opener: {
      check: "ville.ui.core.Widget",
      nullable: true,
      apply: "_applyOpener"
    }

  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __scheduledOpen: null,
    __onAfterSlideBarAdd: null,
    _placementTarget: null,

    /** blocker for background blocking */
    _blocker: null,

    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Opens the menu and configures the opener
     */
    open() {
      if (this.getOpener() != null) {
       // var isPlaced = this.placeToWidget(this.getOpener(), true);
       // if (isPlaced) {

       // @ai-todo Can we manage overflow via CSS? This is what __updateSlideBar does for qooxdoo
       //   this.__updateSlideBar();
        this.show();

       //   this._placementTarget = this.getOpener();
       // } else {
       //   this.warn(
       //     "Could not open menu instance because 'opener' widget is not visible"
       //   );
       // }
      } else {
        this.warn("The menu instance needs a configured 'opener' widget!");
      }
    },

    /**
     * Opens the menu at the pointer position
     *
     * @param e {qx.event.type.Pointer} Pointer event to align to
     */
    openAtPointer(e) {
      //this.placeToPointer(e);
      //this.__updateSlideBar();
      this.show();

      /*this._placementTarget = {
        left: e.getDocumentLeft(),
        top: e.getDocumentTop()
      };*/
    },

    /**
     * Opens the menu in relation to the given point
     *
     * @param point {Map} Coordinate of any point with the keys <code>left</code>
     *   and <code>top</code>.
     */
    openAtPoint(point) {
      //this.placeToPoint(point);
      //this.__updateSlideBar();
      this.show();

      this._placementTarget = point;
    },

    /**
     * Convenience method to add a separator to the menu
     */
    addSeparator() {
      const separator = new ville.ui.core.Widget();
      separator.setCssUtilityClass("m_efdf90cb mantine-Menu-divider");
      this.add(separator);
    },

    /**
     * Return all selectable menu items.
     *
     * @return {ville.ui.core.Widget[]} selectable widgets
     */
    getSelectables() {
      var result = [];
      var children = this.getChildren();

      for (var i = 0; i < children.length; i++) {
        if (children[i].isEnabled()) {
          result.push(children[i]);
        }
      }

      return result;
    },

    /*
    // overridden
    _applyVisibility(value, old) {
      super._applyVisibility(value, old);

      //@ai-todo Can we track menu instances using Popover API?
      //var mgr = qx.ui.menu.Manager.getInstance();

      if (value === "visible") {
        // Register to manager (zIndex handling etc.)
        mgr.add(this);

        // Mark opened in parent menu
        var parentMenu = this.getParentMenu();
        if (parentMenu) {
          parentMenu.setOpenedButton(this.getOpener());
        }
      } else if (old === "visible") {
        // Deregister from manager (zIndex handling etc.)
        mgr.remove(this);

        // Unmark opened in parent menu
        var parentMenu = this.getParentMenu();
        if (parentMenu && parentMenu.getOpenedButton() == this.getOpener()) {
          parentMenu.resetOpenedButton();
        }

        // Clear properties
        this.resetOpenedButton();
        this.resetSelectedButton();
      }

      this.__updateBlockerVisibility();
    },
    */

    /**
     * Get the parent menu. Returns <code>null</code> if the menu doesn't have a
     * parent menu.
     *
     * @return {ville.ui.core.Widget|null} The parent menu.
     */
    getParentMenu() {
      var widget = this.getOpener();
      /*if (!widget || !(widget instanceof qx.ui.menu.AbstractButton)) {
        return null;
      }*/

      // @ai-todo Need to figure out how to handle Context Menus / Popups for Mode 3
      /*if (widget && widget.getContextMenu() === this) {
        return null;
      }

      while (widget && !(widget instanceof ville.ui.menu.Menu)) {
        widget = widget.getLayoutParent();
      }*/
      return widget;
    },

    // property apply
    _applySelectedButton(value, old) {
      if (old) {
        old.removeState("selected");
      }
      if (value) {
        value.addState("selected");
      }

      // @ai-todo Should we move all ARIA into ville.ui.core.Widget properties?
      // ARIA attrs
      const opener = this.__getRootOpener();
      const contentEl = opener
        ? opener.getContentElement()
        : this.getContentElement();
      if (!contentEl) {
        return;
      }
      const valueContentEl = value ? value.getContentElement() : null;
      if (valueContentEl) {
        contentEl.setAttribute(
          "aria-activedescendant",
          valueContentEl.getAttribute("id")
        );
      } else {
        contentEl.removeAttribute("aria-activedescendant");
      }
    },

    // property apply
    _applyOpenedButton(value, old) {
      if (old && old.getMenu()) {
        old.getMenu().exclude();
      }

      if (value) {
        value.getMenu().open();
      }
    },

    // property apply
    _applyOpener(value, old) {
      // ARIA attrs
      const contentEl = this.getContentElement();
      if (!contentEl) {
        return;
      }
      if (value && value.getContentElement()) {
        contentEl.setAttribute("aria-labelledby", "");
        this.addAriaLabelledBy(value);
      } else {
        contentEl.removeAttribute("aria-labelledby");
      }
    },

    /*
    ---------------------------------------------------------------------------
    SCROLLING SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    // @ai-todo Can CSS handle all menu overflow? Commenting out for now.
    /*getChildrenContainer() {
      return this.getChildControl("slidebar", true) || this;
    },*/

    // overridden
    _createChildControlImpl(id, hash) {
      var control;

      switch (id) {
        // @ai-todo I don't want to include a child div just because Qooxdoo does it, and Mantine is very thin (follow's Mode 3). But not sure how to handle this. 
        case "slidebar":
          //var control = new qx.ui.menu.MenuSlideBar();
          var control = this;

          var children = qx.lang.Array.clone(this.getChildren());
          for (var i = 0; i < children.length; i++) {
            //control.add(children[i]);
            control._add(children[i]);
          }

          //this._add(control);

          break;
      }

      return control || super._createChildControlImpl(id);
    },

    /**
     * Get the menu bounds
     *
     * @return {Map} The menu bounds
     */
    /*_getMenuBounds() {
      if (this.hasChildControl("slidebar")) {
        return this.getChildControl("slidebar")
          .getChildrenContainer()
          .getBounds();
      } else {
        return this.getBounds();
      }
    },*/

    /**
     * Computes the size of the menu. This method is used by the
     * {@link qx.ui.core.MPlacement} mixin.
     * @return {Map} The menu bounds
     */
    /*_computePlacementSize() {
      return this._getMenuBounds();
    },*/

    /**
     * Updates the visibility of the slidebar based on the menu's current size
     * and position.
     */
    /*__updateSlideBar() {
      var menuBounds = this._getMenuBounds();
      if (!menuBounds) {
        this.addListenerOnce("resize", this.__updateSlideBar, this);
        return;
      }

      var rootHeight = this.getLayoutParent().getBounds().height;
      var top = this.getLayoutProperties().top;
      var left = this.getLayoutProperties().left;

      // Adding the slidebar must be deferred because this call can happen
      // during the layout flush, which make it impossible to move existing
      // layout to the slidebar
      if (top < 0) {
        this._assertSlideBar(function () {
          this.setHeight(menuBounds.height + top);
          this.moveTo(left, 0);
        });
      } else if (top + menuBounds.height > rootHeight) {
        this._assertSlideBar(function () {
          this.setHeight(rootHeight - top);
        });
      } else {
        this.setHeight(null);
      }
    },*/

    /**
     * Schedules the addition of the slidebar and calls the given callback
     * after the slidebar has been added.
     *
     * @param callback {Function} the callback to call
     * @return {var|undefined} The return value of the callback if the slidebar
     * already exists, or <code>undefined</code> if it doesn't
     */
    /*_assertSlideBar(callback) {
      if (this.hasChildControl("slidebar")) {
        return callback.call(this);
      }

      this.__onAfterSlideBarAdd = callback;
      qx.ui.core.queue.Widget.add(this);
    },*/

    // overridden
    /*syncWidget(jobs) {
      this.getChildControl("slidebar");
      if (this.__onAfterSlideBarAdd) {
        this.__onAfterSlideBarAdd.call(this);
        delete this.__onAfterSlideBarAdd;
      }
    },*/

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Gets called when a child is added. Sets ARIA attrs
     * @param {*} child
     */
    /*_afterAddChild(child) {
      // Some childs, e.g. Seperators, are no meaningful menu items
      if (child instanceof qx.ui.menu.AbstractButton) {
        const contentEl = child.getContentElement();
        contentEl.setAttribute("id", "menu-item-" + child.toHashCode());
        contentEl.setAttribute("role", "menuitem");
      }
    },*/

    /**
     * Update position if the menu or the root is resized
     */
    /*_onResize() {
      if (this.isVisible()) {
        var target = this._placementTarget;
        if (!target) {
          return;
        } else if (target instanceof qx.ui.core.Widget) {
          this.placeToWidget(target, true);
        } else if (target.top !== undefined) {
          this.placeToPoint(target);
        } else {
          throw new Error("Unknown target: " + target);
        }
        this.__updateSlideBar();
      }
    },*/

    /**
     * Event listener for pointerover event.
     *
     * @param e {qx.event.type.Pointer} pointerover event
     */
    _onPointerOver(e) {
      // Cache manager
      var mgr = qx.ui.menu.Manager.getInstance();

      // Be sure this menu is kept
      mgr.cancelClose(this);

      // Change selection
      var target = e.getTarget();
      if (target.isEnabled() && target instanceof qx.ui.menu.AbstractButton) {
        // Select button directly
        this.setSelectedButton(target);

        var subMenu = target.getMenu && target.getMenu();
        if (subMenu) {
          subMenu.setOpener(target);

          // Finally schedule for opening
          mgr.scheduleOpen(subMenu);

          // Remember scheduled menu for opening
          this.__scheduledOpen = subMenu;
        } else {
          var opened = this.getOpenedButton();
          if (opened) {
            mgr.scheduleClose(opened.getMenu());
          }

          if (this.__scheduledOpen) {
            mgr.cancelOpen(this.__scheduledOpen);
            this.__scheduledOpen = null;
          }
        }
      } else if (!this.getOpenedButton()) {
        // When no button is opened reset the selection
        // Otherwise keep it
        this.resetSelectedButton();
      }
    },

    /**
     * Event listener for pointerout event.
     *
     * @param e {qx.event.type.Pointer} pointerout event
     */
    _onPointerOut(e) {
      // Cache manager
      var mgr = qx.ui.menu.Manager.getInstance();

      // Detect whether the related target is out of the menu
      if (!qx.ui.core.Widget.contains(this, e.getRelatedTarget())) {
        // Update selected property
        // Force it to the open sub menu in cases where that is opened
        // Otherwise reset it. Menus which are left by the cursor should
        // not show any selection.
        var opened = this.getOpenedButton();
        opened ? this.setSelectedButton(opened) : this.resetSelectedButton();

        // Cancel a pending close request for the currently
        // opened sub menu
        if (opened) {
          mgr.cancelClose(opened.getMenu());
        }

        // When leaving this menu to the outside, stop
        // all pending requests to open any other sub menu
        if (this.__scheduledOpen) {
          mgr.cancelOpen(this.__scheduledOpen);
        }
      }
    },

    /*
    ---------------------------------------------------------------------------
      HELPER FUNCTIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the opener of the root/the first parent menu.
     * parent menu.
     *
     * @return {ville.ui.core.Widget|null} The opener.
     */
    __getRootOpener() {
      let parentMenu = this.getParentMenu();
      if (!parentMenu) {
        return this.getOpener();
      }
      let opener;
      while (parentMenu) {
        opener = parentMenu.getOpener();
        parentMenu = parentMenu.getParentMenu();
      }
      return opener;
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    /*if (!qx.core.ObjectRegistry.inShutDown) {
      qx.ui.menu.Manager.getInstance().remove(this);
    }*/

    //this.getApplicationRoot().removeListener("resize", this._onResize, this);
    this._placementTarget = null;
    //this._disposeObjects("_blocker");
  }
});
