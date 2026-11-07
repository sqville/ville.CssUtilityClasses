# Project Goal & Active Patches: ville.CssUtilityClasses

You are an expert AI assisting in the development of `ville.CssUtilityClasses` running on qooxdoo v7.9.3.

## Core Objective

The primary mission of this project is to integrate external modern UI framework CSS utility tokens and build pipelines (Mantine, shadcn/Tailwind, Carbon Design SCSS, Tabler) directly into the qooxdoo ecosystem.

## Dual-Layout Core Architecture Modes

This project operates in two distinct modes controlled by environment variables set in `compile.json`. Always check these flags when generating or modifying code:

### Mode 1: Hybrid Approach (Qooxdoo Layouts + CSS Styling)

* **Trigger:** `qx.core.Environment.get("ville.cssEngine") == mantine` (or `tailwindcss` or `scss`) AND `ville.cssLayout` is false.
* **Application Core:** Uses standard `qx.application.Standalone`.
* **Mechanism:** Uses `qx.Class.include` to inject CSS class assignment capabilities into `qx.ui.core.Widget`.
* **Implementation Rule:** When modifying widgets in this mode, preserve qooxdoo's native layout engine managers (`VBox`, `HBox`, `Grid`). Use Qooxdoo's native themeing classes `qx.Theme - Appearance and Font only - never use Decorators` to set a widget's CSS utility classes using it's `cssUtilityClass` property. CSS utility classes are primarily for structural aesthetics, colors, typography, and atomic component styles—**do not** let CSS override structural dimensions handled by layout managers.

### Mode 2: Pure CSS Approach (Bypassing Qooxdoo Layout Engine)

* **Trigger:** `qx.core.Environment.get("ville.cssLayout") == true` and `qx.core.Environment.get("ville.cssEngine") == mantine` (or `tailwindcss` or `scss`).
* **Application Core:** Uses custom `ville.application.Standalone` which applies framework patches automatically.
* **Mechanism:** Bypasses the native JavaScript layout calculation system completely across the three endpoints listed below.
* **Implementation Rule:** In this mode, bypass qooxdoo's internal positioning calculations entirely. Let Tailwind (shadcn) flex/grid classes or SCSS (Carbon/Tabler) manage component layout positions, sizes, and responsiveness directly in the DOM.

## Deployed Architecture Patches (Active in Mode 2)

When `ville.cssLayout` is active, the framework layout engine is neutralized using these explicit, isolated custom patches:

1. **`ville.cssuc.patch.MLayoutItem` (applied to `qx.ui.core.LayoutItem`)**
   * Completely overrides `renderLayout(left, top, width, height)` to simply `return null;`.
   * **Implication:** Bypasses all absolute pixel computations, preventing inline coordinates from wiping out external CSS layout classes.

2. **`ville.cssuc.patch.MLayoutQueue` (applied to `qx.ui.core.queue.Layout`)**
   * Direct static interceptor on the global `Layout.add(widget)` method to short-circuit queue additions.
   * **Implication:** Stops layout invalidation tasks from ever processing in the background, minimizing CPU layout cycles.

3. **`ville.cssuc.patch.MWidget` (applied to `qx.ui.core.Widget`)**
   * Overrides `_setLayout()` to a no-op: `return;`.
   * **Implication:** Prevents real layout manager instances from being assigned to widgets, ensuring that internal layout property validation and rendering logic are completely skipped.
   * Replaces `_getLayout()` with a decoupled virtual layout mock containing zero dependencies on real layout classes:

     ```javascript
     {
       connectToWidget: function() {},
       disconnectFromWidget: function() {},
       invalidateLayoutCache: function() {},
       invalidateChildrenCache: function() {},
       verifyLayoutProperty: function() { return true; },
       hasHeightForWidth: function() { return false; },
       getSizeHint: function() { 
         return { width: 0, height: 0, minWidth: 0, minHeight: 0, maxWidth: Infinity, maxHeight: Infinity }; 
       }
     }
     ```

   * **Implication:** Satisfies native base constructors calling layout verification and size inquiries without crashing, while completely avoiding real layout manager instances.

## Universal State Management & DOM Patching (Active in All Modes)

The `ville.cssuc.patch.MWidget` mixin is utilized by `ville.ui.application.Standalone` across all engines to decouple base UI components from specific CSS framework APIs.

**CRITICAL DESIGN CONSTRAINT (Qooxdoo Private Members):** Qooxdoo enforces strict access control; Mixins and Patches *cannot* access target class variables prefixed with double underscores (e.g., `__states`). To circumvent this restriction, state manipulations in `ville.ui` rely entirely on protected maps (like `_villeuiStates`) and native public/protected methods (e.g., `hasState()`, `replaceState()`).

### 1. Agnostic State Assignment (`setVuiModifier`)

Base `ville.ui` widgets must remain framework-agnostic. Modifiers (e.g., variant, size, radius) are verified against a protected whitelist object (`_villeuiStates`) and applied using native Qooxdoo state operations.

