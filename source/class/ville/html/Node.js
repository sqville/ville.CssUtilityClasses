/**
 * Mode 3 virtual DOM base node (`ville.html.Node`) wrapping a browser DOM `Node`
 * (`HTMLElement`, `SVGElement`, or `Text`).
 *
 * Replaces `qx.html.Node` with a zero-legacy-dependency implementation that
 * completely omits `qx.event.Registration`, `qx.event.Manager`, `qx.html.Factory`,
 * `qx.html.Serializer`, `qx.html.Iframe`, `qx.html.Input`, and `qx.bom.element.Attribute`.
 */
qx.Class.define("ville.html.Node", {
  extend: qx.core.Object,
  implement: [qx.core.IDisposable],

  statics: {
    /**
     * Auto-incrementing counter for native DOM event listener IDs.
     *
     * @type {number}
     * @private
     */
    __nextListenerId: 1,

    /**
     * Returns the `ville.html.Node` instance associated with a live DOM node, or `null`.
     *
     * @param {Node|null|undefined} domNode Live browser DOM node.
     * @returns {ville.html.Node|null} Associated virtual node wrapper, or `null`.
     */
    fromDomNode(domNode) {
      if (!domNode) {
        return null;
      }
      // @ts-ignore
      return domNode.$$elementObject || null;
    },

    /**
     * Resolves a raw DOM event target node (`EventTarget`) to its connected Qooxdoo
     * widget (`$$qxObject`), walking up ancestor elements if the event originated on
     * an inner child/anonymous node, or returning the raw target if unconnected.
     *
     * @param {EventTarget|null} rawTarget Browser DOM event target.
     * @returns {*} Connected `ville.ui.core.Widget` or raw `EventTarget`.
     */
    resolveTargetObject(rawTarget) {
      let curr = /** @type {any} */ (rawTarget);
      while (curr) {
        if (curr.$$qxObject) {
          if (
            typeof curr.$$qxObject.getAnonymous === "function" &&
            curr.$$qxObject.getAnonymous()
          ) {
            curr = curr.parentNode;
            continue;
          }
          return curr.$$qxObject;
        }
        curr = curr.parentNode;
      }
      return rawTarget;
    },

    /**
     * Wraps a native browser `Event` in a lightweight adapter providing the
     * Qooxdoo event helper API (`getNativeEvent`, `getTarget`, `getCurrentTarget`,
     * `getRelatedTarget`, `getType`, `getDocumentLeft`, `getDocumentTop`,
     * `preventDefault`, `stopPropagation`, `stop`).
     *
     * @param {Event} nativeEvent Standard browser DOM `Event`.
     * @param {Node} currentDomNode Element on which the listener was registered.
     * @returns {Object} Lightweight native event wrapper.
     */
    wrapNativeEvent(nativeEvent, currentDomNode) {
      return {
        /**
         * Returns the underlying browser `Event` instance.
         *
         * @returns {Event} Native DOM event.
         */
        getNativeEvent() {
          return nativeEvent;
        },

        /**
         * Returns the event type name (e.g., `"click"`, `"keydown"`, `"toggle"`).
         *
         * @returns {string} Event type.
         */
        getType() {
          return nativeEvent.type;
        },

        /**
         * Returns the resolved `ville.ui.core.Widget` (or DOM target) that dispatched the event.
         *
         * @returns {*} Target widget or DOM element.
         */
        getTarget() {
          return ville.html.Node.resolveTargetObject(nativeEvent.target);
        },

        /**
         * Returns the `ville.ui.core.Widget` (or DOM node) on which the listener is attached.
         *
         * @returns {*} Current target widget or DOM element.
         */
        getCurrentTarget() {
          // @ts-ignore
          return (currentDomNode && currentDomNode.$$qxObject) || currentDomNode;
        },

        /**
         * Returns the resolved `ville.ui.core.Widget` (or DOM node) for `relatedTarget`
         * on pointer/focus events, or `null`.
         *
         * @returns {*} Related target widget or DOM element.
         */
        getRelatedTarget() {
          const rel = /** @type {MouseEvent|FocusEvent} */ (nativeEvent).relatedTarget;
          return rel ? ville.html.Node.resolveTargetObject(rel) : null;
        },

        /**
         * Returns the horizontal viewport coordinate (`clientX`) for pointer/mouse events.
         *
         * @returns {number} Horizontal coordinate in pixels.
         */
        getDocumentLeft() {
          return /** @type {MouseEvent} */ (nativeEvent).clientX || 0;
        },

        /**
         * Returns the vertical viewport coordinate (`clientY`) for pointer/mouse events.
         *
         * @returns {number} Vertical coordinate in pixels.
         */
        getDocumentTop() {
          return /** @type {MouseEvent} */ (nativeEvent).clientY || 0;
        },

        /**
         * Cancels the browser's default action for the event.
         */
        preventDefault() {
          nativeEvent.preventDefault();
        },

        /**
         * Stops the event from bubbling further in the DOM tree.
         */
        stopPropagation() {
          nativeEvent.stopPropagation();
        },

        /**
         * Convenience helper calling both `preventDefault()` and `stopPropagation()`.
         */
        stop() {
          nativeEvent.preventDefault();
          nativeEvent.stopPropagation();
        }
      };
    }
  },

  /**
   * Creates a new `ville.html.Node` wrapper.
   *
   * @param {string} nodeName Tag name for elements (e.g., `"div"`) or `"#text"` for text nodes.
   */
  construct(nodeName) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();
    this._nodeName = nodeName;
  },

  properties: {
    /**
     * Whether this virtual node is visible (`display` not forced to `"none"`).
     */
    visible: {
      init: true,
      nullable: true,
      check: "Boolean",
      apply: "_applyVisible",
      event: "changeVisible"
    }
  },

  members: {
    /** @type {string|null} @protected */
    _nodeName: null,

    /** @type {Node|null} @protected */
    _domNode: null,

    /** @type {ville.html.Element|null} @protected */
    _parent: null,

    /** @type {qx.core.Object|null} @protected */
    _qxObject: null,

    /** @type {boolean} @protected */
    _included: true,

    /** @type {ville.html.Node[]|null} @protected */
    _children: null,

    /** @type {boolean} @protected */
    _modifiedChildren: false,

    /**
     * Map of listener IDs to `{ type, listener, self, capture, handler }` records.
     *
     * @type {Object<string, { type: string, listener: Function, self: any, capture: boolean, handler: EventListener }>|null}
     * @private
     */
    __listeners: null,

    /**
     * Associates a Qooxdoo object (such as a `ville.ui.core.Widget`) with this
     * virtual node and its underlying DOM node (`$$qxObject`).
     *
     * @param {qx.core.Object} qxObject Associated widget or owner object.
     */
    connectObject(qxObject) {
      this._qxObject = qxObject;
      if (this._domNode) {
        // @ts-ignore
        this._domNode.$$qxObjectHash = qxObject.toHashCode();
        // @ts-ignore
        this._domNode.$$qxObject = qxObject;
      }
    },

    /**
     * Dissociates the previously connected Qooxdoo object from this virtual node
     * and its underlying DOM node.
     *
     * @param {qx.core.Object} qxObject Associated widget or owner object.
     */
    disconnectObject(qxObject) {
      if (this._qxObject === qxObject) {
        this._qxObject = null;
      }
      if (this._domNode) {
        // @ts-ignore
        this._domNode.$$qxObjectHash = "";
        // @ts-ignore
        delete this._domNode.$$qxObject;
      }
    },

    /**
     * Creates the concrete browser DOM `Node`. Overridden by subclasses.
     *
     * @returns {Node} Created browser DOM node.
     * @protected
     */
    _createDomElement() {
      throw new Error("No implementation for " + this.classname + "._createDomElement");
    },

    /**
     * Connects a live browser DOM node to this virtual wrapper and attaches any
     * buffered native event listeners.
     *
     * @param {Node} domNode Live browser DOM node.
     * @protected
     */
    _connectDomNode(domNode) {
      this._domNode = domNode;
      // @ts-ignore
      domNode.$$elementObject = this;
      // @ts-ignore
      domNode.$$element = this.toHashCode();

      if (this._qxObject) {
        // @ts-ignore
        domNode.$$qxObjectHash = this._qxObject.toHashCode();
        // @ts-ignore
        domNode.$$qxObject = this._qxObject;
      }

      if (this.__listeners) {
        for (const id in this.__listeners) {
          const entry = this.__listeners[id];
          domNode.addEventListener(entry.type, entry.handler, entry.capture);
        }
      }
    },

    /**
     * Detaches the live DOM node from its parent and clears internal references.
     *
     * @protected
     */
    _disconnectDomNode() {
      if (this._domNode && this._domNode.parentNode) {
        this._domNode.parentNode.removeChild(this._domNode);
      }
      this._domNode = null;
    },

    /**
     * Checks whether the underlying DOM node is currently connected to `document.body`.
     *
     * @returns {boolean} `true` if connected to the active document.
     */
    isInDocument() {
      return Boolean(this._domNode && this._domNode.isConnected);
    },

    /**
     * Schedules a child synchronization pass on the next `ville.html.Element.flush()`.
     *
     * @protected
     */
    _scheduleChildrenUpdate() {
      if (this._modifiedChildren) {
        return;
      }
      if (this._domNode) {
        this._modifiedChildren = true;
        ville.html.Element._modified[this.toHashCode()] = this;
        ville.html.Element._scheduleFlush();
      }
    },

    /**
     * Materializes or synchronizes this node and its visible children to the live DOM.
     */
    flush() {
      const children = this._children;
      const length = children ? children.length : 0;

      if (children) {
        for (let i = 0; i < length; i++) {
          const child = children[i];
          if (child.isVisible() && child._included) {
            if (!child._domNode) {
              child.flush();
            } else {
              child._syncData();
              if (child._modifiedChildren) {
                child._syncChildren();
                child._modifiedChildren = false;
              }
            }
          }
        }
      }

      if (!this._domNode) {
        this._connectDomNode(this._createDomElement());
        this._copyData(false);
        if (children && length > 0) {
          this._insertChildren();
        }
      } else {
        this._syncData();
        if (this._modifiedChildren) {
          this._syncChildren();
        }
      }

      this._modifiedChildren = false;
    },

    /**
     * Returns whether this node acts as a root container.
     *
     * @returns {boolean} `true` if root.
     */
    isRoot() {
      return false;
    },

    /**
     * Checks whether this node is a descendant of a root element.
     *
     * @returns {boolean} `true` if inside a root hierarchy.
     */
    isInRoot() {
      let curr = /** @type {ville.html.Node|null} */ (this);
      while (curr) {
        if (curr.isRoot()) {
          return true;
        }
        curr = curr._parent;
      }
      return false;
    },

    /**
     * Checks whether this node is connected to a visible root chain.
     *
     * @returns {boolean} `true` if seeable on flush.
     * @protected
     */
    _willBeSeeable() {
      if (!ville.html.Element._hasRoots) {
        return false;
      }
      let pa = /** @type {ville.html.Node|null} */ (this);
      while (pa) {
        if (pa.isRoot()) {
          return true;
        }
        if (!pa._included || !pa.isVisible()) {
          return false;
        }
        pa = pa._parent;
      }
      return false;
    },

    /**
     * Appends all included child DOM nodes on initial element creation.
     *
     * @protected
     */
    _insertChildren() {
      const children = this._children;
      if (!children || !this._domNode) {
        return;
      }
      const length = children.length;
      if (length > 2) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < length; i++) {
          const child = children[i];
          if (child._domNode && child._included) {
            frag.appendChild(child._domNode);
          }
        }
        this._domNode.appendChild(frag);
      } else {
        for (let i = 0; i < length; i++) {
          const child = children[i];
          if (child._domNode && child._included) {
            this._domNode.appendChild(child._domNode);
          }
        }
      }
    },

    /**
     * Synchronizes the live `childNodes` order with `this._children`.
     *
     * @protected
     */
    _syncChildren() {
      const dataChildren = this._children || [];
      const dataLength = dataChildren.length;
      const domParent = this._domNode;
      if (!domParent) {
        return;
      }
      const domChildren = domParent.childNodes;
      let domPos = 0;

      for (let i = domChildren.length - 1; i >= 0; i--) {
        const domEl = domChildren[i];
        const dataEl = ville.html.Node.fromDomNode(domEl);
        if (!dataEl || !dataEl._included || dataEl._parent !== this) {
          domParent.removeChild(domEl);
        }
      }

      for (let i = 0; i < dataLength; i++) {
        const dataChild = dataChildren[i];
        if (dataChild._included) {
          const dataEl = dataChild._domNode;
          const domEl = domChildren[domPos];
          if (!dataEl) {
            continue;
          }
          if (dataEl !== domEl) {
            if (domEl) {
              domParent.insertBefore(dataEl, domEl);
            } else {
              domParent.appendChild(dataEl);
            }
          }
          domPos++;
        }
      }
    },

    /**
     * Hook invoked on initial DOM node creation to copy attributes/styles/data.
     *
     * @param {boolean} [fromMarkup=false] Whether initialized from existing markup.
     * @protected
     */
    _copyData(fromMarkup) {},

    /**
     * Hook invoked on subsequent flushes to apply incremental updates.
     *
     * @protected
     */
    _syncData() {},

    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGEMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Internal helper validating and linking a child node to this parent.
     *
     * @param {ville.html.Node} child Child node to link.
     * @protected
     */
    _addChildImpl(child) {
      if (child._parent === this) {
        throw new Error("Child is already in: " + child);
      }
      if (child.isRoot()) {
        throw new Error("Root elements cannot be inserted into other elements.");
      }
      if (child._parent) {
        child._parent.remove(child);
      }
      child._parent = /** @type {ville.html.Element} */ (/** @type {unknown} */ (this));
      if (!this._children) {
        this._children = [];
      }
      if (this._domNode) {
        this._scheduleChildrenUpdate();
      }
    },

    /**
     * Internal helper unlinking a child node from this parent.
     *
     * @param {ville.html.Node} child Child node to unlink.
     * @protected
     */
    _removeChildImpl(child) {
      if (child._parent !== this) {
        throw new Error("Has no child: " + child);
      }
      if (this._domNode) {
        this._scheduleChildrenUpdate();
      }
      child._parent = null;
    },

    /**
     * Returns the internal children array, or `null` if empty.
     *
     * @returns {ville.html.Node[]|null} Array of child nodes.
     */
    getChildren() {
      return this._children || null;
    },

    /**
     * Returns the child node at `index`, or `null`.
     *
     * @param {number} index Zero-based index.
     * @returns {ville.html.Node|null} Child node or `null`.
     */
    getChild(index) {
      return (this._children && this._children[index]) || null;
    },

    /**
     * Checks whether this node has any children.
     *
     * @returns {boolean} `true` if at least one child is present.
     */
    hasChildren() {
      return Boolean(this._children && this._children.length > 0);
    },

    /**
     * Returns the zero-based index of `child`, or `-1`.
     *
     * @param {ville.html.Node} child Child node to find.
     * @returns {number} Index or `-1`.
     */
    indexOf(child) {
      return this._children ? this._children.indexOf(child) : -1;
    },

    /**
     * Checks whether `child` is a direct child of this node.
     *
     * @param {ville.html.Node} child Child node to check.
     * @returns {boolean} `true` if direct child.
     */
    hasChild(child) {
      return Boolean(this._children && this._children.indexOf(child) !== -1);
    },

    /**
     * Appends one or more child nodes (or primitive strings/numbers, converted to
     * `ville.html.Text`).
     *
     * @param {...(ville.html.Node|string|number)} varargs Child nodes to append.
     * @returns {this} This instance for chaining.
     */
    add(...varargs) {
      for (let i = 0; i < varargs.length; i++) {
        let child = varargs[i];
        if (typeof child === "string" || typeof child === "number" || typeof child === "boolean") {
          child = new ville.html.Text(String(child));
        } else if (Array.isArray(child)) {
          this.add(...child);
          continue;
        }
        if (child) {
          this._addChildImpl(child);
          this._children.push(child);
        }
      }
      return this;
    },

    /**
     * Inserts a child node at the specified zero-based `index`.
     *
     * @param {ville.html.Node|string|number} child Child node to insert.
     * @param {number} index Zero-based insertion index.
     * @returns {this} This instance for chaining.
     */
    addAt(child, index) {
      let node = child;
      if (typeof node === "string" || typeof node === "number") {
        node = new ville.html.Text(String(node));
      }
      this._addChildImpl(node);
      if (index == null || index >= this._children.length) {
        this._children.push(node);
      } else {
        this._children.splice(Math.max(0, index), 0, node);
      }
      return this;
    },

    /**
     * Removes one or more child nodes from this container.
     *
     * @param {...ville.html.Node} childs Child nodes to remove.
     * @returns {this} This instance for chaining.
     */
    remove(...childs) {
      if (!this._children) {
        return this;
      }
      for (let i = 0; i < childs.length; i++) {
        const child = childs[i];
        if (Array.isArray(child)) {
          this.remove(...child);
        } else {
          const idx = this._children.indexOf(child);
          if (idx !== -1) {
            this._removeChildImpl(child);
            this._children.splice(idx, 1);
          }
        }
      }
      return this;
    },

    /**
     * Removes the child node at `index`.
     *
     * @param {number} index Zero-based index to remove.
     * @returns {this} This instance for chaining.
     */
    removeAt(index) {
      if (!this._children) {
        throw new Error("Has no children!");
      }
      const child = this._children[index];
      if (!child) {
        throw new Error("Has no child at this position!");
      }
      this._removeChildImpl(child);
      this._children.splice(index, 1);
      return this;
    },

    /**
     * Removes all child nodes from this container.
     *
     * @returns {this} This instance for chaining.
     */
    removeAll() {
      if (this._children) {
        for (let i = 0; i < this._children.length; i++) {
          this._removeChildImpl(this._children[i]);
        }
        this._children.length = 0;
      }
      return this;
    },

    /**
     * Returns the parent `ville.html.Element`, or `null`.
     *
     * @returns {ville.html.Element|null} Parent element.
     */
    getParent() {
      return this._parent || null;
    },

    /**
     * Removes this node from its current parent.
     *
     * @returns {this} This instance for chaining.
     */
    free() {
      if (!this._parent) {
        throw new Error("Has no parent to remove from.");
      }
      this._parent.remove(this);
      return this;
    },

    /*
    ---------------------------------------------------------------------------
      DOM ELEMENT & INCLUDE/VISIBLE ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the live browser DOM node (materializing it immediately if `create === true`).
     *
     * @param {boolean} [create=false] Whether to flush and create the DOM node if not yet created.
     * @returns {Node|null} Live browser DOM node, or `null`.
     */
    getDomElement(create) {
      if (create && !this._domNode) {
        this.flush();
      }
      return this._domNode || null;
    },

    /**
     * Returns the tag/node name (e.g., `"div"`, `"button"`, `"#text"`).
     *
     * @returns {string|null} Node name.
     */
    getNodeName() {
      return this._nodeName;
    },

    /**
     * Updates the tag/node name prior to DOM creation.
     *
     * @param {string} name New node name.
     */
    setNodeName(name) {
      if (this._domNode && name.toLowerCase() !== (this._nodeName || "").toLowerCase()) {
        throw new Error("Cannot change the name of the node after the DOM node has been created");
      }
      this._nodeName = name;
    },

    /**
     * Marks this node as included in the DOM tree.
     *
     * @returns {this} This instance for chaining.
     */
    include() {
      if (this._included) {
        return this;
      }
      this._included = true;
      if (this._parent) {
        this._parent._scheduleChildrenUpdate();
      }
      return this;
    },

    /**
     * Marks this node as excluded from the DOM tree.
     *
     * @returns {this} This instance for chaining.
     */
    exclude() {
      if (!this._included) {
        return this;
      }
      this._included = false;
      if (this._parent) {
        this._parent._scheduleChildrenUpdate();
      }
      return this;
    },

    /**
     * Returns whether this node is currently included in the DOM hierarchy.
     *
     * @returns {boolean} `true` if included.
     */
    isIncluded() {
      return this._included === true;
    },

    /**
     * Property apply handler for `visible`.
     *
     * @param {boolean|null} value New visibility state.
     * @protected
     */
    _applyVisible(value) {},

    /*
    ---------------------------------------------------------------------------
      NATIVE DOM EVENT SUPPORT (ZERO qx.event.Registration DEPENDENCY)
    ---------------------------------------------------------------------------
    */

    /**
     * Attaches a native DOM event listener (`addEventListener`) to this node,
     * buffering it if the underlying DOM element has not yet been flushed.
     *
     * Declared Qooxdoo class events (`changeVisible`) delegate to `qx.core.MEvent`.
     *
     * @param {string} type Native DOM event type (e.g., `"click"`, `"keydown"`, `"toggle"`).
     * @param {Function} listener Event callback receiving a lightweight native event adapter.
     * @param {Object} [self] Execution context (`this`) for the callback.
     * @param {boolean} [capture=false] Whether to listen during the capture phase.
     * @returns {string|null} Opaque listener ID for `removeListenerById()`.
     */
    addListener(type, listener, self, capture = false) {
      if (this.$$disposed) {
        return null;
      }

      if (qx.Class.supportsEvent(this.constructor, type)) {
        return super.addListener(type, listener, self, capture);
      }

      if (!this.__listeners) {
        this.__listeners = {};
      }

      const useCapture = Boolean(capture);
      const id =
        type +
        (useCapture ? "|capture|" : "|bubble|") +
        ville.html.Node.__nextListenerId++;

      const context = self || this;
      const handler = (nativeEvent) => {
        if (this.$$disposed) {
          return;
        }
        const wrapped = ville.html.Node.wrapNativeEvent(
          nativeEvent,
          this._domNode
        );
        listener.call(context, wrapped);
      };

      this.__listeners[id] = {
        type,
        listener,
        self,
        capture: useCapture,
        handler
      };

      if (this._domNode) {
        this._domNode.addEventListener(type, handler, useCapture);
      }

      return id;
    },

    /**
     * Removes a previously registered native DOM event listener by type, callback,
     * context, and capture phase.
     *
     * @param {string} type Event type name.
     * @param {Function} listener Callback function to remove.
     * @param {Object} [self] Execution context originally passed to `addListener`.
     * @param {boolean} [capture=false] Capture flag originally passed to `addListener`.
     * @returns {this} This instance for chaining.
     */
    removeListener(type, listener, self, capture = false) {
      if (this.$$disposed) {
        return null;
      }

      if (qx.Class.supportsEvent(this.constructor, type)) {
        super.removeListener(type, listener, self, capture);
        return this;
      }

      if (!this.__listeners) {
        return this;
      }

      const useCapture = Boolean(capture);
      for (const id in this.__listeners) {
        const entry = this.__listeners[id];
        if (
          entry.type === type &&
          entry.listener === listener &&
          entry.self === self &&
          entry.capture === useCapture
        ) {
          if (this._domNode) {
            this._domNode.removeEventListener(type, entry.handler, useCapture);
          }
          delete this.__listeners[id];
          break;
        }
      }

      return this;
    },

    /**
     * Removes a native DOM event listener using the opaque ID returned by `addListener()`.
     *
     * @param {*} id Listener ID returned by `addListener()`.
     * @returns {this} This instance for chaining.
     */
    removeListenerById(id) {
      if (this.$$disposed || !id) {
        return null;
      }

      if (this.__listeners && this.__listeners[id]) {
        const entry = this.__listeners[id];
        if (this._domNode) {
          this._domNode.removeEventListener(
            entry.type,
            entry.handler,
            entry.capture
          );
        }
        delete this.__listeners[id];
        return this;
      }

      super.removeListenerById(id);
      return this;
    },

    /**
     * Checks whether at least one listener is registered for `type` and `capture`.
     *
     * @param {string} type Event type name.
     * @param {boolean} [capture=false] Whether to check the capture phase.
     * @returns {boolean} `true` if a matching listener exists.
     */
    hasListener(type, capture = false) {
      if (this.$$disposed) {
        return false;
      }

      if (qx.Class.supportsEvent(this.constructor, type) && super.hasListener(type, capture)) {
        return true;
      }

      if (!this.__listeners) {
        return false;
      }

      const useCapture = Boolean(capture);
      for (const id in this.__listeners) {
        const entry = this.__listeners[id];
        if (entry.type === type && entry.capture === useCapture) {
          return true;
        }
      }

      return false;
    }
  },

  destruct() {
    const el = this._domNode;
    if (el) {
      if (this.__listeners) {
        for (const id in this.__listeners) {
          const entry = this.__listeners[id];
          el.removeEventListener(entry.type, entry.handler, entry.capture);
        }
      }
      // @ts-ignore
      el.$$element = "";
      // @ts-ignore
      delete el.$$elementObject;
      // @ts-ignore
      el.$$qxObjectHash = "";
      // @ts-ignore
      delete el.$$qxObject;
    }

    if (!qx.core.ObjectRegistry.inShutDown) {
      const parent = this._parent;
      if (parent && !parent.$$disposed) {
        parent.remove(this);
      }
    }

    this._disposeArray("_children");
    this.__listeners = null;
    this._domNode = null;
    this._parent = null;
    this._qxObject = null;
  }
});
