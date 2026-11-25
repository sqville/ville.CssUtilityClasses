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
 * Base UI widget class for Ville UI (`ville.ui.*`) applications (`STRAT-CORE-01`,
 * `STRAT-CORE-02`, `STRAT-CORE-04`, `STRAT-EVENT-01`, `STRAT-LAYOUT-01`).
 *
 * Architectural responsibilities:
 * - Wraps `ville.html.Element` directly with lazy DOM element instantiation and
 *   microtask-coalesced `ville.html.Element.flush()` scheduling.
 * - Coalesces state and appearance invalidations via `queueMicrotask` into a
 *   single `syncAppearance()` evaluation per synchronous turn.
 * - Bridges provider-independent widget states (`disabled`, `loading`, `variant-*`,
 *   `size-*`, etc.) to external CSS frameworks (Mantine, Obsidian, shadcn/UnoCSS)
 *   via themeable `cssUtilityClass` and `cssStates` delta-diffing properties.
 * - Supports First-Class Standards-Backed `QxLayout` (`_setLayout`, `setLayoutProperties`,
 *   `setUserBounds`, `getBounds`, `width`, `height`, `minWidth`, `maxWidth`, `minHeight`,
 *   `maxHeight`, `allowGrowX/Y`, `alignX/Y`, `margin*`, `padding*`) backed by native
 *   CSS Flexbox, CSS Grid, CSS Positioning, and a shared `ResizeObserver`—with zero
 *   `qx.ui.core.queue.Layout` overhead.
 * - Uses native `IntersectionObserver` for `"appear"` / `"disappear"` visibility events,
 *   native `Element.checkVisibility()` for `isSeeable()`, native `Element.setPointerCapture()`
 *   for pointer capturing, and `ville.locale.MTranslation` (`Intl`) for zero-CLDR localization.
 *
 * @ignore(queueMicrotask, IntersectionObserver)
 */
