qx.Mixin.define("ville.cssuc.patch.MWidget", {

   construct() {

    // Private variable patching workaround
    // Remove inline styles
    //console.log(this.getContentElement().getAllStyles());
    this.setClearAllInlineStyles(true);
    //this.setAttribute("style", "", true);
    //if (this.getContentElement().getTextSelectionLength() != null)
    //console.log(this.getContentElement());

  },

  properties :
  {
    cssUtilityClass: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyCssUtilityClass",
      themeable: true
    },

    cssInlineStyles: {
      check: "Map",
      nullable: true,
      init: null,
      apply: "_applyCssInlineStyles",
      themeable: true
    },

    clearAllInlineStyles: {
      check: "Boolean",
      init: true,
      apply: "_applyClearAllInlineStyles",
      themeable: true
    },

    removeCssClasses: {
      check: "Array",
      nullable: true,
      init: null,
      apply: "_applyRemoveCssClasses",
      themeable: true
    },

    excludeInlineStyles: {
      check: "Array",
      nullable: true,
      init: null,
      apply: "_applyExcludeInlineStyles",
      themeable: true
    }

  },

  members: {

    __createContentElement() {
      var el = this._createContentElement();
      el.connectObject(this);

      // make sure to allow all pointer events
      // el.setStyles({ "touch-action": "none", "-ms-touch-action": "none" });

      if (qx.core.Environment.get("qx.debug")) {
        el.setAttribute("qxClass", this.classname);
      }

      var styles = {
        zIndex: 10,
        boxSizing: "border-box"
      };

      if (!qx.ui.root.Inline || !(this instanceof qx.ui.root.Inline)) {
        // styles.position = "absolute";
      }

      // el.setStyles(styles);

      return el;
    },

    _contentElementTag: "div",

    _createContentElement() {
      return new qx.html.Element(this._contentElementTag);
    },

    _getLayout() {
      return {
          connectToWidget: function() {},
          disconnectFromWidget: function() {},
          invalidateLayoutCache: function() {},
          invalidateChildrenCache: function() {},
          verifyLayoutProperty: function(propName, value) {
            return true;
          },
          hasHeightForWidth: function() {
            return false;
          },
          getSizeHint: function() {
            return { width: 0, height: 0, minWidth: 0, minHeight: 0, maxWidth: Infinity, maxHeight: Infinity };
          }
        };
    },

    _setLayout() {
      return;
    },

    _afterAddChild(child) {
      if (this.hasListener("addChildWidget")) {
          this.fireDataEvent("addChildWidget", child);
      }
      // Short-circuit: Do NOT call layoutManager.addChild()
      return;
    },

    _afterRemoveChild(child) {
      if (this.hasListener("removeChildWidget")) {
          this.fireDataEvent("removeChildWidget", child);
      }
      // Short-circuit: Do NOT call layoutManager.removeChild()
      return;
    },

    // property apply
    _applyCssUtilityClass(value, old) {
      var content = this.getContentElement();
      if (old) {
        content.removeClass(old);
      }
      if (value) {
        content.addClass(value);
      }
    },

    // property apply
    _applyCssInlineStyles(value, old) {
      if (value) {
        this.getContentElement().setStyles(value, true);
      }
    },

    // property apply
    _applyExcludeInlineStyles(value, old) {
      var elem = this.getContentElement();
      for (const style of value) {
        elem.removeStyle(style, true);
      }
    },

    // property apply
    _applyClearAllInlineStyles(value, old) {
      if (value) {
        var elem = this.getContentElement();
        var elemstyles = elem.getAllStyles();
        for (const style in elemstyles) {
          elem.removeStyle(style, true);
        }
        elem.removeAttribute('style', true);
      }
    },
    
    // property apply
    _applyRemoveCssClasses(value, old) {
      var elem = this.getContentElement();
      for (const qxcssclass of value) {
        elem.removeClass(qxcssclass, true);
      }
    },

    // property apply
    _applyFocusable(value, old) {
      var target = this.getFocusElement();

      // Apply native tabIndex attribute
      if (value) {
        var tabIndex = this.getTabIndex();
        if (tabIndex == null) {
          tabIndex = 1;
        }

        target.setAttribute("tabIndex", tabIndex);
        target.removeStyle("outline");
        
      } else {
        if (target.isNativelyFocusable()) {
          target.setAttribute("tabIndex", -1);
        } else if (old) {
          target.setAttribute("tabIndex", null);
        }
      }
    },

    // overridden
    _applyCursor(value, old) {},

    // overridden
    _applyZIndex(value, old) {},

    addClass(classname) {
      this.getContentElement().addClass(classname);
    },

    removeClass(classname) {
      this.getContentElement().removeClass(classname);
    },

    // API - bubble up Style/Attributes
    setStyle(style, value, direct) {
      this.getContentElement().setStyle(style, value, direct);
    },

    getStyle(style, value) {
      this.getContentElement().getStyle(style, value);
    },

    setStyles(styles, direct) {
      this.getContentElement().setStyles(styles, direct);
    },

    removeStyle(style) {
      this.getContentElement().removeStyle(style);
    },

    setAttribute(attribute, value, direct) {
      this.getContentElement().setAttribute(attribute, value, direct);
    },

    getAttribute(attribute, value) {
      this.getContentElement().getAttribute(attribute, value);
    },

    setAttributes(attributes, direct) {
      this.getContentElement().setAttributes(attributes, direct);
    },

    removeAttribute(attribute, direct) {
      this.getContentElement().removeAttribute(attribute, direct);
    }

  }
});
