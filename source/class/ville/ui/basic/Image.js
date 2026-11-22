/**
 * Mode 3 CSS-driven Image widget (`ville.ui.basic.Image`) rendering a native
 * `<img>` element without `qx.io.ImageLoader` or `qx.util.AliasManager`.
 *
 * Supports direct URLs (`/assets/hero.webp`, `https://...`, `data:...`),
 * compiled Qooxdoo `source/resource/` asset IDs (`"villeuiapp/images/ville_logo.png"`),
 * and app-relative asset paths (`"images/ville_logo.png"`, automatically prefixed
 * with the active application's namespace when registered in `qx.util.ResourceManager`).
 *
 * @example
 * const logo = new ville.ui.basic.Image("images/ville_logo.png", "Ville Software Logo", 32, 32);
 */
qx.Class.define("ville.ui.basic.Image", {
  extend: ville.ui.core.Widget,

  /**
   * Creates a new native Image widget.
   *
   * @param {string|null} [source] Image URL, data URI, Qooxdoo resource ID, or app-relative asset path.
   * @param {string|null} [alt] Accessible alternative text (`alt` attribute).
   * @param {number|string|null} [width] Optional width (integer pixels or CSS length string such as `"32px"`).
   * @param {number|string|null} [height] Optional height (integer pixels or CSS length string such as `"32px"`).
   */
  construct(source, alt, width, height) {
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

    if (width != null) {
      this.setWidth(width);
    }

    if (height != null) {
      this.setHeight(height);
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
     * Image source URL, data URI, compiled `source/resource/` asset ID, or app-relative asset path.
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
     * Image width. Accepts a number (treated as pixels, setting both the HTML `width`
     * attribute for CLS reservation and inline CSS `width: <n>px`) or a CSS length string
     * (e.g., `"32px"`, `"2rem"`, `"100%"`).
     *
     * @type {number|string|null}
     */
    width: {
      check(value) {
        return typeof value === "number" || typeof value === "string";
      },
      nullable: true,
      init: null,
      apply: "_applyWidth",
      themeable: true,
      event: "changeWidth"
    },

    /**
     * Image height. Accepts a number (treated as pixels, setting both the HTML `height`
     * attribute for CLS reservation and inline CSS `height: <n>px`) or a CSS length string
     * (e.g., `"32px"`, `"2rem"`, `"auto"`).
     *
     * @type {number|string|null}
     */
    height: {
      check(value) {
        return typeof value === "number" || typeof value === "string";
      },
      nullable: true,
      init: null,
      apply: "_applyHeight",
      themeable: true,
      event: "changeHeight"
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
     * Creates the root `<img>` `ville.html.Element`.
     *
     * @returns {ville.html.Element} Root image element.
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element("img");
    },

    /**
     * Resolves a `source` identifier into a browser-ready URI:
     * 1. Checks `qx.util.ResourceManager` directly for exact resource IDs (`"villeuiapp/images/ville_logo.png"`).
     * 2. If not found and `source` is a relative path (`"images/ville_logo.png"`), prefixes the active
     *    application's root namespace (`"<appNs>/images/ville_logo.png"`) and checks `ResourceManager`.
     * 3. Falls back to returning `source` as a direct URI (`"https://..."`, `"data:..."`, `"resource/..."`).
     *
     * @param {string} source Raw source value, relative asset path, or Qooxdoo resource ID.
     * @returns {string} Resolved browser URI.
     * @protected
     */
    _resolveUri(source) {
      const rm = qx.util.ResourceManager.getInstance();
      if (rm.has(source)) {
        return rm.toUri(source);
      }

      if (
        !source.startsWith("http://") &&
        !source.startsWith("https://") &&
        !source.startsWith("data:") &&
        !source.startsWith("blob:") &&
        !source.startsWith("/") &&
        !source.startsWith("resource/")
      ) {
        const app = qx.core.Init.getApplication();
        if (app && app.classname) {
          const appNs = app.classname.split(".")[0];
          const namespacedId = appNs + "/" + source;
          if (rm.has(namespacedId)) {
            return rm.toUri(namespacedId);
          }
        }
      }

      return source;
    },

    /**
     * Property apply handler for `source`.
     *
     * @this {ville.ui.basic.Image}
     * @param {string|null} value New image source.
     * @protected
     */
    _applySource(value) {
      const el = this.getContentElement();
      if (!value) {
        this.removeState("loading");
        this.removeState("loaded");
        this.removeState("failed");
        el.removeAttribute("src");
        return;
      }

      this.removeState("loaded");
      this.removeState("failed");
      this.addState("loading");

      el.setAttribute("src", this._resolveUri(value));
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
     * Property apply handler for `width`.
     *
     * @this {ville.ui.basic.Image}
     * @param {number|string|null} value Width in pixels or CSS length string.
     * @protected
     */
    _applyWidth(value) {
      const el = this.getContentElement();
      if (value == null) {
        el.removeStyle("width");
        if (this.getIntrinsicWidth() == null) {
          el.removeAttribute("width");
        }
        return;
      }

      if (typeof value === "number") {
        el.setAttribute("width", String(value));
        el.setStyle("width", `${value}px`);
      } else {
        el.setStyle("width", value);
      }
    },

    /**
     * Property apply handler for `height`.
     *
     * @this {ville.ui.basic.Image}
     * @param {number|string|null} value Height in pixels or CSS length string.
     * @protected
     */
    _applyHeight(value) {
      const el = this.getContentElement();
      if (value == null) {
        el.removeStyle("height");
        if (this.getIntrinsicHeight() == null) {
          el.removeAttribute("height");
        }
        return;
      }

      if (typeof value === "number") {
        el.setAttribute("height", String(value));
        el.setStyle("height", `${value}px`);
      } else {
        el.setStyle("height", value);
      }
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
      } else if (typeof this.getWidth() !== "number") {
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
      } else if (typeof this.getHeight() !== "number") {
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