```javascript
_villeuiStates: {
  "size-xs": true,
  "size-sm": true,
  "size-md": true,
  "size-lg": true,
  "size-xl": true,
  "compact-xs": true,
  "compact-sm": true,
  "compact-md": true,
  "compact-lg": true,
  "compact-xl": true,
  "radius-xs" : true,
  "radius-sm" : true,
  "radius-md" : true,
  "radius-lg" : true,
  "radius-xl" : true,
  "variant-default" : true,
  "variant-filled" : true,
  "variant-outline" : true,
  "variant-subtle" : true,
  "data-loading" : true
},

/**
 * Sets a mutually exclusive namespaced state (e.g., category: "variant", value: "filled")
 * Uses replaceState/hasState to bypass private __states restrictions.
 */
setVuiModifier(category, value) {
  const prefix = category + "-";
  const modState = prefix + value;
  const villeuistates = this._villeuiStates;

  if (value == null || value === "" || !(modState in this._villeuiStates)) {
    return;
  }

  if (qx.core.Environment.get("qx.debug")) {
    this.assertKeyInMap(
      modState,
      villeuistates,
      modState + " is not a valid ville ui state. Check for correct spelling or add it to the widget's _villeuiStates object - ville.cssuc.patch.MWidget"
    );
  }

  let replaced = false;
  let locatedsame = false;

  for (const stateName in villeuistates) {
    if (this.hasState(stateName) && stateName.startsWith(prefix)){
      if (modState != stateName) {
        this.replaceState(stateName, modState);
        replaced = true;
        break;
      }
      else {
        locatedsame = true;
      }
    }
  }
  
  // Add the new state if a new value was provided
  if (!replaced && !locatedsame)  {
    this.addState(modState);
  }
  
  return;
}
```

**Implementation Example on an Application Widget:**

```javascript
var pButton = new ville.ui.form.Button("Button");
// Agnostic, native Qooxdoo state management
pButton.setVuiModifier("variant", "outline"); 
pButton.setVuiModifier("size", "xl");
pButton.setVuiModifier("radius", "sm");
```

### 2. State-to-DOM Resolution (`_applyCssStates`)

The `MWidget` mixin provides a unified method to handle the CSS framework-specific payload dispatched by the current Appearance theme.

**Note on Execution:** Qooxdoo properties with `check: "Object"` run their `apply` method every time the object reference mutates. An equality check (`qx.lang.Object.equals`) is used at the top to prevent redundant DOM updates. DOM operations (styles/attributes) explicitly pass `true` as the final parameter to bypass Qooxdoo's internal job queue and apply directly to the DOM synchronously.

```javascript
/**
 * "set-attributes" - Map of strings
 * "remove-attributes" - Array of strings
 * "set-classes" - Array of strings
 * "remove-classes" - Array of strings
 * "set-styles" - Map of strings
 * "remove-styles" - Array of strings
 */
_applyCssStates(value, old) {
  if (!value || qx.lang.Object.equals(value, old)) {
    return;
  }

  // 1. Set attributes (Map / Plain Object) - `true` applies directly to DOM
  const setAttrs = value["set-attributes"];
  if (setAttrs) {
    this.setAttributes(setAttrs, true);
  }

  // 2. Remove attributes (Array of strings) - `true` applies directly to DOM
  const removeAttrs = value["remove-attributes"];
  if (qx.lang.Type.isArray(removeAttrs)) {
    for (const attname of removeAttrs) {
      this.removeAttribute(attname, true);
    }
  }

  // 3. Set / Add classes (Array of strings)
  const setClasses = value["set-classes"];
  if (qx.lang.Type.isArray(setClasses)) {
    for (const classname of setClasses) {
      this.addClass(classname);
    }
  }

  // 4. Remove classes (Array of strings)
  const removeClasses = value["remove-classes"];
  if (qx.lang.Type.isArray(removeClasses)) {
    for (const classname of removeClasses) {
      this.removeClass(classname);
    }
  }

  // 5. Set / Add inline styles (Map / Plain Object) - `true` applies directly to DOM
  const setStyles = value["set-styles"];
  if (setStyles) {
    this.setStyles(setStyles, true);
  }

  // 6. Remove inline styles (Array of strings) - `true` applies directly to DOM
  const removeStyles = value["remove-styles"];
  if (qx.lang.Type.isArray(removeStyles)) {
    for (const stylename of removeStyles) {
      this.removeStyle(stylename, true);
    }
  }
}
```

### 3. State Forwarding Reduction (Atom & Button)

To prevent duplicate state management and allow modern CSS frameworks to handle standard interaction pseudo-classes (e.g., `:hover`, `:active`) natively, Qooxdoo's native internal states are stripped out. Both `qx.ui.basic.Atom` and `qx.ui.form.Button` are patched so that their `_forwardStates` map **only** forwards the `disabled` state.

### 4. Native Layout via DOM & Flex Ordering

