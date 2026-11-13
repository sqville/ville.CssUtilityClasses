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

    // Trigger initial appearance evaluation
    this.initAppearance();
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
      themeable: true,
      apply: "_applyCssUtilityClass"
    },

    cssStates: {
      check: "Map",
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyCssStates"
    },

    variant: {
      check: "String",
      nullable: true,
      themeable: true,
      apply: "_applyVariant"
    }
  },

  members: {
    __contentElement: null,
    __existingDomId: null,
    __childControls: null,
    __parent: null,
    __subparent: null,
    __subcontrolId: null,
    __children: null,
    __states: null,
    __themeValues: null,
    __appearanceDirty: false,

    /**
     * Map of states to forward to child controls.
     * Subclasses can override this declaratively.
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: null,

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
        this._invalidateAppearance();

        if (this._forwardStates && this._forwardStates[state]) {
          for (const id in this.__childControls) {
            this.__childControls[id].addState(state);
          }
        }
      }
    },

    removeState(state) {
      if (this.__states[state]) {
        delete this.__states[state];
        this._invalidateAppearance();

        if (this._forwardStates && this._forwardStates[state]) {
          for (const id in this.__childControls) {
            this.__childControls[id].removeState(state);
          }
        }
      }
    },

    replaceState(oldState, newState) {
      let changed = false;

      if (this.__states[oldState]) {
        delete this.__states[oldState];
        changed = true;
        if (this._forwardStates && this._forwardStates[oldState]) {
          for (const id in this.__childControls) {
            this.__childControls[id].removeState(oldState);
          }
        }
      }

      if (!this.__states[newState]) {
        this.__states[newState] = true;
        changed = true;
        if (this._forwardStates && this._forwardStates[newState]) {
          for (const id in this.__childControls) {
            this.__childControls[id].addState(newState);
          }
        }
      }

      if (changed) {
        this._invalidateAppearance();
      }
    },

    hasState(state) {
      return !!this.__states[state];
    },

    /**
     * @protected
     * O(1) helper for mutually exclusive modifier states (e.g., "variant-*", "size-*", "radius-*").
     *
     * @param prefix {String} State category prefix (without trailing hyphen)
     * @param value {String|null} New property value
     * @param old {String|null} Old property value
     */
    _syncModifierState(prefix, value, old) {
      const prev = old ? prefix + "-" + old : null;
      const next = value ? prefix + "-" + value : null;

      if (prev && next) {
        this.replaceState(prev, next);
      } else if (prev) {
        this.removeState(prev);
      } else if (next) {
        this.addState(next);
      }
    },

    // --- 4. Appearance Resolution (Zero Layout Engine Dependency) ---

    _applyAppearance(value, old) {
      this._invalidateAppearance();
    },

    /**
     * Coalesces state or appearance changes within the same synchronous turn
     * into a single Appearance lookup via microtask.
     * @ignore(queueMicrotask)
     */
    _invalidateAppearance() {
      if (!this.__appearanceDirty) {
        this.__appearanceDirty = true;
        queueMicrotask(() => {
          if (!this.isDisposed() && this.__appearanceDirty) {
            this.syncAppearance();
          }
        });
      }

      // Child controls with subcontrol IDs depend on parent appearance path
      if (this.__childControls) {
        for (const id in this.__childControls) {
          const control = this.__childControls[id];
          if (control.__subcontrolId) {
            control._invalidateAppearance();
          }
        }
      }
    },

    /**
     * Builds the Qooxdoo appearance selector (e.g., "button" or "button/icon").
     *
     * @return {String}
     */
    _getAppearanceSelector() {
      if (this.__subparent && this.__subcontrolId) {
        return this.__subparent._getAppearanceSelector() + "/" + this.__subcontrolId;
      }
      return this.getAppearance();
    },

    /**
     * Evaluates the active Qooxdoo Appearance theme for this widget's current
     * states and applies themeable properties using setThemed* / resetThemed*.
     */
    syncAppearance() {
      this.__appearanceDirty = false;

      if (qx.core.Environment.get("qx.debug")) {
        const activeStates = Object.keys(this.__states).join(" ");
        this._setAttribute("data-states", activeStates || null);
      }

      const selector = this._getAppearanceSelector();
      if (!selector) {
        return;
      }

      const styles = qx.theme.manager.Appearance.getInstance().styleFrom(
        selector,
        this.__states,
        null,
        this.getAppearance()
      );

      const oldStyles = this.__themeValues;

      // 1. Reset themed properties that no longer apply in the current state
      if (oldStyles) {
        for (const prop in oldStyles) {
          if (!styles || !(prop in styles)) {
            const resetMethod =
              "resetThemed" + prop.charAt(0).toUpperCase() + prop.slice(1);
            if (typeof this[resetMethod] === "function") {
              this[resetMethod]();
            }
          }
        }
      }

      // 2. Apply themed properties returned by the Appearance entry
      if (styles) {
        for (const prop in styles) {
          const setMethod =
            "setThemed" + prop.charAt(0).toUpperCase() + prop.slice(1);
          if (typeof this[setMethod] === "function") {
            this[setMethod](styles[prop]);
          } else if (qx.core.Environment.get("qx.debug")) {
            this.warn(
              `Appearance property '${prop}' is not themeable on ${this.classname}. Add 'themeable: true' to the property definition.`
            );
          }
        }
      }

      this.__themeValues = styles;

      // 3. Flush buffered qx.html.Element mutations once microtask passes settle
      if (!this.__appearanceDirty) {
        qx.html.Element.flush();
      }
    },

    // --- 5. Property Apply Methods ---

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

    /**
     * Plain-object delta-diff applier for utility classes (zero Set/Map allocations).
     */
    _applyCssUtilityClass(value, old) {
      const el = this.getContentElement();
      if (!el || value === old) {
        return;
      }

      const oldMap = {};
      const newMap = {};

      if (old) {
        const oldParts = old.trim().split(/\s+/);
        for (let i = 0; i < oldParts.length; i++) {
          if (oldParts[i]) {
            oldMap[oldParts[i]] = true;
          }
        }
      }

      if (value) {
        const newParts = value.trim().split(/\s+/);
        for (let i = 0; i < newParts.length; i++) {
          if (newParts[i]) {
            newMap[newParts[i]] = true;
          }
        }
      }

      for (const cls in oldMap) {
        if (!newMap[cls]) {
          el.removeClass(cls);
        }
      }

      for (const cls in newMap) {
        if (!oldMap[cls]) {
          el.addClass(cls);
        }
      }
    },

    /**
     * Delta-diff applier for theme-driven state mutations ("set-attributes",
     * "remove-attributes", "set-classes", "remove-classes", "set-styles",
     * "remove-styles"). Automatically removes keys dropped from `old`.
     */
    _applyCssStates(value, old) {
      if (value === old) {
        return;
      }

      const next = value || {};
      const prev = old || {};

      // 1. Attributes
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

      // 2. Classes
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

      // 3. Inline Styles
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

    _applyVariant(value, old) {
      this._syncModifierState("variant", value, old);
    },

    // --- 6. Hierarchy & Child Control System ---

    setParent(parent) {
      this.__parent = parent;
    },

    getParent() {
      return this.__parent;
    },

    _add(childWidget) {
      this.__children.push(childWidget);
      childWidget.setParent(this);
      this.getContentElement().add(childWidget.getContentElement());
    },

    _addAt(childWidget, index) {
      qx.core.Assert.assertInteger(index);
      this.__children.splice(index, 0, childWidget);
      childWidget.setParent(this);
      this.getContentElement().addAt(childWidget.getContentElement(), index);
    },

    _remove(childWidget) {
      const idx = this.__children.indexOf(childWidget);
      if (idx !== -1) {
        this.__children.splice(idx, 1);
        childWidget.setParent(null);
        this.getContentElement().remove(childWidget.getContentElement());
      }
    },

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
          control.__subcontrolId = id;
          control.__subparent = this;

          // Forward existing active states down to new child control
          if (this._forwardStates) {
            for (const state in this.__states) {
              if (this._forwardStates[state]) {
                control.addState(state);
              }
            }
          }

          control._invalidateAppearance();
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

    // --- 7. DOM Passthrough Helpers ---

    _setAttribute(key, value) {
      const el = this.getContentElement();
      if (value === null || value === false) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, value === true ? "" : value);
      }
    },

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
    }
  },

  destruct() {
    this._disposeMap("__childControls");
    if (this.__contentElement) {
      this.__contentElement.disconnectObject(this);
      this._disposeObjects("__contentElement");
    }
    this.__children = null;
    this.__states = null;
    this.__themeValues = null;
    this.__parent = null;
    this.__subparent = null;
  }
});
