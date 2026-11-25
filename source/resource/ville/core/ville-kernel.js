/**
 * @villeui/core — Path B Vanilla ES2025 Runtime Kernel (`ville.core.*` with `qx.*` Aliases)
 *
 * Replaces all 88 legacy `@qooxdoo/framework` runtime boot files with a single,
 * self-contained ES2025 kernel (~15 KB minified) implementing the 6 core primitives
 * Ville UI uses:
 *  1. `ville.Class`, `ville.Mixin`, `ville.Interface`, `ville.Theme`
 *     - Supports BOTH classic `ville.Class.define(name, config)` / `qx.Class.define(name, config)`
 *       (including `@qooxdoo/compiler`'s `SuperClass.constructor.call(this, ...)` output)
 *       AND modern ES6 `export class MyWidget extends Widget { static properties = { ... } }`
 *       via `ville.Class.register(MyWidget, "myapp.MyWidget")`.
 *  2. `ville.core.Property` — Declarative reactive property engine (`init`, `check`,
 *     `nullable`, `refine`, `themeable`, `apply`, `event`, `transform`, `group`/`mode: "shorthand"`),
 *     generating `get*`, `set*`, `reset*`, `init*`, `setThemed*`, `resetThemed*`,
 *     `toggle*`, `is*`, and batch `set({ ... })`.
 *  3. `ville.core.Object` & `ville.core.ObjectRegistry` — Deterministic object lifecycle
 *     (`toHashCode()`, `dispose()`, `isDisposed()`, `_disposeObjects()`, `_disposeArray()`,
 *     `_disposeMap()`, `_disposeSingletonObjects()`, and `getDestroySignal()` returning a
 *     native `AbortSignal` that aborts automatically on `dispose()`).
 *  4. `ville.core.MEvent` — High-speed in-memory object & property event emitter
 *     (`addListener`, `addListenerOnce`, `removeListener`, `removeListenerById`,
 *     `hasListener`, `fireEvent`, `fireDataEvent`).
 *  5. `ville.data.MBinding`, `ville.data.SingleValueBinding`, `ville.data.Array` —
 *     Deep property-path single-value data binding (`source.bind("a.b", target, "c", options)`)
 *     and observable array collections.
 *  6. `ville.theme.manager.Appearance`, `ville.core.Environment`, `ville.util.ResourceManager`,
 *     `ville.util.AliasManager`, and `ville.core.Init` (`ready()` direct startup).
 */
