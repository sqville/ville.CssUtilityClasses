/**
 * Structured DOM mutation payload returned by Mode 3 Appearance themes for the
 * `cssStates` themeable property.
 *
 * @typedef {Object} VilleCssStatesPayload
 * @property {Object<string, string|number|boolean|null>} [set-attributes] Map of HTML attribute names to values to set on the content element.
 * @property {string[]} [remove-attributes] List of HTML attribute names to remove from the content element.
 * @property {string[]} [set-classes] List of CSS class names to add to the content element.
 * @property {string[]} [remove-classes] List of CSS class names to remove from the content element.
 * @property {Object<string, string|number|null>} [set-styles] Map of CSS property names to values to apply inline.
 * @property {string[]} [remove-styles] List of CSS property names to remove from inline styles.
 */

/**
 * Base UI widget class for Mode 3 (`ville.ui.*`) applications, completely
 * decoupled from Qooxdoo's legacy layout engine (`qx.ui.layout.*`,
 * `qx.ui.core.LayoutItem`, and `qx.ui.core.queue.*`).
 *
 * Architectural responsibilities:
 * - Wraps `qx.html.Element` directly with lazy DOM element instantiation and
 *   microtask-coalesced `qx.html.Element.flush()` scheduling.
 * - Coalesces state and appearance invalidations via `queueMicrotask` into a
 *   single `syncAppearance()` evaluation per synchronous turn.
 * - Bridges Qooxdoo states (`hovered`, `pressed`, `disabled`, `variant-*`,
 *   `size-*`, etc.) to external CSS frameworks (Mantine, Tailwind, Carbon, Tabler)
 *   via themeable `cssUtilityClass` and `cssStates` delta-diffing properties.
 * - Delegates native DOM events directly to `getContentElement()` while retaining
 *   `qx.core.MEvent` for declared Qooxdoo class and `qx.data` property events.
 *
 * @example
 * const widget = new ville.ui.core.Widget();
 * widget.setCssUtilityClass("mantine-Box-root");
 * widget.addState("active");
 * 
 * @ignore(queueMicrotask)
 */