Bypass Mantine's heavy nested `span` architecture (e.g. `.m_80f1301b`, `.m_811560b9`). `ville.ui` widgets should assign layout responsibilities directly to the primary wrapper element (via `display: inline-flex` and `gap`). Button labels use an internal `qx.html.Text` node linked to a non-DOM `qx.ui.basic.Label` via `changeValue` events, while icons render as direct inline `<svg>` siblings.

**Handling Component Icons:** Manage `iconPosition` visually via CSS `flex-direction` to prevent unnecessary DOM mutations and component thrashing:

```javascript
_applyIconPosition(value, old) {
  const el = this.getContentElement();
  el.setAttribute("data-position", value); // Allows targeted spacing tweaks via CSS

  if (value === "right") {
    el.setStyle("flex-direction", "row-reverse");
  } else if (value === "top") {
    el.setStyle("flex-direction", "column");
  } else if (value === "bottom") {
    el.setStyle("flex-direction", "column-reverse");
  } else {
    el.setStyle("flex-direction", "row"); // Default left
  }
}
```

## CSS Framework Appearance Theming (The Accumulator Pattern)

Appearance themes (e.g., `ville.cssuc.theme.mantine.Appearance`) must use the accumulator pattern. Instead of mapping Qooxdoo decorators, the `style(states)` method evaluates the flat `states` hashmap and builds a structured DOM manipulation object targeting `cssStates`.

**Architectural Rules:**
* Group logic into mapping objects (`interpolations` for scalable sizing like `-xs`/`-md`, and `variants` for explicit string assignments).
* Ensure variants utilize `--mantine-primary-color-*` root CSS variables to guarantee global runtime theme awareness.

**Implementation Structure Example:**

```javascript
button: {
  include: "button-frame",

  style(states) {
    let changes = {
      "set-attributes": {},     
      "remove-attributes": [],  
      "set-classes": [],        
      "remove-classes": [],     
      "set-styles": {},         
      "remove-styles": []       
    };

    // 1. Base Interaction States
    if (states.disabled) {
      changes["set-attributes"]["data-disabled"] = true;
    } else {
      changes["remove-attributes"].push("data-disabled");
    }

    // --- Configuration Mappings ---
    const interpolations = {
      size: { 
        height: 'button-height', 
        'padding-x': 'button-padding-x', 
        fz: 'mantine-font-size' 
      },
      compact: {
        height: 'button-height-compact',
        'padding-x': 'button-padding-x-compact',
        fz: 'mantine-font-size'
      },
      radius: { 
        radius: 'mantine-radius' 
      }
    };

    const variants = {
      filled: {
        bg: 'var(--mantine-primary-color-filled)',
        hover: 'var(--mantine-primary-color-filled-hover)',
        color: 'var(--mantine-color-white)',
        bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
      },
      outline: {
        bg: 'transparent',
        hover: 'var(--mantine-primary-color-outline-hover)',
        color: 'var(--mantine-primary-color-outline)',
        bd: 'calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-primary-color-outline)'
      },
      subtle: {
        bg: 'transparent',
        hover: 'var(--mantine-primary-color-light-hover)',
        color: 'var(--mantine-primary-color-light-color)',
        bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
      },
      default: {
        bg: 'var(--mantine-color-default)',
        hover: 'var(--mantine-color-default-hover)',
        color: 'var(--mantine-color-default-color)',
        bd: 'calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-default-border)'
      },
      light: {
        bg: 'var(--mantine-primary-color-light)',
        hover: 'var(--mantine-primary-color-light-hover)',
        color: 'var(--mantine-primary-color-light-color)',
        bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
      },
      transparent: {
        bg: 'transparent',
        hover: 'transparent',
        color: 'var(--mantine-primary-color-light-color)',
        bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
      },
      white: {
        bg: 'var(--mantine-color-white)',
        hover: 'rgba(252, 252, 252, 1)',
        color: 'var(--mantine-primary-color-filled)',
        bd: 'calc(0.0625rem * var(--mantine-scale)) solid transparent'
      }
    };

    const scales = ['xs', 'sm', 'md', 'lg', 'xl'];

    // --- State Resolution ---

    // 2. Process size, compact, and radius (Interpolated mapping)
    for (const group of Object.keys(interpolations)) {
      for (const scale of scales) {
        if (states[`${group}-${scale}`]) {
          const properties = interpolations[group];
          for (const prop of Object.keys(properties)) {
            changes['set-styles'][`--button-${prop}`] = `var(--${properties[prop]}-${scale})`;
          }
          break; // Mutually exclusive within its group
        }
      }
    }

    // 3. Process variants (Explicit value mapping)
    for (const vKey of Object.keys(variants)) {
      if (states[`variant-${vKey}`]) {
        changes['set-attributes']['data-variant'] = vKey;
        const vStyles = variants[vKey];
        for (const sKey of Object.keys(vStyles)) {
          changes['set-styles'][`--button-${sKey}`] = vStyles[sKey];
        }
        break; // Mutually exclusive
      }
    }

    return {
      cssStates: changes
    };
  }
}
```

