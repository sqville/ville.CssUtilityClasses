qx.Class.define("ville.ui.core.Widget", {
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
    appearance: {
      check: "String",
      init: "widget",
      apply: "_applyAppearance",
      event: "changeAppearance"
    },

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

    /**
     * Whether the widget acts as an anonymous event target.
     * Maps to CSS `pointer-events: none` so interactions pass directly to the parent.
     */
    anonymous: {
      check: "Boolean",
      init: false,
      apply: "_applyAnonymous"
    },

    cssUtilityClass: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyCssUtilityClass",
      themeable: true
    },

    cssStates: {
      check: "Map",
      nullable: true,
      init: null,
      apply: "_applyCssStates",
      themeable: true
    },

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
      __parent: null,
      __children: null,
      __states: null,

      /**
       * Map of states to forward to child controls.
       * Subclasses can override this declaratively.
       * @lint ignoreReferenceField(_forwardStates)
       */
      _forwardStates: null,

      _applyAppearance(value, old) {
        this._syncCssAppearance();
      },

      // --- Event Delegation ---

      /**
       * Transparent event delegation. Routes declared class/property events to
       * qx.core.Object, and routes DOM/Pointer/Keyboard events to qx.html.Element.
       *
       * @param type {String} Name of the event
       * @param listener {Function} The pointer to the event listener
       * @param self {Object?null} Reference to the 'this' variable inside the listener
       * @param capture {Boolean?false} Whether to attach to the capture phase
       * @return {var} An opaque listener ID
       */
      addListener(type, listener, self, capture) {
        if (qx.Class.supportsEvent(this.constructor, type)) {
          return super.addListener(type, listener, self, capture);
        }
        return this.getContentElement().addListener(type, listener, self, capture);
      },

      /**
       * Transparent event unregistration.
       *
       * @param type {String} Name of the event
       * @param listener {Function} The pointer to the event listener
       * @param self {Object?null} Reference to the 'this' variable inside the listener
       * @param capture {Boolean?false} Whether to attach to the capture phase
       * @return {Boolean} Whether the listener was removed
       */
      removeListener(type, listener, self, capture) {
        if (qx.Class.supportsEvent(this.constructor, type)) {
          return super.removeListener(type, listener, self, capture);
        }
        return this.getContentElement().removeListener(type, listener, self, capture);
      },

      /**
       * Check whether an event listener is registered on either the widget or the content element.
       *
       * @param type {String} The event name
       * @param capture {Boolean?false} Whether to check the capture phase
       * @return {Boolean} Whether a listener exists
       */
      hasListener(type, capture) {
        if (qx.Class.supportsEvent(this.constructor, type)) {
          return super.hasListener(type, capture);
        }
        const el = this.getContentElement();
        return el ? el.hasListener(type, capture) : false;
      },

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

      // --- 2. Element Lifecycle (Lazy Load) ---

      getContentElement() {
        if (!this.__contentElement) {
          this.__contentElement = this.__createContentElement();
        }
        return this.__contentElement;
      },

      __createContentElement() {
        const el = this._createContentElement();

        // Bind the DOM element for memory management
        el.connectObject(this);

        // Hydration Mode: Bind to existing DOM if applicable
        if (this.__existingDomId !== undefined && this.__existingDomId !== null) {
          const staticNode = document.getElementById(this.__existingDomId);
          if (staticNode) {
            el.useElement(staticNode);
          }
        }

        // Debugging metadata
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
        return new qx.html.Element("div");
      },

      // --- 3. State Management ---

      addState(state) {
        if (!this.__states[state]) {
          this.__states[state] = true;
          this._syncCssAppearance();

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

      // --- 4. Property Apply Methods ---

      _applyEnabled(value, old) {
        const el = this.getContentElement();
        if (value) {
          this.removeState("disabled");
          el.removeAttribute("disabled");
          this.setAriaState("disabled", null);
        } else {
          this.addState("disabled");
          el.setAttribute("disabled", "disabled");
          this.setAriaState("disabled", true);
        }
      },

      _applyVisibility(value, old) {
        const el = this.getContentElement();
        if (value === "excluded") {
          el.setStyle("display", "none");
        } else if (value === "hidden") {
          el.setStyle("display", "block");
          el.setStyle("visibility", "hidden");
        } else {
          el.setStyle("display", "block");
          el.setStyle("visibility", "visible");
        }
      },

      _applyAnonymous(value, old) {
        const el = this.getContentElement();
        el.setStyle("pointer-events", value ? "none" : null);
      },

      _applyCssUtilityClass(value, old) {
        const el = this.getContentElement();
        if (!el || !value) {
          return;
        }
        // Write-once static base utility classes
        for (const cls of value.trim().split(/\s+/)) {
          if (cls) {
            el.addClass(cls);
          }
        }
      },

      /**
       * Resolves a single state transition directly to DOM mutations
       * using the theme's cssStates map (no Appearance queue overhead).
       */
      _resolveStateToDom(state, active) {
        const statesMap = this.getCssStates();
        const rule = statesMap ? statesMap[state] : null;
        if (!rule) {
          return;
        }

        const el = this.getContentElement();

        // 1. Toggle classes to add when state is active
        if (rule.addClasses) {
          for (const cls of rule.addClasses) {
            active ? el.addClass(cls) : el.removeClass(cls);
          }
        }

        // 2. Toggle classes to remove when state is active (e.g., removing "mantine-active" on disabled)
        if (rule.removeClasses) {
          for (const cls of rule.removeClasses) {
            active ? el.removeClass(cls) : el.addClass(cls);
          }
        }

        // 3. Toggle data-* attributes (e.g., { "data-disabled": "true" })
        if (rule.attributes) {
          for (const [attr, val] of Object.entries(rule.attributes)) {
            if (active) {
              el.setAttribute(attr, val);
            } else {
              el.removeAttribute(attr);
            }
          }
        }
      },

      _applyVariant(value, old) {
        this._syncModifierState("variant", value, old);
      },

      // --- 5. DOM & CSS Appearance Orchestrator ---

      _syncCssAppearance() {
        const activeStates = Object.keys(this.__states).join(" ");
        if (activeStates.length > 0) {
          this.getContentElement().setAttribute("data-states", activeStates);
        } else {
          this.getContentElement().removeAttribute("data-states");
        }
      },

      setParent(parent) {
        this.__parent = parent;
      },

      getParent() {
        return this.__parent;
      },

      /**
       * Appends a child widget directly to this widget's content element.
       * @param childWidget {ville.ui.core.Widget}
       */
      _add(childWidget) {
        this.__children.push(childWidget);
        childWidget.setParent(this);
        this.getContentElement().add(childWidget.getContentElement());
      },

      /**
       * Inserts a child widget at the specified index.
       * @param childWidget {ville.ui.core.Widget}
       * @param index {Integer}
       */
      _addAt(childWidget, index) {
        qx.core.Assert.assertInteger(index);
        this.__children.splice(index, 0, childWidget);
        childWidget.setParent(this);
        this.getContentElement().addAt(childWidget.getContentElement(), index);
      },

      // --- 6. Child Control System ---

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

            // LIFECYCLE SYNC: Forward existing states down to new child
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
       * Factory method for child controls. Subclasses override this.
       */
      _createChildControlImpl(id) {
        return null;
      },

      _setAttribute(key, value) {
        const el = this.getContentElement();
        if (value === null || value === false) {
          el.removeAttribute(key);
        } else {
          el.setAttribute(key, value === true ? "" : value);
        }
      },

      _syncModifierState(prefix, value, old) {
        const prev = old ? `${prefix}-${old}` : null;
        const next = value ? `${prefix}-${value}` : null;
        if (prev && next) {
          this.replaceState(prev, next);
        } else if (prev) {
          this.removeState(prev);
        } else if (next) {
          this.addState(next);
        }
      },

      /**
     * Sets or clears a mutually exclusive namespaced state (e.g., category: "variant", value: "filled").
     * Replaces any existing "variant-*" state with "variant-filled", or removes it if value is null/empty.
     *
     * @param category {String} State namespace prefix (e.g., "variant", "size", "radius")
     * @param value {String|null} Modifier value
     */
    setVuiModifier(category, value) {
      const prefix = category + "-";
      const modState = value != null && value !== "" ? prefix + value : null;

      let existingState = null;
      for (const stateName in this.__states) {
        if (stateName.startsWith(prefix)) {
          existingState = stateName;
          break;
        }
      }

      if (existingState && modState) {
        if (existingState !== modState) {
          this.replaceState(existingState, modState);
        }
      } else if (existingState && !modState) {
        this.removeState(existingState);
      } else if (!existingState && modState) {
        this.addState(modState);
      }
    },

    _applyCssUtilityClass(value, old) {
      const content = this.getContentElement();
      if (old) {
        content.removeClass(old);
      }
      if (value) {
        content.addClass(value);
      }
    },

    /**
     * Delta-diff applier for theme-driven state mutations.
     * Supports MWidget's explicit keys ("set-attributes", "remove-attributes",
     * "set-classes", "remove-classes", "set-styles", "remove-styles") AND
     * automatically cleans up any entry present in `old` that was dropped in `value`.
     */
    _applyCssStates(value, old) {
      if (value === old) {
        return;
      }

      const next = value || {};
      const prev = old || {};

      // 1. Attributes (diff old vs new + explicit remove-attributes)
      const setAttrs = next["set-attributes"];
      const oldAttrs = prev["set-attributes"];
      let deltaAttrs = null;

      if (oldAttrs) {
        for (const key in oldAttrs) {
          if (!setAttrs || !(key in setAttrs)) {
            this.removeAttribute(key, true);
          }
        }
      }
      if (setAttrs) {
        for (const key in setAttrs) {
          if (!oldAttrs || oldAttrs[key] !== setAttrs[key]) {
            deltaAttrs = deltaAttrs || {};
            deltaAttrs[key] = setAttrs[key];
          }
        }
        if (deltaAttrs) {
          this.setAttributes(deltaAttrs, true);
        }
      }

      const removeAttrs = next["remove-attributes"];
      if (removeAttrs && removeAttrs.length > 0) {
        const oldRemAttrs = prev["remove-attributes"];
        for (let i = 0, l = removeAttrs.length; i < l; i++) {
          const attr = removeAttrs[i];
          if (!oldRemAttrs || !oldRemAttrs.includes(attr)) {
            this.removeAttribute(attr, true);
          }
        }
      }

      // 2. Classes (diff old vs new + explicit remove-classes)
      const setClasses = next["set-classes"];
      const oldSetClasses = prev["set-classes"];

      if (oldSetClasses) {
        for (let i = 0, l = oldSetClasses.length; i < l; i++) {
          const cls = oldSetClasses[i];
          if (!setClasses || !setClasses.includes(cls)) {
            this.removeClass(cls);
          }
        }
      }
      if (setClasses && setClasses.length > 0) {
        for (let i = 0, l = setClasses.length; i < l; i++) {
          const cls = setClasses[i];
          if (!oldSetClasses || !oldSetClasses.includes(cls)) {
            this.addClass(cls);
          }
        }
      }

      const removeClasses = next["remove-classes"];
      if (removeClasses && removeClasses.length > 0) {
        const oldRemClasses = prev["remove-classes"];
        for (let i = 0, l = removeClasses.length; i < l; i++) {
          const cls = removeClasses[i];
          if (!oldRemClasses || !oldRemClasses.includes(cls)) {
            this.removeClass(cls);
          }
        }
      }

      // 3. Inline Styles (diff old vs new + explicit remove-styles)
      const setStyles = next["set-styles"];
      const oldStyles = prev["set-styles"];
      let deltaStyles = null;

      if (oldStyles) {
        for (const key in oldStyles) {
          if (!setStyles || !(key in setStyles)) {
            this.removeStyle(key, true);
          }
        }
      }
      if (setStyles) {
        for (const key in setStyles) {
          if (!oldStyles || oldStyles[key] !== setStyles[key]) {
            deltaStyles = deltaStyles || {};
            deltaStyles[key] = setStyles[key];
          }
        }
        if (deltaStyles) {
          this.setStyles(deltaStyles, true);
        }
      }

      const removeStyles = next["remove-styles"];
      if (removeStyles && removeStyles.length > 0) {
        const oldRemStyles = prev["remove-styles"];
        for (let i = 0, l = removeStyles.length; i < l; i++) {
          const style = removeStyles[i];
          if (!oldRemStyles || !oldRemStyles.includes(style)) {
            this.removeStyle(style, true);
          }
        }
      }
    },

    // Ergonomic DOM passthrough helpers (from MWidget.js)
    addClass(classname) {
      this.getContentElement().addClass(classname);
    },

    removeClass(classname) {
      this.getContentElement().removeClass(classname);
    },

    setStyle(style, value, direct) {
      this.getContentElement().setStyle(style, value, direct);
    },

    getStyle(style) {
      return this.getContentElement().getStyle(style);
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

    getAttribute(attribute) {
      return this.getContentElement().getAttribute(attribute);
    },

    setAttributes(attributes, direct) {
      this.getContentElement().setAttributes(attributes, direct);
    },

    removeAttribute(attribute, direct) {
      this.getContentElement().removeAttribute(attribute, direct);
    },

    destruct() {
      this._disposeMap("__childControls");
      if (this.__contentElement) {
        this.__contentElement.disconnectObject(this);
        this._disposeObjects("__contentElement");
      }
      this.__children = null;
      this.__states = null;
    }
  }
});
