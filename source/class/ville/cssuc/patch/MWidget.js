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

    /** @type {Map} List of all available ville ui widget states. */
    _villeuiStates: {
      "size-xs": true,
      "size-sm": true,
      "size-md": true,
      "size-lg": true,
      "size-xl": true,
      "compact-xs": true,
      "compact-sm": true,
      "compact-md": true,
      "compact-lg": true,
      "compact-xl": true,
      "radius-xs" : true,
      "radius-sm" : true,
      "radius-md" : true,
      "radius-lg" : true,
      "radius-xl" : true,
      "variant-default" : true,
      "variant-filled" : true,
      "variant-outline" : true,
      "variant-subtle" : true,
      "data-loading" : true
    },

    /**
     * Sets a mutually exclusive namespaced state (e.g., category: "variant", value: "filled")
     * Results in the state "variant-filled" being added, and any other "variant-*" being removed.
     */
    setVuiModifier(category, value) {
      const prefix = category + "-";
      const modState = prefix + value;
      const villeuistates = this._villeuiStates;

      if (value == null || value === "" || !(modState in this._villeuiStates)) {
        return;
      }

      if (qx.core.Environment.get("qx.debug")) {
        this.assertKeyInMap(
          modState,
          villeuistates,
          modState + " is not a valid ville ui state. Check for correct spelling or add it to the widget's _villeuiStates object - ville.cssuc.patch.MWidget"
        );
      }

      let replaced = false;
      let locatedsame = false;

      for (const stateName in villeuistates) {
        if (this.hasState(stateName) && stateName.startsWith(prefix)){
          if (modState != stateName) {
            this.replaceState(stateName, modState);
            replaced = true;
            break;
          }
          else {
            locatedsame = true;
          }
        }
      }
      
      // 2. Add the new state if a new value was provided
      if (!replaced && !locatedsame)  {
        this.addState(modState);
      }
      
      return;
    },

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
     */
    _applyCssStates(value, old) {
      // O(1) Reference Check (Bypasses heavy deep equality)
      if (!value || value === old) {
        return;
      }

      // 1. Set attributes (Map / Plain Object)
      const setAttrs = value["set-attributes"];
      if (setAttrs) {
        const oldAttrs = old ? old["set-attributes"] : null;
        let deltaAttrs = null;
        
        for (const key in setAttrs) {
          if (!oldAttrs || oldAttrs[key] !== setAttrs[key]) {
            deltaAttrs = deltaAttrs || {};
            deltaAttrs[key] = setAttrs[key];
          }
        }
        if (deltaAttrs) this.setAttributes(deltaAttrs, true);
      }

      // 2. Remove attributes (Array of strings)
      const removeAttrs = value["remove-attributes"];
      if (removeAttrs && removeAttrs.length > 0) {
        const oldRemAttrs = old ? old["remove-attributes"] : null;
        
        for (let i = 0, l = removeAttrs.length; i < l; i++) {
          const attr = removeAttrs[i];
          if (!oldRemAttrs || !oldRemAttrs.includes(attr)) {
            this.removeAttribute(attr, true);
          }
        }
      }

      // 3. Set / Add classes (Array of strings)
      const setClasses = value["set-classes"];
      if (setClasses && setClasses.length > 0) {
        const oldSetClasses = old ? old["set-classes"] : null;
        
        for (let i = 0, l = setClasses.length; i < l; i++) {
          const cls = setClasses[i];
          if (!oldSetClasses || !oldSetClasses.includes(cls)) {
            this.addClass(cls);
          }
        }
      }

      // 4. Remove classes (Array of strings)
      const removeClasses = value["remove-classes"];
      if (removeClasses && removeClasses.length > 0) {
        const oldRemClasses = old ? old["remove-classes"] : null;
        
        for (let i = 0, l = removeClasses.length; i < l; i++) {
          const cls = removeClasses[i];
          if (!oldRemClasses || !oldRemClasses.includes(cls)) {
            this.removeClass(cls);
          }
        }
      }

      // 5. Set / Add inline styles (Map / Plain Object)
      const setStyles = value["set-styles"];
      if (setStyles) {
        const oldStyles = old ? old["set-styles"] : null;
        let deltaStyles = null;
        
        for (const key in setStyles) {
          if (!oldStyles || oldStyles[key] !== setStyles[key]) {
            deltaStyles = deltaStyles || {};
            deltaStyles[key] = setStyles[key];
          }
        }
        if (deltaStyles) this.setStyles(deltaStyles, true);
      }

      // 6. Remove inline styles (Array of strings)
      const removeStyles = value["remove-styles"];
      if (removeStyles && removeStyles.length > 0) {
        const oldRemStyles = old ? old["remove-styles"] : null;
        
        for (let i = 0, l = removeStyles.length; i < l; i++) {
          const style = removeStyles[i];
          if (!oldRemStyles || !oldRemStyles.includes(style)) {
            this.removeStyle(style, true);
          }
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

    removeStyle(style, direct) {
      this.getContentElement().removeStyle(style, direct);
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