## Inline SVG Icon Architecture & Pipelines

To guarantee zero-wrapper `<svg>` rendering, maximum DOM performance, and zero XSS risk across both Mode 1 and Mode 2, all icons in `ville.ui` extend `qx.ui.core.Widget` (never `qx.ui.embed.Html`, which introduces a wrapper `<div>` that breaks `inline-flex` gap alignment) and override `_createContentElement()` using `qx.html.Element.useMarkup()`.

Developers can implement icons using two compatible workflows:
* **Option A (Pre-Generator / Manual Standalone Qooxdoo Classes):** Hand-craft vendor-specific Qooxdoo icon classes (e.g., `ville.ui.icon.fluent.Airplane`) that store static SVG paths (`REGULAR` and `FILLED`) directly on the class without requiring external Node icon packages.
* **Option B (On-Demand Iconify Class Generator - `generate-icons.js`):** Use the offline `@iconify/json` and `@iconify/utils` Node packages to generate native Qooxdoo icon classes on demand from 200,000+ icons across 150+ icon sets.

Both workflows use the unified `ville.ui.icon.Abstract` base class and support three rendering patterns:
1. **Direct Inline `<svg><path .../></svg>` Widget (Default):** Renders the vector directly inside the `<svg>` root element and updates only `innerHTML` when `iconStyle` (`"regular"` vs `"filled"`) changes.
2. **Runtime `<symbol>` / `<use>` Sprite Deduplication (`useSprite = true`):** Registers the icon once inside a hidden global `<svg id="ville-icon-sprite-sheet"><defs>` block in `document.body` and renders `<svg><use href="#..."/></svg>`, saving DOM memory in high-density tables and virtual lists.
3. **Static CSS `clip-path` Values:** Exposes `REGULAR`, `FILLED`, `CLIP_REGULAR`, and `CLIP_FILLED` on the class `statics` map so any widget or Appearance theme can apply the icon shape directly via CSS `clip-path: path('...')`.

### 1. Unified Base Abstract Class (`ville.ui.icon.Abstract`)

```javascript
qx.Class.define("ville.ui.icon.Abstract", {
  extend: qx.ui.core.Widget,
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
   * @param iconStyle {String?"regular"} "regular" or "filled"
   * @param useSprite {Boolean?false} If true, uses <symbol>/<use> sprite deduplication
   * @param size {Integer?null} Optional explicit pixel width/height
   */
  construct(iconStyle = "regular", useSprite = false, size = null) {
    this.__initialStyle = iconStyle;
    this.__useSprite = Boolean(useSprite);

    super();

    this.initIconStyle();
    if (iconStyle !== "regular") {
      this.setIconStyle(iconStyle);
    }

    if (size != null) {
      this.setSize(size);
    }
  },

  properties: {
    viewBox: {
      check: "String",
      init: "0 0 24 24",
      apply: "_applyViewBox",
      themeable: true,
      event: "changeViewBox"
    },

    iconStyle: {
      check: ["regular", "filled"],
      init: "regular",
      apply: "_applyIconStyle",
      themeable: true,
      event: "changeIconStyle"
    },

    pathMarkup: {
      check: "String",
      nullable: true,
      apply: "_applyPathMarkup"
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
      const viewBox = ctor.VIEWBOX || this.getViewBox() || "0 0 24 24";

      if (!rawData) {
        return "";
      }

      // Support both raw `d` path strings and full `<path .../>` tags
      const pathMarkup = rawData.trim().startsWith("<")
        ? rawData
        : `<path d="${rawData}"/>`;

      if (this.__useSprite) {
        const symbolId = `${this.classname.replace(/\./g, "-")}-${isFilled ? "filled" : "regular"}`;
        ville.ui.icon.Abstract.ensureSpriteSymbol(symbolId, viewBox, pathMarkup);
        return `<use href="#${symbolId}"></use>`;
      }

      return pathMarkup;
    },

    // Overridden: Creates a pure <svg> root element with no wrapper <div>
    _createContentElement() {
      const ctor = this.constructor;
      const viewBox = ctor.VIEWBOX || this.getViewBox() || "0 0 24 24";
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
      this.setPathMarkup(this._getInnerSvgMarkup(value));
    },

    _applyPathMarkup(value, old) {
      const domEl = this.getContentElement().getDomElement();
      if (domEl && value != null) {
        domEl.innerHTML = value;
      }
    },

    _applyViewBox(value, old) {
      const el = this.getContentElement();
      if (el && value) {
        el.setAttribute("viewBox", value, true);
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
```

### 2. Option A: Manual / Standalone Qooxdoo Icon Class (Zero External Dependencies)

Before or without using the Iconify CLI generator, developers can author standalone icon classes directly by defining `VIEWBOX`, `REGULAR`, and `FILLED` (plus optional `CLIP_REGULAR` and `CLIP_FILLED` strings) in `statics`:

