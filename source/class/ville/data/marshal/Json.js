/**
 * ES2025 `Proxy`-backed reactive JSON marshaler (`ville.data.marshal.Json` — `STRAT-CORE-09` #2).
 *
 * Replaces Qooxdoo's legacy `qx.data.marshal.Json` (which recursively traversed every
 * JSON payload twice and dynamically executed `qx.Class.define("qx.data.model." + hash)`
 * at runtime for every distinct JSON object shape).
 *
 * Architectural capabilities:
 * - Wraps any plain JavaScript object (POJO) in a lightweight `ville.core.Object` /
 *   `qx.core.Object` subclass fronted by a native ECMAScript `Proxy`.
 * - Supports BOTH classic Qooxdoo `model.getCustomer().getName()` / `model.setName("...")`
 *   method calls AND modern JavaScript direct property access (`model.customer.name = "..."`).
 * - Lazily marshals nested child objects and arrays into reactive `Proxy` models or
 *   `qx.data.Array` instances on access or initialization.
 * - Fires standard Qooxdoo `change<Property>` events and deep `changeBubble` events so
 *   `source.bind("customer.address.city", textField, "value")` and `ville.data.controller.*`
 *   work out of the box with zero runtime class-registry pollution.
 * - Can also be used as a 100% drop-in Qooxdoo v7 plugin (`@villeui/qx7-proxy-marshal`, `STRAT-QX7-01`).
 */
