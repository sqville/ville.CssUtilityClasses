/* ************************************************************************
SQ Notes:
* 

************************************************************************ */

/**
 * @external(mantine/core/styles/Input.css)
 * @external(mantine/core/styles/NumberInput.css)
 */
qx.Class.define("ville.ui.form.Spinner", {
  
  extend: qx.ui.form.Spinner,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct(min, value, max) {
    super();

    var layout = new qx.ui.layout.Basic();

    this._getLayout().dispose();
    this._setLayout(layout);

    this.setExcludeBoundsFromDom(true);
    this.setClearAllInlineStyles(true);
    this.setCssUtilityClass("m_e2f5cd4e m_46b77525 mantine-InputWrapper-root mantine-NumberInput-root");

    this.getContentElement().setAttribute('type', 'button');

    if (label) {
      this.setLabel(label);
    }
        
    if (variant != null) {
      this.setVariant(variant);
    } else {
      this.initVariant();
    }

    if (tabsection != null) {
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
    _applyValue(value, old) {
      //value ? this.addState("checked") : this.removeState("checked");
      //this.getContentElement().setAttribute("aria-checked", Boolean(value));
      if (value)
        this.getContentElement().setAttribute('data-active', 'true');
      else
        this.getContentElement().removeAttribute('data-active');
    },

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
          section.getContentElement().setAttribute("data-position", this.getIconPosition());
        }
      }
    },

    // property apply
    _applyShowCloseButton(value, old) {},

    // property apply
    _applyCenter(value) {}

  }
});