```javascript
qx.Class.define("ville.ui.icon.fluent.Airplane", {
  extend: ville.ui.icon.Abstract,

  statics: {
    VIEWBOX: "0 0 20 20",
    REGULAR: "M8.78 8.29 8.1 2.81a1.16 1.16 0 0 1 1-1.3h.08l.17-.01c.6 0 1.13.35 1.37.9l2.51 5.74 2.75-.09c1.03-.03 1.9.73 2 1.74l.02.15V10c0 1.08-.87 1.95-1.96 1.95l-2.8-.1-2.52 5.75c-.24.55-.78.9-1.37.9h-.1a1.16 1.16 0 0 1-1.15-1.3l.68-5.5-2.14-.06-.96 1.67c-.24.43-.7.69-1.18.69a1 1 0 0 1-1-1v-1.47h-.16a1.53 1.53 0 0 1 0-3.05l.16-.01V7a1 1 0 0 1 1-1c.49 0 .94.26 1.18.69l.96 1.67 2.14-.07Zm.57-5.79h-.12a.16.16 0 0 0-.14.18l.82 6.57-3.84.13-1.26-2.2A.36.36 0 0 0 4.5 7v2.43l-.98.04a.53.53 0 0 0 0 1.06l.98.04V13h.08c.1-.03.18-.1.23-.18l1.26-2.2 3.84.13-.82 6.59c0 .09.07.16.16.16h.1a.5.5 0 0 0 .45-.3l2.79-6.36 3.46.11c.52 0 .95-.42.95-.95v-.03a.95.95 0 0 0-.98-.92l-3.43.11L9.8 2.8a.5.5 0 0 0-.45-.3Z",
    FILLED: "M9 2c.6 0 1.16.36 1.4.92l2.37 5.4 3.23-.2a1.88 1.88 0 0 1 2 1.76V10c0 1.04-.84 1.88-1.88 1.88H16l-3.23-.2-2.37 5.4c-.24.56-.8.92-1.4.92a.88.88 0 0 1-.88-.88v-.06l.7-5.63-2.46-.16-1.14 2.28a.8.8 0 0 1-.72.45.5.5 0 0 1-.5-.5v-2.38l-1.06-.06a1 1 0 0 1-.94-1v-.12a1 1 0 0 1 .94-1L4 8.88V6.5c0-.28.22-.5.5-.5.3 0 .59.17.72.45l1.14 2.28 2.46-.16L8.12 3A.88.88 0 0 1 9 2Z",
    CLIP_REGULAR: "path('M8.78 8.29 8.1 2.81a1.16 1.16 0 0 1 1-1.3h.08l.17-.01c.6 0 1.13.35 1.37.9l2.51 5.74 2.75-.09c1.03-.03 1.9.73 2 1.74l.02.15V10c0 1.08-.87 1.95-1.96 1.95l-2.8-.1-2.52 5.75c-.24.55-.78.9-1.37.9h-.1a1.16 1.16 0 0 1-1.15-1.3l.68-5.5-2.14-.06-.96 1.67c-.24.43-.7.69-1.18.69a1 1 0 0 1-1-1v-1.47h-.16a1.53 1.53 0 0 1 0-3.05l.16-.01V7a1 1 0 0 1 1-1c.49 0 .94.26 1.18.69l.96 1.67 2.14-.07Zm.57-5.79h-.12a.16.16 0 0 0-.14.18l.82 6.57-3.84.13-1.26-2.2A.36.36 0 0 0 4.5 7v2.43l-.98.04a.53.53 0 0 0 0 1.06l.98.04V13h.08c.1-.03.18-.1.23-.18l1.26-2.2 3.84.13-.82 6.59c0 .09.07.16.16.16h.1a.5.5 0 0 0 .45-.3l2.79-6.36 3.46.11c.52 0 .95-.42.95-.95v-.03a.95.95 0 0 0-.98-.92l-3.43.11L9.8 2.8a.5.5 0 0 0-.45-.3Z')",
    CLIP_FILLED: "path('M9 2c.6 0 1.16.36 1.4.92l2.37 5.4 3.23-.2a1.88 1.88 0 0 1 2 1.76V10c0 1.04-.84 1.88-1.88 1.88H16l-3.23-.2-2.37 5.4c-.24.56-.8.92-1.4.92a.88.88 0 0 1-.88-.88v-.06l.7-5.63-2.46-.16-1.14 2.28a.8.8 0 0 1-.72.45.5.5 0 0 1-.5-.5v-2.38l-1.06-.06a1 1 0 0 1-.94-1v-.12a1 1 0 0 1 .94-1L4 8.88V6.5c0-.28.22-.5.5-.5.3 0 .59.17.72.45l1.14 2.28 2.46-.16L8.12 3A.88.88 0 0 1 9 2Z')"
  }
});
```

### 3. Option B: On-Demand Iconify Class Generator (`generate-icons.js`)

