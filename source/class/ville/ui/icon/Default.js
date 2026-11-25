/**
 * Native SVG & Iconify CSS Icon Factory and Built-In Widget Glyph Registry
 * (`ville.ui.icon.Default`).
 *
 * Eliminates the need for per-icon `ville.ui.core.Widget` subclasses by rendering
 * all icons as lightweight native `ville.html.Element` nodes (`<svg>` with global
 * `<symbol>`/`<use>` sprite deduplication, `<span class="i-...">` for Iconify CSS
 * icons, or `<img>` for raster assets).
 *
 * Built-in widget chrome icons (`CHECK`, `INDETERMINATE`, `RADIO_DOT`,
 * `CHEVRON_DOWN`, `CHEVRON_UP`, `CHEVRON_RIGHT`, `CHEVRON_LEFT`,
 * `CHEVRON_UP_DOWN`, `CLOSE`, `EYE`, `EYE_OFF`, `SORT_ASC`, `SORT_DESC`,
 * `FOLDER`, `FOLDER_OPEN`, `FILE`, `CALENDAR`) are stored as compact static
 * SVG descriptors and automatically deduplicated via a single hidden DOM
 * `<svg id="ville-icon-sprite-sheet"><defs>` block for high-density scalability
 * in `Table`, `Tree`, `List`, `Menu`, and `Form` widgets.
 */
