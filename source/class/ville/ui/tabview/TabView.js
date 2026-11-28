/**
 * A TabView is a multi-page view where only one page is visible at a time,
 * switchable via the tab buttons in the tab bar.
 *
 * Baseline 2025 Enhancements:
 * - Semantic ARIA tablist (`role="tablist"`), tab (`role="tab"`), and tabpanel (`role="tabpanel"`).
 * - Inactive pages use `visibility: "until-found"` (`hidden="until-found"`) by default so
 *   native browser Find-in-Page (`Ctrl+F` / `Cmd+F`) searches across all tabs and fires
 *   the `"beforematch"` event to auto-activate the matching tab.
 * - Optional View Transitions API (`document.startViewTransition`) integration for smooth
 *   hardware-accelerated tab switching when `useViewTransition` is enabled.
 * - Arrow-key (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Home`, `End`) keyboard
 *   navigation across the tab bar.
 *
 * @childControl bar {ville.ui.core.Box} Tab bar container (`role="tablist"`) holding tab buttons
 * @childControl pane {ville.ui.core.Box} Container holding the tab pages
 */
qx.Class.define("ville.ui.tabview.TabView", {
  extend: ville.ui.core.Box,
  implement: [ville.ui.core.ISingleSelection],
  include: [ville.ui.core.MContentPadding],

  /**
   * @param barPosition {String?"top"} Initial bar position (`"top"`, `"bottom"`, `"left"`, `"right"`)
   */
  construct(barPosition) {
    super();

    this.__barPositionToState = {
      top: "barTop",
      right: "barRight",
      bottom: "barBottom",
      left: "barLeft"
    };

    this._createChildControl("bar");
    this._createChildControl("pane");

    const manager = (this.__radioGroup = new ville.ui.form.RadioGroup());
    manager.setWrap(false);
    manager.addListener("changeSelection", this._onChangeSelection, this);

    if (barPosition != null) {
      this.setBarPosition(barPosition);
    } else {
      this.initBarPosition();
    }

    this.addListener("keydown", this._onKeyDown, this);
  },

  events: {
    /** Fires after the selection was modified. Data: `{ville.ui.tabview.Page[]}` */
    changeSelection: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "tabview"
    },

    /**
     * This property defines on which side of the TabView the tab bar should be positioned.
     */
    barPosition: {
      check: ["left", "right", "top", "bottom"],
      init: "top",
      apply: "_applyBarPosition"
    },

    /**
     * Whether tab switches should wrap in `document.startViewTransition()` when available.
     */
    useViewTransition: {
      check: "Boolean",
      init: false
    }
  },

  members: {
    __radioGroup: null,
    __barPositionToState: null,
    __selectedPage: null,

    /**
     * Adds a Page to the TabView.
     *
     * @param page {ville.ui.tabview.Page} The page to be added
     */
    add(page) {
      this.addAt(page, null);
    },

    /**
     * Adds a Page to the TabView at the specified index.
     *
     * @param page {ville.ui.tabview.Page} The page to be added
     * @param index {Integer?null} Optional target index
     */
    addAt(page, index = null) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!(page instanceof ville.ui.tabview.Page)) {
          throw new Error("Incompatible child for TabView: " + page);
        }
      }

      const bar = this.getChildControl("bar");
      const pane = this.getChildControl("pane");
      const button = page.getButton();

      if (index != null) {
        bar.addAt(button, index);
        pane.addAt(page, index);
      } else {
        bar.add(button);
        pane.add(page);
      }

      // Set Initial Hidden / Visible State before registering with RadioGroup
      const currentSelection = this.__radioGroup.getSelection();
      if (currentSelection.length === 0) {
        this.__selectedPage = page;
        page.show();
      } else {
        page.setVisibility(page.isSearchableWhenHidden() ? "until-found" : "excluded");
      }

      this.__radioGroup.add(button);
      page.addState(this.__barPositionToState[this.getBarPosition()]);

      page.addListener("close", this._onPageClose, this);
    },

    /**
     * Removes a Page from the TabView.
     *
     * @param page {ville.ui.tabview.Page} The page to be removed
     */
    remove(page) {
      const bar = this.getChildControl("bar");
      const pane = this.getChildControl("pane");
      const button = page.getButton();

      page.removeListener("close", this._onPageClose, this);

      this.__radioGroup.remove(button);
      bar.remove(button);
      pane.remove(page);

      if (this.__selectedPage === page) {
        const remaining = pane.getChildren();
        this.__selectedPage = remaining[0] || null;
        if (this.__selectedPage) {
          this.setSelection([this.__selectedPage]);
        }
      }

      page.removeState(this.__barPositionToState[this.getBarPosition()]);
    },

    /**
     * Returns all TabView pages inside the pane.
     *
     * @return {ville.ui.tabview.Page[]}
     */
    getChildren() {
      return this.getChildControl("pane").getChildren();
    },

    _createChildControlImpl(id) {
      let control;

      switch (id) {
        case "bar":
          control = new ville.ui.core.Box(new ville.ui.layout.HBox(2));
          control.setAttribute("role", "tablist");
          control.setZIndex(10);
          this._addAt(control, 0);
          break;

        case "pane":
          control = new ville.ui.core.Box(new ville.ui.layout.Grow());
          control.setZIndex(5);
          this._addAt(control, 1, { flex: 1 });
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    _getContentPaddingTarget() {
      return this.getChildControl("pane");
    },

    _applyBarPosition(value, old) {
      const bar = this.getChildControl("bar");
      const pane = this.getChildControl("pane");
      const horizontal = value === "top" || value === "bottom";

      bar.setAttribute("aria-orientation", horizontal ? "horizontal" : "vertical");

      // Re-arrange layout direction and child order
      this._removeAll();

      if (horizontal) {
        this._setLayout(new ville.ui.layout.VBox());
        bar.setLayout(new ville.ui.layout.HBox(2));
        if (value === "top") {
          this._add(bar);
          this._add(pane, { flex: 1 });
        } else {
          this._add(pane, { flex: 1 });
          this._add(bar);
        }
      } else {
        this._setLayout(new ville.ui.layout.HBox());
        bar.setLayout(new ville.ui.layout.VBox(2));
        if (value === "left") {
          this._add(bar);
          this._add(pane, { flex: 1 });
        } else {
          this._add(pane, { flex: 1 });
          this._add(bar);
        }
      }

      const pages = pane.getChildren();
      if (old) {
        const oldState = this.__barPositionToState[old];
        this.removeState(oldState);
        bar.removeState(oldState);
        pane.removeState(oldState);
        for (let i = 0; i < pages.length; i++) {
          pages[i].removeState(oldState);
        }
      }

      if (value) {
        const newState = this.__barPositionToState[value];
        this.addState(newState);
        bar.addState(newState);
        pane.addState(newState);
        for (let i = 0; i < pages.length; i++) {
          pages[i].addState(newState);
        }
      }
    },

    _onChangeSelection(e) {
      const pane = this.getChildControl("pane");
      const button = e.getData()[0];
      const oldButton = e.getOldData()[0];
      const newPage = button ? button.getUserData("page") : null;
      const oldPage = oldButton ? oldButton.getUserData("page") : this.__selectedPage;

      const applySwitch = () => {
        const pages = pane.getChildren();
        for (let i = 0; i < pages.length; i++) {
          const p = pages[i];
          if (p === newPage) {
            p.show();
          } else {
            p.setVisibility(p.isSearchableWhenHidden() ? "until-found" : "excluded");
          }
        }
        this.__selectedPage = newPage;
      };

      if (
        this.isUseViewTransition() &&
        typeof document !== "undefined" &&
        typeof document.startViewTransition === "function" &&
        this.isSeeable()
      ) {
        document.startViewTransition(() => {
          applySwitch();
        });
      } else {
        applySwitch();
      }

      const value = newPage ? [newPage] : [];
      const old = oldPage && oldPage !== newPage ? [oldPage] : [];
      this.fireDataEvent("changeSelection", value, old);
    },

    _onKeyDown(e) {
      const key = typeof e.getKey === "function" ? e.getKey() : e.key;
      const pages = this.getChildren().filter((p) => p.getEnabled() !== false);
      if (pages.length <= 1) return;

      const current = this.__selectedPage;
      const idx = pages.indexOf(current);
      if (idx === -1) return;

      let nextIdx = -1;
      if (key === "Right" || key === "ArrowRight" || key === "Down" || key === "ArrowDown") {
        nextIdx = (idx + 1) % pages.length;
      } else if (key === "Left" || key === "ArrowLeft" || key === "Up" || key === "ArrowUp") {
        nextIdx = (idx - 1 + pages.length) % pages.length;
      } else if (key === "Home") {
        nextIdx = 0;
      } else if (key === "End") {
        nextIdx = pages.length - 1;
      }

      if (nextIdx !== -1 && nextIdx !== idx) {
        if (typeof e.preventDefault === "function") {
          e.preventDefault();
        }
        const targetPage = pages[nextIdx];
        this.setSelection([targetPage]);
        targetPage.getButton().focus();
      }
    },

    _onPageClose(e) {
      const page = e.getTarget();
      this.remove(page);
    },

    // ------------------------------------------------------------------------
    // ISingleSelection Implementation
    // ------------------------------------------------------------------------

    getSelection() {
      const buttons = this.__radioGroup.getSelection();
      const result = [];
      for (let i = 0; i < buttons.length; i++) {
        const page = buttons[i].getUserData("page");
        if (page) result.push(page);
      }
      return result;
    },

    setSelection(items) {
      const buttonItems = [];
      if (Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
          if (items[i] && typeof items[i].getButton === "function") {
            buttonItems.push(items[i].getButton());
          }
        }
      }
      this.__radioGroup.setSelection(buttonItems);
    },

    resetSelection() {
      this.__radioGroup.resetSelection();
    },

    isSelected(item) {
      if (!item || typeof item.getButton !== "function") return false;
      return this.__radioGroup.isSelected(item.getButton());
    },

    isSelectionEmpty() {
      return this.__radioGroup.isSelectionEmpty();
    },

    getSelectables(all) {
      const buttons = this.__radioGroup.getSelectables(all);
      const result = [];
      for (let i = 0; i < buttons.length; i++) {
        const page = buttons[i].getUserData("page");
        if (page) result.push(page);
      }
      return result;
    }
  },

  destruct() {
    this._disposeObjects("__radioGroup");
    this.__barPositionToState = null;
    this.__selectedPage = null;
  }
});
