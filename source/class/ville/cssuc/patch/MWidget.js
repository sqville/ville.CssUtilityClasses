qx.Mixin.define("ville.cssuc.patch.MWidget", {

  properties :
  {
    cssUtilityClass: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyCssUtilityClass",
      themeable: true
    },

    excludeInlineStyles: {
      check: "Array",
      nullable: true,
      init: null,
      apply: "_applyExcludeInlineStyles",
      themeable: true
    },

    clearAllInlineStyles: {
      check: "Boolean",
      init: false,
      apply: "_applyClearAllInlineStyles",
      themeable: true
    },

    removeCssClasses: {
      check: "Array",
      nullable: true,
      init: null,
      apply: "_applyRemoveCssClasses",
      themeable: true
    }
  },

  members: {

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

        // Omit native dotted outline border
        if (qx.core.Environment.get("ville.cssuc")) {
          if (qx.core.Environment.get("qx.debug"))
            this.assert(qx.Class.hasProperty(this.constructor, "excludeBoundsFromDom"), "Missing ExcludeBoundsFromDom property.");
          if (this.getExcludeBoundsFromDom())
            target.removeStyle("outline");
          else
            target.setStyle("outline", "none");
        } else {
          target.setStyle("outline", "none");
        }
        
      } else {
        if (target.isNativelyFocusable()) {
          target.setAttribute("tabIndex", -1);
        } else if (old) {
          target.setAttribute("tabIndex", null);
        }
      }
    },

    // overridden
    _applyCursor(value, old) {
      if (value == null && !this.isSelectable()) {
        value = "default";
      }

      if (qx.core.Environment.get("ville.cssuc")) {
        if (!this.getExcludeBoundsFromDom()) {
          this.getContentElement().setStyle(
            "cursor",
            value,
            qx.core.Environment.get("engine.name") == "opera"
          );
        }
      } else {
        // In Opera the cursor must be set directly.
        // http://bugzilla.qooxdoo.org/show_bug.cgi?id=1729
        this.getContentElement().setStyle(
          "cursor",
          value,
          qx.core.Environment.get("engine.name") == "opera"
        );
      }
      
    }
  }
});
