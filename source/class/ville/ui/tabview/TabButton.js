/* ************************************************************************
SQ Notes:
* 

************************************************************************ */

/**
 * A TabButton is the tapable part sitting on the {@link qx.ui.tabview.Page}.
 * By tapping on the TabButton the user can set a Page active.
 *
 * @childControl label {ville.ui.basic.Label} label of the tab button
 * @childControl tabsection {qx.ui.core.Widget} icon of the tab button
 */
qx.Class.define("ville.ui.tabview.TabButton", {
  extend: qx.ui.tabview.TabButton,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct(label, variant, tabsection) {
    super();

    var layout = new qx.ui.layout.Basic();

    this._getLayout().dispose();
    this._setLayout(layout);

    this.setExcludeBoundsFromDom(true);
    this.setExcludeInlineStyles(["position"]);
    this.setCssUtilityClass("mantine-focus-auto m_539e827b m_4ec4dce6 mantine-Tabs-tab m_87cf2631 mantine-UnstyledButton-root");
    this.setSelectable(null);
    this.getContentElement().setAttribute('type', 'button');

    if (label) {
      this.setLabel(label);
    }
        
    if (variant) {
      this.setVariant(variant);
    } else {
      this.initVariant();
    }

    if (tabsection !== undefined) {
      this.setTabSection(tabsection);
    }

  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    iconPosition: {
      refine: true,
      init: "left"
    },

    appearance: {
      refine: true,
      init: "blank"
    },

    variant: {
      init: "default",
      check: ["default", "outline", "pills"],
      apply: "_applyVariant",
      themeable: true,
      event: "changeVariant"
    },

    tabSection: {
      check: "qx.ui.core.Widget",
      apply: "_applyTabSection",
      nullable: true,
      themeable: true,
      event: "changeTabSection"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {

    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createContentElement() {
        return new qx.html.Element("button");
    },

    // overridden
    _createChildControlImpl(id, hash) {
      var control;

      switch (id) {
        case "tabsection":
          control = new ville.ui.basic.Label();
          control.setAnonymous(true);
          control.setCssUtilityClass("m_fc420b1f mantine-Tabs-tabSection");
          control.getContentElement().setAttribute("data-position", "left");
          this._add(control);
          break;

        case "label":
          control = new ville.ui.basic.Label();
          control.setAnonymous(true);
          control.setSelectable(this.getSelectable());
          control.setCssUtilityClass("m_42bbd1ae mantine-Tabs-tabLabel");
          this._add(control);
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyIconPosition(value, old) {
      if (value) {
        var section = this.getChildControl("tabsection");
        if (section) {
          if (value === "top" || value === "bottom") {
            section.getContentElement().setAttribute("data-position", "left");
          } else {
            section.getContentElement().setAttribute("data-position", value);
          }
        } 
      }
    },

    // overridden
    _applyIcon(value, old) {},

    // overridden
    _applyLabel(value, old) {
      if (value) {
        var label = this.getChildControl("label");
        if (label) {
          label.setValue(value);
        }
      }
    },

    // property apply
    _applyVariant(value, old) {
      if (value) {
        this.getContentElement().setAttribute("data-variant", value);
      }
    },

    _applyTabSection(value, old) {
      var section = this.getChildControl("tabsection");
      if (section) {
        if (old) {
          section.removeAll();
        }
        if (value) {
          section.add(value);
          section.getContentElement().setAttribute("data-position", "true");
        }
      }
    },

    // property apply
    _applyShowCloseButton(value, old) {},

    // property apply
    _applyCenter(value) {}

  }
});
