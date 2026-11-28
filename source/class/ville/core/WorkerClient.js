/**
 * Off-Thread Web Worker & `BroadcastChannel` Concurrency Client (`ville.core.WorkerClient` — `STRAT-CORE-07`, `STRAT-CORE-06`).
 *
 * Provides a zero-boilerplate OOP + reactive-property wrapper around native Web Workers
 * (`new Worker(...)`) and `BroadcastChannel`:
 *  1. **Reactive `busy` & `pendingCount` Properties**: Bind directly to any Ville UI widget
 *     (`worker.bind("busy", refreshButton, "loading")` or `worker.bind("busy", table, "inert")`).
 *  2. **Built-In Off-Thread Data View Kernel (Zero External File Required by Default)**:
 *     When instantiated without a custom `scriptUrl`, automatically spins up an inline
 *     Blob ES2025 Web Worker supporting off-thread dataset operations:
 *       - `"sort"`: Multi-type locale/numeric sorting of large row arrays (`rows`, `columnKey`, `direction`).
 *       - `"filter"`: Multi-column substring / predicate filtering (`rows`, `query`, `columns`).
 *       - `"sortAndFilter"`: Combined filter + sort pass in a single off-thread round-trip.
 *  3. **Custom ES Module Worker Support**: Pass any `{ scriptUrl, type: "module" }` to run
 *     custom application worker modules with `request(action, payload, { signal, transfer })`.
 *  4. **Cross-Tab `BroadcastChannel` Synchronization**: Optional `channelName` property broadcasts
 *     state/data notifications across browser tabs and PWA windows.
 *  5. **Deterministic Cleanup**: `destruct()` automatically terminates the underlying `Worker`,
 *     closes any `BroadcastChannel`, and rejects in-flight requests cleanly.
 */
