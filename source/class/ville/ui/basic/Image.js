/**
* Mode 3 CSS-driven Image widget (`ville.ui.basic.Image`) rendering a native
* `<img>` element without `qx.io.ImageLoader` or `qx.util.AliasManager`.
*
* Supports both direct URLs (`/assets/hero.webp`, `https://...`, `data:...`)
* and compiled Qooxdoo `source/resource/` asset IDs (`"villeuiapp/logo.svg"`).
*
* @example
* const logo = new ville.ui.basic.Image("villeuiapp/logo.svg", "Application Logo");
* logo.setFit("contain");
* logo.setLoading("eager");
*/
qx.Class.define("ville.ui.basic.Image", {
  extend: ville.ui.core.Widget,

  /**
  * Creates a new native Image widget.
  *
  * @param {string|null} [source] Image URL, data URI, or `source/resource/` asset ID.
  * @param {string|null} [alt] Accessible alternative text (`alt` attribute).
  */
  construct(source, alt) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    this.initLoading();
    this.initDecoding();

    const contentEl = this.getContentElement();
    contentEl.addListener("load", this._onNativeLoad, this);
    contentEl.addListener("error", this._onNativeError, this);

    if (alt != null) {
      this.setAlt(alt);
    }

    if (source != null) {
      this.setSource(source);
    }

  },

  events: {
    /** Fired when the image has finished loading and decoding. */
    loaded: "qx.event.type.Event",
    /** Fired when the browser fails to load the image resource. */
    loadingFailed: "qx.event.type.Event"
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
    * Image source URL, data URI, or compiled `source/resource/` asset ID.
    * Marked `themeable: true` so Appearance themes can supply default or state-based images.
    */
    source: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applySource",
      themeable: true,
      event: "changeSource"
    },

    /**
    * Accessible alternative text applied to the native `alt` attribute.
    */
    alt: {
      check: "String",
      nullable: true,
      init: "",
      apply: "_applyAlt",
      event: "changeAlt"
    },

    /**
    * Native browser lazy-loading hint (`"lazy"` or `"eager"`).
    */
    loading: {
      check: ["lazy", "eager"],
      init: "lazy",
      apply: "_applyLoading",
      themeable: true,
      event: "changeLoading"
    },

    /**
    * Native browser image decoding hint (`"async"`, `"sync"`, or `"auto"`).
    */
    decoding: {
      check: ["async", "sync", "auto"],
      init: "async",
      apply: "_applyDecoding",
      themeable: true,
      event: "changeDecoding"
    },

    /**
    * CSS `object-fit` behavior (`"contain"`, `"cover"`, `"fill"`, `"none"`, or `"scale-down"`).
    * Synchronizes the `"fit-<value>"` widget state for the active Appearance theme.
    */
    fit: {
      check: ["contain", "cover", "fill", "none", "scale-down"],
      nullable: true,
      init: null,
      apply: "_applyFit",
      themeable: true,
      event: "changeFit"
    },

    /**
    * Intrinsic HTML `width` attribute (in pixels) to reserve aspect ratio and prevent CLS.
    */

    intrinsicWidth: {
      check: "Integer",
      nullable: true,
      init: null,
      apply: "_applyIntrinsicWidth",
      event: "changeIntrinsicWidth"
    },

    /**
    * Intrinsic HTML `height` attribute (in pixels) to reserve aspect ratio and prevent CLS.
    */
    intrinsicHeight: {
      check: "Integer",
      nullable: true,
      init: null,
      apply: "_applyIntrinsicHeight",
      event: "changeIntrinsicHeight"
    }

  },

  members: {
    /**
    * Creates the root `<img>` `qx.html.Element`.
    *
    * @returns {qx.html.Element} Root image element.
    * @protected
    */
    _createContentElement() {
      return new qx.html.Element("img");
    },

    /**
    * Resolves a `source` identifier into a browser-ready URI.
    * If `source` matches a registered `@asset(...)` entry in `qx.util.ResourceManager`,
    * returns its compiled, cache-busted URI; otherwise passes direct URLs through unchanged.
    *
    * @param {string} source Raw source value or Qooxdoo resource ID.
    * @returns {string} Resolved browser URI.
    * @protected
    */
    _resolveUri(source) {
      const rm = qx.util.ResourceManager.getInstance();
      return rm.has(source) ? rm.toUri(source) : source;
    },

    /**
    * Property apply handler for `source`.
    *
    * @this {ville.ui.basic.Image}
    * @param {string|null} value New image source.
    * @protected
    */
    _applySource(value) {
      if (!value) {
        this.removeState("loading");
        this.removeState("loaded");
        this.removeState("failed");
        this.removeAttribute("src");
        return;
      }

      this.removeState("loaded");
      this.removeState("failed");
      this.addState("loading");

      this.getContentElement().setAttribute("src", this._resolveUri(value));

    },

    /**
    * Property apply handler for `alt`.
    *
    * @this {ville.ui.basic.Image}
    * @param {string|null} value Alternative text.
    * @protected
    */
    _applyAlt(value) {
      this.getContentElement().setAttribute("alt", value != null ? value : "");
    },

    /**
    * Property apply handler for `loading`.
    *
    * @this {ville.ui.basic.Image}
    * @param {"lazy"|"eager"} value Loading strategy.
    * @protected
    */
    _applyLoading(value) {
      this.getContentElement().setAttribute("loading", value);
    },

    /**
    * Property apply handler for `decoding`.
    *
    * @this {ville.ui.basic.Image}
    * @param {"async"|"sync"|"auto"} value Decoding hint.
    * @protected
    */
    _applyDecoding(value) {
      this.getContentElement().setAttribute("decoding", value);
    },

    /**
    * Property apply handler for `fit`. Synchronizes `"fit-<value>"`.
    *
    * @this {ville.ui.basic.Image}
    * @param {"contain"|"cover"|"fill"|"none"|"scale-down"|null} value New fit mode.
    * @param {"contain"|"cover"|"fill"|"none"|"scale-down"|null} old Previous fit mode.
    * @protected
    */
    _applyFit(value, old) {
      this._syncModifierState("fit", value, old);
    },

    /**
    * Property apply handler for `intrinsicWidth`.
    *
    * @this {ville.ui.basic.Image}
    * @param {number|null} value Width in pixels.
    * @protected
    */
    _applyIntrinsicWidth(value) {
      if (value != null) {
        this.getContentElement().setAttribute("width", String(value));
      } else {
        this.getContentElement().removeAttribute("width");
      }

    },

    /**
    * Property apply handler for `intrinsicHeight`.
    *
    * @this {ville.ui.basic.Image}
    * @param {number|null} value Height in pixels.
    * @protected
    */
    _applyIntrinsicHeight(value) {
      if (value != null) {
        this.getContentElement().setAttribute("height", String(value));
      } else {
        this.getContentElement().removeAttribute("height");
      }
    },

    /**
    * Handles native `<img>` `load` events, awaiting `img.decode()` before
    * transitioning to `"loaded"` and firing `loaded`.
    *
    * @this {ville.ui.basic.Image}
    * @protected
    */
    async _onNativeLoad() {
      const domEl = /** @type {HTMLImageElement|null} */ (
        this.getContentElement().getDomElement()
      );

      if (domEl && typeof domEl.decode === "function") {
        try {
          await domEl.decode();
        } catch (_) {
          // Ignore decode rejections on empty or non-raster SVG sources
        }
      }

      if (!this.isDisposed()) {
        this.removeState("loading");
        this.removeState("failed");
        this.addState("loaded");
        this.fireEvent("loaded");
      }

    },

    /**
    * Handles native `<img>` `error` events.
    *
    * @this {ville.ui.basic.Image}
    * @protected
    */
    _onNativeError() {
      if (!this.isDisposed()) {
        this.removeState("loading");
        this.removeState("loaded");
        this.addState("failed");
        this.fireEvent("loadingFailed");
      }
    }

  },

    
  /**
  * Detaches native `load` and `error` listeners on widget disposal.
  */

  destruct() {
    const contentEl = this.getContentElement();
    if (contentEl) {
      contentEl.removeListener("load", this._onNativeLoad, this);
      contentEl.removeListener("error", this._onNativeError, this);
    }

  }
});
