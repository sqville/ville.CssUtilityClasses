/**
 * Lightweight standalone Icon widget (`ville.ui.basic.Icon`) for placing a
 * non-interactive decorative icon directly inside a layout container (`HGroup`,
 * `VStack`, `Box`).
 *
 * For icons inside interactive controls (`Button`, `MenuButton`, `Menu.Button`,
 * `CheckBox`, `SelectBox`, `ComboBox`, `Tree`, `Table`), pass the icon key or
 * Iconify token string directly to the control (`new ville.ui.form.Button("Save", "CHECK")`),
 * which renders a native `ville.html.Element` via `ville.ui.icon.Default.createElement()`
 * with zero extra `Widget` instance overhead.
 *
 * @example
 * const checkIcon = new ville.ui.basic.Icon("CHECK", 20);
 * const planeIcon = new ville.ui.basic.Icon("i-fluent-airplane-20-regular", 24);
 */
qx.Class.define("ville.ui.basic.Icon", {
  extend: ville.ui.core.Widget,

  /**
   * Creates a standalone Icon widget.
   *
   * @param {string|Object} [name="CHECK"] Built-in glyph key (`"CHECK"`, `"AIRPLANE"`), Iconify class (`"i-tabler-check"`), or raw `<svg>`.
   * @param {number|null} [size=null] Optional explicit pixel width and height.
   * @param {boolean} [useSprite=false] Whether to render via `<use href="#...">` global sprite sheet.
   */
  construct(name = "CHECK", size = null, useSprite = false) {
    this.__initialName = name || "CHECK";
    this.__initialSize = size;
    this.__useSprite = Boolean(useSprite);

    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    if (name != null) {
      this.setName(name);
    }
    if (size != null) {
      this.setSize(size);
    }
  },

  properties: {
    /**
     * Built-in `ville.ui.icon.Default` glyph key (`"CHECK"`, `"CHEVRON_DOWN"`, `"AIRPLANE"`),
     * Iconify CSS token (`"i-tabler-check"`), or raw `<svg>` markup.
     */
    name: {
      check: "String",
      nullable: true,
      apply: "_applyName",
      themeable: true,
      event: "changeName"
    },

    /**
     * Explicit pixel width/height (`null` scales natively with `1em` CSS `font-size`).
     */
    size: {
      check: "Number",
      nullable: true,
      apply: "_applySize",
      themeable: true,
      event: "changeSize"
    }
  },

  members: {
    /** @type {string|Object} @private */
    __initialName: "CHECK",

    /** @type {number|null} @private */
    __initialSize: null,

    /** @type {boolean} @private */
    __useSprite: false,

    /**
     * @override
     * @this {ville.ui.basic.Icon}
     * @returns {ville.html.Element} Native `<svg>` or `<span class="i-...">` element.
     * @protected
     */
    _createContentElement() {
      return (
        ville.ui.icon.Default.createElement(this.__initialName, {
          size: this.__initialSize,
          useSprite: this.__useSprite
        }) || new ville.html.Element("span")
      );
    },

    /**
     * Property apply handler for `name`.
     *
     * @this {ville.ui.basic.Icon}
     * @param {string|null} value New icon name or token.
     * @protected
     */
    _applyName(value) {
      if (!value) {
        return;
      }
      const el = this.getContentElement();
      const upperKey = value.toUpperCase().replace(/-/g, "_");
      const glyph = ville.ui.icon.Default.GLYPHS[upperKey];
      if (glyph && el.getNodeName() === "svg") {
        el.setAttribute("viewBox", glyph.viewBox || "0 0 24 24");
        const domEl = el.getDomElement();
        if (domEl) {
          if (this.__useSprite && glyph.id) {
            ville.ui.icon.Default.ensureSpriteSymbol(glyph.id, glyph.viewBox, glyph.markup);
            domEl.innerHTML = `<use href="#${glyph.id}"></use>`;
          } else {
            domEl.innerHTML = glyph.markup;
          }
        }
      } else if (value.startsWith("i-") || value.includes(":")) {
        const iconClass = value.includes(":") ? "i-" + value.replace(/:/g, "-") : value;
        el.setAttribute("class", iconClass);
      }
    },

    /**
     * Property apply handler for `size`.
     *
     * @this {ville.ui.basic.Icon}
     * @param {number|null} value Explicit pixel width/height.
     * @protected
     */
    _applySize(value) {
      const el = this.getContentElement();
      if (!el) {
        return;
      }
      if (value != null) {
        const dim = `${value}px`;
        if (el.getNodeName() === "svg") {
          el.setAttribute("width", dim);
          el.setAttribute("height", dim);
        } else {
          el.setStyles({ width: dim, height: dim });
        }
      } else {
        if (el.getNodeName() === "svg") {
          el.setAttribute("width", "1em");
          el.setAttribute("height", "1em");
        } else {
          el.removeStyle("width");
          el.removeStyle("height");
        }
      }
    }
  }
});