To give developers access to thousands of icons from Iconify (`@iconify/json` and `@iconify/utils`) while outputting native Qooxdoo classes that extend `ville.ui.icon.Abstract`:

* **Install Dependencies:** `npm install --save-dev @iconify/utils @iconify/json`
* **CLI Usage:**
  ```bash
  node generate-icons.js --icons fluent:airplane-20,tabler:check --out-dir source/class/ville/ui/icon --namespace ville.ui.icon
  ```
* **Generator Script (`generate-icons.js`):**

```javascript
const fs = require('fs');
const path = require('path');
const { getIconData, iconToSVG } = require('@iconify/utils');
const { locate } = require('@iconify/json');

// 1. Parse Named CLI Arguments
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith('--')) {
    const [key, value] = arg.split('=');
    if (value !== undefined) {
      args[key] = value;
    } else if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith('--')) {
      args[key] = process.argv[++i];
    } else {
      args[key] = true;
    }
  }
}

const outDir = path.resolve(args['--out-dir'] || 'source/class/ville/ui/icon');
const namespacePrefix = args['--namespace'] || 'ville.ui.icon';
const iconListArg = args['--icons'] || '';

if (!iconListArg) {
  console.error('❌ Usage: node generate-icons.js --icons fluent:airplane-20,tabler:check [--out-dir source/class/ville/ui/icon] [--namespace ville.ui.icon]');
  process.exit(1);
}

const requestedIcons = iconListArg.split(',').map(s => s.trim()).filter(Boolean);
const iconSetCache = {};

function loadIconSet(prefix) {
  if (!iconSetCache[prefix]) {
    const jsonPath = locate(prefix);
    if (!jsonPath || !fs.existsSync(jsonPath)) {
      throw new Error(`Iconify set "${prefix}" not found. Did you install @iconify/json?`);
    }
    iconSetCache[prefix] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
  return iconSetCache[prefix];
}

/**
 * Converts SVG primitives (<circle>, <rect>, <line>) to path `d` commands
 * and merges all <path d="..."> segments into a single compound `d` string for clip-path compatibility.
 */
function extractCompoundPathD(svgBody, prefix) {
  const dSegments = [];

  // 1. Extract <path d="...">
  const pathRegex = /<path\b[^>]*?\bd=["']([^"']+)["'][^>]*?>/gi;
  let match;
  while ((match = pathRegex.exec(svgBody)) !== null) {
    const d = match[1].trim();
    if (prefix === 'tabler' && d === 'M0 0h24v24H0z') continue;
    dSegments.push(d);
  }

  // 2. Convert <circle cx="..." cy="..." r="..."/>
  const circleRegex = /<circle\b([^>]*?)>/gi;
  while ((match = circleRegex.exec(svgBody)) !== null) {
    const attrs = match[1];
    const cx = parseFloat((attrs.match(/\bcx=["']([^"']+)["']/) || [])[1] || 0);
    const cy = parseFloat((attrs.match(/\bcy=["']([^"']+)["']/) || [])[1] || 0);
    const r = parseFloat((attrs.match(/\br=["']([^"']+)["']/) || [])[1] || 0);
    if (r > 0) {
      dSegments.push(`M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0 Z`);
    }
  }

  // 3. Convert <rect x="..." y="..." width="..." height="..."/>
  const rectRegex = /<rect\b([^>]*?)>/gi;
  while ((match = rectRegex.exec(svgBody)) !== null) {
    const attrs = match[1];
    const x = parseFloat((attrs.match(/\bx=["']([^"']+)["']/) || [])[1] || 0);
    const y = parseFloat((attrs.match(/\by=["']([^"']+)["']/) || [])[1] || 0);
    const w = parseFloat((attrs.match(/\bwidth=["']([^"']+)["']/) || [])[1] || 0);
    const h = parseFloat((attrs.match(/\bheight=["']([^"']+)["']/) || [])[1] || 0);
    if (w > 0 && h > 0) {
      dSegments.push(`M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`);
    }
  }

  // 4. Convert <line x1="..." y1="..." x2="..." y2="..."/>
  const lineRegex = /<line\b([^>]*?)>/gi;
  while ((match = lineRegex.exec(svgBody)) !== null) {
    const attrs = match[1];
    const x1 = parseFloat((attrs.match(/\bx1=["']([^"']+)["']/) || [])[1] || 0);
    const y1 = parseFloat((attrs.match(/\by1=["']([^"']+)["']/) || [])[1] || 0);
    const x2 = parseFloat((attrs.match(/\bx2=["']([^"']+)["']/) || [])[1] || 0);
    const y2 = parseFloat((attrs.match(/\by2=["']([^"']+)["']/) || [])[1] || 0);
    dSegments.push(`M ${x1} ${y1} L ${x2} ${y2}`);
  }

  return dSegments.join(' ');
}

function toPascalCase(str) {
  return str
    .replace(/-(?:\d+)-(regular|filled)$/i, '')
    .replace(/-(?:\d+)$/i, '')
    .replace(/-(regular|filled)$/i, '')
    .split(/[-_:]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function resolveVariantPair(prefix, rawName, iconSet) {
  if (prefix === 'fluent') {
    const base = rawName.replace(/-(regular|filled)$/, '');
    const hasSize = /-\d+$/.test(base);
    const sizedBase = hasSize ? base : `${base}-20`;
    return {
      regularName: `${sizedBase}-regular`,
      filledName: `${sizedBase}-filled`
    };
  }

  const base = rawName.replace(/-(regular|filled)$/, '');
  return {
    regularName: getIconData(iconSet, base) ? base : `${base}-regular`,
    filledName: `${base}-filled`
  };
}

for (const item of requestedIcons) {
  const [prefix, rawName] = item.split(':');
  if (!prefix || !rawName) {
    console.warn(`⚠️ Skipping invalid icon identifier "${item}". Use format "prefix:name".`);
    continue;
  }

  const iconSet = loadIconSet(prefix);
  const { regularName, filledName } = resolveVariantPair(prefix, rawName, iconSet);

  const regIconData = getIconData(iconSet, regularName);
  const filIconData = getIconData(iconSet, filledName);

  if (!regIconData && !filIconData) {
    console.warn(`⚠️ Icon "${item}" not found in set "${prefix}".`);
    continue;
  }

  const primaryData = regIconData || filIconData;
  const primarySvg = iconToSVG(primaryData);
  const viewBox = primarySvg.attributes.viewBox || '0 0 24 24';

  const regPathD = regIconData ? extractCompoundPathD(iconToSVG(regIconData).body, prefix) : '';
  const filPathD = filIconData ? extractCompoundPathD(iconToSVG(filIconData).body, prefix) : regPathD;
  const finalRegD = regPathD || filPathD;

  const isStrokedSet = prefix === 'tabler' || prefix === 'lucide';
  const strokeStatic = isStrokedSet
    ? `\n    FILL: "none",\n    STROKE: "currentColor",\n    STROKE_WIDTH: "2",\n    STROKE_LINECAP: "round",\n    STROKE_LINEJOIN: "round",`
    : '';

  const className = toPascalCase(rawName);
  const fullClassName = `${namespacePrefix}.${prefix}.${className}`;
  const vendorDir = path.join(outDir, prefix);
  fs.mkdirSync(vendorDir, { recursive: true });

  const filePath = path.join(vendorDir, `${className}.js`);

  const classContent = `/* ************************************************************************
   AUTO-GENERATED BY generate-icons.js
   Source: @iconify/json (${prefix}:${regularName}${filIconData ? ` / ${prefix}:${filledName}` : ''})
************************************************************************ */
qx.Class.define("${fullClassName}",
{
  extend : ${namespacePrefix}.Abstract,

  statics :
  {
    VIEWBOX : "${viewBox}",${strokeStatic}
    REGULAR : "${finalRegD}",
    FILLED : "${filPathD}",
    CLIP_REGULAR : "path('${finalRegD}')",
    CLIP_FILLED : "path('${filPathD}')"
  }
});
`;

  fs.writeFileSync(filePath, classContent, 'utf8');
  console.log(`✅ Generated ${fullClassName} -> ${filePath}`);
}
```