qx.Class.define("ville.data.marshal.Json", {
  extend: qx.core.Object,

  /**
   * @param {Object} [delegate] Optional marshaler delegate (`ignore`, `getPropertyMapping`, `getValidationRule`).
   */
  construct(delegate) {
    // @ts-ignore
    super();
    this.__delegate = delegate || null;
  },

  statics: {
    /** @type {ville.data.marshal.Json|null} @private */
    $$instance: null,

    /**
     * Converts a plain JSON value (object or array) into a reactive model instance
     * supporting both `get*()`/`set*()` methods, direct `model.prop` mutation,
     * `bind()`, `change<Prop>` events, and optional `changeBubble` deep events.
     *
     * @param {*} data Plain JSON object or array to marshal.
     * @param {boolean} [includeBubbleEvents=true] Whether to bubble nested `changeBubble` events.
     * @returns {*} Reactive model instance or `qx.data.Array`.
     */
    createModel(data, includeBubbleEvents = true) {
      if (!ville.data.marshal.Json.$$instance) {
        ville.data.marshal.Json.$$instance = new ville.data.marshal.Json();
      }
      return ville.data.marshal.Json.$$instance.toModel(
        data,
        includeBubbleEvents
      );
    },

    /**
     * Serializes a reactive `ville.data.marshal.Json` model (or `qx.data.Array`)
     * back into a clean plain JavaScript object/array for `JSON.stringify()` or `fetch()`.
     *
     * @param {*} model Reactive model or primitive.
     * @returns {*} Plain JavaScript object or array.
     */
    toPlainObject(model) {
      if (model == null || typeof model !== "object") {
        return model;
      }
      if (typeof model.$$toPlainObject === "function") {
        return model.$$toPlainObject();
      }
      if (typeof model.toArray === "function") {
        return model
          .toArray()
          .map((item) => ville.data.marshal.Json.toPlainObject(item));
      }
      if (Array.isArray(model)) {
        return model.map((item) => ville.data.marshal.Json.toPlainObject(item));
      }
      const out = {};
      for (const key of Object.keys(model)) {
        if (!key.startsWith("$$") && !key.startsWith("__")) {
          out[key] = ville.data.marshal.Json.toPlainObject(model[key]);
        }
      }
      return out;
    }
  },

  members: {
    /** @type {Object|null} @private */
    __delegate: null,

    /**
     * No-op compatibility method for legacy `qx.data.store.Json` callers that invoke
     * `marshaler.toClass(data, includeBubbleEvents)` prior to `toModel()`.
     *
     * @param {*} data Input JSON data.
     * @param {boolean} [includeBubbleEvents=true] Whether to include bubble events.
     */
    toClass(data, includeBubbleEvents = true) {
      // Proxy-backed marshaling requires zero runtime `qx.Class.define` generation!
    },

    /**
     * Converts a plain JSON object or array into a reactive model or `qx.data.Array`.
     *
     * @param {*} data Plain JSON object or array.
     * @param {boolean} [includeBubbleEvents=true] Whether to propagate `changeBubble` events.
     * @returns {*} Reactive model instance.
     */
    toModel(data, includeBubbleEvents = true) {
      return this.__wrapValue(data, Boolean(includeBubbleEvents), null, null, 0);
    },

    /**
     * Internal recursive wrapper converting POJOs to `Proxy`-fronted `qx.core.Object`
     * instances and arrays to observable `qx.data.Array` instances.
     *
     * @param {*} value Raw JSON value.
     * @param {boolean} bubble Whether `changeBubble` is enabled.
     * @param {qx.core.Object|null} parentModel Parent reactive model.
     * @param {string|null} parentProp Property name in parent.
     * @param {number} depth Recursion depth.
     * @returns {*} Wrapped reactive value.
     * @private
     */
    __wrapValue(value, bubble, parentModel, parentProp, depth) {
      if (value === null || value === undefined || typeof value !== "object") {
        return value;
      }

      if (value.$$isVilleProxyModel || value instanceof qx.core.Object) {
        return value;
      }

      if (Array.isArray(value)) {
        const arr = new qx.data.Array();
        arr.setAutoDisposeItems(true);
        for (let i = 0; i < value.length; i++) {
          arr.push(
            this.__wrapValue(
              value[i],
              bubble,
              parentModel,
              `${parentProp || ""}[${i}]`,
              depth + 1
            )
          );
        }
        if (bubble && parentModel) {
          arr.addListener("change", (e) => {
            const info = e.getData() || {};
            parentModel.fireDataEvent("changeBubble", {
              value: arr,
              old: arr,
              name: parentProp || "[]",
              item: parentModel
            });
          });
        }
        return arr;
      }

      // Check delegate ignore hook
      if (
        this.__delegate &&
        typeof this.__delegate.ignore === "function" &&
        this.__delegate.ignore(Object.keys(value).sort().join("|"), parentProp, depth)
      ) {
        return value;
      }

      const marshaler = this;
      const store = {};
      const childListenerIds = {};
      const backingObj = new qx.core.Object();

      const attachChildBubble = (propKey, childVal) => {
        if (!bubble || !childVal || typeof childVal.addListener !== "function") {
          return;
        }
        if (childListenerIds[propKey] && typeof childVal.removeListenerById === "function") {
          childVal.removeListenerById(childListenerIds[propKey]);
        }
        childListenerIds[propKey] = childVal.addListener("changeBubble", (ev) => {
          const data = ev.getData();
          proxyModel.fireDataEvent("changeBubble", {
            value: data.value,
            old: data.old,
            name: `${propKey}.${data.name}`,
            item: data.item || proxyModel
          });
        });
      };

      const setPropValue = (propKey, newVal) => {
        const wrappedVal = marshaler.__wrapValue(
          newVal,
          bubble,
          proxyModel,
          propKey,
          depth + 1
        );
        const oldVal = store[propKey];
        if (wrappedVal === oldVal) {
          return wrappedVal;
        }
        store[propKey] = wrappedVal;
        attachChildBubble(propKey, wrappedVal);

        const cap = propKey.charAt(0).toUpperCase() + propKey.slice(1);
        backingObj.fireDataEvent(`change${cap}`, wrappedVal, oldVal);
        if (bubble) {
          backingObj.fireDataEvent("changeBubble", {
            value: wrappedVal,
            old: oldVal,
            name: propKey,
            item: proxyModel
          });
        }
        return wrappedVal;
      };

      const proxyModel = new Proxy(backingObj, {
        get(target, prop, receiver) {
          if (prop === "$$isVilleProxyModel") return true;
          if (prop === "$$rawStore") return store;
          if (prop === "$$toPlainObject") {
            return () => {
              const plain = {};
              for (const k of Object.keys(store)) {
                plain[k] = ville.data.marshal.Json.toPlainObject(store[k]);
              }
              return plain;
            };
          }

          // Direct method/property on `qx.core.Object` (`bind`, `addListener`, `dispose`, `toHashCode`, etc.)
          if (prop in target || typeof prop === "symbol") {
            const val = Reflect.get(target, prop, receiver);
            return typeof val === "function" ? val.bind(receiver) : val;
          }

          // Direct property read: `model.firstName`
          if (typeof prop === "string" && prop in store) {
            return store[prop];
          }

          if (typeof prop === "string") {
            // Dynamic Qooxdoo Getter: `model.getFirstName()` or `model.isActive()`
            if (prop.startsWith("get") && prop.length > 3) {
              const key = prop.charAt(3).toLowerCase() + prop.slice(4);
              if (key in store) {
                return () => store[key];
              }
            }
            if (prop.startsWith("is") && prop.length > 2) {
              const key = prop.charAt(2).toLowerCase() + prop.slice(3);
              if (key in store) {
                return () => Boolean(store[key]);
              }
            }
            // Dynamic Qooxdoo Setter: `model.setFirstName(val)`
            if (prop.startsWith("set") && prop.length > 3) {
              const key = prop.charAt(3).toLowerCase() + prop.slice(4);
              return (val) => setPropValue(key, val);
            }
            // Dynamic Qooxdoo Resetter: `model.resetFirstName()`
            if (prop.startsWith("reset") && prop.length > 5) {
              const key = prop.charAt(5).toLowerCase() + prop.slice(6);
              return () => setPropValue(key, null);
            }
            // Dynamic Qooxdoo Boolean Toggler: `model.toggleActive()`
            if (prop.startsWith("toggle") && prop.length > 6) {
              const key = prop.charAt(6).toLowerCase() + prop.slice(7);
              return () => setPropValue(key, !store[key]);
            }
          }

          return undefined;
        },

        set(target, prop, newVal, receiver) {
          if (typeof prop === "string" && !prop.startsWith("$$") && !prop.startsWith("__") && !(prop in target)) {
            setPropValue(prop, newVal);
            return true;
          }
          return Reflect.set(target, prop, newVal, receiver);
        },

        has(target, prop) {
          if (typeof prop === "string" && prop in store) {
            return true;
          }
          return Reflect.has(target, prop);
        },

        ownKeys(target) {
          return Array.from(new Set([...Object.keys(store), ...Reflect.ownKeys(target)]));
        },

        getOwnPropertyDescriptor(target, prop) {
          if (typeof prop === "string" && prop in store) {
            return {
              configurable: true,
              enumerable: true,
              writable: true,
              value: store[prop]
            };
          }
          return Reflect.getOwnPropertyDescriptor(target, prop);
        }
      });

      // Initialize all keys from the source POJO
      for (const rawKey of Object.keys(value)) {
        const mappedKey =
          this.__delegate && typeof this.__delegate.getPropertyMapping === "function"
            ? this.__delegate.getPropertyMapping(rawKey, "")
            : rawKey;
        store[mappedKey] = this.__wrapValue(
          value[rawKey],
          bubble,
          proxyModel,
          mappedKey,
          depth + 1
        );
        attachChildBubble(mappedKey, store[mappedKey]);
      }

      return proxyModel;
    }
  }
});
