/**
 * Mode 3 CSS-driven Image widget (`ville.ui.basic.Image`) supporting managed
 * Qooxdoo resources (`ResourceManager`), path aliases (`AliasManager`),
 * asynchronous external URIs (`qx.io.ImageLoader`), and fallback sources.
 *
 * Renders a flat `<img>` element via `qx.html.Image("img")` with zero `QxLayout`
 * dependencies, delegating sizing and `object-fit` styling to CSS or Appearance themes.
 *
 * @example
 * const img = new ville.ui.basic.Image("myapp/hero.png");
 * img.setFallbackSource("myapp/placeholder.png");
 * img.setScale(true);
 */
qx.Class.define("ville.ui.basic.Image", {
  extend: ville.ui.core.Widget,

  /**
   * Creates a new Image widget instance.
   *
   * @param {string|null} [source] URL or managed resource ID of the image to display.
   */
  construct(source) {
    super();

    if (source) {
      this.setSource(source);
    }
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"image"`).
     */
    appearance: {
      refine: true,
      init: "image"
    },

    /**
     * URL, alias, or managed Qooxdoo resource ID of the image.
     */
    source: {
      check: "String",
      init: null,
      nullable: true,
      event: "changeSource",
      apply: "_applySource",
      themeable: true
    },

    /**
     * Whether the image scales proportionally to fit its container (`object-fit: contain`).
     * When `false`, no inline `object-fit` style is forced so CSS rules remain in control.
     */
    scale: {
      check: "Boolean",
      init: false,
      event: "changeScale",
      themeable: true,
      apply: "_applyScale"
    },

    /**
     * Fallback URL or resource ID displayed if the primary `source` fails to load.
     */
    fallbackSource: {
      check: "String",
      init: null,
      nullable: true,
      event: "changeFallbackSource"
    }
  },

  events: {
    /** Fired when the image source fails to load. */
    loadingFailed: "qx.event.type.Event",

    /** Fired when the image has loaded successfully. */
    loaded: "qx.event.type.Event",

    /** Fired when an in-flight image loading request is aborted. */
    aborted: "qx.event.type.Event"
  },

  members: {
    /** @type {string|null} @private */
    __sourceToDisplay: null,

    /** @type {boolean} @private */
    __failedToLoad: false,

    /** @type {number} @private */
    __requestId: 0,

    /**
     * Creates a native `<img>` virtual DOM element via `qx.html.Image("img")`
     * without injecting inline layout styles that would override CSS stylesheets.
     *
     * @returns {qx.html.Image} Root image element.
     * @protected
     */
    _createContentElement() {
      const el = new qx.html.Image("img");
      // el.setScale(this.getScale());
      el.setScale(true);
      return el;
    },

    // --- Property Appliers ---

    /**
     * Property apply handler for `source`. Aborts any in-flight load for the
     * resolved previous URI and initiates resolution/loading for `value`.
     *
     * @param {string|null} value New image URL or resource ID.
     * @param {string|null} old Previous image URL or resource ID.
     * @protected
     */
    _applySource(value, old) {
      if (old) {
        const resolvedOld = qx.util.AliasManager.getInstance().resolve(old);
        if (resolvedOld && qx.io.ImageLoader.isLoading(resolvedOld)) {
          qx.io.ImageLoader.abort(resolvedOld);
        }
      }

      this.__failedToLoad = false;
      this.__sourceToDisplay = value;
      this._styleSource();
    },

    /**
     * Property apply handler for `scale`.
     *
     * @param {boolean} value Whether proportional scaling is enabled.
     * @protected
     */
    _applyScale(value) {
      const el = this.getContentElement();
      el.setScale(value);
      if (value) {
        el.setStyle("object-fit", "contain", true);
      } else {
        el.removeStyle("object-fit", true);
      }
    },

    // --- Image Resolution & Loading ---

    /**
     * Resolves `__sourceToDisplay` via `AliasManager` and `ResourceManager`,
     * applying cached/managed URIs immediately or preloading external URLs via
     * `qx.io.ImageLoader`.
     *
     * @protected
     */
    _styleSource() {
      const aliasManager = qx.util.AliasManager.getInstance();
      const resourceManager = qx.util.ResourceManager.getInstance();

      const source = aliasManager.resolve(this.__sourceToDisplay);
      const el = this.getContentElement();

      if (!source) {
        el.resetSource();
        qx.html.Element.flush();
        return;
      }

      // 1. Managed Resource (compiled into app)
      if (resourceManager.has(source)) {
        el.setSource(resourceManager.toUri(source));
        qx.html.Element.flush();
        this.__fireLoadEvent();
      }
      // 2. Already loaded unmanaged image
      else if (qx.io.ImageLoader.isLoaded(source)) {
        el.setSource(source);
        qx.html.Element.flush();
        this.__fireLoadEvent();
      }
      // 3. Unmanaged external URL (requires asynchronous preloading)
      else {
        this.__loadUnmanagedImage(el, source);
      }
    },

    /**
     * Preloads an external image URL via `qx.io.ImageLoader` or switches to
     * `fallbackSource` if the URL has already failed previously.
     *
     * @param {qx.html.Image} el Target image content element.
     * @param {string} source Resolved external URI.
     * @private
     */
    __loadUnmanagedImage(el, source) {
      if (!qx.io.ImageLoader.isFailed(source)) {
        qx.io.ImageLoader.load(source, this.__loaderCallback, this);
      } else {
        el.resetSource();
        qx.html.Element.flush();
        if (!this.__failedToLoad && this.getFallbackSource()) {
          this.__failedToLoad = true;
          this.__sourceToDisplay = this.getFallbackSource();
          this._styleSource();
        }
      }
    },

    /**
     * Callback invoked by `qx.io.ImageLoader` when an external image finishes
     * loading, fails, or is aborted.
     *
     * @param {string} source Resolved URI that completed loading.
     * @param {Object} imageInfo Status metadata returned by `qx.io.ImageLoader`.
     * @private
     */
    __loaderCallback(source, imageInfo) {
      if (this.isDisposed()) {
        return;
      }

      const resolvedCurrent = qx.util.AliasManager.getInstance().resolve(this.__sourceToDisplay);
      if (source !== resolvedCurrent) {
        this.fireEvent("aborted");
        return;
      }

      if (imageInfo.failed) {
        this.fireEvent("loadingFailed");
        if (!this.__failedToLoad && this.getFallbackSource()) {
          this.__failedToLoad = true;
          this.__sourceToDisplay = this.getFallbackSource();
          this._styleSource();
        }
        return;
      }

      if (imageInfo.aborted) {
        this.fireEvent("aborted");
        return;
      }

      this.getContentElement().setSource(source);
      qx.html.Element.flush();
      this.fireEvent("loaded");
    },

    /**
     * Schedules an asynchronous `"loaded"` (or `"aborted"` if superseded) event
     * on the next animation frame for cached or managed resources.
     *
     * @private
     */
    __fireLoadEvent() {
      this.__requestId++;
      const currentRequestId = this.__requestId;

      qx.bom.AnimationFrame.request(() => {
        if (this.isDisposed()) {
          return;
        }

        if (currentRequestId === this.__requestId) {
          this.fireEvent("loaded");
        } else {
          this.fireEvent("aborted");
        }
      });
    },

    /**
     * Retries loading the primary `source` after a previous failure.
     */
    tryReload() {
      if (!this.__failedToLoad || !this.getSource()) {
        return;
      }

      const resolvedSource = qx.util.AliasManager.getInstance().resolve(this.getSource());
      this.__failedToLoad = false;
      this.__sourceToDisplay = this.getSource();

      qx.io.ImageLoader.load(
        resolvedSource,
        () => {
          if (!this.isDisposed()) {
            this._styleSource();
          }
        },
        this,
        { retryFailed: true }
      );
    },

    /**
     * Returns whether the primary image source failed to load.
     *
     * @returns {boolean} `true` if loading failed.
     */
    hasFailedToLoad() {
      return this.__failedToLoad;
    }
  },

  /**
   * Clears cached source string references on disposal.
   */
  destruct() {
    this.__sourceToDisplay = null;
  }
});
