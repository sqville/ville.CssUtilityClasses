/**
 * A page represents both the tab button on the bar and the panel widget shown
 * in the content pane of a `{ville.ui.tabview.TabView}`.
 *
 * Baseline 2025 Enhancement:
 * - Inactive pages use `visibility: "until-found"` (`hidden="until-found"`) by default,
 *   allowing native browser Find-in-Page (`Ctrl+F` / `Cmd+F`) to search inside
 *   inactive tabs and fire the native `"beforematch"` event so `TabView` automatically
 *   switches to the matching tab!
 *
 * @childControl button {ville.ui.tabview.TabButton} Tab button for the TabView bar
 */
qx.Class.define("ville.ui.tabview.Page", {
  extend: ville.ui.core.Box,

  /**
   * @param label {String?""} Initial label of the tab
   * @param icon {String?null} Initial icon of the tab
   * @param layout {ville.ui.layout.Abstract?null} Optional layout for the page panel
   */
  construct(label, icon, layout) {
    super(layout || new ville.ui.layout.VBox());

    this.setAttribute("role", "tabpanel");

    this._createChildControl("button");

    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    // Listen to native Baseline 2025 `beforematch` so browser Find-in-Page
    // (`Ctrl+F` / `Cmd+F`) on `hidden="until-found"` panels reveals this tab!
    const el = this.getContentElement();
    if (el) {
      el.addListener("beforematch", () => {
        this.fireEvent("beforeMatch");
        const btn = this.getChildControl("button");
        if (btn && !btn.getValue()) {
          btn.setValue(true);
        }
      });
    }
  },

  events: {
    /** Fired when the close button of the TabButton is tapped. */
    close: "qx.event.type.Event",

    /**
     * Fired when the browser's Find-in-Page (`Ctrl+F`) matches text inside this
     * inactive `hidden="until-found"` tab panel.
     */
    beforeMatch: "qx.event.type.Event"
  },

  properties: {
    appearance: {
      refine: true,
      init: "tabview-page"
    },

    /** The label/caption/text of the Page's TabButton. */
    label: {
      check: "String",
      init: "",
      apply: "_applyLabel"
    },

    /** Any URI String supported by `ville.ui.icon.Default` or image URL. */
    icon: {
      check: "String",
      init: "",
      nullable: true,
      apply: "_applyIcon"
    },

    /** Indicates if the close button on the TabButton should be shown. */
    showCloseButton: {
      check: "Boolean",
      init: false,
      apply: "_applyShowCloseButton"
    },

    /**
     * Whether inactive pages use `hidden="until-found"` (`visibility: "until-found"`)
     * so browser Find-in-Page (`Ctrl+F`) can search and auto-activate them.
     */
    searchableWhenHidden: {
      check: "Boolean",
      init: true
    }
  },

  members: {
    _applyStates(states, Value, isAdd) {
      super._applyStates(states, Value, isAdd);
      const button = this.getChildControl("button", true);
      if (button) {
        if (isAdd) {
          button.addState(Value);
        } else {
          button.removeState(Value);
        }
      }
    },

    _createChildControlImpl(id) {
      let control;

      switch (id) {
        case "button": {
          control = new ville.ui.tabview.TabButton();
          control.setAllowGrowX(true);
          control.setAllowGrowY(true);
          control.setUserData("page", this);
          control.addListener("close", this._onButtonClose, this);

          // Link ARIA tab -> tabpanel
          const panelId = `ville-tabpanel-${this.toHashCode()}`;
          const tabId = `ville-tab-${control.toHashCode()}`;
          this.setAttribute("id", panelId);
          this.setAttribute("aria-labelledby", tabId);
          control.setAttribute("id", tabId);
          control.setAttribute("aria-controls", panelId);
          break;
        }
      }

      return control || super._createChildControlImpl(id);
    },

    _applyLabel(value) {
      this.getChildControl("button").setLabel(value);
    },

    _applyIcon(value) {
      const btn = this.getChildControl("button");
      if (value) {
        btn.setIcon(value);
      } else {
        btn.resetIcon();
      }
    },

    _applyShowCloseButton(value) {
      this.getChildControl("button").setShowCloseButton(value);
    },

    _applyEnabled(value, old) {
      super._applyEnabled(value, old);
      const btn = this.getChildControl("button", true);
      if (btn) {
        if (value === null) {
          btn.resetEnabled();
        } else {
          btn.setEnabled(value);
        }
      }
    },

    _onButtonClose() {
      this.fireEvent("close");
    },

    /**
     * Returns the TabButton widget associated with this Page.
     *
     * @return {ville.ui.tabview.TabButton}
     */
    getButton() {
      return this.getChildControl("button");
    }
  }
});