### 4. Application Usage Patterns (Inline, Sprite, & CSS `clip-path`)

```javascript
// 1. Standard Inline SVG Widget (<svg><path d="..."/></svg>)
const airplaneIcon = new ville.ui.icon.fluent.Airplane("regular");
airplaneIcon.setIconStyle("filled"); // Mutates innerHTML only, preserving root <svg>

// 2. High-Density Sprite Deduplication (<svg><use href="#..."/></svg>)
const spriteIcon = new ville.ui.icon.fluent.Airplane("filled", true, 20);

// 3. CSS clip-path via Static Class Reference
// Option A: Pre-wrapped CLIP_REGULAR / CLIP_FILLED static
myWidget.getContentElement().setStyles({
  "width": "20px",
  "height": "20px",
  "background-color": "var(--mantine-primary-color-filled)",
  "clip-path": ville.ui.icon.fluent.Airplane.CLIP_FILLED
}, true);

// Option B: Raw REGULAR / FILLED static wrapped with path() or helper
myWidget.getContentElement().setStyle(
  "clip-path",
  ville.ui.icon.Abstract.toClipPath(ville.ui.icon.fluent.Airplane.REGULAR),
  true
);
```

## Floating Components, HTML Popover, & CSS Anchor Position APIs

* **Stylesheet Injection Rules:** `ville.ui.application.Standalone` injects CSS Anchor positioning directly to `.ville-popover` elements using `addRules()`:

  ```javascript
  this.addRules([
    "margin: 0;",
    "inset: auto;",
    "position-area: var(--ville-popover-position-area, bottom center);",
    "position-try-fallbacks: var(--ville-popover-position-try-fallbacks, flip-block);",
    "position-try-order: var(--ville-popover-position-try-order, most-height);"
  ], ".ville-popover");
  ```

