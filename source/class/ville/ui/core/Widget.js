/**
 * Structured DOM mutation payload returned by Mode 3 Appearance themes for the
 * `cssStates` themeable property.
 *
 * @typedef {Object} VilleCssStatesPayload
 * @property {Object<string, string|number|boolean>} [set-attributes] Map of HTML attribute names to values to set on the content element.
 * @property {string[]} [remove-attributes] List of HTML attribute names to remove from the content element.
 * @property {string[]} [set-classes] List of CSS class names to add to the content element.
 * @property {string[]} [remove-classes] List of CSS class names to remove from the content element.
 * @property {Object<string, string|number>} [set-styles] Map of CSS property names to values to apply inline.
 * @property {string[]} [remove-styles] List of CSS property names to remove from inline styles.
 */

/**
 * Base UI widget class for Mode 3 (`ville.ui.*`) applications, completely
 * decoupled from Qooxdoo's legacy layout engine (`qx.ui.layout.*`,
 * `qx.ui.core.LayoutItem`, and `qx.ui.core.queue.*`).
 *
 * Architectural responsibilities:
 * - Wraps `qx.html.Element` directly with lazy DOM element instantiation.
 * - Coalesces state and appearance invalidations via `queueMicrotask` into a
 *   single `syncAppearance()` evaluation per synchronous turn.
 * - Bridges Qooxdoo states (`hovered`, `pressed`, `disabled`, `variant-*`,
 *   `size-*`, etc.) to external CSS frameworks (Mantine, Tailwind, Carbon, Tabler)
 *   via themeable `cssUtilityClass` and `cssStates` delta-diffing properties.
 * - Transparently delegates DOM, pointer, and keyboard event listeners to the
 *   underlying `qx.html.Element` when not declared as Qooxdoo class events.
 *
 * @example
 * const widget = new ville.ui.core.Widget();
 * widget.setCssUtilityClass("mantine-Box-root");
 * widget.addState("active");
 */
