/**
 * Mode 3 virtual DOM element (`ville.html.Element`) wrapping a browser `HTMLElement`
 * or `SVGElement` with buffered attribute, class, inline style, and child flushing.
 *
 * Replaces `qx.html.Element` in Mode 3 to completely eliminate dependencies on
 * `qx.bom.Element`, `qx.event.handler.Focus` (which dragged in `qx.ui.core.Widget`),
 * `qx.event.handler.Appear`, `qx.event.handler.Pointer/Gesture/Touch/Keyboard/Mouse`,
 * `qx.event.dispatch.MouseCapture`, `qx.bom.Selection`, `qx.bom.element.*`, and `qx.html.Slot`.
 *
 * @ignore(queueMicrotask)
 */
qx.Class.define("ville.html.Element", {
  extend: ville.html.Node,

  /**
   * Creates a new `ville.html.Element`.
   *
   * @param {string} [tagName="div"] HTML tag name to create.
   * @param {Object<string, string|number|null>|null} [styles=null] Optional initial inline styles.
   * @param {Object<string, string|number|boolean|null>|null} [attributes=null] Optional initial HTML attributes.
   */
  construct(tagName, styles, attributes) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(tagName || "div");

    this.__styleValues = styles ? Object.assign({}, styles) : null;
    this.__attribValues = attributes ? Object.assign({}, attributes) : null;
  },

  statics: {
    /** @type {number} Number of active root elements */
    _hasRoots: 0,

    /** @type {Object<string, ville.html.Node>} Modified nodes awaiting flush */
    _modified: {},

    /** @type {Object<string, ville.html.Element>} Visibility changes awaiting flush */
    _visibility: {},

    /** @type {boolean} Whether a microtask flush is currently scheduled */
    __flushScheduled: false,

    /** @type {HTMLDivElement|null} Shared offscreen parser element for `useMarkup()` */
    __helperEl: null,

    /**
     * Schedules a coalesced microtask flush of all modified `ville.html.Element`
     * and `ville.html.Text` nodes.
     */
    _scheduleFlush() {
      if (ville.html.Element.__flushScheduled) {
        return;
      }
      ville.html.Element.__flushScheduled = true;
      queueMicrotask(() => {
        ville.html.Element.__flushScheduled = false;
        ville.html.Element.flush();
      });
    },

    /**
     * Flushes all pending virtual DOM creations, attribute/style updates, child
     * insertions, and visibility changes to the live browser DOM.
     */
    flush() {
      const later = [];
      const modified = ville.html.Element._modified;

      for (const hc in modified) {
        const obj = modified[hc];
        if (obj && !obj.$$disposed && obj._willBeSeeable()) {
          if (obj._domNode && obj._domNode.isConnected) {
            later.push(obj);
          } else {
            obj.flush();
          }
          delete modified[hc];
        }
      }

      for (let i = 0, l = later.length; i < l; i++) {
        const obj = later[i];
        if (!obj.$$disposed) {
          obj.flush();
        }
      }

      const visibility = ville.html.Element._visibility;
      for (const hc in visibility) {
        const obj = visibility[hc];
        const element = /** @type {HTMLElement|null} */ (obj ? obj._domNode : null);
        if (element && !obj.$$disposed) {
          element.style.display = obj.isVisible() ? "" : "none";
        }
        delete visibility[hc];
      }
    },

    /**
     * Applies a single CSS property or custom property (`--*`) directly onto a
     * live `HTMLElement` or `SVGElement`.
     *
     * @param {HTMLElement|SVGElement} domEl Target DOM element.
     * @param {string} key CSS property name (camelCase or kebab-case) or `--custom-prop`.
     * @param {string|number|null|undefined} value CSS property value, or `null` to remove.
     */
    _applyDomStyle(domEl, key, value) {
      if (!domEl || !domEl.style) {
        return;
      }
      const cssProp = key.startsWith("--")
        ? key
        : key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

      if (value == null || value === "") {
        domEl.style.removeProperty(cssProp);
      } else {
        domEl.style.setProperty(cssProp, String(value));
      }
    },

    /**
     * Applies a single HTML attribute (or `"html"` innerHTML shorthand) directly
     * onto a live `HTMLElement` or `SVGElement`.
     *
     * @param {HTMLElement|SVGElement} domEl Target DOM element.
     * @param {string} key Attribute name.
     * @param {*} value Attribute value, or `null`/`undefined` to remove.
     */
    _applyDomAttribute(domEl, key, value) {
      if (!domEl) {
        return;
      }
      if (key === "html") {
        domEl.innerHTML = value != null ? String(value) : "";
        return;
      }
      if (value == null || value === false) {
        domEl.removeAttribute(key);
      } else {
        domEl.setAttribute(key, value === true ? "" : String(value));
      }
    }
  },

  members: {
    /** @type {boolean} @private */
    __root: false,

    /** @type {Object<string, boolean>|null} @private */
    __styleJobs: null,

    /** @type {Object<string, boolean>|null} @private */
    __attribJobs: null,

    /** @type {Object<string, any>|null} @private */
    __styleValues: null,

    /** @type {Object<string, any>|null} @private */
    __attribValues: null,

    /**
     * Creates the concrete browser `HTMLElement` for `this._nodeName`.
     *
     * @override
     * @returns {HTMLElement} Newly created DOM element.
     * @protected
     */
    _createDomElement() {
      return document.createElement(this._nodeName || "div");
    },

    /**
     * Copies all buffered attributes, inline styles, and visibility state onto
     * `this._domNode` immediately after initial creation.
     *
     * @override
     * @param {boolean} [fromMarkup=false] Whether the node was hydrated from markup.
     * @protected
     */
    _copyData(fromMarkup) {
      const elem = /** @type {HTMLElement} */ (this._domNode);
      if (!elem) {
        return;
      }

      if (this.__attribValues) {
        for (const key in this.__attribValues) {
          ville.html.Element._applyDomAttribute(elem, key, this.__attribValues[key]);
        }
      }

      if (this.__styleValues) {
        for (const key in this.__styleValues) {
          ville.html.Element._applyDomStyle(elem, key, this.__styleValues[key]);
        }
      }

      if (!fromMarkup) {
        const display = elem.style ? elem.style.display : "";
        if (!display && !this.isVisible()) {
          elem.style.display = "none";
        }
      }
    },

    /**
     * Flushes incremental attribute and style mutations queued since the last flush.
     *
     * @override
     * @protected
     */
    _syncData() {
      const elem = /** @type {HTMLElement} */ (this._domNode);
      if (!elem) {
        return;
      }

      const attribJobs = this.__attribJobs;
      if (attribJobs) {
        const data = this.__attribValues;
        for (const key in attribJobs) {
          const val = data ? data[key] : undefined;
          ville.html.Element._applyDomAttribute(elem, key, val);
        }
        this.__attribJobs = null;
      }

      const styleJobs = this.__styleJobs;
      if (styleJobs) {
        const data = this.__styleValues;
        for (const key in styleJobs) {
          const val = data ? data[key] : undefined;
          ville.html.Element._applyDomStyle(elem, key, val);
        }
        this.__styleJobs = null;
      }
    },

    /**
     * Marks or unmarks this element as a top-level root element.
     *
     * @param {boolean} root Whether this element is a root node.
     */
    setRoot(root) {
      if (root && !this.__root) {
        ville.html.Element._hasRoots++;
      } else if (!root && this.__root) {
        ville.html.Element._hasRoots--;
      }
      this.__root = Boolean(root);
    },

    /**
     * @override
     * @returns {boolean} `true` if this element is a root node.
     */
    isRoot() {
      return this.__root;
    },

    /**
     * Initializes this virtual element from a static HTML/SVG markup string
     * containing a single root element (e.g., `<svg ...>...</svg>`).
     *
     * @param {string} html HTML or SVG markup string.
     * @returns {Element} The parsed root DOM element.
     */
    useMarkup(html) {
      if (this._domNode) {
        throw new Error("Could not overwrite existing element!");
      }

      if (!ville.html.Element.__helperEl) {
        ville.html.Element.__helperEl = document.createElement("div");
      }
      const helper = ville.html.Element.__helperEl;
      helper.innerHTML = html;
      const firstElement = helper.firstElementChild || helper.firstChild;
      if (firstElement) {
        helper.removeChild(firstElement);
        this.useElement(/** @type {HTMLElement} */ (firstElement));
      }
      return /** @type {Element} */ (this._domNode);
    },

    /**
     * Hydrates/binds this virtual element around an existing live DOM element.
     *
     * @param {HTMLElement|SVGElement} domEl Existing DOM element to adopt.
     */
    useElement(domEl) {
      if (this._domNode) {
        throw new Error("Could not overwrite existing element!");
      }
      this._nodeName = domEl.nodeName.toLowerCase();
      this._connectDomNode(domEl);
      this._copyData(true);
    },

    /**
     * Alias for `useElement()` for backwards compatibility with `qx.html.Node#useNode`.
     *
     * @param {Node} domNode Existing DOM node to adopt.
     */
    useNode(domNode) {
      this.useElement(/** @type {HTMLElement} */ (domNode));
    },

    /*
    ---------------------------------------------------------------------------
      VISIBILITY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * @override
     * @param {boolean|null} value Whether the element is visible.
     * @protected
     */
    _applyVisible(value) {
      if (this._domNode) {
        ville.html.Element._visibility[this.toHashCode()] = this;
        ville.html.Element._scheduleFlush();
      }
      if (value && this._parent) {
        this._parent._scheduleChildrenUpdate();
      }
    },

    /**
     * Shows the element by removing `display: none`.
     *
     * @returns {this} This instance for chaining.
     */
    show() {
      this.setVisible(true);
      return this;
    },

    /**
     * Hides the element in place via `display: none`.
     *
     * @returns {this} This instance for chaining.
     */
    hide() {
      this.setVisible(false);
      return this;
    },

    /*
    ---------------------------------------------------------------------------
      FOCUS / BLUR SUPPORT (NATIVE DOM)
    ---------------------------------------------------------------------------
    */

    /**
     * Focuses the underlying DOM element if materialized.
     */
    focus() {
      const domEl = /** @type {HTMLElement|null} */ (this._domNode);
      if (domEl && typeof domEl.focus === "function") {
        domEl.focus();
      }
    },

    /**
     * Blurs the underlying DOM element if materialized.
     */
    blur() {
      const domEl = /** @type {HTMLElement|null} */ (this._domNode);
      if (domEl && typeof domEl.blur === "function") {
        domEl.blur();
      }
    },

    /*
    ---------------------------------------------------------------------------
      INLINE STYLE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets an inline CSS style property or custom property (`--*`).
     *
     * @param {string} key CSS property name.
     * @param {string|number|null} value CSS property value, or `null` to remove.
     * @param {boolean} [direct=false] If `true`, mutates `domNode.style` immediately without queuing.
     * @returns {this} This instance for chaining.
     */
    setStyle(key, value, direct) {
      if (!this.__styleValues) {
        this.__styleValues = {};
      }
      if (this.__styleValues[key] == value) {
        return this;
      }

      if (value == null) {
        delete this.__styleValues[key];
      } else {
        this.__styleValues[key] = value;
      }

      if (this._domNode) {
        if (direct) {
          ville.html.Element._applyDomStyle(
            /** @type {HTMLElement} */ (this._domNode),
            key,
            value
          );
          return this;
        }
        if (!this.__styleJobs) {
          this.__styleJobs = {};
        }
        this.__styleJobs[key] = true;
        ville.html.Element._modified[this.toHashCode()] = this;
        ville.html.Element._scheduleFlush();
      }

      return this;
    },

    /**
     * Sets multiple inline CSS properties at once.
     *
     * @param {Object<string, string|number|null>} map Map of CSS property names to values.
     * @param {boolean} [direct=false] If `true`, mutates `domNode.style` immediately.
     * @returns {this} This instance for chaining.
     */
    setStyles(map, direct) {
      for (const key in map) {
        this.setStyle(key, map[key], direct);
      }
      return this;
    },

    /**
     * Removes an inline CSS property.
     *
     * @param {string} key CSS property name to remove.
     * @param {boolean} [direct=false] If `true`, mutates `domNode.style` immediately.
     * @returns {this} This instance for chaining.
     */
    removeStyle(key, direct) {
      return this.setStyle(key, null, direct);
    },

    /**
     * Returns the current buffered value for the inline CSS property `key`, or `null`.
     *
     * @param {string} key CSS property name.
     * @returns {*} CSS value or `null`.
     */
    getStyle(key) {
      return this.__styleValues ? this.__styleValues[key] : null;
    },

    /**
     * Returns the internal map of all buffered inline styles, or `null`.
     *
     * @returns {Object<string, any>|null} Style map or `null`.
     */
    getAllStyles() {
      return this.__styleValues || null;
    },

    /*
    ---------------------------------------------------------------------------
      CSS CLASS SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Adds one or more space-separated CSS class names to the element, preserving
     * exact case and insertion order.
     *
     * @param {string} name Space-separated CSS class name(s) to add.
     * @returns {this} This instance for chaining.
     */
    addClass(name) {
      if (!name) {
        return this;
      }
      const current = (this.getAttribute("class") || "").trim();
      const parts = current ? current.split(/\s+/) : [];
      const toAdd = name.trim().split(/\s+/);
      let changed = false;

      for (let i = 0; i < toAdd.length; i++) {
        const cls = toAdd[i];
        if (cls && !parts.includes(cls)) {
          parts.push(cls);
          changed = true;
        }
      }

      if (changed) {
        this.setAttribute("class", parts.length ? parts.join(" ") : null);
      }
      return this;
    },

    /**
     * Removes one or more space-separated CSS class names from the element.
     *
     * @param {string} name Space-separated CSS class name(s) to remove.
     * @returns {this} This instance for chaining.
     */
    removeClass(name) {
      if (!name) {
        return this;
      }
      const current = (this.getAttribute("class") || "").trim();
      if (!current) {
        return this;
      }
      const parts = current.split(/\s+/);
      const toRemove = name.trim().split(/\s+/);
      const next = [];
      let changed = false;

      for (let i = 0; i < parts.length; i++) {
        if (toRemove.includes(parts[i])) {
          changed = true;
        } else if (parts[i]) {
          next.push(parts[i]);
        }
      }

      if (changed) {
        this.setAttribute("class", next.length ? next.join(" ") : null);
      }
      return this;
    },

    /**
     * Removes all CSS classes from the element.
     */
    removeAllClasses() {
      this.setAttribute("class", null);
    },

    /*
    ---------------------------------------------------------------------------
      HTML ATTRIBUTE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets or removes (`null`) an HTML attribute on the element.
     *
     * @param {string} key HTML attribute name.
     * @param {*} value Attribute value, or `null` to remove.
     * @param {boolean} [direct=false] If `true`, mutates `domNode` immediately without queuing.
     * @returns {this} This instance for chaining.
     */
    setAttribute(key, value, direct) {
      if (!this.__attribValues) {
        this.__attribValues = {};
      }
      if (this.__attribValues[key] == value) {
        return this;
      }

      if (value == null) {
        delete this.__attribValues[key];
      } else {
        this.__attribValues[key] = value;
      }

      if (this._domNode) {
        if (direct) {
          ville.html.Element._applyDomAttribute(
            /** @type {HTMLElement} */ (this._domNode),
            key,
            value
          );
          return this;
        }
        if (!this.__attribJobs) {
          this.__attribJobs = {};
        }
        this.__attribJobs[key] = true;
        ville.html.Element._modified[this.toHashCode()] = this;
        ville.html.Element._scheduleFlush();
      }

      return this;
    },

    /**
     * Sets multiple HTML attributes at once.
     *
     * @param {Object<string, any>} map Map of attribute names to values.
     * @param {boolean} [direct=false] If `true`, mutates `domNode` immediately.
     * @returns {this} This instance for chaining.
     */
    setAttributes(map, direct) {
      for (const key in map) {
        this.setAttribute(key, map[key], direct);
      }
      return this;
    },

    /**
     * Removes an HTML attribute from the element.
     *
     * @param {string} key Attribute name to remove.
     * @param {boolean} [direct=false] If `true`, mutates `domNode` immediately.
     * @returns {this} This instance for chaining.
     */
    removeAttribute(key, direct) {
      return this.setAttribute(key, null, direct);
    },

    /**
     * Returns the buffered value of the HTML attribute `key`, or `null`.
     *
     * @param {string} key Attribute name.
     * @returns {*} Attribute value or `null`.
     */
    getAttribute(key) {
      return this.__attribValues && this.__attribValues[key] !== undefined
        ? this.__attribValues[key]
        : null;
    }
  },

  destruct() {
    const hash = this.toHashCode();
    if (hash) {
      delete ville.html.Element._modified[hash];
      delete ville.html.Element._visibility[hash];
    }
    this.setRoot(false);
    this.__attribValues = null;
    this.__styleValues = null;
    this.__attribJobs = null;
    this.__styleJobs = null;
  }
});