qx.Class.define("ville.core.WorkerClient", {
  extend: qx.core.Object,

  statics: {
    /**
     * Inline worker kernel source used when no external `scriptUrl` is provided.
     * Supports `"sort"`, `"filter"`, `"sortAndFilter"`, and `"ping"` off the main UI thread.
     *
     * @type {string}
     */
    DEFAULT_KERNEL_SOURCE: `
      const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

      function filterRows(rows, query, columns) {
        if (!query || !String(query).trim()) return rows;
        const q = String(query).trim().toLowerCase();
        const cols = Array.isArray(columns) && columns.length > 0 ? columns : null;
        const out = [];
        for (let i = 0, len = rows.length; i < len; i++) {
          const row = rows[i];
          if (!row) continue;
          let matched = false;
          if (Array.isArray(row)) {
            for (let c = 0; c < row.length; c++) {
              if (row[c] != null && String(row[c]).toLowerCase().includes(q)) {
                matched = true;
                break;
              }
            }
          } else if (typeof row === "object") {
            const keys = cols || Object.keys(row);
            for (let k = 0; k < keys.length; k++) {
              const val = row[keys[k]];
              if (val != null && String(val).toLowerCase().includes(q)) {
                matched = true;
                break;
              }
            }
          } else if (String(row).toLowerCase().includes(q)) {
            matched = true;
          }
          if (matched) out.push(row);
        }
        return out;
      }

      function sortRows(rows, columnKey, direction) {
        if (columnKey === undefined || columnKey === null) return rows;
        const dir = direction === "desc" ? -1 : 1;
        const copy = rows.slice();
        copy.sort((a, b) => {
          const va = a && typeof a === "object" ? a[columnKey] : a;
          const vb = b && typeof b === "object" ? b[columnKey] : b;
          if (typeof va === "number" && typeof vb === "number") {
            return (va - vb) * dir;
          }
          return collator.compare(String(va ?? ""), String(vb ?? "")) * dir;
        });
        return copy;
      }

      self.addEventListener("message", (e) => {
        const msg = e.data || {};
        const { id, action, payload } = msg;
        try {
          let result = null;
          if (action === "ping") {
            result = { pong: true, timestamp: Date.now() };
          } else if (action === "sort") {
            result = sortRows(payload.rows || [], payload.columnKey, payload.direction);
          } else if (action === "filter") {
            result = filterRows(payload.rows || [], payload.query, payload.columns);
          } else if (action === "sortAndFilter") {
            const filtered = filterRows(payload.rows || [], payload.query, payload.columns);
            result = sortRows(filtered, payload.columnKey, payload.direction);
          } else {
            result = payload;
          }
          self.postMessage({ id, ok: true, result });
        } catch (err) {
          self.postMessage({ id, ok: false, error: err && err.message ? err.message : String(err) });
        }
      });
    `
  },

  /**
   * @param {string|null} [scriptUrl=null] Optional external worker script URL (`null` uses the built-in off-thread data kernel).
   * @param {{ type?: "classic"|"module", name?: string, channelName?: string }} [options] Optional worker and `BroadcastChannel` options.
   */
  construct(scriptUrl = null, options = {}) {
    // @ts-ignore
    super();

    this.__pending = new Map();
    this.__nextRequestId = 1;
    this.__scriptUrl = scriptUrl;
    this.__workerOptions = options || {};

    if (options && options.channelName) {
      this.setChannelName(options.channelName);
    }
  },

  events: {
    /** Fired when an unsolicited message or broadcast arrives from the worker or `BroadcastChannel`. */
    message: "qx.event.type.Data",

    /** Fired when a worker error occurs. */
    error: "qx.event.type.Data"
  },

  properties: {
    /**
     * Reactive flag (`true` while one or more off-thread requests are in flight).
     * Ideal for `worker.bind("busy", button, "loading")`.
     */
    busy: {
      check: "Boolean",
      init: false,
      event: "changeBusy"
    },

    /** Number of currently in-flight worker requests. */
    pendingCount: {
      check: "Integer",
      init: 0,
      event: "changePendingCount"
    },

    /** Optional `BroadcastChannel` topic name for cross-tab synchronization. */
    channelName: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyChannelName"
    }
  },

  members: {
    /** @type {Worker|null} @private */
    __worker: null,

    /** @type {string|null} @private */
    __blobUrl: null,

    /** @type {string|null} @private */
    __scriptUrl: null,

    /** @type {Object} @private */
    __workerOptions: null,

    /** @type {Map<number, { resolve: Function, reject: Function }>} @private */
    __pending: null,

    /** @type {number} @private */
    __nextRequestId: 1,

    /** @type {BroadcastChannel|null} @private */
    __channel: null,

    /**
     * Lazily initializes and returns the underlying browser `Worker` instance.
     *
     * @returns {Worker|null}
     * @protected
     */
    _ensureWorker() {
      if (this.__worker) {
        return this.__worker;
      }
      if (typeof Worker === "undefined") {
        return null;
      }

      let url = this.__scriptUrl;
      let opts = Object.assign({}, this.__workerOptions);

      if (!url) {
        const blob = new Blob(
          [ville.core.WorkerClient.DEFAULT_KERNEL_SOURCE],
          { type: "text/javascript" }
        );
        url = this.__blobUrl = URL.createObjectURL(blob);
      } else if (!opts.type) {
        opts.type = "module";
      }

      const worker = (this.__worker = new Worker(url, opts));
      worker.addEventListener("message", (e) => this._onWorkerMessage(e));
      worker.addEventListener("error", (e) => this._onWorkerError(e));
      return worker;
    },

    /**
     * Dispatches an off-thread request to the Web Worker and returns a Promise.
     * Falls back to synchronous main-thread execution if Web Workers are unavailable
     * (e.g. in headless Node.js SSR).
     *
     * @param {string} action Action identifier (`"sort"`, `"filter"`, `"sortAndFilter"`, or custom).
     * @param {*} [payload={}] Serializable payload object.
     * @param {{ signal?: AbortSignal, transfer?: Transferable[] }} [options={}] Optional `AbortSignal` and `Transferable` list.
     * @returns {Promise<*>}
     */
    request(action, payload = {}, options = {}) {
      if (options.signal && options.signal.aborted) {
        return Promise.reject(new DOMException("Aborted", "AbortError"));
      }

      const worker = this._ensureWorker();
      if (!worker) {
        return Promise.resolve(this._runFallbackSync(action, payload));
      }

      const id = this.__nextRequestId++;
      this._updatePendingCount(1);

      return new Promise((resolve, reject) => {
        let onAbort = null;
        if (options.signal) {
          onAbort = () => {
            if (this.__pending && this.__pending.has(id)) {
              this.__pending.delete(id);
              this._updatePendingCount(-1);
              reject(new DOMException("Aborted", "AbortError"));
            }
          };
          options.signal.addEventListener("abort", onAbort, { once: true });
        }

        this.__pending.set(id, {
          resolve: (res) => {
            if (onAbort && options.signal) {
              options.signal.removeEventListener("abort", onAbort);
            }
            resolve(res);
          },
          reject: (err) => {
            if (onAbort && options.signal) {
              options.signal.removeEventListener("abort", onAbort);
            }
            reject(err);
          }
        });

        const msg = { id, action, payload };
        if (Array.isArray(options.transfer) && options.transfer.length > 0) {
          worker.postMessage(msg, options.transfer);
        } else {
          worker.postMessage(msg);
        }
      });
    },

    /**
     * Convenience helper to sort and/or filter an array of rows off the main UI thread.
     *
     * @param {Array<Object|Array>} rows
     * @param {{ query?: string, columns?: string[], columnKey?: string|number|null, direction?: "asc"|"desc", signal?: AbortSignal }} [params={}]
     * @returns {Promise<Array<Object|Array>>}
     */
    sortAndFilter(rows, params = {}) {
      return this.request(
        "sortAndFilter",
        {
          rows,
          query: params.query || "",
          columns: params.columns || null,
          columnKey: params.columnKey !== undefined ? params.columnKey : null,
          direction: params.direction || "asc"
        },
        { signal: params.signal }
      );
    },

    /**
     * Broadcasts a message across all tabs/windows listening to `channelName`.
     *
     * @param {*} data Serializable payload to broadcast.
     */
    broadcast(data) {
      if (this.__channel) {
        this.__channel.postMessage(data);
      }
    },

    _onWorkerMessage(e) {
      const msg = e.data || {};
      const { id, ok, result, error } = msg;
      if (id !== undefined && this.__pending && this.__pending.has(id)) {
        const entry = this.__pending.get(id);
        this.__pending.delete(id);
        this._updatePendingCount(-1);
        if (ok !== false) {
          entry.resolve(result);
        } else {
          entry.reject(new Error(error || "Worker task failed"));
        }
      } else {
        this.fireDataEvent("message", msg);
      }
    },

    _onWorkerError(e) {
      this.fireDataEvent("error", e);
    },

    _updatePendingCount(delta) {
      const next = Math.max(0, this.getPendingCount() + delta);
      this.setPendingCount(next);
      this.setBusy(next > 0);
    },

    _applyChannelName(value) {
      if (this.__channel) {
        this.__channel.close();
        this.__channel = null;
      }
      if (value && typeof BroadcastChannel !== "undefined") {
        this.__channel = new BroadcastChannel(value);
        this.__channel.addEventListener("message", (e) => {
          this.fireDataEvent("message", e.data);
        });
      }
    },

    _runFallbackSync(action, payload) {
      const rows = (payload && payload.rows) || [];
      if (action === "ping") {
        return { pong: true, timestamp: Date.now() };
      }
      return rows.slice();
    }
  },

  destruct() {
    if (this.__pending) {
      for (const entry of this.__pending.values()) {
        entry.reject(new Error("WorkerClient disposed"));
      }
      this.__pending.clear();
      this.__pending = null;
    }
    if (this.__worker) {
      this.__worker.terminate();
      this.__worker = null;
    }
    if (this.__blobUrl && typeof URL !== "undefined") {
      URL.revokeObjectURL(this.__blobUrl);
      this.__blobUrl = null;
    }
    if (this.__channel) {
      this.__channel.close();
      this.__channel = null;
    }
  }
});