qx.Class.define("ville.ui.core.Widget", {
  extend: qx.core.Object,
  include: [qx.locale.MTranslation],
  implement: [qx.core.IDisposable],

  /**
   * Creates a new Mode 3 widget instance without eagerly creating DOM nodes.
   *
   * @param {string} [existingDomId] Optional ID of an existing DOM element to hydrate via `qx.html.Element#useElement`.
   */
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
    /**
     * Appearance selector ID resolved against the active `qx.theme.manager.Appearance` theme.
     */
    appearance: {
      check: "String",
      init: "widget",
      apply: "_applyAppearance",
      event: "changeAppearance"
    },

    /**
     * WAI-ARIA `role` attribute applied to the root content element (e.g., `"button"`, `"dialog"`).
     */
    ariaRole: {
      check: "String",
      nullable: true,
      apply: "_applyAriaRole"
    },

    /**
     * Whether the widget is interactive. When `false`, adds the `"disabled"` state,
     * sets the native `disabled` attribute, and sets `aria-disabled="true"`.
     */
    enabled: {
      check: "Boolean",
      init: true,
      apply: "_applyEnabled",
      event: "changeEnabled"
    },

    /**
     * Controls element display and visibility (`"visible"`, `"hidden"`, or `"excluded"`).
     */
    visibility: {
      check: ["visible", "hidden", "excluded"],
      init: "visible",
      apply: "_applyVisibility",
      event: "changeVisibility"
    },

    /**
     * Whether the widget acts as an anonymous pointer target.
     * Maps to `pointer-events: none` so pointer events pass through to parent elements.
     */
    anonymous: {
      check: "Boolean",
      init: false,
      apply: "_applyAnonymous"
    },

    /**
     * Whitespace-separated utility or root CSS classes applied to the content element.
     * Diffed against previous values so unchanged classes remain untouched.
     */
    cssUtilityClass: {
      check: "String",
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyCssUtilityClass"
    },

    /**
     * Theme-driven state mutation payload (`VilleCssStatesPayload`) mapping active
     * widget states to DOM attributes, classes, and CSS custom properties.
     */
    cssStates: {
      check: "Map",
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyCssStates"
    },

    /**
     * Visual variant modifier (e.g., `"filled"`, `"default"`, `"outline"`, `"subtle"`).
     * Automatically synchronizes the mutually exclusive `"variant-<value>"` widget state.
     */
    variant: {
      check: "String",
      nullable: true,
      themeable: true,
      apply: "_applyVariant"
    }
  },

  members: {
    /** @type {qx.html.Element|null} @private */
    __contentElement: null,

    /** @type {string|null|undefined} @private */
    __existingDomId: null,

    /** @type {Object<string, ville.ui.core.Widget>|null} @private */
    __childControls: null,

    /** @type {ville.ui.core.Widget|null} @private */
    __parent: null,

    /** @type {ville.ui.core.Widget|null} @private */
    __subparent: null,

    /** @type {string|null} @private */
    __subcontrolId: null,

    /** @type {ville.ui.core.Widget[]|null} @private */
    __children: null,

    /** @type {Object<string, boolean>|null} @private */
    __states: null,

    /** @type {Object<string, *>|null} @private */
    __themeValues: null,

    /** @type {boolean} @private */
    __appearanceDirty: false,

    /**
     * Map of state names (e.g., `{ disabled: true }`) that should automatically
     * propagate to child controls registered via `getChildControl()`.
     * Subclasses can override this declaratively.
     *
     * @type {Object<string, boolean>|null}
     * @protected
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: null,

    // --- Event Delegation ---

    /**
     * Registers an event listener. Declared Qooxdoo class and property events attach
     * to the widget instance; all other events (DOM, pointer, keyboard, focus)
     * delegate directly to `getContentElement()`.
     *
     * @param {string} type Name of the event (e.g., `"execute"`, `"pointerover"`, `"keydown"`).
     * @param {Function} listener Event handler function.
     * @param {Object} [self] Context (`this`) bound when invoking the listener.
     * @param {boolean} [capture=false] Whether to attach during the DOM capture phase.
     * @returns {*} Opaque listener ID used for removal.
     */
    addListener(type, listener, self, capture) {
      if (qx.Class.supportsEvent(this.constructor, type)) {
        return super.addListener(type, listener, self, capture);
      }
      return this.getContentElement().addListener(type, listener, self, capture);
    },

    /**
     * Unregisters a previously attached event listener from either the widget
     * or its underlying content element.
     *
     * @param {string} type Name of the event.
     * @param {Function} listener Event handler function to remove.
     * @param {Object} [self] Context (`this`) originally passed to `addListener()`.
     * @param {boolean} [capture=false] Whether the listener was registered for the capture phase.
     * @returns {boolean} `true` if the listener was found and removed.
     */
    removeListener(type, listener, self, capture) {
      if (qx.Class.supportsEvent(this.constructor, type)) {
        return super.removeListener(type, listener, self, capture);
      }
      return this.getContentElement().removeListener(type, listener, self, capture);
    },

    /**
     * Checks whether at least one listener is registered for the given event type
     * on either the widget or its underlying content element.
     *
     * @param {string} type Name of the event.
     * @param {boolean} [capture=false] Whether to check the capture phase.
     * @returns {boolean} `true` if a matching listener exists.
     */
    hasListener(type, capture) {
      if (qx.Class.supportsEvent(this.constructor, type)) {
        return super.hasListener(type, capture);
      }
      const el = this.getContentElement();
      return el ? el.hasListener(type, capture) : false;
    },

    // --- 1. WAI-ARIA Support ---

    /**
     * Property apply handler for `ariaRole`.
     *
     * @param {string|null} value New ARIA role value.
     * @param {string|null} old Previous ARIA role value.
     * @protected
     */
    _applyAriaRole(value, old) {
      const el = this.getContentElement();
      if (value) {
        el.setAttribute("role", value);
      } else {
        el.removeAttribute("role");
      }
    },

    /**
     * Sets or removes a WAI-ARIA state/property attribute (`aria-<state>`) on the content element.
     *
     * @param {string} state ARIA attribute suffix without the `"aria-"` prefix (e.g., `"disabled"`, `"expanded"`).
     * @param {string|boolean|number|null} value Attribute value, or `null` to remove the attribute.
     */
    setAriaState(state, value) {
      const el = this.getContentElement();
      if (value === null) {
        el.removeAttribute("aria-" + state);
      } else {
        el.setAttribute("aria-" + state, String(value));
      }
    },

    // --- 2. Element Lifecycle (Lazy Load) ---

    /**
     * Returns the widget's root `qx.html.Element`, creating and binding it lazily
     * on first access.
     *
     * @returns {qx.html.Element} The root virtual DOM wrapper element.
     */
    getContentElement() {
      if (!this.__contentElement) {
        this.__contentElement = this.__createContentElement();
      }
      return this.__contentElement;
    },

    /**
     * Instantiates, connects, and optionally hydrates the root `qx.html.Element`.
     *
     * @returns {qx.html.Element} The initialized content element.
     * @private
     */
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
     * Factory method that creates the underlying `qx.html.Element`.
     * Subclasses override this to return semantic tags (e.g., `"button"`, `"a"`)
     * or raw SVG markup via `useMarkup()`.
     *
     * @returns {qx.html.Element} Newly constructed content element (defaults to `"div"`).
     * @protected
     */
    _createContentElement() {
      return new qx.html.Element("div");
    },

    // --- 3. State Management ---

    /**
     * Activates a visual/behavioral state on the widget, schedules an appearance
     * re-evaluation, and forwards the state to child controls if listed in `_forwardStates`.
     *
     * @param {string} state State identifier (e.g., `"hovered"`, `"pressed"`, `"disabled"`).
     */
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

    /**
     * Deactivates a state on the widget, schedules an appearance re-evaluation,
     * and removes the state from child controls if listed in `_forwardStates`.
     *
     * @param {string} state State identifier to remove.
     */
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

    /**
     * Atomically replaces `oldState` with `newState` and triggers a single
     * appearance invalidation if the active state map changed.
     *
     * @param {string} oldState State identifier to deactivate.
     * @param {string} newState State identifier to activate.
     */
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

    /**
     * Checks whether a given state is currently active on the widget.
     *
     * @param {string} state State identifier to test.
     * @returns {boolean} `true` if the state is active.
     */
    hasState(state) {
      return !!this.__states[state];
    },

    /**
     * O(1) helper for mutually exclusive namespaced modifier states
     * (e.g., `"variant-*"`, `"size-*"`, `"radius-*"`).
     *
     * @param {string} prefix State category prefix without trailing hyphen (e.g., `"variant"`).
     * @param {string|null|undefined} value New modifier value.
     * @param {string|null|undefined} old Previous modifier value.
     * @protected
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

    /**
     * Property apply handler for `appearance`.
     *
     * @param {string} value New appearance selector ID.
     * @param {string} old Previous appearance selector ID.
     * @protected
     */
    _applyAppearance(value, old) {
      this._invalidateAppearance();
    },

    /**
     * Marks this widget's appearance as dirty and schedules `syncAppearance()` on
     * the microtask queue so multiple synchronous state/property mutations
     * coalesce into a single theme evaluation. Also invalidates child subcontrols.
     *
     * @protected
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
     * Builds the Qooxdoo appearance selector path (e.g., `"button"` for root
     * widgets or `"button/icon"` for registered child controls).
     *
     * @returns {string} Resolved appearance selector string.
     * @protected
     */
    _getAppearanceSelector() {
      if (this.__subparent && this.__subcontrolId) {
        return this.__subparent._getAppearanceSelector() + "/" + this.__subcontrolId;
      }
      return this.getAppearance();
    },

    /**
     * Evaluates the active `qx.theme.manager.Appearance` entry for this widget's
     * current `__states` map, applies returned themeable properties via
     * `setThemed*()` / `resetThemed()`, and flushes buffered `qx.html.Element`
     * mutations once all microtask passes settle.
     */
    syncAppearance() {
      this.__appearanceDirty = false;

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

    /**
     * Property apply handler for `enabled`.
     *
     * @param {boolean} value New enabled state.
     * @param {boolean} old Previous enabled state.
     * @protected
     */
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

    /**
     * Property apply handler for `visibility`.
     *
     * @param {"visible"|"hidden"|"excluded"} value New visibility mode.
     * @param {"visible"|"hidden"|"excluded"} old Previous visibility mode.
     * @protected
     */
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

    /**
     * Property apply handler for `anonymous`.
     *
     * @param {boolean} value Whether pointer events should be disabled.
     * @param {boolean} old Previous anonymous state.
     * @protected
     */
    _applyAnonymous(value, old) {
      const el = this.getContentElement();
      el.setStyle("pointer-events", value ? "none" : null);
    },

    /**
     * Plain-object delta-diff applier for `cssUtilityClass` (zero `Set`/`Map` allocations).
     * Adds only newly introduced classes and removes only dropped classes while
     * preserving exact token ordering.
     *
     * @param {string|null} value New whitespace-separated class string.
     * @param {string|null} old Previous whitespace-separated class string.
     * @protected
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
     * Delta-diff applier for theme-driven state mutations (`VilleCssStatesPayload`).
     * Diffs `set-attributes`, `set-classes`, and `set-styles` against `old`,
     * automatically removing any entry present in `old` that was omitted in `value`,
     * and processes explicit `remove-*` arrays.
     *
     * @param {VilleCssStatesPayload|null} value Incoming state DOM payload.
     * @param {VilleCssStatesPayload|null} old Previous state DOM payload.
     * @protected
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

    /**
     * Property apply handler for `variant`.
     *
     * @param {string|null} value New variant identifier.
     * @param {string|null} old Previous variant identifier.
     * @protected
     */
    _applyVariant(value, old) {
      this._syncModifierState("variant", value, old);
    },

    
    // --- 6. Hierarchy & Child Control System ---

    /**
     * Assigns the logical parent widget reference.
     *
     * @param {ville.ui.core.Widget|null} parent Parent widget instance.
     */
    setParent(parent) {
      this.__parent = parent;
    },

    /**
     * Returns the logical parent widget reference.
     *
     * @returns {ville.ui.core.Widget|null} Parent widget instance, or `null` if detached.
     */
    getParent() {
      return this.__parent;
    },

    /**
     * Returns the internal children array.
     *
     * @returns {ville.ui.core.Widget[]} Ordered list of child widgets.
     * @protected
     */
    _getChildren() {
      return this.__children;
    },

    /**
     * Checks whether this widget has any child widgets.
     *
     * @returns {boolean} `true` if `this.__children` is non-empty.
     * @protected
     */
    _hasChildren() {
      return this.__children.length > 0;
    },

    /**
     * Returns the zero-based index of `childWidget` in `this.__children`, or `-1`.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to locate.
     * @returns {number} Zero-based index or `-1`.
     * @protected
     */
    _indexOf(childWidget) {
      return this.__children.indexOf(childWidget);
    },

    /**
     * Appends a child widget and inserts its content element into this widget's DOM container.
     * Detaches `childWidget` from any previous parent first.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to append.
     * @protected
     */
    _add(childWidget) {
      if (childWidget.getParent()) {
        childWidget.getParent()._remove(childWidget);
      }
      this.__children.push(childWidget);
      childWidget.setParent(this);
      this.getContentElement().add(childWidget.getContentElement());
    },

    /**
     * Inserts a child widget at the specified zero-based index.
     * Detaches `childWidget` from any previous parent first.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to insert.
     * @param {number} index Zero-based insertion index.
     * @protected
     */
    _addAt(childWidget, index) {
      qx.core.Assert.assertInteger(index);
      if (childWidget.getParent()) {
        childWidget.getParent()._remove(childWidget);
      }
      this.__children.splice(index, 0, childWidget);
      childWidget.setParent(this);
      this.getContentElement().addAt(childWidget.getContentElement(), index);
    },

    /**
     * Inserts `childWidget` immediately before `beforeWidget`.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to insert.
     * @param {ville.ui.core.Widget} beforeWidget Existing child widget to insert before.
     * @protected
     */
    _addBefore(childWidget, beforeWidget) {
      const idx = this.__children.indexOf(beforeWidget);
      if (idx === -1) {
        throw new Error("The widget to insert before is not a child of this widget.");
      }
      this._addAt(childWidget, idx);
    },

    /**
     * Inserts `childWidget` immediately after `afterWidget`.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to insert.
     * @param {ville.ui.core.Widget} afterWidget Existing child widget to insert after.
     * @protected
     */
    _addAfter(childWidget, afterWidget) {
      const idx = this.__children.indexOf(afterWidget);
      if (idx === -1) {
        throw new Error("The widget to insert after is not a child of this widget.");
      }
      this._addAt(childWidget, idx + 1);
    },

    /**
     * Removes a child widget and detaches its content element from this widget's DOM container.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to remove.
     * @protected
     */
    _remove(childWidget) {
      const idx = this.__children.indexOf(childWidget);
      if (idx !== -1) {
        this.__children.splice(idx, 1);
        childWidget.setParent(null);
        this.getContentElement().remove(childWidget.getContentElement());
      }
    },

    /**
     * Removes and returns the child widget at `index`.
     *
     * @param {number} index Zero-based index of the child widget to remove.
     * @returns {ville.ui.core.Widget|null} Removed child widget, or `null` if index is invalid.
     * @protected
     */
    _removeAt(index) {
      qx.core.Assert.assertInteger(index);
      const child = this.__children[index];
      if (!child) {
        return null;
      }
      this._remove(child);
      return child;
    },

    /**
     * Removes all child widgets from this container and returns them in an array.
     *
     * @returns {ville.ui.core.Widget[]} Array of removed child widgets.
     * @protected
     */
    _removeAll() {
      const removed = this.__children.slice();
      for (let i = removed.length - 1; i >= 0; i--) {
        this._remove(removed[i]);
      }
      return removed;
    },

    /**
     * Checks whether a named child control has already been instantiated.
     *
     * @param {string} id Child control identifier (e.g., `"label"`, `"icon"`).
     * @returns {boolean} `true` if the child control exists.
     */
    hasChildControl(id) {
      return !!this.__childControls[id];
    },

    /**
     * Retrieves (and lazily creates via `_createChildControlImpl()`) a named child control,
     * wiring subcontrol appearance selector resolution and forwarding active states.
     *
     * @param {string} id Child control identifier (e.g., `"label"`, `"icon"`).
     * @param {boolean} [notcreate=false] If `true`, returns `null` instead of creating the control when absent.
     * @returns {ville.ui.core.Widget|null} The child control widget instance, or `null`.
     */
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
     * Factory hook for creating named child controls on demand.
     * Subclasses override this method to instantiate their internal subcontrols.
     *
     * @param {string} id Child control identifier.
     * @param {*} [hash] Optional configuration map passed during creation.
     * @returns {ville.ui.core.Widget|null} Newly created child control, or `null` if unsupported.
     * @protected
     */
    _createChildControlImpl(id, hash) {
      return null;
    },

    // --- 7. DOM Passthrough Helpers ---

    /**
     * Internal helper to set, toggle (boolean), or remove (`null`/`false`) an HTML attribute.
     *
     * @param {string} key HTML attribute name.
     * @param {string|boolean|null} value Attribute value (`true` sets empty string; `null`/`false` removes).
     * @protected
     */
    _setAttribute(key, value) {
      const el = this.getContentElement();
      if (value === null || value === false) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, value === true ? "" : value);
      }
    },

    /**
     * Adds a CSS class name to the root content element.
     *
     * @param {string} classname CSS class name to add.
     */
    addClass(classname) {
      this.getContentElement().addClass(classname);
    },

    /**
     * Removes a CSS class name from the root content element.
     *
     * @param {string} classname CSS class name to remove.
     */
    removeClass(classname) {
      this.getContentElement().removeClass(classname);
    },

    /**
     * Sets a single inline CSS style property on the root content element.
     *
     * @param {string} style CSS property name (e.g., `"width"`, `"--button-radius"`).
     * @param {string|number|null} value CSS property value.
     * @param {boolean} [direct=false] Whether to bypass `qx.html.Element` queueing and write directly to the DOM.
     */
    setStyle(style, value, direct) {
      this.getContentElement().setStyle(style, value, direct);
    },

    /**
     * Reads an inline CSS style value from the root content element.
     *
     * @param {string} style CSS property name.
     * @returns {*} Current style value.
     */
    getStyle(style) {
      return this.getContentElement().getStyle(style);
    },

    /**
     * Sets multiple inline CSS style properties on the root content element.
     *
     * @param {Object<string, string|number|null>} styles Map of CSS property names to values.
     * @param {boolean} [direct=false] Whether to write directly to the DOM.
     */
    setStyles(styles, direct) {
      this.getContentElement().setStyles(styles, direct);
    },

    /**
     * Removes an inline CSS style property from the root content element.
     *
     * @param {string} style CSS property name to remove.
     * @param {boolean} [direct=false] Whether to write directly to the DOM.
     */
    removeStyle(style, direct) {
      this.getContentElement().removeStyle(style, direct);
    },

    /**
     * Sets a single HTML attribute on the root content element.
     *
     * @param {string} attribute HTML attribute name.
     * @param {string|number|boolean|null} value Attribute value.
     * @param {boolean} [direct=false] Whether to write directly to the DOM.
     */
    setAttribute(attribute, value, direct) {
      this.getContentElement().setAttribute(attribute, value, direct);
    },

    /**
     * Reads an HTML attribute value from the root content element.
     *
     * @param {string} attribute HTML attribute name.
     * @returns {*} Current attribute value.
     */
    getAttribute(attribute) {
      return this.getContentElement().getAttribute(attribute);
    },

    /**
     * Sets multiple HTML attributes on the root content element.
     *
     * @param {Object<string, string|number|boolean|null>} attributes Map of attribute names to values.
     * @param {boolean} [direct=false] Whether to write directly to the DOM.
     */
    setAttributes(attributes, direct) {
      this.getContentElement().setAttributes(attributes, direct);
    },

    /**
     * Removes an HTML attribute from the root content element.
     *
     * @param {string} attribute HTML attribute name to remove.
     * @param {boolean} [direct=false] Whether to write directly to the DOM.
     */
    removeAttribute(attribute, direct) {
      this.getContentElement().removeAttribute(attribute, direct);
    }
  },

  /**
   * Disposes all instantiated child controls, disconnects and disposes the root
   * `qx.html.Element`, and clears internal state/hierarchy references.
   */
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