qx.Class.define("ville.ui.icon.Default", {
  statics: {
    /**
     * Global `<defs>` element inside `<svg id="ville-icon-sprite-sheet">`.
     *
     * @type {SVGDefsElement|null}
     * @private
     */
    __spriteDefs: null,

    /**
     * Map of registered `<symbol id="...">` keys in the global sprite sheet.
     *
     * @type {Record<string, boolean>}
     * @private
     */
    __registeredSymbols: {},

    /*
    ---------------------------------------------------------------------------
      BUILT-IN DEFAULT WIDGET GLYPH DESCRIPTORS
    ---------------------------------------------------------------------------
    */

    /**
     * Built-in glyph library for core Ville UI widgets (`CheckBox`, `RadioButton`,
     * `PasswordField`, `SelectBox`, `ComboBox`, `Spinner`, `DateField`, `Menu`,
     * `Tree`, `Table`, `Modal`, `Window`).
     */
    GLYPHS: {
      CHECK: {
        id: "ville-icon-check",
        viewBox: "0 0 10 7",
        fill: "currentColor",
        stroke: "none",
        markup:
          '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z"/>'
      },

      INDETERMINATE: {
        id: "ville-icon-indeterminate",
        viewBox: "0 0 32 6",
        fill: "currentColor",
        stroke: "none",
        markup: '<rect width="32" height="6" fill="currentColor" rx="3"/>'
      },

      RADIO_DOT: {
        id: "ville-icon-radio-dot",
        viewBox: "0 0 5 5",
        fill: "currentColor",
        stroke: "none",
        markup: '<circle cx="2.5" cy="2.5" r="2.5" fill="currentColor"/>'
      },

      CHEVRON_DOWN: {
        id: "ville-icon-chevron-down",
        viewBox: "0 0 15 15",
        fill: "none",
        stroke: "none",
        markup:
          '<path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>'
      },

      CHEVRON_UP: {
        id: "ville-icon-chevron-up",
        viewBox: "0 0 15 15",
        fill: "none",
        stroke: "none",
        markup:
          '<path d="M3.13523 8.84197C3.3241 9.04343 3.64052 9.05363 3.84197 8.86477L7.5 5.43536L11.158 8.86477C11.3595 9.05363 11.6759 9.04343 11.8648 8.84197C12.0536 8.64051 12.0434 8.32409 11.842 8.13523L7.84197 4.38523C7.64964 4.20492 7.35036 4.20492 7.15803 4.38523L3.15803 8.13523C2.95657 8.32409 2.94637 8.64051 3.13523 8.84197Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>'
      },

      CHEVRON_RIGHT: {
        id: "ville-icon-chevron-right",
        viewBox: "0 0 15 15",
        fill: "none",
        stroke: "none",
        markup:
          '<path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>'
      },

      CHEVRON_LEFT: {
        id: "ville-icon-chevron-left",
        viewBox: "0 0 15 15",
        fill: "none",
        stroke: "none",
        markup:
          '<path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>'
      },

      CHEVRON_UP_DOWN: {
        id: "ville-icon-chevron-up-down",
        viewBox: "0 0 15 15",
        fill: "none",
        stroke: "none",
        markup:
          '<path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>'
      },

      CLOSE: {
        id: "ville-icon-close",
        viewBox: "0 0 15 15",
        fill: "none",
        stroke: "none",
        markup:
          '<path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>'
      },

      EYE: {
        id: "ville-icon-eye",
        viewBox: "0 0 15 15",
        fill: "none",
        stroke: "none",
        markup:
          '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z"/>'
      },

      EYE_OFF: {
        id: "ville-icon-eye-off",
        viewBox: "0 0 15 15",
        fill: "none",
        stroke: "none",
        markup:
          '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M13.3536 2.35355C13.5488 2.15829 13.5488 1.84171 13.3536 1.64645C13.1583 1.45118 12.8417 1.45118 12.6464 1.64645L10.6828 3.61012C9.70652 3.21671 8.63759 3 7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C0.902945 9.08812 2.02314 10.1861 3.36061 10.9323L1.64645 12.6464C1.45118 12.8417 1.45118 13.1583 1.64645 13.3536C1.84171 13.5488 2.15829 13.5488 2.35355 13.3536L4.31723 11.3899C5.29348 11.7833 6.36241 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C14.0971 5.9119 12.9769 4.81391 11.6394 4.06771L13.3536 2.35355ZM9.90428 4.38861L8.46111 5.83179C8.18156 5.6229 7.85421 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 7.85421 5.6229 8.18156 5.83179 8.46111L4.14832 10.1446C2.8841 9.5204 1.82496 8.60095 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C8.35263 4 9.16422 4.13805 9.90428 4.38861ZM5.09572 10.6114C5.83578 10.862 6.64737 11 7.5 11C10.1971 11 12.4705 9.62183 13.9038 7.50001C13.175 6.39906 12.1159 5.4796 10.8517 4.85542L9.16821 6.53889C9.3771 6.81844 9.5 7.14579 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5C7.14579 9.5 6.81844 9.3771 6.53889 9.16821L5.09572 10.6114Z"/>'
      },

      SORT_ASC: {
        id: "ville-icon-sort-asc",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        markup: '<path d="m18 15-6-6-6 6"/>'
      },

      SORT_DESC: {
        id: "ville-icon-sort-desc",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        markup: '<path d="m6 9 6 6 6-6"/>'
      },

      FOLDER: {
        id: "ville-icon-folder",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        markup:
          '<path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2"/>'
      },

      FOLDER_OPEN: {
        id: "ville-icon-folder-open",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        markup:
          '<path d="m5 19 2.757-7.351A1 1 0 0 1 8.693 11H21a1 1 0 0 1 .986 1.164l-.996 5.211A2 2 0 0 1 19.026 19za2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l3 3h7a2 2 0 0 1 2 2v2"/>'
      },

      FILE: {
        id: "ville-icon-file",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        markup:
          '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2"/>'
      },

      CALENDAR: {
        id: "ville-icon-calendar",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        markup:
          '<path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zm12-4v4M8 3v4m-4 4h16"/>'
      },

      AIRPLANE: {
        id: "ville-icon-airplane",
        viewBox: "0 0 20 20",
        fill: "currentColor",
        stroke: "none",
        markup:
          '<path d="M8.78 8.29 8.1 2.81a1.16 1.16 0 0 1 1-1.3h.08l.17-.01c.6 0 1.13.35 1.37.9l2.51 5.74 2.75-.09c1.03-.03 1.9.73 2 1.74l.02.15V10c0 1.08-.87 1.95-1.96 1.95l-2.8-.1-2.52 5.75c-.24.55-.78.9-1.37.9h-.1a1.16 1.16 0 0 1-1.15-1.3l.68-5.5-2.14-.06-.96 1.67c-.24.43-.7.69-1.18.69a1 1 0 0 1-1-1v-1.47h-.16a1.53 1.53 0 0 1 0-3.05l.16-.01V7a1 1 0 0 1 1-1c.49 0 .94.26 1.18.69l.96 1.67 2.14-.07Zm.57-5.79h-.12a.16.16 0 0 0-.14.18l.82 6.57-3.84.13-1.26-2.2A.36.36 0 0 0 4.5 7v2.43l-.98.04a.53.53 0 0 0 0 1.06l.98.04V13h.08c.1-.03.18-.1.23-.18l1.26-2.2 3.84.13-.82 6.59c0 .09.07.16.16.16h.1a.5.5 0 0 0 .45-.3l2.79-6.36 3.46.11c.52 0 .95-.42.95-.95v-.03a.95.95 0 0 0-.98-.92l-3.43.11L9.8 2.8a.5.5 0 0 0-.45-.3Z"/>'
      }
    },

    /*
    ---------------------------------------------------------------------------
      SPRITE SHEET & ELEMENT CREATION HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Registers an SVG `<symbol>` once in the global DOM `<svg id="ville-icon-sprite-sheet"><defs>`
     * so repeated icons in lists, trees, and tables share a single vector definition.
     *
     * @param {string} symbolId Unique symbol ID (e.g., `"ville-icon-check"`).
     * @param {string} viewBox SVG viewBox string.
     * @param {string} innerMarkup Inner `<path>` / shape markup.
     */
    ensureSpriteSymbol(symbolId, viewBox, innerMarkup) {
      if (ville.ui.icon.Default.__registeredSymbols[symbolId]) {
        return;
      }

      if (typeof document === "undefined" || !document.body) {
        return;
      }

      if (!ville.ui.icon.Default.__spriteDefs) {
        const svgNS = "http://www.w3.org/2000/svg";
        const spriteSvg = document.createElementNS(svgNS, "svg");
        spriteSvg.setAttribute("id", "ville-icon-sprite-sheet");
        spriteSvg.setAttribute("aria-hidden", "true");
        spriteSvg.style.cssText =
          "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;";

        const defs = document.createElementNS(svgNS, "defs");
        spriteSvg.appendChild(defs);
        document.body.appendChild(spriteSvg);
        ville.ui.icon.Default.__spriteDefs = defs;
      }

      const svgNS = "http://www.w3.org/2000/svg";
      const symbol = document.createElementNS(svgNS, "symbol");
      symbol.setAttribute("id", symbolId);
      symbol.setAttribute("viewBox", viewBox || "0 0 24 24");
      symbol.innerHTML = innerMarkup;

      ville.ui.icon.Default.__spriteDefs.appendChild(symbol);
      ville.ui.icon.Default.__registeredSymbols[symbolId] = true;
    },

    /**
     * Resolves an image resource ID (e.g., `"images/logo.png"`) to its full URI.
     *
     * @param {string} source Raw asset path or URL.
     * @returns {string} Resolved URL.
     */
    resolveImageUri(source) {
      if (!source) {
        return "";
      }
      if (/^(?:https?:|data:|blob:|\/|\.\.?\/)/.test(source)) {
        return source;
      }
      const rm = qx.util.ResourceManager.getInstance();
      let resourceId = source;
      if (!rm.has(resourceId)) {
        const app = qx.core.Init.getApplication();
        if (app && app.classname) {
          const appNs = app.classname.split(".")[0];
          const prefixed = appNs + "/" + source.replace(/^\/+/, "");
          if (rm.has(prefixed)) {
            resourceId = prefixed;
          }
        }
      }
      return rm.toUri(resourceId);
    },

    /**
     * Creates a native `ville.html.Element` for any icon specification with zero
     * `ville.ui.core.Widget` instance overhead:
     *
     * 1. Built-in glyph key (`"CHECK"`, `"CHEVRON_DOWN"`, `"AIRPLANE"`, etc.) or descriptor object
     * 2. Iconify CSS token (`"i-tabler-check"`, `"i-fluent-airplane-20-regular"`) -> `<span class="i-..." aria-hidden="true">`
     * 3. Raw inline `<svg ...>...</svg>` string -> `<svg>` via `useMarkup()`
     * 4. Raster/SVG image file URI (`"images/ville_logo.png"`) -> `<img src="..." alt="" aria-hidden="true">`
     *
     * @param {string|Object|ville.html.Element} iconSpec Icon key, Iconify CSS class, raw `<svg>`, descriptor, or image URI.
     * @param {{ size?: number|string, cssClass?: string, useSprite?: boolean }} [options] Optional rendering config.
     * @returns {ville.html.Element|null} Native virtual DOM element.
     */
    createElement(iconSpec, options) {
      if (!iconSpec) {
        return null;
      }

      if (iconSpec instanceof ville.html.Element) {
        return iconSpec;
      }

      const opts = options || {};
      const size = opts.size;
      const cssClass = opts.cssClass;
      const useSprite = opts.useSprite !== undefined ? Boolean(opts.useSprite) : false;

      // 1. Check if iconSpec is a built-in GLYPHS key (e.g., "CHECK", "CHEVRON_DOWN") or glyph descriptor object
      let glyph = null;
      if (typeof iconSpec === "string") {
        const upperKey = iconSpec.toUpperCase().replace(/-/g, "_");
        if (ville.ui.icon.Default.GLYPHS[upperKey]) {
          glyph = ville.ui.icon.Default.GLYPHS[upperKey];
        }
      } else if (typeof iconSpec === "object" && (iconSpec.markup || iconSpec.path)) {
        glyph = iconSpec;
      }

      if (glyph) {
        const viewBox = glyph.viewBox || "0 0 24 24";
        const fill = glyph.fill || "currentColor";
        const stroke = glyph.stroke || "none";
        const strokeWidth = glyph.strokeWidth ? ` stroke-width="${glyph.strokeWidth}"` : "";
        const strokeLinecap = glyph.strokeLinecap ? ` stroke-linecap="${glyph.strokeLinecap}"` : "";
        const strokeLinejoin = glyph.strokeLinejoin ? ` stroke-linejoin="${glyph.strokeLinejoin}"` : "";
        const rawMarkup = glyph.markup || `<path d="${glyph.path}"/>`;
        const dim = size != null ? (typeof size === "number" ? `${size}px` : String(size)) : "1em";
        const classAttr = cssClass ? ` class="${cssClass}"` : "";

        let inner = rawMarkup;
        if (useSprite && glyph.id) {
          ville.ui.icon.Default.ensureSpriteSymbol(glyph.id, viewBox, rawMarkup);
          inner = `<use href="#${glyph.id}"></use>`;
        }

        const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${dim}" height="${dim}" fill="${fill}" stroke="${stroke}"${strokeWidth}${strokeLinecap}${strokeLinejoin}${classAttr} aria-hidden="true">${inner}</svg>`;
        const el = new ville.html.Element("svg");
        el.useMarkup(svgMarkup);
        return el;
      }

      if (typeof iconSpec === "string") {
        const trimmed = iconSpec.trim();

        // 2. Raw inline <svg> markup string
        if (trimmed.startsWith("<svg")) {
          const el = new ville.html.Element("svg");
          el.useMarkup(trimmed);
          if (cssClass) {
            el.addClass(cssClass);
          }
          if (size != null) {
            const dim = typeof size === "number" ? `${size}px` : String(size);
            el.setStyles({ width: dim, height: dim });
          }
          return el;
        }

        // 3. Iconify / Pure CSS Icon class token (e.g., "i-tabler-check", "i-fluent-airplane-20-regular")
        if (trimmed.startsWith("i-") || trimmed.includes(":")) {
          const iconClass = trimmed.includes(":")
            ? "i-" + trimmed.replace(/:/g, "-")
            : trimmed;
          const el = new ville.html.Element("span");
          el.setAttribute("class", cssClass ? `${iconClass} ${cssClass}` : iconClass);
          el.setAttribute("aria-hidden", "true");
          if (size != null) {
            const dim = typeof size === "number" ? `${size}px` : String(size);
            el.setStyles({ width: dim, height: dim });
          }
          return el;
        }

        // 4. Image asset URI (e.g., "images/ville_logo.png")
        const imgEl = new ville.html.Element("img");
        imgEl.setAttribute("src", ville.ui.icon.Default.resolveImageUri(trimmed));
        imgEl.setAttribute("alt", "");
        imgEl.setAttribute("aria-hidden", "true");
        imgEl.setAttribute("decoding", "async");
        if (cssClass) {
          imgEl.setAttribute("class", cssClass);
        }
        if (size != null) {
          const dim = typeof size === "number" ? String(size) : String(size).replace(/px$/, "");
          imgEl.setAttribute("width", dim);
          imgEl.setAttribute("height", dim);
        }
        return imgEl;
      }

      return null;
    }
  }
});
