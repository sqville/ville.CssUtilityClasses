qx.Mixin.define("ville.cssuc.patch.MWidget", {

   construct() {

    // Private variable patching workaround for qx.debug builds
    // Remove inline styles - leaves empty style attribute (i.e. style="")
    if (qx.core.Environment.get("qx.debug"))
    {
      this.setClearAllInlineStyles(true);
    }

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

    cssStates: {
      check: "Map",
      nullable: true,
      init: null,
      apply: "_applyCssStates",
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

    /**
     * Removes widget's content HTML element styles
     * Only applies to builds with qx.debud = "off" per Qooxdoo's patching feature
     * 
     */
    __createContentElement() {
      var el = this._createContentElement();
      el.connectObject(this);

      if (qx.core.Environment.get("qx.debug")) {
        el.setAttribute("qxClass", this.classname);
      }

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

    /**
     * Removes call to layoutManager.addChild()
     */
    _afterAddChild(child) {
      if (this.hasListener("addChildWidget")) {
          this.fireDataEvent("addChildWidget", child);
      }
      // Short-circuit: Do NOT call layoutManager.addChild()
      return;
    },

    /**
     * Removes call to layoutManager.addChild()
     */
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

    /**
     * "set-attributes" - Map of strings
     * "remove-attributes" - Array of strings
     * "set-classes" - Array of strings
     * "remove-classes" - Array of strings
     * "set-styles" - Map of strings
     * "remove-styles" - Array of strings
     * 
     */
    _applyCssStates(value, old) {
      if (!value || qx.lang.Object.equals(value, old)) {
        return;
      }

      // 1. Set attributes
      const setAttrs = value["set-attributes"];
      if (setAttrs) {
        for (const key in setAttrs) {
          this.setAttribute(key, setAttrs[key], true);
        }
      }

      // 2. Remove attributes
      const removeAttrs = value["remove-attributes"];
      if (qx.lang.Type.isArray(removeAttrs)) {
        for (const attname of removeAttrs) {
          this.removeAttribute(attname, true);
        }
      }

      // 3. Set / Add classes
      const setClasses = value["set-classes"];
      if (qx.lang.Type.isArray(setClasses)) {
        for (const classname of setClasses) {
          this.addClass(classname);
        }
      }

      // 4. Remove classes
      const removeClasses = value["remove-classes"];
      if (qx.lang.Type.isArray(removeClasses)) {
        for (const classname of removeClasses) {
          this.removeClass(classname);
        }
      }

      // 5. Set / Add inline styles
      const setStyles = value["set-styles"];
      if (qx.lang.Type.isArray(setClasses)) {
        for (const classname of setClasses) {
          this.addClass(classname);
        }
      }

      // 6. Remove inline styles
      const removeStyles = value["remove-styles"];
      if (qx.lang.Type.isArray(removeStyles)) {
        for (const classname of removeClasses) {
          this.removeClass(classname);
        }
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
        elem.setAttribute("style", "");
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