* **Trigger Requirements:** Any opening widget element (e.g., button, anchor, input) must be set as a valid popover trigger in the DOM, carrying `popovertarget` and `popovertargetaction` attributes.
* **Target Widget Requirements:** Target widgets (`qx.ui.menu.Menu`, `qx.ui.popup.Popup`, and soon `qx.ui.window.Window`) must be injected with the `popover="auto"` DOM attribute.
* **Future Window Refactoring Rule:** When working with windows or modal overlays, prioritize migrating their underlying content container elements to either use the `popover` attribute or transform the structural DOM node to an native HTML `<dialog>` element.

## Mantine CSS Pipeline & Mapping

This project utilizes a specialized orchestration script (`bundle-mantine.js`) to bridge Qooxdoo's dependency-driven architecture with Mantine's component-based styling.

### 1. The Mapping Source of Truth (`mantine-map.json`)

Every component in the `ville.ui.*` namespace that utilizes Mantine styles **must** be registered in `source/resource/ville/mantine-map.json`.

* **The `map` Object:** Every new class must be mapped to an array of its required Mantine CSS filenames.
  * *Example:* `"ville.ui.form.Button": ["UnstyledButton.css", "Button.css"]`

* **The `order` Array:** Defines the master sequence for the CSS cascade. Any new Mantine CSS file dependency introduced **must** be added here.
  * *Constraint:* Fundamental/Reset styles (e.g., `baseline.css`, `default-css-variables.css`, `global.css`) must always reside at the top of this array.
    * *Constraint:* Component dependencies must precede the component style (e.g., `UnstyledButton.css` before `Button.css`).

### 2. Class Creation Workflow

When developing a new `ville.ui` component:

1. Identify the required Mantine CSS files from `@mantine/core/styles` in `node_modules`.
2. Update `mantine-map.json` (both `map` and `order`).
3. Ensure the widget applies the appropriate Mantine classes via `this.setCssUtilityClass()` or the `appearance` theme mapping.

### 3. Application Integration via `@external`

To ensure the bundled CSS is injected into the application's DOM, the main application class (e.g., `source/class/<app_name>/Application.js`) **must** include the following JSDoc hint:

* **Format:** `@external(<app_name>/css/bundle.min.css)`
* **Purpose:** This tells the Qooxdoo compiler to automatically add the `<link>` tag to the generated `index.html`.

### 4. The CSS Cascade & `app.css`

The pipeline enforces a specific cascade: **Mantine Order -> Custom Application Styles**.

* Custom application-specific overrides must be placed in `source/resource/<app_name>/css/app.css`.

* **Warning:** Never manually edit `bundle.min.css`; it is a transient build artifact generated by the pipeline.

### 5. Build Pipeline Execution

The CSS bundling is a post-transpilation step.

* **Dependency:** The `bundle-mantine.js` script must be run **after** `qx compile` or `qx clean` to ensure it can analyze the `compiled/<target>/transpiled` directory.
* **Tooling:** `lightningcss` is the required compiler to ensure proper `@import` resolution from `node_modules`.
* **Execution Arguments:** The script supports named arguments to customize pipeline resolution:
  * `--app-name` (default: `myapp`): The namespace/name of the Qooxdoo application.
  * `--target` (default: `source`): The build phase (`source` or `build`).
  * `--styles-dir` (optional): Custom path to resolve Mantine CSS files (defaults to `node_modules/@mantine/core/styles`).
  * `--map-path` (optional): Custom path to the directory containing `mantine-map.json` or the direct path to the JSON file (defaults to `source/resource/ville`).

### 6. Environment Configuration

The pipeline logic is only active when:

* `ville.cssEngine` is set to `"mantine"` in the application's environment configuration in `compile.json`.

## AI Code Generation Constraints

* **Mode-Aware Generation:** Always determine if the current task is targeting Mode 1 or Mode 2 based on user prompt parameters or file scope.
* **In Mode 2:** Completely ignore layout hints like `alignX`, `allowGrowY`, `flex`, or `spacing` properties on layouts. All structural choices must be applied via CSS classes using DOM element accessors (`widget.getContentElement().addClass()`, `widget.setCssUtilityClass()`, `widget.getContentElement().setStyle()`).
* **State Operations:** Never assign CSS framework-specific layout attributes directly to a base widget instance. Instead, use `widget.setVuiModifier()` with a namespaced category.
* **Appearance Modifications:** Always utilize the `cssStates` accumulator pattern in `style(states)` theme definitions to manage bulk attributes, classes, and styles efficiently.
* **SVG Icons:** Never use `qx.ui.embed.Html` for icons. Always extend `ville.ui.icon.Abstract` (either manually via static `REGULAR`/`FILLED` path definitions or via `generate-icons.js`) so the widget's root DOM element is a pure `<svg>` via `useMarkup()`.
