/* ************************************************************************
SQ Notes:
* 

************************************************************************ */

/**
 * @external(mantine/core/styles/Input.css)
 * @external(mantine/core/styles/NumberInput.css)
 * @require(ville.ui.icon.ChevronDown)
 */
qx.Class.define("ville.ui.form.Spinner", {
  
  extend: qx.ui.form.Spinner,

  include: [qx.ui.core.MChildrenHandling, ville.ui.core.MWidget],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct(min, value, max, variant, sectionleft, sectionright) {
    super(min, value, max);

    this.setExcludeBoundsFromDom(true);
    this.setClearAllInlineStyles(true);
    this.setCssUtilityClass("m_6c018570 mantine-Input-wrapper mantine-NumberInput-wrapper");
        
    if (variant != null) {
      this.setVariant(variant);
    } else {
      this.initVariant();
    }

    if (sectionleft != null) {
      this.setSectionLeft(sectionleft);
    }

    // create textfield
    //this._createChildControl("textfield");

    if (sectionright != null) {
      this.setSectionRight(sectionright);
    }

    this.initSize();
    this.initRadius();

  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {

    variant: {
        init: "default",
        check: ["default", "filled", "light", "outline", "subtle", "transparent", "white"],
        apply: "_applyVariant",
        themeable: true,
        event: "changeVariant"
    },

    size: {
        init: "sm",
        check: ["xs", "sm", "md", "lg", "xl"],
        apply: "_applySize",
        nullable: true,
        themeable: true,
        event: "changeSize"
    },

    radius: {
        init: "md",
        check: ["xs", "sm", "md", "lg", "xl"],
        apply: "_applyRadius",
        nullable: true,
        themeable: true,
        event: "changeRadius"
    },

    sectionLeft: {
        check: "qx.ui.core.Widget",
        apply: "_applySectionLeft",
        nullable: true,
        event: "changeSectionLeft"
    },

    sectionRight: {
        check: "qx.ui.core.Widget",
        apply: "_applySectionRight",
        nullable: true,
        event: "changeSectionRight"
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
        return new qx.html.Element("div");
    },

    // overridden
    _createChildControlImpl(id, hash) {
      var control;
      var buttoncontrols;

      switch (id) {
        case "textfield":
          control = new ville.ui.form.TextField();
          control.setFilter(this._getFilterRegExp());
          control.addState("inner");
          //control.setWidth(40);
          control.setFocusable(false);
          control.addListener("changeValue", this._onTextChange, this);
          //this._add(control, { column: 0, row: 0, rowSpan: 2 });
          this._add(control);
          break;

        case "upbutton":
          control = new ville.ui.form.RepeatButton();
          control.setCssUtilityClass("mantine-focus-auto m_80b4b171 mantine-NumberInput-control m_87cf2631 mantine-UnstyledButton-root");
          control.setAttribute("data-direction", "up");
          control.addState("inner");
          control.setFocusable(false);
          control.addListener("execute", this._countUp, this);
          var defaulticon = new ville.ui.icon.ChevronDown();
          defaulticon.setViewBox("0 0 15 15");
          defaulticon.setStyles({
            "width": "var(--ni-chevron-size)",
            "height": "var(--ni-chevron-size)",
            "transform": "rotate(180deg)"
          });
          control.add(defaulticon);
          buttoncontrols = this.getChildControl("buttoncontrols");
          buttoncontrols.addAt(control, 0);
          //this._add(control, { column: 1, row: 0 });
          break;

        case "downbutton":
          control = new ville.ui.form.RepeatButton();
          control.setCssUtilityClass("mantine-focus-auto m_80b4b171 mantine-NumberInput-control m_87cf2631 mantine-UnstyledButton-root");
          control.setAttribute("data-direction", "down");
          control.addState("inner");
          control.setFocusable(false);
          control.addListener("execute", this._countDown, this);
          var defaulticon = new ville.ui.icon.ChevronDown();
          defaulticon.setViewBox("0 0 15 15");
          defaulticon.setStyles({
            "width": "var(--ni-chevron-size)",
            "height": "var(--ni-chevron-size)"
          });
          control.add(defaulticon);
          buttoncontrols = this.getChildControl("buttoncontrols");
          buttoncontrols.add(control);
          //this._add(control, { column: 1, row: 1 });
          break;

        case "sectionleft":
          control = new ville.ui.form.InputSection();
          control.setAnonymous(true);
          control.setCssUtilityClass("m_82577fc2 mantine-Input-section mantine-NumberInput-section");
          control.setAttribute("data-position", "left");
          this._addAt(control, 0);
          break;

        case "sectionright":
          control = new ville.ui.form.InputSection();
          control.setAnonymous(true);
          control.setCssUtilityClass("m_82577fc2 mantine-Input-section mantine-NumberInput-section");
          control.setAttribute("data-position", "right");
          this._add(control);
          break;

        case "buttoncontrols":
          control = new ville.ui.layout.VStack();
          control.setCssUtilityClass("m_95e17d22 mantine-NumberInput-controls");
          var sectionright = this.getChildControl("sectionright");
          sectionright.add(control);
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyVariant(value, old) {
        if (value)
            this.setAttribute("data-variant", value);
    },

    _applySize(value, old) {
        if (value) {
            this.setAttribute("data-size", value);
            this.setStyles({
                "--input-height" : `var(--input-height-${value})`, 
                "--input-fz" : `var(--mantine-font-size-${value})`
            });
        }
    },

    _applyRadius(value, old) {
        if (value)
            this.setStyle("--input-radius", `var(--mantine-radius-${value})`);
    },

    // property apply
    _applySectionLeft(value, old) {
        var section = this.getChildControl("sectionleft");
        if (section) {
            if (old) {
                section.removeAll();
            }

            if (value) {
                section.add(value);
                this.setAttribute("data-with-left-section", "true");
            } else {
                this.removeAttribute("data-with-left-section");
            }
        }
    },

    _applySectionRight(value, old) {
        var section = this.getChildControl("sectionright");
        if (section) {
            if (old) {
                section.removeAll();
            }

            if (value) {
                section.add(value);
                this.setAttribute("data-with-right-section", "true");
            } else {
                this.removeAttribute("data-with-right-section");
            }
        }
    }

  }
});