qx.Class.define("ville.ui.core.Widget", {
  extend: qx.core.Object,
  include: [qx.locale.MTranslation],
  implement: [qx.core.IDisposable],

  statics: {
    /** @type {boolean} @private */
    __flushScheduled: false,

    /**
     * Schedules a single coalesced `qx.html.Element.flush()` at the end of the
     * current microtask turn so callers never need to flush manually.
     */
    scheduleFlush() {
      if (this.__flushScheduled) {
        return;
      }
      this.__flushScheduled = true;
      queueMicrotask(() => {
        this.__flushScheduled = false;
        qx.html.Element.flush();
      });
    }
  },

  /**
   * Creates a new Mode 3 widget instance without eagerly creating DOM nodes.
   *
   * @param {string} [existingDomId] Optional ID of an existing DOM element to hydrate via `qx.html.Element#useElement`.
   */
  construct(existingDomId) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    this.__children = [];
    this.__states = {};
    this.__childControls = {};
    this.__existingDomId = existingDomId;

    this.initAppearance();
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active `qx.theme.manager.Appearance` theme.
     */
    appearance: {
      check: "String",
      init: "widget",
      themeable: true,
      apply: "_applyAppearance",
      event: "changeAppearance"
    },

    /**
     * WAI-ARIA `role` attribute applied to the root content element (e.g., `"menu"`, `"tablist"`).
     */
    ariaRole: {
      check: "String",
      nullable: true,
      themeable: true,
      apply: "_applyAriaRole"
    },

    /**
     * Whether the widget is interactive. When `false`, adds the `"disabled"` state
     * and sets `aria-disabled="true"`. Form control subclasses also toggle the
     * native `disabled` HTML attribute.
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
     * Whether the widget acts as an anonymous pointer target (`pointer-events: none`).
     */
    anonymous: {
      check: "Boolean",
      init: false,
      apply: "_applyAnonymous"
    },

    /**
     * Whitespace-separated utility or root CSS classes applied to the content element.
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
     *
     * @type {Object<string, boolean>|null}
     * @protected
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: null,

    // --- 1. Event Delegation & Native CustomEvent Dispatch ---

    /**
     * Registers an event listener. Declared Qooxdoo class and property events attach
     * to the widget instance (`qx.core.MEvent`); native DOM events (`"click"`,
     * `"keydown"`, `"toggle"`, `"command"`, `"change"`) delegate directly to
     * `getContentElement()`.
     *
     * @param {string} type Event name (e.g., `"changeValue"`, `"click"`, `"keydown"`).
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
     * @param {string} type Event name.
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
     * @param {string} type Event name.
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

    /**
     * Dispatches a standard Web API `CustomEvent` directly on the widget's live
     * root `HTMLElement` (materializing the DOM element just-in-time if needed).
     *
     * @template T
     * @param {string} type Event name (e.g., `"ville:select"`, `"ville:change"`).
     * @param {T} [detail] Typed payload attached to `event.detail`.
     * @param {{ bubbles?: boolean, cancelable?: boolean, composed?: boolean }} [options] Dispatch options.
     * @returns {boolean} `false` if any listener called `event.preventDefault()`, otherwise `true`.
     * @protected
     */
    _dispatchNativeEvent(type, detail, options = {}) {
      const domEl = this._ensureDomElement();
      if (!domEl) {
        return true;
      }

      const event = new CustomEvent(type, {
        detail: detail !== undefined ? detail : null,
        bubbles: options.bubbles !== undefined ? options.bubbles : true,
        cancelable: options.cancelable !== undefined ? options.cancelable : true,
        composed: options.composed !== undefined ? options.composed : true
      });

      return domEl.dispatchEvent(event);
    },

    // --- 2. WAI-ARIA Support ---

    /**
     * Property apply handler for `ariaRole`.
     *
     * @param {string|null} value New ARIA role value.
     * @protected
     */
    _applyAriaRole(value) {
      this._setAttribute("role", value);
    },

    /**
     * Sets or removes a WAI-ARIA state/property attribute (`aria-<state>`) on the content element.
     *
     * @param {string} state ARIA attribute suffix without the `"aria-"` prefix (e.g., `"disabled"`, `"expanded"`).
     * @param {string|boolean|number|null} value Attribute value, or `null` to remove the attribute.
     */
    setAriaState(state, value) {
      this._setAttribute("aria-" + state, value === null ? null : String(value));
    },

    // --- 3. Element Lifecycle (Lazy Load & Flush) ---

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
     * Returns the widget's live `HTMLElement`, flushing pending `qx.html.Element`
     * mutations just-in-time if the element has not yet been materialized.
     *
     * @returns {HTMLElement|null} Live DOM element.
     * @protected
     */
    _ensureDomElement() {
      let domEl = /** @type {HTMLElement|null} */ (
        this.getContentElement().getDomElement()
      );
      if (!domEl || !domEl.isConnected) {
        qx.html.Element.flush();
        domEl = /** @type {HTMLElement|null} */ (
          this.getContentElement().getDomElement()
        );
      }
      return domEl;
    },

    /**
     * Instantiates, connects, and optionally hydrates the root `qx.html.Element`.
     *
     * @returns {qx.html.Element} The initialized content element.
     * @private
     */
    __createContentElement() {
      const el = this._createContentElement();
      el.connectObject(this);

      if (this.__existingDomId !== undefined && this.__existingDomId !== null) {
        const staticNode = document.getElementById(this.__existingDomId);
        if (staticNode) {
          el.useElement(staticNode);
        }
      }

      if (qx.core.Environment.get("qx.debug")) {
        el.setAttribute("villeClass", this.classname);
      }

      return el;
    },

    /**
     * Factory method that creates the underlying `qx.html.Element`.
     * Subclasses override this to return semantic tags (e.g., `"button"`, `"a"`, `"dialog"`).
     *
     * @returns {qx.html.Element} Newly constructed content element (defaults to `"div"`).
     * @protected
     */
    _createContentElement() {
      return new qx.html.Element("div");
    },

    // --- 4. State Management ---

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

    // --- 5. Appearance Resolution (Zero Layout Engine Dependency) ---

    /**
     * Property apply handler for `appearance`.
     *
     * @protected
     */
    _applyAppearance() {
      this._invalidateAppearance();
    },

    /**
     * Marks this widget's appearance as dirty and schedules `syncAppearance()` on
     * the microtask queue so multiple synchronous state/property mutations
     * coalesce into a single theme evaluation.
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
     * current `__states` map, applies returned themeable properties, and schedules
     * a single coalesced DOM flush once microtask passes settle.
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

      if (!this.__appearanceDirty) {
        ville.ui.core.Widget.scheduleFlush();
      }
    },

    // --- 6. Core Property Apply Methods ---

    /**
     * Property apply handler for `enabled`. Toggles `"disabled"` state and
     * `aria-disabled`. Form control subclasses override this to also toggle
     * the native HTML `disabled` attribute.
     *
     * @param {boolean} value New enabled state.
     * @protected
     */
    _applyEnabled(value) {
      if (value) {
        this.removeState("disabled");
        this.setAriaState("disabled", null);
      } else {
        this.addState("disabled");
        this.setAriaState("disabled", true);
      }
    },

    /**
     * Property apply handler for `visibility`.
     *
     * @param {"visible"|"hidden"|"excluded"} value New visibility mode.
     * @protected
     */
    _applyVisibility(value) {
      const el = this.getContentElement();
      if (value === "excluded") {
        el.setStyle("display", "none");
        el.setStyle("visibility", null);
      } else if (value === "hidden") {
        el.setStyle("display", null);
        el.setStyle("visibility", "hidden");
      } else {
        el.setStyle("display", null);
        el.setStyle("visibility", null);
      }
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Property apply handler for `anonymous`.
     *
     * @param {boolean} value Whether pointer events should be disabled.
     * @protected
     */
    _applyAnonymous(value) {
      this.getContentElement().setStyle("pointer-events", value ? "none" : null);
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Plain-object delta-diff applier for `cssUtilityClass` (zero `Set`/`Map` allocations).
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

      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Delta-diff applier for theme-driven state mutations (`VilleCssStatesPayload`).
     *
     * @param {VilleCssStatesPayload|null} value Incoming state DOM payload.
     * @param {VilleCssStatesPayload|null} old Previous state DOM payload.
     * @protected
     */
    _applyCssStates(value, old) {
      if (value === old) {
        return;
      }

      const el = this.getContentElement();
      if (!el) {
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
            el.removeAttribute(key, true);
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
          el.setAttributes(deltaAttrs, true);
        }
      }

      const removeAttrs = next["remove-attributes"];
      if (removeAttrs && removeAttrs.length > 0) {
        const oldRemAttrs = prev["remove-attributes"];
        for (let i = 0, l = removeAttrs.length; i < l; i++) {
          const attr = removeAttrs[i];
          if (!oldRemAttrs || !oldRemAttrs.includes(attr)) {
            el.removeAttribute(attr, true);
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
            el.removeClass(cls);
          }
        }
      }
      if (setClasses && setClasses.length > 0) {
        for (let i = 0, l = setClasses.length; i < l; i++) {
          const cls = setClasses[i];
          if (!oldSetClasses || !oldSetClasses.includes(cls)) {
            el.addClass(cls);
          }
        }
      }

      const removeClasses = next["remove-classes"];
      if (removeClasses && removeClasses.length > 0) {
        const oldRemClasses = prev["remove-classes"];
        for (let i = 0, l = removeClasses.length; i < l; i++) {
          const cls = removeClasses[i];
          if (!oldRemClasses || !oldRemClasses.includes(cls)) {
            el.removeClass(cls);
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
            el.removeStyle(key, true);
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
          el.setStyles(deltaStyles, true);
        }
      }

      const removeStyles = next["remove-styles"];
      if (removeStyles && removeStyles.length > 0) {
        const oldRemStyles = prev["remove-styles"];
        for (let i = 0, l = removeStyles.length; i < l; i++) {
          const style = removeStyles[i];
          if (!oldRemStyles || !oldRemStyles.includes(style)) {
            el.removeStyle(style, true);
          }
        }
      }

      ville.ui.core.Widget.scheduleFlush();
    },

    // --- 7. Hierarchy, Child Controls & Attribute Helper ---

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

      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Inserts a child widget at the specified zero-based index.
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

      ville.ui.core.Widget.scheduleFlush();
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

        ville.ui.core.Widget.scheduleFlush();
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
     * Retrieves (and lazily creates via `_createChildControlImpl()`) a named child control.
     *
     * @param {string} id Child control identifier.
     * @param {boolean} [notcreate=false] If `true`, returns `null` when absent.
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
     *
     * @param {string} id Child control identifier.
     * @param {*} [hash] Optional configuration map passed during creation.
     * @returns {ville.ui.core.Widget|null} Newly created child control, or `null` if unsupported.
     * @protected
     */
    _createChildControlImpl(id, hash) {
      return null;
    },

    /**
     * Protected helper to set, toggle (boolean), or remove (`null`/`false`) an HTML
     * attribute on the content element and schedule a coalesced DOM flush.
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
      ville.ui.core.Widget.scheduleFlush();
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