qx.Class.define("ville.ui.core.Widget", {
  extend: qx.core.Object,
  include: [ville.locale.MTranslation],
  implement: [qx.core.IDisposable],

  events: {
    /**
     * Fired when the widget enters the viewport or becomes visible in the document
     * (backed by a shared `IntersectionObserver` — `STRAT-EVENT-01`).
     */
    appear: "qx.event.type.Event",

    /**
     * Fired when the widget leaves the viewport or is hidden/detached.
     */
    disappear: "qx.event.type.Event",

    /**
     * Fired when the widget's content box dimensions change (when observed).
     */
    resize: "qx.event.type.Data"
  },

  statics: {
    /** @type {boolean} @private */
    __flushScheduled: false,

    /** @type {boolean|null} @private */
    __reduceMotionOverride: null,

    /** @type {MediaQueryList|null} @private */
    __reducedMotionQuery: null,

    /**
     * Shared `IntersectionObserver` instance driving `"appear"` and `"disappear"`
     * events across all opted-in widgets (`STRAT-EVENT-01`).
     *
     * @type {IntersectionObserver|null}
     * @private
     */
    __appearObserver: null,

    /**
     * Schedules a single coalesced `ville.html.Element.flush()` at the end of the
     * current microtask turn so callers never need to flush manually.
     */
    scheduleFlush() {
      if (ville.ui.core.Widget.__flushScheduled) {
        return;
      }
      ville.ui.core.Widget.__flushScheduled = true;
      queueMicrotask(() => {
        ville.ui.core.Widget.__flushScheduled = false;
        ville.html.Element.flush();
      });
    },

    /**
     * Converts a numeric pixel value, semantic spacing token (`"xs"`, `"sm"`, `"md"`,
     * `"lg"`, `"xl"`), or CSS length string into a valid CSS dimension/spacing value.
     *
     * @param {number|string|null|undefined} val Input dimension or spacing value.
     * @returns {string|null} Formatted CSS value or `null`.
     */
    formatCssDimension(val) {
      if (val === null || val === undefined || val === "") {
        return null;
      }
      if (typeof val === "number") {
        return `${val}px`;
      }
      const tokenMap = {
        xs: "var(--ville-spacing-xs, var(--mantine-spacing-xs, 0.5rem))",
        sm: "var(--ville-spacing-sm, var(--mantine-spacing-sm, 0.75rem))",
        md: "var(--ville-spacing-md, var(--mantine-spacing-md, 1rem))",
        lg: "var(--ville-spacing-lg, var(--mantine-spacing-lg, 1.25rem))",
        xl: "var(--ville-spacing-xl, var(--mantine-spacing-xl, 2rem))"
      };
      return tokenMap[val] || String(val);
    },

    /**
     * Returns or lazily creates the shared `IntersectionObserver` for `"appear"` / `"disappear"`.
     *
     * @returns {IntersectionObserver|null} Shared intersection observer.
     * @private
     */
    __getAppearObserver() {
      if (
        !ville.ui.core.Widget.__appearObserver &&
        typeof IntersectionObserver !== "undefined"
      ) {
        ville.ui.core.Widget.__appearObserver = new IntersectionObserver(
          (entries) => {
            for (let i = 0; i < entries.length; i++) {
              const entry = entries[i];
              // @ts-ignore
              const widget = entry.target.$$qxObject;
              if (!widget || widget.isDisposed()) {
                continue;
              }
              if (entry.isIntersecting) {
                if (!widget.__isAppeared) {
                  widget.__isAppeared = true;
                  widget.fireEvent("appear");
                  widget._dispatchNativeEvent("ville:visible", {
                    visible: true,
                    entry
                  });
                }
              } else if (widget.__isAppeared) {
                widget.__isAppeared = false;
                widget.fireEvent("disappear");
                widget._dispatchNativeEvent("ville:visible", {
                  visible: false,
                  entry
                });
              }
            }
          }
        );
      }
      return ville.ui.core.Widget.__appearObserver;
    },

    /**
     * Sets or clears an application-level override for reduced motion, and syncs
     * `data-reduce-motion="true"` on `document.documentElement`.
     *
     * @param {boolean|null} value `true` to disable animations, `false` to enable, or `null` to follow OS `prefers-reduced-motion`.
     */
    setReduceMotion(value) {
      ville.ui.core.Widget.__reduceMotionOverride =
        value === null || value === undefined ? null : Boolean(value);

      if (typeof document !== "undefined" && document.documentElement) {
        if (ville.ui.core.Widget.prefersReducedMotion()) {
          document.documentElement.setAttribute("data-reduce-motion", "true");
        } else {
          document.documentElement.removeAttribute("data-reduce-motion");
        }
      }
    },

    /**
     * Returns the explicit application-level reduced-motion override (`true`, `false`, or `null`).
     *
     * @returns {boolean|null} Current override value.
     */
    getReduceMotion() {
      return ville.ui.core.Widget.__reduceMotionOverride;
    },

    /**
     * Returns `true` when animations should be suppressed or shortened.
     *
     * @returns {boolean} `true` if reduced motion is active.
     */
    prefersReducedMotion() {
      if (ville.ui.core.Widget.__reduceMotionOverride !== null) {
        return ville.ui.core.Widget.__reduceMotionOverride;
      }
      if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
        if (!ville.ui.core.Widget.__reducedMotionQuery) {
          ville.ui.core.Widget.__reducedMotionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          );
        }
        return ville.ui.core.Widget.__reducedMotionQuery.matches;
      }
      return false;
    }
  },

  /**
   * Creates a new Ville UI widget instance without eagerly creating DOM nodes.
   *
   * @param {string|Object} [existingDomIdOrProps] Optional ID of an existing DOM element to hydrate, or an initial property bag (`{ variant: "filled" }`).
   */
  construct(existingDomIdOrProps) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    this.__children = [];
    this.__states = {};
    this.__childControls = {};

    if (typeof existingDomIdOrProps === "string") {
      this.__existingDomId = existingDomIdOrProps;
    } else if (qx.lang.Type.isPojo(existingDomIdOrProps)) {
      this.__pendingProps = existingDomIdOrProps;
    }

    this.initAppearance();

    if (this.__pendingProps) {
      this.set(this.__pendingProps);
      this.__pendingProps = null;
    }
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
     * Explicit DOM `id` attribute applied to the root content element (`STRAT-CORE-01`, `STRAT-EVENT-02`).
     * Required for Invoker Commands (`commandfor`), Popover API (`popovertarget`), and label association.
     */
    domId: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyDomId",
      event: "changeDomId"
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
     * Native HTML `tabindex` attribute controlling keyboard focus order (`STRAT-CORE-01`).
     */
    tabIndex: {
      check: "Integer",
      nullable: true,
      init: null,
      apply: "_applyTabIndex"
    },

    /**
     * Native tooltip text (`title` attribute) on the root element (`STRAT-CORE-01`).
     */
    toolTipText: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyToolTipText"
    },

    /**
     * Native HTML `inert` attribute disabling focus, pointer events, and AOM subtree discovery (`STRAT-CORE-06`).
     */
    inert: {
      check: "Boolean",
      init: false,
      apply: "_applyInert",
      event: "changeInert"
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
     * Controls element display and visibility (`"visible"`, `"hidden"`, `"excluded"`, or `"until-found"`).
     * When set to `"until-found"`, applies native HTML `hidden="until-found"` so browser
     * `Ctrl+F` find-in-page can search collapsed tabs/accordions and fire `"beforematch"` (`STRAT-CORE-02`, `06`).
     */
    visibility: {
      check: ["visible", "hidden", "excluded", "until-found"],
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
     * CSS `cursor` property applied to the root element.
     */
    cursor: {
      check: "String",
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyCursor"
    },

    /**
     * CSS `z-index` stacking order applied to the root element.
     */
    zIndex: {
      check: "Integer",
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyZIndex",
      event: "changeZIndex"
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
    },

    // --- Standards-Backed QxLayout Dimension, Alignment & Spacing Properties (STRAT-LAYOUT-01) ---

    /**
     * Explicit width of the widget (`number` in pixels or CSS length string such as `"100%"`, `"20rem"`).
     */
    width: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyDimension",
      event: "changeWidth"
    },

    /**
     * Explicit height of the widget (`number` in pixels or CSS length string).
     */
    height: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyDimension",
      event: "changeHeight"
    },

    /**
     * Minimum width of the widget (`number` in pixels or CSS length string).
     */
    minWidth: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyDimension"
    },

    /**
     * Maximum width of the widget (`number` in pixels or CSS length string).
     */
    maxWidth: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyDimension"
    },

    /**
     * Minimum height of the widget (`number` in pixels or CSS length string).
     */
    minHeight: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyDimension"
    },

    /**
     * Maximum height of the widget (`number` in pixels or CSS length string).
     */
    maxHeight: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyDimension"
    },

    /**
     * Whether the widget is allowed to grow horizontally inside a parent layout (`HBox`, `VBox`, `Grid`).
     */
    allowGrowX: {
      check: "Boolean",
      init: true,
      apply: "_applyLayoutConstraint"
    },

    /**
     * Whether the widget is allowed to grow vertically inside a parent layout.
     */
    allowGrowY: {
      check: "Boolean",
      init: true,
      apply: "_applyLayoutConstraint"
    },

    /**
     * Whether the widget is allowed to shrink horizontally (`min-width: 0` in Flexbox/Grid).
     */
    allowShrinkX: {
      check: "Boolean",
      init: true,
      apply: "_applyLayoutConstraint"
    },

    /**
     * Whether the widget is allowed to shrink vertically (`min-height: 0` in Flexbox/Grid).
     */
    allowShrinkY: {
      check: "Boolean",
      init: true,
      apply: "_applyLayoutConstraint"
    },

    /**
     * Horizontal self-alignment inside the parent layout (`"left"`, `"center"`, `"right"`).
     */
    alignX: {
      check: ["left", "center", "right"],
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyAlignX"
    },

    /**
     * Vertical self-alignment inside the parent layout (`"top"`, `"middle"`, `"bottom"`, `"baseline"`).
     */
    alignY: {
      check: ["top", "middle", "bottom", "baseline"],
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applyAlignY"
    },

    /** Top outer margin (`number` in px, theme token `"xs".."xl"`, or CSS string). */
    marginTop: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applySpacing"
    },

    /** Right outer margin. */
    marginRight: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applySpacing"
    },

    /** Bottom outer margin. */
    marginBottom: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applySpacing"
    },

    /** Left outer margin. */
    marginLeft: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applySpacing"
    },

    /** Shorthand property for `marginTop`, `marginRight`, `marginBottom`, `marginLeft`. */
    margin: {
      group: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
      mode: "shorthand",
      themeable: true
    },

    /** Top inner padding (`number` in px, theme token `"xs".."xl"`, or CSS string). */
    paddingTop: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applySpacing"
    },

    /** Right inner padding. */
    paddingRight: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applySpacing"
    },

    /** Bottom inner padding. */
    paddingBottom: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applySpacing"
    },

    /** Left inner padding. */
    paddingLeft: {
      nullable: true,
      init: null,
      themeable: true,
      apply: "_applySpacing"
    },

    /** Shorthand property for `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`. */
    padding: {
      group: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
      mode: "shorthand",
      themeable: true
    }
  },

  members: {
    /** @type {ville.html.Element|null} @private */
    __contentElement: null,

    /** @type {string|null|undefined} @private */
    __existingDomId: null,

    /** @type {Object|null} @private */
    __pendingProps: null,

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

    /** @type {ville.ui.layout.Abstract|null} @private */
    __layoutManager: null,

    /** @type {Object<string, *>|null} @private */
    __layoutProperties: null,

    /** @type {boolean} @private */
    __observingAppear: false,

    /** @type {boolean} @private */
    __isAppeared: false,

    /** @type {number|null} @private */
    __capturedPointerId: null,

    /**
     * Map of state names (e.g., `{ disabled: true }`) that should automatically
     * propagate to child controls registered via `getChildControl()`.
     *
     * @type {Object<string, boolean>|null}
     * @protected
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: null,

    // --- 1. Event Delegation, IntersectionObserver Appear Bridge & Web Animations API ---

    /**
     * Registers an event listener. Declared Qooxdoo class and property events attach
     * to the widget instance (`qx.core.MEvent`); native DOM events (`"click"`,
     * `"keydown"`, `"toggle"`, `"command"`, `"change"`, `"beforematch"`) delegate
     * directly to `getContentElement()`.
     *
     * Attaching `"appear"` or `"disappear"` automatically registers this widget's
     * content element with the shared `IntersectionObserver` (`STRAT-EVENT-01`).
     *
     * @param {string} type Event name (e.g., `"changeValue"`, `"click"`, `"appear"`).
     * @param {Function} listener Event handler function.
     * @param {Object} [self] Context (`this`) bound when invoking the listener.
     * @param {boolean} [capture=false] Whether to attach during the DOM capture phase.
     * @returns {*} Opaque listener ID used for removal.
     */
    addListener(type, listener, self, capture) {
      if (type === "appear" || type === "disappear") {
        this.__enableAppearObserver();
      }
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
     * Checks whether at least one listener is registered for the given event type.
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
     * Enrolls this widget's DOM element in the shared `IntersectionObserver` once flushed.
     *
     * @private
     */
    __enableAppearObserver() {
      if (this.__observingAppear) {
        return;
      }
      this.__observingAppear = true;
      queueMicrotask(() => {
        if (this.isDisposed()) {
          return;
        }
        const domEl = this._ensureDomElement();
        const obs = ville.ui.core.Widget.__getAppearObserver();
        if (domEl && obs) {
          obs.observe(domEl);
        }
      });
    },

    /**
     * Dispatches a standard Web API `CustomEvent` directly on the widget's live
     * root `HTMLElement`.
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

    /**
     * Runs a native Web Animations API (`Element.prototype.animate`) transition on
     * this widget's live DOM element while automatically honoring `prefers-reduced-motion`
     * and `ville.ui.core.Widget.setReduceMotion()`.
     *
     * @param {Keyframe[]|PropertyIndexedKeyframes} keyframes Standard WAAPI keyframes.
     * @param {number|(KeyframeAnimationOptions & { skipIfReduced?: boolean })} [options=150] Duration in ms or WAAPI options object.
     * @returns {Animation|null} The active browser `Animation` instance, or `null`.
     */
    animate(keyframes, options = 150) {
      const domEl = this._ensureDomElement();
      if (!domEl || typeof domEl.animate !== "function") {
        return null;
      }

      const reduced = ville.ui.core.Widget.prefersReducedMotion();
      const normalizedOptions =
        typeof options === "number"
          ? { duration: options }
          : Object.assign({}, options);

      if (reduced) {
        if (normalizedOptions.skipIfReduced) {
          return null;
        }
        normalizedOptions.duration = 0;
        normalizedOptions.delay = 0;
      }

      delete normalizedOptions.skipIfReduced;
      return domEl.animate(keyframes, normalizedOptions);
    },

    // --- 2. WAI-ARIA, Visibility Convenience & Native Pointer Capture ---

    /**
     * @param {string|null} value New DOM `id`.
     * @protected
     */
    _applyDomId(value) {
      this._setAttribute("id", value);
    },

    /**
     * @param {string|null} value New ARIA role value.
     * @protected
     */
    _applyAriaRole(value) {
      this._setAttribute("role", value);
    },

    /**
     * @param {number|null} value New `tabindex` value.
     * @protected
     */
    _applyTabIndex(value) {
      this._setAttribute("tabindex", value !== null ? String(value) : null);
    },

    /**
     * @param {string|null} value New tooltip text.
     * @protected
     */
    _applyToolTipText(value) {
      this._setAttribute("title", value);
    },

    /**
     * @param {boolean} value Whether the element and its subtree are `inert`.
     * @protected
     */
    _applyInert(value) {
      this._setAttribute("inert", value ? true : null);
    },

    /**
     * @param {string|null} value CSS cursor value.
     * @protected
     */
    _applyCursor(value) {
      this.getContentElement().setStyle("cursor", value || null);
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * @param {number|null} value CSS `z-index` value.
     * @protected
     */
    _applyZIndex(value) {
      this.getContentElement().setStyle(
        "z-index",
        value !== null && value !== undefined ? String(value) : null
      );
      ville.ui.core.Widget.scheduleFlush();
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

    /**
     * Makes the widget visible (`setVisibility("visible")`).
     */
    show() {
      this.setVisibility("visible");
    },

    /**
     * Hides the widget while preserving its layout box (`setVisibility("hidden")`).
     */
    hide() {
      this.setVisibility("hidden");
    },

    /**
     * Excludes the widget from layout and display (`setVisibility("excluded")`).
     */
    exclude() {
      this.setVisibility("excluded");
    },

    /**
     * Returns `true` if `visibility` is `"visible"`.
     *
     * @returns {boolean} `true` if visible.
     */
    isVisible() {
      return this.getVisibility() === "visible";
    },

    /**
     * Returns `true` if `visibility` is `"hidden"`.
     *
     * @returns {boolean} `true` if hidden.
     */
    isHidden() {
      return this.getVisibility() === "hidden";
    },

    /**
     * Returns `true` if `visibility` is `"excluded"`.
     *
     * @returns {boolean} `true` if excluded.
     */
    isExcluded() {
      return this.getVisibility() === "excluded";
    },

    /**
     * Checks whether the widget is currently rendered and visible in the live document
     * using the browser's C++ `Element.prototype.checkVisibility()` Web API (`STRAT-CORE-06`).
     *
     * @param {CheckVisibilityOptions} [options] Optional `checkVisibility` flags.
     * @returns {boolean} `true` if rendered and visible on screen.
     */
    isSeeable(options) {
      const domEl = /** @type {HTMLElement|null} */ (
        this.getContentElement().getDomElement()
      );
      if (!domEl || !domEl.isConnected) {
        return false;
      }
      if (typeof domEl.checkVisibility === "function") {
        return domEl.checkVisibility(
          options || {
            visibilityProperty: true,
            contentVisibilityAuto: true
          }
        );
      }
      return this.isVisible();
    },

    /**
     * Alias for `isSeeable(options)` matching the W3C `Element.checkVisibility()` method name.
     *
     * @param {CheckVisibilityOptions} [options] Optional `checkVisibility` flags.
     * @returns {boolean} `true` if visible.
     */
    checkVisibility(options) {
      return this.isSeeable(options);
    },

    /**
     * Captures pointer events to this widget's root DOM element using native
     * `Element.prototype.setPointerCapture()` (`STRAT-CORE-06`).
     *
     * @param {number} [pointerId=1] Active pointer ID from `PointerEvent`.
     */
    capture(pointerId = 1) {
      const domEl = this._ensureDomElement();
      if (domEl && typeof domEl.setPointerCapture === "function") {
        try {
          domEl.setPointerCapture(pointerId);
          this.__capturedPointerId = pointerId;
        } catch (err) {
          // Ignore InvalidStateError if pointer is not currently down
        }
      }
    },

    /**
     * Releases pointer capture previously acquired via `capture()`.
     *
     * @param {number} [pointerId] Pointer ID to release.
     */
    releaseCapture(pointerId) {
      const id = pointerId ?? this.__capturedPointerId;
      const domEl = /** @type {HTMLElement|null} */ (
        this.getContentElement().getDomElement()
      );
      if (
        id !== null &&
        domEl &&
        typeof domEl.hasPointerCapture === "function" &&
        domEl.hasPointerCapture(id)
      ) {
        domEl.releasePointerCapture(id);
      }
      this.__capturedPointerId = null;
    },

    // --- 3. Element Lifecycle (Lazy Load & Flush) ---

    /**
     * Returns the widget's root `ville.html.Element`, creating and binding it lazily
     * on first access.
     *
     * @returns {ville.html.Element} The root virtual DOM wrapper element.
     */
    getContentElement() {
      if (!this.__contentElement) {
        this.__contentElement = this.__createContentElement();
      }
      return this.__contentElement;
    },

    /**
     * Returns the widget's live `HTMLElement`, flushing pending `ville.html.Element`
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
        ville.html.Element.flush();
        domEl = /** @type {HTMLElement|null} */ (
          this.getContentElement().getDomElement()
        );
      }
      return domEl;
    },

    /**
     * Instantiates, connects, and optionally hydrates the root `ville.html.Element`.
     *
     * @returns {ville.html.Element} The initialized content element.
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
     * Factory method that creates the underlying `ville.html.Element`.
     * Subclasses override this to return semantic tags (e.g., `"button"`, `"a"`, `"dialog"`).
     *
     * @returns {ville.html.Element} Newly constructed content element (defaults to `"div"`).
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element("div");
    },

    // --- 4. State Management ---

    /**
     * Activates a visual/behavioral state on the widget, schedules an appearance
     * re-evaluation, and forwards the state to child controls if listed in `_forwardStates`.
     *
     * @param {string} state State identifier (e.g., `"disabled"`, `"loading"`, `"expanded"`).
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

    // --- 5. Appearance Resolution ---

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
     * Property apply handler for `enabled`.
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
     * Property apply handler for `visibility` (`"visible"`, `"hidden"`, `"excluded"`, `"until-found"`).
     *
     * @param {"visible"|"hidden"|"excluded"|"until-found"} value New visibility mode.
     * @protected
     */
    _applyVisibility(value) {
      const el = this.getContentElement();
      if (value === "excluded") {
        el.removeAttribute("hidden");
        el.setStyle("display", "none");
        el.setStyle("visibility", null);
      } else if (value === "until-found") {
        el.setStyle("display", null);
        el.setStyle("visibility", null);
        el.setAttribute("hidden", "until-found");
      } else if (value === "hidden") {
        el.removeAttribute("hidden");
        el.setStyle("display", null);
        el.setStyle("visibility", "hidden");
      } else {
        el.removeAttribute("hidden");
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

    // --- 7. Standards-Backed QxLayout Dimension, Alignment, Spacing & Bounds API (STRAT-LAYOUT-01) ---

    /**
     * Property apply handler for `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`.
     *
     * @param {number|string|null} value Dimension value.
     * @param {number|string|null} old Previous value.
     * @param {string} name Property name.
     * @protected
     */
    _applyDimension(value, old, name) {
      const cssPropMap = {
        width: "width",
        height: "height",
        minWidth: "min-width",
        maxWidth: "max-width",
        minHeight: "min-height",
        maxHeight: "max-height"
      };
      const cssProp = cssPropMap[name];
      if (!cssProp) {
        return;
      }
      this.getContentElement().setStyle(
        cssProp,
        ville.ui.core.Widget.formatCssDimension(value)
      );
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Property apply handler for `marginTop..Left` and `paddingTop..Left`.
     *
     * @param {number|string|null} value Spacing value.
     * @param {number|string|null} old Previous value.
     * @param {string} name Property name.
     * @protected
     */
    _applySpacing(value, old, name) {
      const cssPropMap = {
        marginTop: "margin-top",
        marginRight: "margin-right",
        marginBottom: "margin-bottom",
        marginLeft: "margin-left",
        paddingTop: "padding-top",
        paddingRight: "padding-right",
        paddingBottom: "padding-bottom",
        paddingLeft: "padding-left"
      };
      const cssProp = cssPropMap[name];
      if (!cssProp) {
        return;
      }
      this.getContentElement().setStyle(
        cssProp,
        ville.ui.core.Widget.formatCssDimension(value)
      );
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Property apply handler for `alignX`.
     *
     * @param {"left"|"center"|"right"|null} value Horizontal self-alignment.
     * @protected
     */
    _applyAlignX(value) {
      this.__syncParentChildLayout();
    },

    /**
     * Property apply handler for `alignY`.
     *
     * @param {"top"|"middle"|"bottom"|"baseline"|null} value Vertical self-alignment.
     * @protected
     */
    _applyAlignY(value) {
      this.__syncParentChildLayout();
    },

    /**
     * Property apply handler for `allowGrowX`, `allowGrowY`, `allowShrinkX`, `allowShrinkY`.
     *
     * @protected
     */
    _applyLayoutConstraint() {
      this.__syncParentChildLayout();
    },

    /**
     * Notifies the parent container's layout manager when a child's layout properties
     * or alignment/growth constraints change.
     *
     * @private
     */
    __syncParentChildLayout() {
      const parent = this.__parent;
      if (parent && parent.__layoutManager) {
        parent.__layoutManager.applyChildLayout(this, this.__layoutProperties || {});
      }
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Assigns a Standards-Backed `QxLayout` manager (`ville.ui.layout.Abstract` subclass
     * such as `HBox`, `VBox`, `Grid`, `Dock`, `Canvas`, `Flow`, `Grow`, or a custom
     * `ResizeObserver` layout) to this container widget (`STRAT-LAYOUT-01`).
     *
     * @param {ville.ui.layout.Abstract|null} layout Layout manager instance.
     * @protected
     */
    _setLayout(layout) {
      if (this.__layoutManager === layout) {
        return;
      }
      if (this.__layoutManager) {
        this.__layoutManager.connectToWidget(null);
      }
      this.__layoutManager = layout || null;
      if (layout) {
        layout.connectToWidget(this);
        for (let i = 0; i < this.__children.length; i++) {
          const child = this.__children[i];
          layout.applyChildLayout(child, child.getLayoutProperties());
        }
      }
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Returns the active layout manager attached to this container, or `null`.
     *
     * @returns {ville.ui.layout.Abstract|null} Active layout manager.
     * @protected
     */
    _getLayout() {
      return this.__layoutManager;
    },

    /**
     * Stores and applies per-child layout options (e.g., `{ flex: 1 }`, `{ row: 0, column: 1, colSpan: 2 }`,
     * `{ left: 20, top: 40 }`, `{ edge: "north" }`) interpreted by the parent's layout manager.
     *
     * @param {Object<string, *>|null} props Map of layout properties.
     */
    setLayoutProperties(props) {
      if (!props) {
        return;
      }
      this.__layoutProperties = Object.assign(
        this.__layoutProperties || {},
        props
      );

      const parent = this.__parent;
      if (parent && parent.__layoutManager) {
        parent.__layoutManager.applyChildLayout(this, this.__layoutProperties);
      } else {
        this.__applyDefaultChildLayoutProperties(this.__layoutProperties);
      }
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Returns the map of layout properties currently set on this widget.
     *
     * @returns {Object<string, *>} Layout properties map.
     */
    getLayoutProperties() {
      return this.__layoutProperties || {};
    },

    /**
     * Compatibility alias for `setLayoutProperties(props)`.
     *
     * @param {Object<string, *>} props Layout properties map.
     */
    updateLayoutProperties(props) {
      this.setLayoutProperties(props);
    },

    /**
     * Fallback layout property translation when a child is added with `{ flex, left, top, right, bottom, width }`
     * inside a declarative container (`HGroup`, `VStack`, `Flex`, `SimpleGrid`, `Box`) that does not
     * have an explicit `ville.ui.layout.Abstract` instance attached.
     *
     * @param {Object<string, *>} props Layout options map.
     * @private
     */
    __applyDefaultChildLayoutProperties(props) {
      const el = this.getContentElement();
      if ("flex" in props) {
        el.setStyle(
          "flex",
          props.flex !== null && props.flex !== undefined
            ? `${props.flex} 1 0%`
            : null
        );
      }
      if ("width" in props && props.width != null) {
        el.setStyle("width", ville.ui.core.Widget.formatCssDimension(props.width));
      }
      if ("height" in props && props.height != null) {
        el.setStyle("height", ville.ui.core.Widget.formatCssDimension(props.height));
      }
      if (
        "left" in props ||
        "top" in props ||
        "right" in props ||
        "bottom" in props
      ) {
        el.setStyle("position", "absolute");
        if ("left" in props) {
          el.setStyle("left", ville.ui.core.Widget.formatCssDimension(props.left));
        }
        if ("top" in props) {
          el.setStyle("top", ville.ui.core.Widget.formatCssDimension(props.top));
        }
        if ("right" in props) {
          el.setStyle("right", ville.ui.core.Widget.formatCssDimension(props.right));
        }
        if ("bottom" in props) {
          el.setStyle("bottom", ville.ui.core.Widget.formatCssDimension(props.bottom));
        }
      }
      if ("colSpan" in props && props.colSpan > 1) {
        el.setStyle("grid-column", `span ${props.colSpan}`);
      }
      if ("rowSpan" in props && props.rowSpan > 1) {
        el.setStyle("grid-row", `span ${props.rowSpan}`);
      }
    },

    /**
     * Applies explicit pixel or CSS bounds (`left`, `top`, `width`, `height`) to this
     * widget in a single microtask-coalesced style batch (`STRAT-LAYOUT-01`).
     * Used by custom `ResizeObserver` `renderLayout(availWidth, availHeight)` implementations,
     * `MMovable`, `MResizable`, and freeform canvases.
     *
     * @param {number|string} left Horizontal offset from parent content box.
     * @param {number|string} top Vertical offset from parent content box.
     * @param {number|string} width Box width.
     * @param {number|string} height Box height.
     */
    setUserBounds(left, top, width, height) {
      this.getContentElement().setStyles({
        position: "absolute",
        left: ville.ui.core.Widget.formatCssDimension(left),
        top: ville.ui.core.Widget.formatCssDimension(top),
        width: ville.ui.core.Widget.formatCssDimension(width),
        height: ville.ui.core.Widget.formatCssDimension(height)
      });
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Resets explicit user bounds previously applied via `setUserBounds()`.
     */
    resetUserBounds() {
      this.getContentElement().setStyles({
        position: null,
        left: null,
        top: null,
        width: ville.ui.core.Widget.formatCssDimension(this.getWidth()),
        height: ville.ui.core.Widget.formatCssDimension(this.getHeight())
      });
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Updates the widget's inline `left` and `top` DOM coordinates directly.
     *
     * @param {number} left Horizontal offset in pixels.
     * @param {number} top Vertical offset in pixels.
     */
    setDomPosition(left, top) {
      this.getContentElement().setStyles({
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`
      });
      ville.html.Element.flush();
    },

    /**
     * Returns the widget's live pixel geometry (`{ left, top, width, height }`) relative
     * to its offset parent using the browser's C++ layout engine (`STRAT-CORE-04`).
     *
     * @returns {{ left: number, top: number, width: number, height: number }} Widget bounds in pixels.
     */
    getBounds() {
      const domEl = this._ensureDomElement();
      if (!domEl) {
        return {
          left: 0,
          top: 0,
          width: typeof this.getWidth() === "number" ? this.getWidth() : 0,
          height: typeof this.getHeight() === "number" ? this.getHeight() : 0
        };
      }
      const rect = domEl.getBoundingClientRect();
      return {
        left: Math.round(domEl.offsetLeft || 0),
        top: Math.round(domEl.offsetTop || 0),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    },

    /**
     * Returns the widget's live viewport rectangle (`{ left, top, right, bottom, width, height }`)
     * via `Element.prototype.getBoundingClientRect()`.
     *
     * @returns {{ left: number, top: number, right: number, bottom: number, width: number, height: number }} Viewport box coordinates.
     */
    getContentLocation() {
      const domEl = this._ensureDomElement();
      if (!domEl) {
        return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
      }
      const rect = domEl.getBoundingClientRect();
      return {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    },

    /**
     * Returns the widget's configured min/max size constraints (`getSizeHint` compatibility helper).
     *
     * @returns {{ width: number, height: number, minWidth: number, maxWidth: number, minHeight: number, maxHeight: number }} Size constraint map.
     */
    getSizeHint() {
      const bounds = this.getBounds();
      return {
        width: typeof this.getWidth() === "number" ? this.getWidth() : bounds.width,
        height: typeof this.getHeight() === "number" ? this.getHeight() : bounds.height,
        minWidth: typeof this.getMinWidth() === "number" ? this.getMinWidth() : 0,
        maxWidth:
          typeof this.getMaxWidth() === "number" ? this.getMaxWidth() : Infinity,
        minHeight: typeof this.getMinHeight() === "number" ? this.getMinHeight() : 0,
        maxHeight:
          typeof this.getMaxHeight() === "number" ? this.getMaxHeight() : Infinity
      };
    },

    /**
     * Returns zeroed or computed padding insets for `MMovable` / `QxLayout` compatibility.
     *
     * @returns {{ top: number, right: number, bottom: number, left: number }} Inset map.
     */
    getInsets() {
      return {
        top: typeof this.getPaddingTop() === "number" ? this.getPaddingTop() : 0,
        right: typeof this.getPaddingRight() === "number" ? this.getPaddingRight() : 0,
        bottom:
          typeof this.getPaddingBottom() === "number" ? this.getPaddingBottom() : 0,
        left: typeof this.getPaddingLeft() === "number" ? this.getPaddingLeft() : 0
      };
    },

    // --- 8. Hierarchy, Child Controls & Attribute Helper ---

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
     * Compatibility alias for `getParent()` used by `MMovable`, `MResizable`, and `QxLayout`.
     *
     * @returns {ville.ui.core.Widget|null} Parent widget instance.
     */
    getLayoutParent() {
      return this.__parent;
    },

    /**
     * Returns the application root widget (`ville.ui.root.Application`).
     *
     * @returns {ville.ui.core.Widget|null} Application root widget.
     */
    getApplicationRoot() {
      const app = qx.core.Init?.getApplication?.();
      return app && typeof app.getRoot === "function" ? app.getRoot() : null;
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
     * Alias for `_getChildren()` used by `ville.ui.layout.Abstract` subclasses.
     *
     * @returns {ville.ui.core.Widget[]} Ordered list of child widgets.
     * @protected
     */
    _getLayoutChildren() {
      return this.__children.filter((c) => !c.isExcluded());
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
     * Appends a child widget (with optional `QxLayout` layout options), inserts its
     * content element into this widget's DOM container, and applies layout rules.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to append.
     * @param {Object<string, *>} [options] Optional per-child layout properties (`{ flex, row, column, left, top, edge }`).
     * @returns {this} This widget for chaining.
     * @protected
     */
    _add(childWidget, options) {
      if (childWidget.getParent()) {
        childWidget.getParent()._remove(childWidget);
      }
      this.__children.push(childWidget);
      childWidget.setParent(this);
      this.getContentElement().add(childWidget.getContentElement());

      if (options) {
        childWidget.setLayoutProperties(options);
      } else if (this.__layoutManager) {
        this.__layoutManager.applyChildLayout(
          childWidget,
          childWidget.getLayoutProperties()
        );
      }

      ville.ui.core.Widget.scheduleFlush();
      return this;
    },

    /**
     * Inserts a child widget at the specified zero-based index with optional layout properties.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to insert.
     * @param {number} index Zero-based insertion index.
     * @param {Object<string, *>} [options] Optional per-child layout properties.
     * @returns {this} This widget for chaining.
     * @protected
     */
    _addAt(childWidget, index, options) {
      qx.core.Assert.assertInteger(index);
      if (childWidget.getParent()) {
        childWidget.getParent()._remove(childWidget);
      }
      this.__children.splice(index, 0, childWidget);
      childWidget.setParent(this);
      this.getContentElement().addAt(childWidget.getContentElement(), index);

      if (options) {
        childWidget.setLayoutProperties(options);
      } else if (this.__layoutManager) {
        this.__layoutManager.applyChildLayout(
          childWidget,
          childWidget.getLayoutProperties()
        );
      }

      ville.ui.core.Widget.scheduleFlush();
      return this;
    },

    /**
     * Inserts `childWidget` immediately before `beforeWidget`.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to insert.
     * @param {ville.ui.core.Widget} beforeWidget Existing child widget to insert before.
     * @param {Object<string, *>} [options] Optional per-child layout properties.
     * @returns {this} This widget for chaining.
     * @protected
     */
    _addBefore(childWidget, beforeWidget, options) {
      const idx = this.__children.indexOf(beforeWidget);
      if (idx === -1) {
        throw new Error("The widget to insert before is not a child of this widget.");
      }
      return this._addAt(childWidget, idx, options);
    },

    /**
     * Inserts `childWidget` immediately after `afterWidget`.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to insert.
     * @param {ville.ui.core.Widget} afterWidget Existing child widget to insert after.
     * @param {Object<string, *>} [options] Optional per-child layout properties.
     * @returns {this} This widget for chaining.
     * @protected
     */
    _addAfter(childWidget, afterWidget, options) {
      const idx = this.__children.indexOf(afterWidget);
      if (idx === -1) {
        throw new Error("The widget to insert after is not a child of this widget.");
      }
      return this._addAt(childWidget, idx + 1, options);
    },

    /**
     * Removes a child widget and detaches its content element from this widget's DOM container.
     *
     * @param {ville.ui.core.Widget} childWidget Child widget to remove.
     * @returns {this} This widget for chaining.
     * @protected
     */
    _remove(childWidget) {
      const idx = this.__children.indexOf(childWidget);
      if (idx !== -1) {
        this.__children.splice(idx, 1);
        childWidget.setParent(null);
        this.getContentElement().remove(childWidget.getContentElement());

        if (this.__layoutManager) {
          this.__layoutManager.onChildRemoved(childWidget);
        }

        ville.ui.core.Widget.scheduleFlush();
      }
      return this;
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
     * Convenience Qooxdoo compatibility alias for `getChildControl(id, false)`.
     *
     * @param {string} id Child control identifier.
     * @param {*} [hash] Optional configuration map passed during creation.
     * @returns {ville.ui.core.Widget|null} The child control widget instance.
     * @protected
     */
    _createChildControl(id, hash) {
      return this.getChildControl(id, false);
    },

    /**
     * Disposes and unregisters one or more named child controls if instantiated.
     *
     * @param {...string} ids Child control identifiers to dispose.
     * @protected
     */
    _disposeChildControl(...ids) {
      if (!this.__childControls) {
        return;
      }
      for (const id of ids) {
        const ctrl = this.__childControls[id];
        if (ctrl && typeof ctrl.dispose === "function" && !ctrl.isDisposed()) {
          ctrl.dispose();
        }
        delete this.__childControls[id];
      }
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
   * Unobserves from shared `IntersectionObserver`, disconnects layout manager,
   * disposes all instantiated child controls, and disposes the root `ville.html.Element`.
   */
  destruct() {
    if (this.__observingAppear && ville.ui.core.Widget.__appearObserver) {
      const domEl = this.__contentElement?.getDomElement();
      if (domEl) {
        ville.ui.core.Widget.__appearObserver.unobserve(domEl);
      }
    }
    if (this.__layoutManager) {
      this.__layoutManager.connectToWidget(null);
      this._disposeObjects("__layoutManager");
    }
    this._disposeMap("__childControls");
    if (this.__contentElement) {
      this.__contentElement.disconnectObject(this);
      this._disposeObjects("__contentElement");
    }
    this.__children = null;
    this.__states = null;
    this.__themeValues = null;
    this.__layoutProperties = null;
    this.__parent = null;
    this.__subparent = null;
  }
});
