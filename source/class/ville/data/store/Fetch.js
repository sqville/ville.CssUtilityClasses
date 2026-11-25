/**
 * Browser-native `fetch()` + `AbortController` reactive JSON store
 * (`ville.data.store.Fetch` — `STRAT-CORE-09` #7 & `STRAT-QX7-01` Tier 1).
 *
 * Replaces `qx.data.store.Json` and `qx.io.request.Xhr` while preserving the exact
 * `url`, `model`, and `state` properties plus `loaded`, `error`, and `parseError`
 * events expected by Qooxdoo data bindings (`store.bind("model", controller, "model")`).
 *
 * Key Web API upgrades:
 * - Uses native `fetch()` + `AbortController` to automatically cancel in-flight
 *   HTTP requests when `url` changes, `abort()` is called, or the store is disposed.
 * - Composes `AbortSignal.timeout(ms)` (`STRAT-CORE-06`, Baseline Apr 2024) when
 *   `timeout` is configured.
 * - Uses `ville.data.marshal.Json` (`Proxy`-backed reactive JSON marshaling) with
 *   zero runtime `qx.Class.define` overhead.
 */
qx.Class.define("ville.data.store.Fetch", {
  extend: qx.core.Object,

  /**
   * @param {string|null} [url=null] Optional URL to fetch immediately on construction.
   * @param {Object|null} [delegate=null] Optional store delegate (`manipulateData`, `configureRequest`).
   * @param {RequestInit} [requestInit] Optional native `fetch()` initialization options.
   */
  construct(url = null, delegate = null, requestInit) {
    // @ts-ignore
    super();

    this._marshaler = new ville.data.marshal.Json(delegate);
    this._delegate = delegate;
    this.__requestInit = requestInit || null;

    if (url != null) {
      this.setUrl(url);
    }
  },

  events: {
    /**
     * Fired after the JSON response has been marshaled into a reactive `model`.
     */
    loaded: "qx.event.type.Data",

    /**
     * Fired when JSON parsing fails.
     */
    parseError: "qx.event.type.Data",

    /**
     * Fired when a network, HTTP status, timeout, or abort error occurs.
     */
    error: "qx.event.type.Data"
  },

  properties: {
    /**
     * Reactive model instance created from the fetched JSON payload.
     */
    model: {
      nullable: true,
      init: null,
      event: "changeModel"
    },

    /**
     * Lifecycle state of the current `fetch()` request (100% compatible with `qx.data.store.Json`).
     */
    state: {
      check: [
        "configured",
        "queued",
        "sending",
        "receiving",
        "completed",
        "aborted",
        "timeout",
        "failed"
      ],
      init: "configured",
      event: "changeState"
    },

    /**
     * Target endpoint URL. Setting a non-null URL automatically starts a `fetch()` request.
     */
    url: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyUrl",
      event: "changeUrl"
    },

    /**
     * Whether a `fetch()` request is currently in flight (`true` during `"sending"` / `"receiving"`).
     * Convenient for binding directly to button/widget `loading` states (`store.bind("loading", btn, "loading")`).
     */
    loading: {
      check: "Boolean",
      init: false,
      event: "changeLoading"
    },

    /**
     * Optional request timeout in milliseconds (uses `AbortSignal.timeout(ms)` when `> 0`).
     */
    timeout: {
      check: "Integer",
      nullable: true,
      init: null
    }
  },

  members: {
    /** @type {ville.data.marshal.Json|null} @protected */
    _marshaler: null,

    /** @type {Object|null} @protected */
    _delegate: null,

    /** @type {RequestInit|null} @private */
    __requestInit: null,

    /** @type {AbortController|null} @private */
    __abortController: null,

    /**
     * Property apply handler for `url`.
     *
     * @param {string|null} value New URL.
     * @protected
     */
    _applyUrl(value) {
      if (value != null) {
        let resolvedUrl = value;
        if (qx.util?.AliasManager) {
          resolvedUrl = qx.util.AliasManager.getInstance().resolve(resolvedUrl);
        }
        if (qx.util?.ResourceManager) {
          resolvedUrl = qx.util.ResourceManager.getInstance().toUri(resolvedUrl);
        }
        this._createRequest(resolvedUrl);
      }
    },

    /**
     * Aborts any in-flight `fetch()` request.
     */
    abort() {
      if (this.__abortController) {
        this.__abortController.abort();
        this.__abortController = null;
        this.setLoading(false);
        this.setState("aborted");
      }
    },

    /**
     * Reloads the JSON data from the current `url`.
     *
     * @param {RequestInit} [overrideInit] Optional per-call `fetch()` options.
     * @returns {Promise<*>|null} Promise resolving to the reactive model, or `null`.
     */
    reload(overrideInit) {
      const url = this.getUrl();
      if (url != null) {
        return this._createRequest(url, overrideInit);
      }
      return null;
    },

    /**
     * Executes the native `fetch()` request with automatic `AbortController` and
     * `AbortSignal.timeout()` management.
     *
     * @param {string} url Resolved request URL.
     * @param {RequestInit} [overrideInit] Optional per-call `fetch()` options.
     * @returns {Promise<*>} Promise resolving to the marshaled model.
     * @protected
     */
    async _createRequest(url, overrideInit) {
      // Cancel any previous in-flight request
      if (this.__abortController) {
        this.__abortController.abort();
      }

      const controller = new AbortController();
      this.__abortController = controller;

      const timeoutMs = this.getTimeout();
      let signal = controller.signal;
      if (
        timeoutMs &&
        timeoutMs > 0 &&
        typeof AbortSignal !== "undefined" &&
        typeof AbortSignal.any === "function" &&
        typeof AbortSignal.timeout === "function"
      ) {
        signal = AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(timeoutMs)
        ]);
      }

      const init = Object.assign(
        {
          method: "GET",
          headers: { Accept: "application/json" }
        },
        this.__requestInit || {},
        overrideInit || {},
        { signal }
      );

      if (this._delegate && typeof this._delegate.configureRequest === "function") {
        this._delegate.configureRequest(init);
      }

      this.setLoading(true);
      this.setState("sending");

      try {
        const response = await fetch(url, init);
        if (this.isDisposed() || this.__abortController !== controller) {
          return null;
        }

        this.setState("receiving");

        if (!response.ok) {
          this.setLoading(false);
          this.setState("failed");
          this.fireDataEvent("error", response);
          return null;
        }

        const rawText = await response.text();
        if (this.isDisposed() || this.__abortController !== controller) {
          return null;
        }

        let data;
        try {
          data = rawText ? JSON.parse(rawText) : null;
        } catch (parseErr) {
          this.setLoading(false);
          this.setState("failed");
          this.fireDataEvent("parseError", { response, error: parseErr });
          return null;
        }

        if (this._delegate && typeof this._delegate.manipulateData === "function") {
          data = this._delegate.manipulateData(data);
        }

        const oldModel = this.getModel();
        const newModel = this._marshaler.toModel(data, true);
        this.setModel(newModel);

        if (
          oldModel &&
          oldModel !== newModel &&
          typeof oldModel.dispose === "function" &&
          !oldModel.isDisposed()
        ) {
          oldModel.dispose();
        }

        this.__abortController = null;
        this.setLoading(false);
        this.setState("completed");
        this.fireDataEvent("loaded", newModel);
        return newModel;
      } catch (err) {
        if (this.isDisposed()) {
          return null;
        }
        this.setLoading(false);
        if (err && err.name === "TimeoutError") {
          this.setState("timeout");
        } else if (err && err.name === "AbortError") {
          this.setState("aborted");
        } else {
          this.setState("failed");
        }
        this.fireDataEvent("error", err);
        return null;
      }
    }
  },

  destruct() {
    if (this.__abortController) {
      this.__abortController.abort();
      this.__abortController = null;
    }
    this._disposeObjects("_marshaler");
    this._delegate = null;
    this.__requestInit = null;
  }
});
