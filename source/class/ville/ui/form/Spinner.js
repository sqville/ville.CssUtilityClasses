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

  construct(min, value, max, variant, sectionleft, sectionright) {
    super(min, value, max);

    this.setExcludeBoundsFromDom(true);
    this.setClearAllInlineStyles(true);
    this.setCssUtilityClass("m_6c018570 mantine-Input-wrapper mantine-NumberInput-wrapper");
        
    if (variant) {
      this.setVariant(variant);
    } else {
      this.initVariant();
    }

    if (sectionleft) {
      this.setSectionLeft(sectionleft);
    }

    if (sectionright) {
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
        return new qx.html.Element("button");
    },

    // overridden
    _createChildControlImpl(id, hash) {
      var control;
      var innerwrapper;

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
          control.addState("inner");
          control.setFocusable(false);
          control.addListener("execute", this._countUp, this);
          //this._add(control, { column: 1, row: 0 });

          break;

        case "downbutton":
          control = new qx.ui.form.RepeatButton();
          control.addState("inner");
          control.setFocusable(false);
          control.addListener("execute", this._countDown, this);
          this._add(control, { column: 1, row: 1 });
          break;

        case "sectionleft":
          control = new ville.ui.form.InputSection();
          control.setAnonymous(true);
          control.setCssUtilityClass("m_82577fc2 mantine-Input-section mantine-TextInput-section");
          control.setAttribute("data-position", "left");
          innerwrapper = this.getChildControl("innerwrapper");
          innerwrapper.add(control);
          break;

        case "sectionright":
          control = new ville.ui.form.InputSection();
          control.setAnonymous(true);
          control.setCssUtilityClass("m_82577fc2 mantine-Input-section mantine-TextInput-section");
          control.setAttribute("data-position", "right");
          innerwrapper = this.getChildControl("innerwrapper");
          innerwrapper.add(control);
          break;

        case "inputwrapper":
          control = new ville.ui.core.InnerWrapper("div");
          control.setCssUtilityClass("m_8fb7ebe7 mantine-Input-input");
          innerwrapper = this.getChildControl("innerwrapper");
          innerwrapper.add(control);
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
        if (value) {
            var innerwrapper = this.getChildControl("innerwrapper");
            if (innerwrapper) {
                innerwrapper.setAttribute("data-variant", value);
            }
        }
    },

    _applySize(value, old) {
        if (value) {
            var innerwrapper = this.getChildControl("innerwrapper");
            if (innerwrapper) {
                this.setAttribute("data-size", value);
                innerwrapper.setAttribute("data-size", value);
                innerwrapper.setStyles({
                    "--input-height" : `var(--input-height-${value})`, 
                    "--input-fz" : `var(--mantine-font-size-${value})`
                });
                var label = this.getLabel();
                if (label) {
                    label.setSize(value);
                }
            }
        }
    },

    _applyRadius(value, old) {
        if (value) {
            var innerwrapper = this.getChildControl("innerwrapper");
            if (innerwrapper) {
                innerwrapper.setStyle("--input-radius", `var(--mantine-radius-${value})`);
            }
        }
    },

    // property apply
    _applySectionLeft(value, old) {
        var innerwrapper = this.getChildControl("innerwrapper");
        if (innerwrapper) {
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
        }
    },

    _applySectionRight(value, old) {
        var innerwrapper = this.getChildControl("innerwrapper");
        if (innerwrapper) {
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

  }
});
