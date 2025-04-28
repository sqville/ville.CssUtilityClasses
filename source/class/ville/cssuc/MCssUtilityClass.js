qx.Mixin.define("ville.cssuc.MCssUtilityClass",
    {      
      properties :
      {
        cssUtilityClass: {
            check: "String",
            nullable: true,
            init: null,
            apply: "_applyCssUtilityClass",
            themeable: true
          },

        cssUtilityStyle: {
          check: "Array",
          nullable: true,
          init: null,
          apply: "_applyCssUtilityStyle",
          themeable: true
        },

        cssUtilityStyleClearAll: {
          check: "Boolean",
          init: false,
          apply: "_applyCssUtilityStyleClearAll",
          themeable: true
        },

        qxClassClear: {
          check: "Array",
          nullable: true,
          init: null,
          apply: "_applyQxClassClear",
          themeable: true
        }
      },
    
      /*
      *****************************************************************************
         MEMBERS
      *****************************************************************************
      */
    
      members :
      {
        // property apply
        _applyCssUtilityClass(value, old) {
          var content = this.getContentElement();
          if (old) {
            content.removeClass(old);
          }
          if (value) {
            content.addClass(value);
          }
          //this.getContentElement().setCssClass(value);
        },

        _applyCssUtilityStyle(value, old) {
          var elem = this.getContentElement();
          for (const style of value) {
            elem.removeStyle(style, true);
          }
        },

        _applyCssUtilityStyleClearAll(value, old) {
          if (value) {
            var elem = this.getContentElement();
            var elemstyles = elem.getAllStyles();
            for (const style in elemstyles) {
              elem.removeStyle(style, true);
            }
          }
        },
        
        _applyQxClassClear(value, old) {
          var elem = this.getContentElement();
          for (const qxcssclass of value) {
            elem.removeClass(qxcssclass, true);
          }
        }
      }
    });