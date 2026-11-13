qx.Class.define("ville.ui.core.WidgetLast", {
  extend: qx.core.Object,
  include: [qx.locale.MTranslation],
  implement: [qx.core.IDisposable],

  construct(existingDomId) {
    super();
    
    // Pure data initialization. Absolutely NO DOM creation here.
    this.__children = [];
    this.__states = {};
    this.__childControls = {};
    this.__existingDomId = existingDomId; 

  },


  properties: {

    ariaRole: {
      check: "String",
      nullable: true,
      apply: "_applyAriaRole"
    },
    
    enabled: {
      check: "Boolean",
      init: true,
      apply: "_applyEnabled",
      event: "changeEnabled"
    },

    visibility: {
      check: ["visible", "hidden", "excluded"],
      init: "visible",
      apply: "_applyVisibility",
      event: "changeVisibility"
    },

    // A base property to apply your Mantine/CSS utility classes
    cssUtilityClass: {
      check: "String",
      nullable: true,
      apply: "_applyCssUtilityClass"
    },

    // Mantine specific property
    variant: {
      check: "String",
      nullable: true,
      apply: "_applyVariant"
    }

  },

  members: {
    __contentElement: null,
    __existingDomId: null,
    __childControls: null,

    /**
     * Map of states to forward to child controls. 
     * Subclasses can override this declaratively.
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: null,

    /** @warning Do not modify this value after the widget's constructor has finished executing. */
    _contentElementTag: "div",

    // --- 1. WAI-ARIA Support ---
    
    _applyAriaRole(value, old) {
      const el = this.getContentElement();
      if (value) {
        el.setAttribute("role", value);
      } else {
        el.removeAttribute("role");
      }
    },

    setAriaState(state, value) {
      const el = this.getContentElement();
      if (value === null) {
        el.removeAttribute("aria-" + state);
      } else {
        el.setAttribute("aria-" + state, String(value));
      }
    },

    // --- Element Lifecycle (Lazy Load) ---

    getContentElement() {
      if (!this.__contentElement) {
        this.__contentElement = this.__createContentElement();
      }
      return this.__contentElement;
    },

    __createContentElement() {
      // 1. Call the protected factory method (subclasses override this)
      const el = this._createContentElement();

      // 2. Bind the DOM element for memory management
      el.connectObject(this);

      // 3. Hydration Mode: Bind to existing DOM if applicable
      if (this.__existingDomId !== undefined && this.__existingDomId !== null) {
        const staticNode = document.getElementById(this.__existingDomId);
        if (staticNode) {
          el.useElement(staticNode);
        }
      }

      // 4. Debugging metadata
      if (qx.core.Environment.get("qx.debug")) {
        el.setAttribute("villeClass", this.classname);
      }

      return el;
    },

    /**
     * @protected
     * Default factory method. Returns a div unless overridden by a subclass.
     */
    _createContentElement() {
      // Developer guardrail: Prevent mutation after DOM generation
      if (qx.core.Environment.get("qx.debug")) {
        Object.defineProperty(this, "_contentElementTag", {
          writable: false,
          value: this._contentElementTag
        });
      }
      
      return new qx.html.Element(this._contentElementTag);
    },

    // --- State Management ---

    addState(state) {
      if (!this.__states[state]) {
        this.__states[state] = true;
        this._syncCssAppearance();

        // Push state dynamically to all existing child controls
        if (this._forwardStates && this._forwardStates[state]) {
          for (let id in this.__childControls) {
            this.__childControls[id].addState(state);
          }
        }
      }
    },

    removeState(state) {
      if (this.__states[state]) {
        delete this.__states[state];
        this._syncCssAppearance();

        // Remove state dynamically from all existing child controls
        if (this._forwardStates && this._forwardStates[state]) {
          for (let id in this.__childControls) {
            this.__childControls[id].removeState(state);
          }
        }
      }
    },

    replaceState(oldState, newState) {
      this.removeState(oldState);
      this.addState(newState);
    },

    hasState(state) {
      return !!this.__states[state];
    },

    // --- Property Apply Methods ---

    _applyEnabled(value, old) {
      const el = this.getContentElement();
      if (value) {
        this.removeState("disabled");
        el.removeAttribute("disabled");
      } else {
        this.addState("disabled");
        // Required for native HTML form controls to prevent focus/clicks
        el.setAttribute("disabled", "disabled"); 
      }
    },

    _applyVisibility(value, old) {
      const el = this.getContentElement();
      if (value === "excluded") {
        el.setStyle("display", "none");
      } else if (value === "hidden") {
        el.setStyle("display", "block"); // Assuming block as default for now
        el.setStyle("visibility", "hidden");
      } else {
        el.setStyle("display", "block");
        el.setStyle("visibility", "visible");
      }
    },

    // --- Appearance Orchestrator ---

    /** 
     * @ai-todo When we revisit the States feature, explain this approach and how it helps.
     */
    _syncCssAppearance() {
      // 1. Convert the state map keys into a single string (e.g. "hovered disabled")
      const activeStates = Object.keys(this.__states).join(" ");
      
      // 2. Write it to the DOM. 
      // (This instantly makes all states targetable via CSS: [data-states~="disabled"])
      if (activeStates.length > 0) {
        this.getContentElement().setAttribute("data-states", activeStates);
      } else {
        this.getContentElement().removeAttribute("data-states");
      }

      // FUTURE: Call your delta-diff utility class script here to swap Mantine classes
      // ville.CssUtilityClasses.apply(this, this.__states);
    },

    _applyCssUtilityClass(value, old) {
      const el = this.getContentElement();
      if (old) {
        el.removeClass(old);
      }
      if (value) {
        el.addClass(value);
      }
    },

    setParent(parent) {
      this.__parent = parent;
    },

    /**
     * Appends a pure ville.ui widget to this widget.
     * @param childWidget {ville.ui.core.Widget}
     */
    _add(childWidget) {
      this.__children.push(childWidget);
      childWidget.setParent(this);
      
      // Directly append the child's DOM node to this widget's DOM node
      this.getContentElement().add(childWidget.getContentElement());
    },

    // --- 2. Child Control System ---

    hasChildControl(id) {
      return !!this.__childControls[id];
    },

    getChildControl(id, notcreate) {
      if (!this.__childControls[id]) {
        if (notcreate) {
          return null;
        }
        
        const control = this._createChildControlImpl(id);
        
        if (control) {
          this.__childControls[id] = control;

          // LIFECYCLE SYNC: If the parent already has states, and they are 
          // marked for forwarding, push them to the new child immediately.
          if (this._forwardStates) {
            for (let state in this.__states) {
              if (this._forwardStates[state]) {
                control.addState(state);
              }
            }
          }
        } else {
          throw new Error(`Child control '${id}' cannot be created.`);
        }
      }
      return this.__childControls[id];
    },


    /**
     * @protected
     * Factory method for child controls. Subclasses MUST override this.
     */
    _createChildControlImpl(id) {
      return null;
    },

    /**
     * Helper to safely set or remove DOM attributes
     */
    _setAttribute(key, value) {
      const el = this.getContentElement();
      if (value === null || value === false) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, value === true ? "" : value); // Handle boolean attributes
      }
    },

    /** 
     * @ai-todo This looks Mantine specific. Need to consider include/patch (qx.Class.include() or qx.Class.patch())
     */
    _applyVariant(value, old) {
      this._setAttribute("data-variant", value);
    }

  },
  
  destruct() {
    this._disposeMap("__childControls"); // Clean up all created child controls
    if (this.__contentElement) {
      this.__contentElement.disconnectObject(this);
      this._disposeObjects("__contentElement");
    }
  }

});