(function () {
  const globalScope =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof window !== "undefined"
      ? window
      : global;

  const ville = globalScope.ville || (globalScope.ville = {});
  const qx = globalScope.qx || (globalScope.qx = {});

  /* ============================================================================
   * 1. NAMESPACE & BOOTSTRAP HELPERS
   * ========================================================================== */

  const ClassRegistry = new Map();
  const MixinRegistry = new Map();
  const InterfaceRegistry = new Map();
  const ThemeRegistry = new Map();

  function setByPath(root, parts, value) {
    let curr = root;
    for (let i = 0; i < parts.length - 1; i++) {
      curr = curr[parts[i]] || (curr[parts[i]] = {});
    }
    curr[parts[parts.length - 1]] = value;
  }

  function getByName(name) {
    if (!name) return null;
    if (ClassRegistry.has(name)) return ClassRegistry.get(name);
    if (MixinRegistry.has(name)) return MixinRegistry.get(name);
    if (InterfaceRegistry.has(name)) return InterfaceRegistry.get(name);
    if (ThemeRegistry.has(name)) return ThemeRegistry.get(name);
    const splits = name.split(".");
    let curr = globalScope;
    for (let i = 0; i < splits.length; i++) {
      if (curr == null) return null;
      curr = curr[splits[i]];
    }
    return curr || null;
  }

  function createNamespace(name, targetObj) {
    const splits = name.split(".");
    let part = splits[0];
    let parent =
      part === "ville"
        ? ville
        : part === "qx"
        ? qx
        : globalScope[part] || (globalScope[part] = {});

    for (let i = 1, len = splits.length - 1; i < len; i++) {
      part = splits[i];
      parent = parent[part] || (parent[part] = {});
    }

    const last = splits[splits.length - 1];
    if (targetObj !== undefined) {
      parent[last] = targetObj;
      if (splits[0] === "qx") {
        const villeMirrorPath = ["ville", ...splits.slice(1)].join(".");
        if (!getByName(villeMirrorPath)) {
          setByPath(ville, splits.slice(1), targetObj);
        }
      }
    }
    return last;
  }

  function firstUp(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  }

  function firstLow(str) {
    return str ? str.charAt(0).toLowerCase() + str.slice(1) : "";
  }

  const pendingDeferClasses = [];

  const Bootstrap = {
    LOADSTART: qx.$$start || new Date(),
    DEBUG: Boolean(qx.$$environment && qx.$$environment["qx.debug"]),
    $$logs: [],
    $$registry: {},
    firstUp,
    firstLow,
    createNamespace,
    getByName,
    setDisplayName() {},
    setDisplayNames() {},
    genericToString() {
      return "[Class " + this.classname + "]";
    },
    getClass(val) {
      if (val === undefined) return "Undefined";
      if (val === null) return "Null";
      return Object.prototype.toString.call(val).slice(8, -1);
    },
    isString(val) {
      return typeof val === "string" || val instanceof String;
    },
    isArray(val) {
      return Array.isArray(val) || val instanceof DataArray;
    },
    isObject(val) {
      return val !== null && typeof val === "object" && !Array.isArray(val);
    },
    isFunction(val) {
      return typeof val === "function";
    },
    isFunctionOrAsyncFunction(val) {
      return typeof val === "function";
    },
    keys(map) {
      return map ? Object.keys(map) : [];
    },
    objectGetLength(map) {
      return map ? Object.keys(map).length : 0;
    },
    objectMergeWith(target, source, overwrite = true) {
      if (!target || !source) return target;
      for (const k in source) {
        if (overwrite || target[k] === undefined) {
          target[k] = source[k];
        }
      }
      return target;
    },
    bind(fn, self, ...fixedArgs) {
      return function (...callArgs) {
        return fn.apply(self, fixedArgs.concat(callArgs));
      };
    },
    addPendingDefer(clazz, cb) {
      if (qx.$$loader && qx.$$loader.delayDefer) {
        pendingDeferClasses.push(clazz);
        clazz.$$pendingDefer = cb;
      } else {
        cb.call(clazz);
      }
    },
    executePendingDefers(dbClassInfo) {
      const executeClazz = (clazz) => {
        if (!clazz || clazz.$$deferComplete) return;
        const cb = clazz.$$pendingDefer;
        if (cb) {
          delete clazz.$$pendingDefer;
          clazz.$$deferComplete = true;
          cb.call(clazz);
        }
      };
      const executeForClassName = (className) => {
        const clazz = getByName(className);
        if (!clazz || clazz.$$deferComplete) return;
        if (clazz.$$dbClassInfo) {
          executeForInfo(clazz.$$dbClassInfo);
        }
        executeClazz(clazz);
      };
      const executeForInfo = (info) => {
        if (!info) return;
        if (info.environment && info.environment.required) {
          for (const k in info.environment.required) {
            const req = info.environment.required[k];
            if (req.load && req.className) {
              executeForClassName(req.className);
            }
          }
        }
        if (info.dependsOn) {
          for (const k in info.dependsOn) {
            const dep = info.dependsOn[k];
            if (dep.require || dep.usage === "dynamic") {
              executeForClassName(k);
            }
          }
        }
      };

      if (!dbClassInfo) {
        while (pendingDeferClasses.length > 0) {
          executeClazz(pendingDeferClasses.shift());
        }
        return;
      }
      executeForInfo(dbClassInfo);
    },
    debug(...args) {
      if (typeof console !== "undefined") console.debug(...args);
    },
    info(...args) {
      if (typeof console !== "undefined") console.info(...args);
    },
    warn(...args) {
      if (typeof console !== "undefined") console.warn(...args);
    },
    error(...args) {
      if (typeof console !== "undefined") console.error(...args);
    },
    trace() {}
  };

  /* ============================================================================
   * 2. ENVIRONMENT & ASSERTIONS (`ville.core.Environment`, `ville.core.Assert`)
   * ========================================================================== */

  const envStore = Object.assign(
    {
      "qx.debug": false,
      "qx.debug.ui.queue": false,
      "qx.debug.databinding": false,
      "qx.nativeScrollBars": true,
      "qx.dynlocale": false,
      "qx.dyntheme": false,
      "qx.Promise.useNativePromise": true,
      "qx.command.bindEnabled": false,
      "qx.application": "villeuiapp.Application",
      "qx.theme": "villeuiapp.theme.Theme",
      "qx.headless": typeof document === "undefined",
      "ville.cssLayout": true,
      "ville.cssEngine": "mantine",
      "ville.appType": "web",
      "ville.ssg": false
    },
    globalScope.qx?.$$environment || {},
    globalScope.ville?.$$environment || {}
  );

  const Environment = {
    _checks: envStore,
    get(key) {
      if (globalScope.qx?.$$environment && key in globalScope.qx.$$environment) {
        return globalScope.qx.$$environment[key];
      }
      return envStore[key];
    },
    set(key, value) {
      envStore[key] = value;
      if (globalScope.qx?.$$environment) {
        globalScope.qx.$$environment[key] = value;
      }
    },
    add(key, value) {
      if (!(key in envStore)) {
        envStore[key] = value;
      }
    },
    select(key, map) {
      const val = Environment.get(key);
      return val in map ? map[val] : map["default"];
    },
    filter(map) {
      const res = [];
      for (const k in map) {
        if (Environment.get(k)) res.push(map[k]);
      }
      return res;
    }
  };

  const Assert = {
    assert(cond, msg) {
      if (!cond) throw new Error(msg || "Assertion failed");
    },
    assertTrue(val, msg) {
      if (val !== true) throw new Error(msg || `Expected true but got ${val}`);
    },
    assertFalse(val, msg) {
      if (val !== false) throw new Error(msg || `Expected false but got ${val}`);
    },
    assertNull(val, msg) {
      if (val !== null) throw new Error(msg || `Expected null but got ${val}`);
    },
    assertNotNull(val, msg) {
      if (val === null) throw new Error(msg || "Expected non-null value");
    },
    assertUndefined(val, msg) {
      if (val !== undefined) throw new Error(msg || `Expected undefined but got ${val}`);
    },
    assertNotUndefined(val, msg) {
      if (val === undefined) throw new Error(msg || "Expected defined value");
    },
    assertEquals(expected, found, msg) {
      if (expected !== found) {
        throw new Error(msg || `Expected '${expected}' but found '${found}'`);
      }
    },
    assertInteger(val, msg) {
      if (typeof val !== "number" || !Number.isInteger(val)) {
        throw new Error(msg || `Expected integer but got ${val}`);
      }
    },
    assertNumber(val, msg) {
      if (typeof val !== "number" || Number.isNaN(val)) {
        throw new Error(msg || `Expected number but got ${val}`);
      }
    },
    assertString(val, msg) {
      if (typeof val !== "string") {
        throw new Error(msg || `Expected string but got ${val}`);
      }
    },
    assertBoolean(val, msg) {
      if (typeof val !== "boolean") {
        throw new Error(msg || `Expected boolean but got ${val}`);
      }
    },
    assertArray(val, msg) {
      if (!Array.isArray(val)) {
        throw new Error(msg || `Expected Array but got ${val}`);
      }
    },
    assertObject(val, msg) {
      if (typeof val !== "object" || val === null) {
        throw new Error(msg || `Expected object but got ${val}`);
      }
    },
    assertMap(val, msg) {
      if (typeof val !== "object" || val === null || Array.isArray(val)) {
        throw new Error(msg || `Expected map object but got ${val}`);
      }
    },
    assertFunction(val, msg) {
      if (typeof val !== "function") {
        throw new Error(msg || `Expected function but got ${val}`);
      }
    },
    assertInArray(val, arr, msg) {
      if (!Array.isArray(arr) || !arr.includes(val)) {
        throw new Error(
          msg || `Expected '${val}' to be in [${Array.isArray(arr) ? arr.join(", ") : ""}]`
        );
      }
    },
    assertKeyInMap(key, map, msg) {
      if (!map || typeof map !== "object" || !(key in map)) {
        throw new Error(msg || `Expected key '${key}' to exist in map`);
      }
    },
    assertInstance(val, clazz, msg) {
      if (!(val instanceof clazz)) {
        throw new Error(msg || `Expected instance of ${clazz?.classname || clazz}`);
      }
    },
    assertInterface(obj, iface, msg) {
      if (!Class.implementsInterface(obj, iface)) {
        throw new Error(msg || `Object does not implement interface ${iface?.name || iface}`);
      }
    }
  };

  /* ============================================================================
   * 3. REACTIVE PROPERTY ENGINE (`ville.core.Property`)
   * ========================================================================== */

  const Property = {
    attachProperties(clazz, propertiesMap) {
      if (!propertiesMap) return;
      const proto = clazz.prototype;
      clazz.$$properties = Object.assign({}, clazz.superclass?.$$properties || {}, propertiesMap);

      for (const [propName, config] of Object.entries(propertiesMap)) {
        const up = firstUp(propName);

        // Property group / shorthand (e.g., padding: { group: ["paddingTop", ...], mode: "shorthand" })
        if (config.group && Array.isArray(config.group)) {
          const groupProps = config.group;
          const isShorthand = config.mode === "shorthand";

          proto[`set${up}`] = function (...args) {
            let values = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
            if (isShorthand) {
              if (values.length === 1) {
                values = [values[0], values[0], values[0], values[0]];
              } else if (values.length === 2) {
                values = [values[0], values[1], values[0], values[1]];
              } else if (values.length === 3) {
                values = [values[0], values[1], values[2], values[1]];
              }
            }
            for (let i = 0; i < groupProps.length; i++) {
              const subUp = firstUp(groupProps[i]);
              if (values[i] !== undefined && typeof this[`set${subUp}`] === "function") {
                this[`set${subUp}`](values[i]);
              }
            }
            return this;
          };

          proto[`reset${up}`] = function () {
            for (let i = 0; i < groupProps.length; i++) {
              const subUp = firstUp(groupProps[i]);
              if (typeof this[`reset${subUp}`] === "function") {
                this[`reset${subUp}`]();
              }
            }
          };

          if (config.themeable) {
            proto[`setThemed${up}`] = function (...args) {
              let values = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
              if (isShorthand) {
                if (values.length === 1) {
                  values = [values[0], values[0], values[0], values[0]];
                } else if (values.length === 2) {
                  values = [values[0], values[1], values[0], values[1]];
                } else if (values.length === 3) {
                  values = [values[0], values[1], values[2], values[1]];
                }
              }
              for (let i = 0; i < groupProps.length; i++) {
                const subUp = firstUp(groupProps[i]);
                if (values[i] !== undefined && typeof this[`setThemed${subUp}`] === "function") {
                  this[`setThemed${subUp}`](values[i]);
                }
              }
            };

            proto[`resetThemed${up}`] = function () {
              for (let i = 0; i < groupProps.length; i++) {
                const subUp = firstUp(groupProps[i]);
                if (typeof this[`resetThemed${subUp}`] === "function") {
                  this[`resetThemed${subUp}`]();
                }
              }
            };
          }
          continue;
        }

        // Refine existing superclass property (`refine: true`)
        const baseConfig = clazz.superclass?.$$properties?.[propName] || {};
        const fullConfig = config.refine ? Object.assign({}, baseConfig, config) : config;
        clazz.$$properties[propName] = fullConfig;

        const userKey = `$$user_${propName}`;
        const themeKey = `$$theme_${propName}`;
        const initKey = `$$init_${propName}`;
        const useInitKey = `$$useinit_${propName}`;

        if ("init" in fullConfig) {
          proto[initKey] = fullConfig.init;
        }

        const resolveCurrentValue = function (instance) {
          if (instance[userKey] !== undefined) return instance[userKey];
          if (instance[themeKey] !== undefined) return instance[themeKey];
          if (instance[initKey] !== undefined) return instance[initKey];
          return fullConfig.nullable ? null : undefined;
        };

        const transformValue = function (instance, value, oldVal) {
          if (fullConfig.transform && typeof instance[fullConfig.transform] === "function") {
            return instance[fullConfig.transform](value, oldVal);
          }
          return value;
        };

        const commitChange = function (instance, newVal, oldVal, variant) {
          if (newVal === oldVal) return newVal;
          if (fullConfig.apply && typeof instance[fullConfig.apply] === "function") {
            instance[fullConfig.apply](newVal, oldVal, propName, variant);
          }
          if (fullConfig.event && typeof instance.fireDataEvent === "function") {
            instance.fireDataEvent(fullConfig.event, newVal, oldVal);
          }
          return newVal;
        };

        proto[`get${up}`] = function () {
          return resolveCurrentValue(this);
        };

        proto[`set${up}`] = function (value) {
          const oldVal = resolveCurrentValue(this);
          const transformed = transformValue(this, value, oldVal);
          this[userKey] = transformed;
          this[useInitKey] = false;
          return commitChange(this, resolveCurrentValue(this), oldVal, "set");
        };

        proto[`reset${up}`] = function () {
          const oldVal = resolveCurrentValue(this);
          this[userKey] = undefined;
          commitChange(this, resolveCurrentValue(this), oldVal, "reset");
        };

        proto[`init${up}`] = function () {
          const val = resolveCurrentValue(this);
          if (fullConfig.apply && typeof this[fullConfig.apply] === "function") {
            this[fullConfig.apply](val, undefined, propName, "init");
          }
          if (fullConfig.event && typeof this.fireDataEvent === "function") {
            this.fireDataEvent(fullConfig.event, val, undefined);
          }
        };

        if (fullConfig.themeable) {
          proto[`setThemed${up}`] = function (value) {
            const oldVal = resolveCurrentValue(this);
            const transformed = transformValue(this, value, oldVal);
            this[themeKey] = transformed;
            commitChange(this, resolveCurrentValue(this), oldVal, "setThemed");
          };

          proto[`resetThemed${up}`] = function () {
            const oldVal = resolveCurrentValue(this);
            this[themeKey] = undefined;
            commitChange(this, resolveCurrentValue(this), oldVal, "resetThemed");
          };
        }

        if (fullConfig.check === "Boolean") {
          proto[`is${up}`] = proto[`get${up}`];
          proto[`toggle${up}`] = function () {
            return this[`set${up}`](!this[`get${up}`]());
          };
        }
      }
    }
  };

  /* ============================================================================
   * 4. OBJECT REGISTRY & LIFECYCLE (`ville.core.ObjectRegistry`, `IDisposable`)
   * ========================================================================== */

  let nextHashCode = 1;
  const objectRegistryMap = new Map();

  const ObjectRegistry = {
    inShutDown: false,
    register(obj) {
      if (!obj.$$hash) {
        obj.$$hash = `${nextHashCode++}-0`;
      }
      objectRegistryMap.set(obj.$$hash, obj);
    },
    unregister(obj) {
      if (obj && obj.$$hash) {
        objectRegistryMap.delete(obj.$$hash);
      }
    },
    toHashCode(obj) {
      if (!obj) return "";
      if (!obj.$$hash) {
        obj.$$hash = `${nextHashCode++}-0`;
      }
      return obj.$$hash;
    },
    fromHashCode(hash) {
      return objectRegistryMap.get(hash) || null;
    },
    getRegistry() {
      return Object.fromEntries(objectRegistryMap.entries());
    },
    shutdown() {
      ObjectRegistry.inShutDown = true;
      for (const obj of objectRegistryMap.values()) {
        if (obj && !obj.$$disposed && typeof obj.dispose === "function") {
          obj.dispose();
        }
      }
      objectRegistryMap.clear();
      ObjectRegistry.inShutDown = false;
    }
  };

  /* ============================================================================
   * 5. IN-MEMORY EVENT EMITTER (`ville.core.MEvent`) & EVENT TYPES
   * ========================================================================== */

  let nextEventId = 1;

  function NativeSimEvent(type, target, data, oldData, cancelable) {
    this.__type = type;
    this.__target = target;
    this.__currentTarget = target;
    this.__data = data;
    this.__oldData = oldData;
    this.__cancelable = Boolean(cancelable);
    this.__defaultPrevented = false;
    this.__propagationStopped = false;
  }

  Object.assign(NativeSimEvent.prototype, {
    getType() {
      return this.__type;
    },
    getTarget() {
      return this.__target;
    },
    getCurrentTarget() {
      return this.__currentTarget;
    },
    getData() {
      return this.__data;
    },
    getOldData() {
      return this.__oldData;
    },
    getCancelable() {
      return this.__cancelable;
    },
    preventDefault() {
      this.__defaultPrevented = true;
    },
    getDefaultPrevented() {
      return this.__defaultPrevented;
    },
    stopPropagation() {
      this.__propagationStopped = true;
    },
    getPropagationStopped() {
      return this.__propagationStopped;
    },
    stop() {
      this.preventDefault();
      this.stopPropagation();
    }
  });

  const MEvent = {
    addListener(type, listener, self, capture = false) {
      if (this.$$disposed || typeof listener !== "function") return null;
      if (!this.$$eventListeners) this.$$eventListeners = {};
      const list = this.$$eventListeners[type] || (this.$$eventListeners[type] = []);
      const id = `${type}|${nextEventId++}`;
      list.push({
        id,
        type,
        listener,
        self: self || this,
        capture: Boolean(capture),
        once: false
      });
      return id;
    },

    addListenerOnce(type, listener, self, capture = false) {
      if (this.$$disposed || typeof listener !== "function") return null;
      if (!this.$$eventListeners) this.$$eventListeners = {};
      const list = this.$$eventListeners[type] || (this.$$eventListeners[type] = []);
      const id = `${type}|${nextEventId++}`;
      list.push({
        id,
        type,
        listener,
        self: self || this,
        capture: Boolean(capture),
        once: true
      });
      return id;
    },

    removeListener(type, listener, self, capture = false) {
      const list = this.$$eventListeners?.[type];
      if (!list) return false;
      const ctx = self || this;
      const cap = Boolean(capture);
      for (let i = 0; i < list.length; i++) {
        const entry = list[i];
        if (entry.listener === listener && entry.self === ctx && entry.capture === cap) {
          list.splice(i, 1);
          return true;
        }
      }
      return false;
    },

    removeListenerById(id) {
      if (!id || !this.$$eventListeners) return false;
      const type = String(id).split("|")[0];
      const list = this.$$eventListeners[type];
      if (!list) return false;
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list.splice(i, 1);
          return true;
        }
      }
      return false;
    },

    hasListener(type) {
      const list = this.$$eventListeners?.[type];
      return Boolean(list && list.length > 0);
    },

    fireEvent(type, clazz, args) {
      if (this.$$disposed || !this.$$eventListeners?.[type]?.length) return true;
      const data = Array.isArray(args) ? args[0] : undefined;
      const oldData = Array.isArray(args) ? args[1] : undefined;
      const cancelable = Array.isArray(args) ? Boolean(args[2]) : false;
      const evt = new NativeSimEvent(type, this, data, oldData, cancelable);
      return this.__dispatchSimEvent(type, evt);
    },

    fireDataEvent(type, data, oldData, cancelable = false) {
      if (this.$$disposed || !this.$$eventListeners?.[type]?.length) return true;
      const evt = new NativeSimEvent(type, this, data, oldData, cancelable);
      return this.__dispatchSimEvent(type, evt);
    },

    fireNonBubblingEvent(type, clazz, args) {
      return this.fireEvent(type, clazz, args);
    },

    __dispatchSimEvent(type, evt) {
      const list = this.$$eventListeners?.[type];
      if (!list || list.length === 0) return true;
      const snapshot = list.slice();
      for (let i = 0; i < snapshot.length; i++) {
        const entry = snapshot[i];
        if (entry.once) {
          this.removeListenerById(entry.id);
        }
        entry.listener.call(entry.self, evt);
        if (evt.getPropagationStopped()) break;
      }
      return !evt.getDefaultPrevented();
    }
  };

  /* ============================================================================
   * 6. SINGLE-VALUE DATA BINDING (`ville.data.SingleValueBinding`, `MBinding`)
   * ========================================================================== */

  let nextBindingId = 1;

  const SingleValueBinding = {
    bind(source, sourcePropertyChain, target, targetPropertyChain, options) {
      if (!source || !target) {
        throw new Error("SingleValueBinding.bind requires non-null source and target.");
      }
      const id = `binding_${nextBindingId++}`;
      const chain = sourcePropertyChain.split(".");
      const targetChain = targetPropertyChain.split(".");

      const readChainValue = (rootObj, parts) => {
        let curr = rootObj;
        for (let i = 0; i < parts.length; i++) {
          if (curr == null) return undefined;
          const prop = parts[i];
          const getter = `get${firstUp(prop)}`;
          if (typeof curr[getter] === "function") {
            curr = curr[getter]();
          } else {
            curr = curr[prop];
          }
        }
        return curr;
      };

      const writeTargetValue = (val) => {
        let curr = target;
        for (let i = 0; i < targetChain.length - 1; i++) {
          if (curr == null) return;
          const prop = targetChain[i];
          const getter = `get${firstUp(prop)}`;
          curr = typeof curr[getter] === "function" ? curr[getter]() : curr[prop];
        }
        if (curr == null) return;
        const lastProp = targetChain[targetChain.length - 1];
        let finalVal = val;
        if (options && typeof options.converter === "function") {
          finalVal = options.converter(val, curr, source, target);
        }
        const setter = `set${firstUp(lastProp)}`;
        const resetter = `reset${firstUp(lastProp)}`;
        if (finalVal === undefined && typeof curr[resetter] === "function") {
          curr[resetter]();
        } else if (typeof curr[setter] === "function") {
          curr[setter](finalVal);
        } else {
          curr[lastProp] = finalVal;
        }
        if (options && typeof options.onUpdate === "function") {
          options.onUpdate(source, target, finalVal);
        }
      };

      writeTargetValue(readChainValue(source, chain));

      const rootProp = chain[0];
      const eventName =
        chain.length > 1 && typeof source.hasListener === "function"
          ? `change${firstUp(rootProp)}`
          : source.constructor?.$$properties?.[rootProp]?.event || `change${firstUp(rootProp)}`;

      let listenerId = null;
      let bubbleListenerId = null;
      if (typeof source.addListener === "function") {
        listenerId = source.addListener(eventName, () => {
          writeTargetValue(readChainValue(source, chain));
        });
        if (chain.length > 1) {
          bubbleListenerId = source.addListener("changeBubble", () => {
            writeTargetValue(readChainValue(source, chain));
          });
        }
      }

      if (!source.$$bindings) source.$$bindings = [];
      const record = {
        id,
        source,
        sourcePropertyChain,
        target,
        targetPropertyChain,
        listenerId,
        bubbleListenerId
      };
      source.$$bindings.push(record);
      return record;
    },

    removeBindingFromObject(source, idOrRecord) {
      if (!source || !source.$$bindings) return;
      const idx = source.$$bindings.findIndex(
        (b) => b === idOrRecord || b.id === idOrRecord
      );
      if (idx !== -1) {
        const rec = source.$$bindings[idx];
        if (rec.listenerId && typeof source.removeListenerById === "function") {
          source.removeListenerById(rec.listenerId);
        }
        if (rec.bubbleListenerId && typeof source.removeListenerById === "function") {
          source.removeListenerById(rec.bubbleListenerId);
        }
        source.$$bindings.splice(idx, 1);
      }
    },

    removeAllBindingsForObject(source) {
      if (!source || !source.$$bindings) return;
      for (const rec of source.$$bindings.slice()) {
        SingleValueBinding.removeBindingFromObject(source, rec);
      }
    },

    getAllBindingsForObject(source) {
      return source?.$$bindings ? source.$$bindings.slice() : [];
    }
  };

  const MBinding = {
    bind(sourcePropertyChain, target, targetProperty, options) {
      return SingleValueBinding.bind(
        this,
        sourcePropertyChain,
        target,
        targetProperty,
        options
      );
    },
    removeBinding(id) {
      SingleValueBinding.removeBindingFromObject(this, id);
    },
    removeRelatedBindings(relatedObject) {
      if (!this.$$bindings) return;
      for (const b of this.$$bindings.slice()) {
        if (b.target === relatedObject) {
          SingleValueBinding.removeBindingFromObject(this, b);
        }
      }
    },
    removeAllBindings() {
      SingleValueBinding.removeAllBindingsForObject(this);
    },
    getBindings() {
      return SingleValueBinding.getAllBindingsForObject(this);
    }
  };

  /* ============================================================================
   * 7. BASE OBJECT CLASS (`ville.core.Object` / `qx.core.Object`)
   *    Uses a function constructor with `.self = .constructor = BaseObject` so
   *    both `@qooxdoo/compiler`'s `qx.core.Object.constructor.call(this)` and
   *    native ES6 `class extends ville.core.Object` work seamlessly!
   * ========================================================================== */

  function BaseObject() {
    if (!this.$$hash) {
      this.$$hash = `${nextHashCode++}-0`;
      this.$$disposed = false;
      ObjectRegistry.register(this);
    }
    this.$$initialized = true;
  }

  Object.assign(BaseObject.prototype, MEvent, MBinding, {
    classname: "qx.core.Object",
    basename: "Object",

    toHashCode() {
      return this.$$hash || ObjectRegistry.toHashCode(this);
    },

    set(data, value) {
      if (typeof data === "string") {
        const setter = `set${firstUp(data)}`;
        if (typeof this[setter] === "function") {
          return this[setter](value);
        }
        this[data] = value;
        return value;
      }
      if (data && typeof data === "object") {
        for (const prop of Object.keys(data)) {
          const setter = `set${firstUp(prop)}`;
          if (typeof this[setter] === "function") {
            this[setter](data[prop]);
          } else {
            this[prop] = data[prop];
          }
        }
      }
      return this;
    },

    get(prop) {
      const getter = `get${firstUp(prop)}`;
      return typeof this[getter] === "function" ? this[getter]() : this[prop];
    },

    reset(prop) {
      const resetter = `reset${firstUp(prop)}`;
      if (typeof this[resetter] === "function") {
        this[resetter]();
      }
    },

    getDestroySignal() {
      if (!this.$$abortController) {
        this.$$abortController = new AbortController();
        if (this.$$disposed) {
          this.$$abortController.abort();
        }
      }
      return this.$$abortController.signal;
    },

    isDisposed() {
      return Boolean(this.$$disposed);
    },

    dispose() {
      if (this.$$disposed) return;
      this.$$disposed = true;

      if (this.$$abortController) {
        this.$$abortController.abort();
        this.$$abortController = null;
      }

      if (this.$$bindings) {
        SingleValueBinding.removeAllBindingsForObject(this);
      }

      let clazz = this.constructor;
      while (clazz) {
        if (clazz.$$destructor) {
          clazz.$$destructor.call(this);
        }
        if (clazz.$$ownIncludes) {
          for (const mixin of clazz.$$ownIncludes) {
            if (mixin.$$destructor) {
              mixin.$$destructor.call(this);
            }
          }
        }
        clazz = clazz.superclass;
      }

      this.$$eventListeners = null;
      ObjectRegistry.unregister(this);
    },

    destroy() {
      this.dispose();
    },

    _disposeObjects(...names) {
      for (const name of names) {
        const obj = this[name];
        if (obj && typeof obj.dispose === "function" && !obj.isDisposed()) {
          obj.dispose();
        }
        this[name] = null;
      }
    },

    _disposeSingletonObjects(...names) {
      for (const name of names) {
        this[name] = null;
      }
    },

    _disposeArray(name) {
      const arr = this[name];
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] && typeof arr[i].dispose === "function" && !arr[i].isDisposed()) {
            arr[i].dispose();
          }
        }
        arr.length = 0;
      }
      this[name] = null;
    },

    _disposeMap(name) {
      const map = this[name];
      if (map && typeof map === "object") {
        for (const k in map) {
          if (map[k] && typeof map[k].dispose === "function" && !map[k].isDisposed()) {
            map[k].dispose();
          }
        }
      }
      this[name] = null;
    },

    debug(...args) {
      Bootstrap.debug(`[${this.classname || "Object"}]`, ...args);
    },
    info(...args) {
      Bootstrap.info(`[${this.classname || "Object"}]`, ...args);
    },
    warn(...args) {
      Bootstrap.warn(`[${this.classname || "Object"}]`, ...args);
    },
    error(...args) {
      Bootstrap.error(`[${this.classname || "Object"}]`, ...args);
    },
    assertTrue(val, msg) {
      Assert.assertTrue(val, msg);
    },
    assertFalse(val, msg) {
      Assert.assertFalse(val, msg);
    },
    assertInteger(val, msg) {
      Assert.assertInteger(val, msg);
    },
    assertInArray(val, arr, msg) {
      Assert.assertInArray(val, arr, msg);
    }
  });

  BaseObject.self = BaseObject.constructor = BaseObject.prototype.constructor = BaseObject;
  BaseObject.$$type = "Class";
  BaseObject.classname = "qx.core.Object";
  BaseObject.basename = "Object";
  BaseObject.$$events = {};
  BaseObject.$$properties = {};
  BaseObject.$$includes = [];
  BaseObject.$$ownIncludes = [];

  ClassRegistry.set("qx.core.Object", BaseObject);
  ClassRegistry.set("ville.core.Object", BaseObject);
  Bootstrap.$$registry["qx.core.Object"] = BaseObject;
  Bootstrap.$$registry["ville.core.Object"] = BaseObject;

  /* ============================================================================
   * 8. CLASS, MIXIN, INTERFACE & THEME SYSTEM (`ville.Class`, `Mixin`, `Interface`, `Theme`)
   * ========================================================================== */

  function flattenMixins(mixins) {
    if (!mixins) return [];
    const list = Array.isArray(mixins) ? mixins : [mixins];
    const result = [];
    for (const m of list) {
      if (!m) continue;
      if (m.$$includes) {
        for (const sub of flattenMixins(m.$$includes)) {
          if (!result.includes(sub)) result.push(sub);
        }
      }
      if (!result.includes(m)) result.push(m);
    }
    return result;
  }

  const Mixin = {
    define(name, config = {}) {
      const mixin = {
        $$type: "Mixin",
        name,
        classname: name,
        $$includes: flattenMixins(config.include),
        $$properties: config.properties || {},
        $$events: config.events || {},
        $$members: config.members || {},
        $$statics: config.statics || {},
        $$constructor: config.construct || null,
        $$destructor: config.destruct || null
      };
      Object.assign(mixin, mixin.$$statics);
      MixinRegistry.set(name, mixin);
      Bootstrap.$$registry[name] = mixin;
      createNamespace(name, mixin);
      return mixin;
    },
    getByName(name) {
      return MixinRegistry.get(name) || getByName(name);
    }
  };

  const Interface = {
    define(name, config = {}) {
      const iface = {
        $$type: "Interface",
        name,
        classname: name,
        $$extends: config.extend
          ? Array.isArray(config.extend)
            ? config.extend
            : [config.extend]
          : [],
        $$properties: config.properties || {},
        $$events: config.events || {},
        $$members: config.members || {},
        $$statics: config.statics || {}
      };
      Object.assign(iface, iface.$$statics);
      InterfaceRegistry.set(name, iface);
      Bootstrap.$$registry[name] = iface;
      createNamespace(name, iface);
      return iface;
    },
    getByName(name) {
      return InterfaceRegistry.get(name) || getByName(name);
    }
  };

  const Class = {
    define(name, config = {}) {
      const isStaticOnly =
        !config.extend && !config.members && !config.construct && !config.properties && !config.include;
      const superClass = config.extend || (isStaticOnly ? null : BaseObject);
      const ownMixins = flattenMixins(config.include);
      const inheritedMixins = superClass?.$$includes || [];
      const allMixins = inheritedMixins.concat(
        ownMixins.filter((m) => !inheritedMixins.includes(m))
      );
      const userConstruct = config.construct || null;

      let Clazz;
      if (!superClass) {
        Clazz = function () {};
      } else {
        Clazz = function (...args) {
          if (!this.$$hash) {
            this.$$hash = `${nextHashCode++}-0`;
            this.$$disposed = false;
            this.$$initialized = false;
            ObjectRegistry.register(this);
          }

          if (userConstruct) {
            userConstruct.apply(this, args);
          } else {
            superClass.apply(this, args);
          }

          // Run only ownMixins for this class level so chaining SuperClass.constructor.call(this)
          // never invokes ancestor mixin constructors multiple times.
          for (let i = 0; i < ownMixins.length; i++) {
            if (ownMixins[i].$$constructor) {
              ownMixins[i].$$constructor.apply(this, args);
            }
          }

          this.$$initialized = true;
        };

        Clazz.prototype = Object.create(superClass.prototype);
        Clazz.superclass = superClass;
      }

      // Critical Qooxdoo transpiler contract (`qx/Bootstrap.js:426`):
      // Transpiled `super()` calls invoke `SuperClass.constructor.call(this, ...)`!
      Clazz.self = Clazz.constructor = Clazz.prototype.constructor = Clazz;

      Clazz.$$type = "Class";
      Clazz.classname = name;
      Clazz.basename = name.split(".").pop();
      Clazz.prototype.classname = name;
      Clazz.prototype.name = name;
      Clazz.prototype.basename = Clazz.basename;
      Clazz.$$ownIncludes = ownMixins;
      Clazz.$$includes = allMixins;
      Clazz.$$implements = config.implement
        ? Array.isArray(config.implement)
          ? config.implement
          : [config.implement]
        : [];
      Clazz.$$destructor = config.destruct || null;

      // Environment keys declared on the class (`environment: { ... }`)
      if (config.environment) {
        for (const [envKey, envVal] of Object.entries(config.environment)) {
          Environment.add(envKey, envVal);
        }
      }

      // Events inheritance
      Clazz.$$events = Object.assign({}, superClass?.$$events || {});
      for (const m of ownMixins) {
        Object.assign(Clazz.$$events, m.$$events);
      }
      if (config.events) {
        Object.assign(Clazz.$$events, config.events);
      }

      // Statics
      if (config.statics) {
        Object.assign(Clazz, config.statics);
      }

      // Apply own mixins (properties & members)
      for (const m of ownMixins) {
        if (m.$$properties) {
          Property.attachProperties(Clazz, m.$$properties);
        }
        if (m.$$members) {
          Object.assign(Clazz.prototype, m.$$members);
        }
      }

      // Class properties & members
      if (config.properties) {
        Property.attachProperties(Clazz, config.properties);
      }
      if (config.members) {
        Object.assign(Clazz.prototype, config.members);
      }

      // Singleton support (`type: "singleton"`)
      if (config.type === "singleton") {
        Clazz.getInstance = function () {
          if (!this.$$instance) {
            this.$$instance = new this();
          }
          return this.$$instance;
        };
      }

      ClassRegistry.set(name, Clazz);
      Bootstrap.$$registry[name] = Clazz;
      createNamespace(name, Clazz);

      if (typeof config.defer === "function") {
        Bootstrap.addPendingDefer(Clazz, function () {
          config.defer(Clazz, Clazz.prototype);
        });
      }

      return Clazz;
    },

    /**
     * Dual-Syntax Bridge: Registers a native ES6 `class MyWidget extends Widget`
     * with static `properties`, `events`, `include`, `implement`, and `destruct`
     * onto the reactive property & namespace engine.
     */
    register(ES6Class, name) {
      const className = name || ES6Class.classname || ES6Class.name;
      const superClass = Object.getPrototypeOf(ES6Class.prototype)?.constructor || BaseObject;
      ES6Class.superclass = superClass;
      ES6Class.self = ES6Class;
      ES6Class.$$type = "Class";
      ES6Class.classname = className;
      ES6Class.basename = className.split(".").pop();
      ES6Class.prototype.classname = className;
      ES6Class.prototype.name = className;
      ES6Class.prototype.basename = ES6Class.basename;

      const ownMixins = flattenMixins(ES6Class.include);
      const inheritedMixins = superClass?.$$includes || [];
      ES6Class.$$ownIncludes = ownMixins;
      ES6Class.$$includes = inheritedMixins.concat(
        ownMixins.filter((m) => !inheritedMixins.includes(m))
      );
      ES6Class.$$implements = ES6Class.implement
        ? Array.isArray(ES6Class.implement)
          ? ES6Class.implement
          : [ES6Class.implement]
        : [];
      ES6Class.$$destructor = ES6Class.prototype.destruct || null;

      ES6Class.$$events = Object.assign(
        {},
        superClass?.$$events || {},
        ES6Class.events || {}
      );
      for (const m of ownMixins) {
        Object.assign(ES6Class.$$events, m.$$events);
        if (m.$$properties) Property.attachProperties(ES6Class, m.$$properties);
        if (m.$$members) Object.assign(ES6Class.prototype, m.$$members);
      }

      if (ES6Class.properties) {
        Property.attachProperties(ES6Class, ES6Class.properties);
      }

      if (ES6Class.type === "singleton") {
        ES6Class.getInstance = function () {
          if (!this.$$instance) {
            this.$$instance = new this();
          }
          return this.$$instance;
        };
      }

      ClassRegistry.set(className, ES6Class);
      Bootstrap.$$registry[className] = ES6Class;
      createNamespace(className, ES6Class);
      return ES6Class;
    },

    isDefined(name) {
      return ClassRegistry.has(name) || Boolean(getByName(name));
    },

    getByName(name) {
      return ClassRegistry.get(name) || getByName(name);
    },

    supportsEvent(clazz, eventName) {
      let curr = clazz;
      while (curr) {
        if (curr.$$events && eventName in curr.$$events) return true;
        if (curr.$$properties) {
          for (const p in curr.$$properties) {
            if (curr.$$properties[p].event === eventName) return true;
          }
        }
        curr = curr.superclass;
      }
      return false;
    },

    implementsInterface(objOrClass, iface) {
      if (!objOrClass || !iface) return false;
      let curr = typeof objOrClass === "function" ? objOrClass : objOrClass.constructor;
      while (curr) {
        if (curr.$$implements) {
          for (const impl of curr.$$implements) {
            if (impl === iface || (impl.$$extends && impl.$$extends.includes(iface))) {
              return true;
            }
          }
        }
        curr = curr.superclass;
      }
      return false;
    },

    hasMixin(clazz, mixin) {
      let curr = clazz;
      while (curr) {
        if (curr.$$includes && curr.$$includes.includes(mixin)) return true;
        curr = curr.superclass;
      }
      return false;
    },

    isSubClassOf(clazz, superClass) {
      if (!clazz || !superClass) return false;
      if (clazz === superClass) return true;
      return Boolean(clazz.prototype && clazz.prototype instanceof superClass);
    },

    hasProperty(clazz, propName) {
      return Boolean(clazz?.$$properties && propName in clazz.$$properties);
    },

    patch(clazz, mixin) {
      if (!clazz || !mixin) return;
      if (mixin.$$properties) Property.attachProperties(clazz, mixin.$$properties);
      if (mixin.$$members) Object.assign(clazz.prototype, mixin.$$members);
      if (mixin.$$events) Object.assign(clazz.$$events, mixin.$$events);
      return clazz;
    }
  };

  /* ============================================================================
   * 9. THEME & APPEARANCE ENGINE (`ville.Theme`, `ville.theme.manager.Appearance`)
   * ========================================================================== */

  const Theme = {
    define(name, config = {}) {
      const theme = Object.assign(
        {
          $$type: "Theme",
          name,
          classname: name,
          title: config.title || name
        },
        config
      );

      if (config.extend && config.appearances) {
        theme.appearances = Object.assign(
          {},
          config.extend.appearances || {},
          config.appearances
        );
      }

      ThemeRegistry.set(name, theme);
      Bootstrap.$$registry[name] = theme;
      createNamespace(name, theme);
      return theme;
    },
    getByName(name) {
      return ThemeRegistry.get(name) || getByName(name);
    }
  };

  const AppearanceManager = Class.define("qx.theme.manager.Appearance", {
    type: "singleton",
    extend: BaseObject,
    construct() {
      BaseObject.call(this);
      this.__theme = null;
      this.__entryCache = {};
    },
    members: {
      __theme: null,
      __entryCache: null,
      setTheme(theme) {
        this.__theme = theme;
        this.__entryCache = {};
      },
      getTheme() {
        return this.__theme;
      },
      styleFrom(id, states, theme, defaultId) {
        const activeTheme = theme || this.__theme;
        if (!activeTheme || !activeTheme.appearances) return null;
        const apps = activeTheme.appearances;

        let entry = apps[id];
        if (!entry && defaultId) {
          entry = apps[defaultId];
        }
        if (!entry) return null;

        while (typeof entry === "string") {
          entry = apps[entry];
        }
        if (!entry) return null;

        return this.__evalEntry(apps, entry, states || {});
      },
      __evalEntry(apps, entry, states) {
        let baseResult = {};
        if (entry.include) {
          let incEntry = apps[entry.include];
          while (typeof incEntry === "string") {
            incEntry = apps[incEntry];
          }
          if (incEntry) {
            baseResult = this.__evalEntry(apps, incEntry, states) || {};
          }
        }

        const ownResult =
          typeof entry.style === "function" ? entry.style(states, baseResult) || {} : {};
        return Object.assign({}, baseResult, ownResult);
      }
    }
  });

  /* ============================================================================
   * 10. OBSERVABLE DATA ARRAY (`ville.data.Array` / `qx.data.Array`)
   * ========================================================================== */

  const IListDataIface = Interface.define("qx.data.IListData", {
    events: { change: "qx.event.type.Data", changeLength: "qx.event.type.Data" },
    members: {
      getItem() {},
      setItem() {},
      splice() {},
      getLength() {},
      toArray() {}
    }
  });

  const DataArray = Class.define("qx.data.Array", {
    extend: BaseObject,
    implement: [IListDataIface],
    construct(param) {
      BaseObject.call(this);
      this.__array = Array.isArray(param)
        ? param.slice()
        : arguments.length > 1
        ? Array.from(arguments)
        : param instanceof DataArray
        ? param.toArray().slice()
        : [];
      this.__autoDisposeItems = false;
    },
    events: {
      change: "qx.event.type.Data",
      changeLength: "qx.event.type.Data"
    },
    members: {
      __array: null,
      __autoDisposeItems: false,
      getAutoDisposeItems() {
        return this.__autoDisposeItems;
      },
      setAutoDisposeItems(val) {
        this.__autoDisposeItems = Boolean(val);
      },
      getLength() {
        return this.__array ? this.__array.length : 0;
      },
      toArray() {
        return this.__array;
      },
      getItem(index) {
        return this.__array[index];
      },
      setItem(index, item) {
        const oldItem = this.__array[index];
        this.__array[index] = item;
        this.fireDataEvent("change", {
          start: index,
          end: index,
          type: "order",
          added: [item],
          removed: [oldItem]
        });
        this.fireDataEvent("changeLength", this.__array.length);
      },
      push(...items) {
        const start = this.__array.length;
        const len = this.__array.push(...items);
        this.fireDataEvent("change", {
          start,
          end: this.__array.length - 1,
          type: "add",
          added: items,
          removed: []
        });
        this.fireDataEvent("changeLength", len);
        return len;
      },
      pop() {
        const removed = this.__array.pop();
        this.fireDataEvent("change", {
          start: this.__array.length,
          end: this.__array.length,
          type: "remove",
          added: [],
          removed: [removed]
        });
        this.fireDataEvent("changeLength", this.__array.length);
        return removed;
      },
      splice(startIndex, deleteCount, ...itemsToAdd) {
        const removed = this.__array.splice(startIndex, deleteCount, ...itemsToAdd);
        this.fireDataEvent("change", {
          start: startIndex,
          end: this.__array.length - 1,
          type: "add/remove",
          added: itemsToAdd,
          removed
        });
        this.fireDataEvent("changeLength", this.__array.length);
        return new DataArray(removed);
      },
      remove(item) {
        const idx = this.__array.indexOf(item);
        if (idx !== -1) {
          this.splice(idx, 1);
          return item;
        }
        return undefined;
      },
      removeAt(index) {
        return this.splice(index, 1).getItem(0);
      },
      removeAll() {
        const removed = this.__array.slice();
        this.__array.length = 0;
        this.fireDataEvent("change", {
          start: 0,
          end: 0,
          type: "remove",
          added: [],
          removed
        });
        this.fireDataEvent("changeLength", 0);
        return removed;
      },
      append(items) {
        const list = items instanceof DataArray ? items.toArray() : Array.from(items || []);
        if (list.length > 0) {
          this.push(...list);
        }
      },
      indexOf(item) {
        return this.__array.indexOf(item);
      },
      contains(item) {
        return this.__array.includes(item);
      },
      forEach(fn, ctx) {
        this.__array.forEach(fn, ctx);
      },
      map(fn, ctx) {
        return this.__array.map(fn, ctx);
      },
      filter(fn, ctx) {
        return new DataArray(this.__array.filter(fn, ctx));
      },
      slice(start, end) {
        return new DataArray(this.__array.slice(start, end));
      },
      copy() {
        return new DataArray(this.__array.slice());
      }
    },
    destruct() {
      if (this.__autoDisposeItems && this.__array) {
        for (const item of this.__array) {
          if (item && typeof item.dispose === "function" && !item.isDisposed()) {
            item.dispose();
          }
        }
      }
      this.__array = null;
    }
  });

  Object.defineProperty(DataArray.prototype, "length", {
    get() {
      return this.__array ? this.__array.length : 0;
    }
  });
  DataArray.prototype[Symbol.iterator] = function () {
    return (this.__array || [])[Symbol.iterator]();
  };

  /* ============================================================================
   * 11. RESOURCE & ALIAS MANAGERS, UTILITIES & APPLICATION INIT (`ville.core.Init`)
   * ========================================================================== */

  const AliasManager = Class.define("qx.util.AliasManager", {
    type: "singleton",
    extend: BaseObject,
    construct() {
      BaseObject.call(this);
      this.__aliases = {};
    },
    members: {
      __aliases: null,
      add(alias, base) {
        this.__aliases[alias] = base;
      },
      resolve(path) {
        if (!path || typeof path !== "string") return path;
        for (const [alias, base] of Object.entries(this.__aliases)) {
          if (path.startsWith(alias + "/")) {
            return base + path.slice(alias.length);
          }
        }
        return path;
      }
    }
  });

  const ResourceManager = Class.define("qx.util.ResourceManager", {
    type: "singleton",
    extend: BaseObject,
    members: {
      toUri(id) {
        if (!id || typeof id !== "string") return id;
        if (/^(https?:|data:|blob:|\/)/.test(id)) return id;
        const libs = globalScope.qx?.$$libraries;
        const data = globalScope.qx?.$$resources?.[id];
        const libNs = Array.isArray(data) && data[3] ? data[3] : id.split("/")[0];
        if (libs && libs[libNs]?.resourceUri) {
          return `${libs[libNs].resourceUri}/${id}`;
        }
        const root = globalScope.qx?.$$resourceRoot || globalScope.qx?.$$appRoot || "";
        return root ? `${root}../resource/${id}` : id;
      },
      has(id) {
        return Boolean(globalScope.qx?.$$resources && id in globalScope.qx.$$resources);
      },
      getData(id) {
        return globalScope.qx?.$$resources?.[id] || null;
      },
      getImageWidth(id) {
        const d = this.getData(id);
        return Array.isArray(d) ? d[0] : null;
      },
      getImageHeight(id) {
        const d = this.getData(id);
        return Array.isArray(d) ? d[1] : null;
      },
      getImageFormat(id) {
        const d = this.getData(id);
        return Array.isArray(d) ? d[2] : null;
      }
    }
  });

  const DeferredCall = Class.define("qx.util.DeferredCall", {
    extend: BaseObject,
    construct(callback, context) {
      BaseObject.call(this);
      this.__callback = callback;
      this.__context = context || null;
      this.__scheduled = false;
    },
    members: {
      __callback: null,
      __context: null,
      __scheduled: false,
      schedule() {
        if (this.__scheduled || this.$$disposed) return;
        this.__scheduled = true;
        queueMicrotask(() => {
          if (!this.$$disposed && this.__scheduled) {
            this.__scheduled = false;
            this.call();
          }
        });
      },
      cancel() {
        this.__scheduled = false;
      },
      call() {
        this.__scheduled = false;
        if (this.__callback && !this.$$disposed) {
          this.__callback.call(this.__context || this);
        }
      }
    },
    destruct() {
      this.__scheduled = false;
      this.__callback = null;
      this.__context = null;
    }
  });

  const PropertyUtil = {
    getUserValue(obj, prop) {
      return obj ? obj[`$$user_${prop}`] : undefined;
    },
    getThemeValue(obj, prop) {
      return obj ? obj[`$$theme_${prop}`] : undefined;
    },
    getInitValue(obj, prop) {
      return obj ? obj[`$$init_${prop}`] : undefined;
    },
    setUserValue(obj, prop, val) {
      if (obj) obj[`$$user_${prop}`] = val;
    },
    deleteUserValue(obj, prop) {
      if (obj) obj[`$$user_${prop}`] = undefined;
    }
  };

  const OOUtil = {
    hasProperty(clazz, name) {
      return Boolean(clazz?.$$properties && name in clazz.$$properties);
    },
    getPropertyDefinition(clazz, name) {
      return clazz?.$$properties?.[name] || null;
    },
    hasInterface(clazz, iface) {
      return Class.implementsInterface(clazz, iface);
    },
    supportsEvent(clazz, name) {
      return Class.supportsEvent(clazz, name);
    }
  };

  const Delegate = {
    getMethod(delegate, specificMethod) {
      if (delegate && typeof delegate[specificMethod] === "function") {
        return delegate[specificMethod].bind(delegate);
      }
      return null;
    },
    containsMethod(delegate, specificMethod) {
      return Boolean(delegate && typeof delegate[specificMethod] === "function");
    }
  };

  const DisposeUtil = {
    disposeTriggeredBy(disposeMe, trigger) {
      if (!disposeMe || !trigger) return;
      const origDispose = trigger.dispose;
      trigger.dispose = function () {
        origDispose.call(trigger);
        if (disposeMe && typeof disposeMe.dispose === "function" && !disposeMe.isDisposed()) {
          disposeMe.dispose();
        }
      };
    }
  };

  const Init = {
    __application: null,
    getApplication() {
      return this.__application;
    },
    /**
     * Direct `BaseInit`-style application startup (`STRAT-BUILD-07`), inspired by
     * `loader-node.tmpl.js`: executes pending `defer()` blocks, instantiates the
     * configured `qx.application` class, and runs `app.main()` and `app.finalize()`
     * without pulling in legacy `qx.event.handler.Application` or `Window`.
     */
    ready() {
      if (this.__application) {
        return this.__application;
      }
      Bootstrap.executePendingDefers();
      const appClassName = Environment.get("qx.application");
      const AppClass = Class.getByName(appClassName);
      if (!AppClass) {
        throw new Error(`Ville UI Init.ready(): Application class '${appClassName}' not found.`);
      }
      const app = Object.create(AppClass.prototype);
      this.__application = app;
      AppClass.call(app);
      if (typeof app.main === "function") {
        app.main();
      }
      if (typeof app.finalize === "function") {
        app.finalize();
      }
      return app;
    }
  };

  /* ============================================================================
   * 12. REGISTER KERNEL NAMESPACES (`ville.*` AND `qx.*` ALIASES)
   * ========================================================================== */

  const IDisposableIface = Interface.define("qx.core.IDisposable", {
    members: { dispose() {}, isDisposed() {} }
  });
  const IApplicationIface = Interface.define("qx.application.IApplication", {
    members: { main() {}, finalize() {}, close() {}, terminate() {} }
  });

  const LangArray = {
    insertAt(arr, obj, i) {
      arr.splice(i, 0, obj);
      return arr;
    },
    insertBefore(arr, obj, before) {
      const idx = arr.indexOf(before);
      if (idx === -1) arr.push(obj);
      else arr.splice(idx, 0, obj);
      return arr;
    },
    insertAfter(arr, obj, after) {
      const idx = arr.indexOf(after);
      if (idx === -1 || idx === arr.length - 1) arr.push(obj);
      else arr.splice(idx + 1, 0, obj);
      return arr;
    },
    remove(arr, obj) {
      const idx = arr.indexOf(obj);
      if (idx !== -1) {
        arr.splice(idx, 1);
        return obj;
      }
      return undefined;
    },
    removeAt(arr, i) {
      return arr.splice(i, 1)[0];
    },
    removeAll(arr) {
      arr.length = 0;
      return arr;
    },
    contains(arr, obj) {
      return Array.isArray(arr) && arr.includes(obj);
    },
    contain(arr, obj) {
      return Array.isArray(arr) && arr.includes(obj);
    },
    clone(arr) {
      return Array.isArray(arr) ? arr.slice() : [];
    },
    equals(arr1, arr2) {
      if (arr1 === arr2) return true;
      if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
      }
      return true;
    },
    append(arr1, arr2) {
      if (Array.isArray(arr1) && Array.isArray(arr2)) {
        arr1.push(...arr2);
      }
      return arr1;
    },
    unique(arr) {
      return Array.from(new Set(arr));
    }
  };

  const LangNumber = {
    limit(num, min, max) {
      if (min != null && num < min) return min;
      if (max != null && num > max) return max;
      return num;
    },
    isBetweenRange(num, min, max) {
      return num >= min && num <= max;
    }
  };

  const LangObject = {
    clone(obj, deep) {
      if (!obj || typeof obj !== "object") return obj;
      return deep && typeof structuredClone === "function"
        ? structuredClone(obj)
        : Object.assign(Array.isArray(obj) ? [] : {}, obj);
    },
    isEmpty(obj) {
      if (!obj) return true;
      for (const k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) return false;
      }
      return true;
    },
    mergeWith(target, source, overwrite = true) {
      return Bootstrap.objectMergeWith(target, source, overwrite);
    },
    getValues(obj) {
      return obj ? Object.values(obj) : [];
    },
    getLength(obj) {
      return obj ? Object.keys(obj).length : 0;
    }
  };

  const LangType = {
    isString: (v) => typeof v === "string" || v instanceof String,
    isNumber: (v) => typeof v === "number" && !Number.isNaN(v),
    isBoolean: (v) => typeof v === "boolean",
    isFunction: (v) => typeof v === "function",
    isArray: (v) => Array.isArray(v) || v instanceof DataArray,
    isObject: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
    isRegExp: (v) => v instanceof RegExp,
    isDate: (v) => v instanceof Date,
    isError: (v) => v instanceof Error,
    isPromise: (v) => Boolean(v && typeof v.then === "function"),
    isPojo: (v) =>
      typeof v === "object" &&
      v !== null &&
      (Object.getPrototypeOf(v) === Object.prototype ||
        Object.getPrototypeOf(v) === null)
  };

  for (const root of [ville, qx]) {
    root.Bootstrap = Bootstrap;
    root.Class = Class;
    root.Mixin = Mixin;
    root.Interface = Interface;
    root.Theme = Theme;

    root.core = Object.assign(root.core || {}, {
      Object: BaseObject,
      ObjectRegistry,
      Property,
      MEvent,
      Environment,
      Assert,
      Init,
      BaseInit: Init,
      IDisposable: IDisposableIface
    });

    root.data = Object.assign(root.data || {}, {
      MBinding,
      SingleValueBinding,
      Array: DataArray,
      IListData: IListDataIface
    });

    root.theme = Object.assign(root.theme || {}, {
      manager: Object.assign(root.theme?.manager || {}, {
        Appearance: AppearanceManager
      })
    });

    root.util = Object.assign(root.util || {}, {
      AliasManager,
      ResourceManager,
      DeferredCall,
      PropertyUtil,
      OOUtil,
      Delegate,
      DisposeUtil
    });

    root.application = Object.assign(root.application || {}, {
      IApplication: IApplicationIface
    });

    root.event = Object.assign(root.event || {}, {
      type: {
        Event: NativeSimEvent,
        Data: NativeSimEvent
      }
    });

    root.log = Object.assign(root.log || {}, {
      appender: { Native: {} },
      Logger: Bootstrap
    });

    root.lang = Object.assign(root.lang || {}, {
      String: { firstUp, firstLow },
      Array: LangArray,
      Number: LangNumber,
      Object: LangObject,
      Type: LangType
    });
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      ville,
      qx,
      Bootstrap,
      Class,
      Mixin,
      Interface,
      Theme,
      Object: BaseObject,
      ObjectRegistry,
      Property,
      MEvent,
      Environment,
      Assert,
      Init,
      MBinding,
      SingleValueBinding,
      Array: DataArray,
      AppearanceManager,
      AliasManager,
      ResourceManager
    };
  }
})();
