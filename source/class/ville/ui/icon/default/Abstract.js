qx.Class.define("ville.ui.icon.default.Abstract", {
  extend: ville.ui.core.Widget,
  type: "abstract",

  statics: {
    __spriteDefs: null,
    __registeredSymbols: {},

    /**
     * Converts a raw SVG `d` string into a valid CSS `clip-path: path('...')` value.
     */
    toClipPath(pathData) {
      if (!pathData) return "none";
      return pathData.startsWith("path(") ? pathData : `path('${pathData}')`;
    },

    /**
     * Registers an icon's path data once in the global DOM <defs> sprite sheet.
     */
    ensureSpriteSymbol(symbolId, viewBox, innerMarkup) {
      if (this.__registeredSymbols[symbolId]) {
        return;
      }

      if (!this.__spriteDefs) {
        const svgNS = "[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)";
        const spriteSvg = document.createElementNS(svgNS, "svg");
        spriteSvg.setAttribute("id", "ville-icon-sprite-sheet");
        spriteSvg.setAttribute("aria-hidden", "true");
        spriteSvg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;";

        const defs = document.createElementNS(svgNS, "defs");
        spriteSvg.appendChild(defs);
        document.body.appendChild(spriteSvg);
        this.__spriteDefs = defs;
      }

      const svgNS = "[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)";
      const symbol = document.createElementNS(svgNS, "symbol");
      symbol.setAttribute("id", symbolId);
      symbol.setAttribute("viewBox", viewBox);
      symbol.innerHTML = innerMarkup;

      this.__spriteDefs.appendChild(symbol);
      this.__registeredSymbols[symbolId] = true;
    }
  },

  /**
   * @param size {Integer?null} Optional explicit pixel width/height
   * @param iconStyle {String?"regular"} "regular" or "filled"
   * @param useSprite {Boolean?false} If true, uses <symbol>/<use> sprite deduplication
   */
  construct(size, iconStyle, useSprite) {
    
    if (qx.core.Environment.get("qx.debug")) {
        if (iconStyle !== undefined) {
            qx.core.Assert.assertInArray(
            iconStyle, 
            ["regular", "filled"], 
            `Invalid value for '${iconStyle}'. Allowed values are 'regular' or 'filled'.`
            );
        }
        if (useSprite !== undefined) {
            qx.core.Assert.assertBoolean(
            useSprite,
            `Invalid value for '${useSprite}'. Must be true or false.`
            );
        }
    }

    if (iconStyle != null) {
      this.__initialStyle = iconStyle;
    }

    if (useSprite != null) {
      this.__useSprite = useSprite;
    }

    super();

    if (iconStyle != null) {
      this.setIconStyle(iconStyle);
    }

    if (size != null) {
      this.setSize(size);
    }
  },

  properties: {
    iconStyle: {
      check: ["regular", "filled"],
      init: "regular",
      apply: "_applyIconStyle",
      themeable: true,
      event: "changeIconStyle"
    },

    size: {
      check: "Number",
      nullable: true,
      apply: "_applySize",
      themeable: true
    }
  },

  members: {
    __initialStyle: "regular",
    __useSprite: false,

    _getInnerSvgMarkup(styleVariant) {
      const ctor = this.constructor;
      const isFilled = styleVariant === "filled" && ctor.FILLED;
      const rawData = isFilled ? ctor.FILLED : ctor.REGULAR;
      const viewBox = ctor.VIEWBOX || "0 0 24 24";

      // Support both raw `d` path strings and full SVG element tags
      const pathMarkup = rawData.trim().startsWith("<")
        ? rawData
        : `<path d="${rawData}"/>`;

      if (this.__useSprite) {
        const symbolId = `${this.classname.replace(/\./g, "-")}-${isFilled ? "filled" : "regular"}`;
        this.constructor.ensureSpriteSymbol(symbolId, viewBox, pathMarkup);
        return `<use href="#${symbolId}"></use>`;
      }

      return pathMarkup;
    },

    // Overridden: Creates a pure <svg> root element with no wrapper <div>
    _createContentElement() {
      const ctor = this.constructor;
      const viewBox = ctor.VIEWBOX || "0 0 24 24";
      const fill = ctor.FILL || "currentColor";
      const stroke = ctor.STROKE || "none";
      const strokeWidth = ctor.STROKE_WIDTH ? ` stroke-width="${ctor.STROKE_WIDTH}"` : "";
      const strokeLinecap = ctor.STROKE_LINECAP ? ` stroke-linecap="${ctor.STROKE_LINECAP}"` : "";
      const strokeLinejoin = ctor.STROKE_LINEJOIN ? ` stroke-linejoin="${ctor.STROKE_LINEJOIN}"` : "";

      const innerMarkup = this._getInnerSvgMarkup(this.__initialStyle);

      // width="1em" height="1em" scales automatically with CSS font-size in Mode 2,
      // while Mode 1 layout managers can override via inline pixel styles.
      const markup = `<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="${viewBox}" width="1em" height="1em" fill="${fill}" stroke="${stroke}"${strokeWidth}${strokeLinecap}${strokeLinejoin}>${innerMarkup}</svg>`;

      const el = new qx.html.Element();
      el.useMarkup(markup);
      return el;
    },

    _applyIconStyle(value, old) {
      const domEl = this.getContentElement().getDomElement();
      if (domEl) {
        domEl.innerHTML = this._getInnerSvgMarkup(value);
      }
    },

    _applySize(value) {
      const el = this.getContentElement();
      if (value != null) {
        el.setStyles({ width: `${value}px`, height: `${value}px` }, true);
      } else {
        el.removeStyle("width", true);
        el.removeStyle("height", true);
      }
    },

    _applyCssUtilityClass(value, old) {
      const el = this.getContentElement();
      if (value) {
        el.setAttribute("class", value, true);
      } else {
        el.removeAttribute("class", true);
      }
    }
  }
});
