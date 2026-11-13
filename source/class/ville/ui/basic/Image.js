/**
 * A modern CSS-driven Image widget supporting managed resources, external URIs, and fallbacks.
 */
qx.Class.define("ville.ui.basic.Image", {
  extend: ville.ui.core.Widget,

  /**
   * @param source {String?null} The URL or resource ID of the image to display.
   */
  construct(source) {

    super();

    if (source) {
      this.setSource(source);
    }
    
  },

  properties: {
    appearance: {
      refine: true,
      init: "image"
    },

    /**
     * The URL or resource ID of the image.
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
     * Whether the image should scale to fill its container (CSS object-fit: contain/cover).
     */
    scale: {
      check: "Boolean",
      init: false,
      event: "changeScale",
      themeable: true,
      apply: "_applyScale"
    },

    /**
     * Fallback URL if the primary source fails to load.
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

    /** Fired when the loading request is aborted. */
    aborted: "qx.event.type.Event"
  },

  members: {
    __sourceToDisplay: null,
    __failedToLoad: false,
    __requestId: 0,

    _createContentElement() {
      const el = new qx.html.Image("img");
      el.setScale(this.getScale());
      el.setStyles({
        display: "inline-block",
        verticalAlign: "middle",
        boxSizing: "border-box"
      });
      return el;
    },

    // --- Property Appliers ---

    _applySource(value, old) {
      if (old && qx.io.ImageLoader.isLoading(old)) {
        qx.io.ImageLoader.abort(old);
      }

      this.__failedToLoad = false;
      this.__sourceToDisplay = value;
      this._styleSource();
    },

    _applyScale(value) {
      const el = this.getContentElement();
      el.setScale(value);
      el.setStyle("objectFit", value ? "contain" : "none");
    },

    // --- Image Resolution & Loading ---

    _styleSource() {
      const aliasManager = qx.util.AliasManager.getInstance();
      const resourceManager = qx.util.ResourceManager.getInstance();

      const source = aliasManager.resolve(this.__sourceToDisplay);
      const el = this.getContentElement();

      if (!source) {
        el.resetSource();
        return;
      }

      // 1. Managed Resource (compiled into app)
      if (resourceManager.has(source)) {
        el.setSource(resourceManager.toUri(source));
        this.__fireLoadEvent();
      }
      // 2. Already loaded unmanaged image
      else if (qx.io.ImageLoader.isLoaded(source)) {
        el.setSource(source);
        this.__fireLoadEvent();
      }
      // 3. Unmanaged external URL (requires asynchronous preloading)
      else {
        this.__loadUnmanagedImage(el, source);
      }
    },

    __loadUnmanagedImage(el, source) {
      if (!qx.io.ImageLoader.isFailed(source)) {
        qx.io.ImageLoader.load(source, this.__loaderCallback, this);
      } else {
        el.resetSource();
        if (!this.__failedToLoad && this.getFallbackSource()) {
          this.__failedToLoad = true;
          this.__sourceToDisplay = this.getFallbackSource();
          this._styleSource();
        }
      }
    },

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

      this.fireEvent("loaded");
      this.getContentElement().setSource(source);
    },

    __fireLoadEvent() {
      this.__requestId++;
      qx.bom.AnimationFrame.request(
        function(rId) {
          if (rId === this.__requestId) {
            this.fireEvent("loaded");
          } else {
            this.fireEvent("aborted");
          }
        }.bind(this, this.__requestId)
      );
    },

    tryReload() {
      if (!this.__failedToLoad) {
        return;
      }
      this.__failedToLoad = false;
      this.__sourceToDisplay = this.getSource();
      qx.io.ImageLoader.load(this.getSource(), () => this._styleSource(), undefined, {
        retryFailed: true
      });
    },

    hasFailedToLoad() {
      return this.__failedToLoad;
    }
  },

  destruct() {
    this.__sourceToDisplay = null;
  }
});
