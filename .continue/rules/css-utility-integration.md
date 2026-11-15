---
name: CSS Utility Integration
description: Guidelines for integrating modern CSS utility tokens and frameworks into ville.CssUtilityClasses on qooxdoo v7.9.3
alwaysApply: true
---

# Project Goal & Active Patches: ville.CssUtilityClasses

You are an expert AI assisting in the development of `ville.CssUtilityClasses` running on qooxdoo v7.9.3.

## Glossary of Terms

Terms defined here and used in this rule file:

- **QxLayout** - Qooxdoo's UI positioning system, simply referred to as the layout engine (or layout system), which coordinates individual layout managers within the `qx.ui.layout` namespace alongside `qx.ui.core.LayoutItem` and `qx.ui.core.queue.*`.

## Core Objective

The primary mission of this project is to integrate external modern UI framework CSS utility tokens and build pipelines (Mantine, shadcn/Tailwind, Carbon Design SCSS, Tabler) directly into the qooxdoo ecosystem.

## Tri-Mode Core Architecture

This project operates in three distinct modes controlled by environment variables set in `compile.json` and the target application base classes. Always check these flags and class hierarchies when generating or modifying code:

### Mode 1: Hybrid Approach (Qooxdoo Layouts + CSS Styling)

- **Trigger:** `qx.core.Environment.get("ville.cssEngine") == "mantine"` (or `"tailwindcss"` or `"scss"`) AND `ville.cssLayout` is `false`.
- **Application Core:** Uses standard `qx.application.Standalone` and `qx.application.Inline`.
- **Mechanism:** Uses `qx.Class.include` to inject CSS class assignment capabilities (`ville.cssuc.patch.MWidget`) into `qx.ui.core.Widget`.
- **Implementation Rule:** When modifying widgets in this mode, preserve qooxdoo's native layout engine managers (`VBox`, `HBox`, `Grid`). Use Qooxdoo's native theming classes (`qx.Theme` - `Appearance` and `Font` only — **never** use `Decorators`) to set a widget's CSS utility classes using its `cssUtilityClass` property. CSS utility classes are primarily for structural aesthetics, colors, typography, and atomic component styles—**do not** let CSS override structural dimensions handled by layout managers.

### Mode 2: CSS Adapted (Bypassing Qooxdoo Layout Engine)

- **Trigger:** `qx.core.Environment.get("ville.cssLayout") == true` and `qx.core.Environment.get("ville.cssEngine") == "mantine"` (or `"tailwindcss"` or `"scss"`), running on patched `qx.ui.*` classes.
- **Application Core:** Uses custom `ville.ui.application.Standalone` which extends `qx.application.Standalone` and applies framework patches `ville.cssuc.patch.MLayoutItem`, `ville.cssuc.patch.MLayoutQueue`, `ville.cssuc.patch.MWidget`, and `ville.cssuc.patch.MLabel` automatically.
- **Mechanism:** Bypasses the native JavaScript layout calculation system completely across `LayoutItem`, `Layout` queue, and `Widget` while retaining `qx.ui.core.Widget` as the base widget class.
- **Implementation Rule:** In this mode, bypass qooxdoo's internal positioning calculations entirely. Let Mantine, Tailwind (shadcn) flex/grid classes, or SCSS (Carbon/Tabler) manage component layout positions, sizes, and responsiveness directly in the DOM. Because `ville.cssuc.patch.MWidget` patches `qx.ui.core.Widget` externally, it cannot access private `__states` and must use `setVuiModifier()` with the protected `_villeuiStates` whitelist map.

### Mode 3: Pure CSS Approach (Complete Independence from Core Qooxdoo Layout Engine)

- **Trigger:** `qx.core.Environment.get("ville.cssLayout") == true` and `qx.core.Environment.get("ville.cssEngine") == "mantine"` (or `"tailwindcss"` or `"scss"`), utilizing the standalone `ville.ui.*` widget and application hierarchy.
- **Application Core:** Uses custom `ville.ui.core.Widget` (extending `qx.core.Object` directly), `ville.ui.application.AbstractGui`, `ville.ui.application.Standalone`, `ville.ui.root.Abstract`, and `ville.ui.root.Application`, which completely omit all classes, imports, and calls to `QxLayout` (`qx.ui.layout.*`, `qx.ui.core.LayoutItem`, `qx.ui.core.queue.*`).
- **Mechanism:** Replaces `qx.ui.core.Widget` and Qooxdoo's layout/appearance queues with a lean, zero-layout-engine base class (`ville.ui.core.Widget`) that wraps `qx.html.Element` directly, coalesces state-driven Appearance lookups via microtasks (`queueMicrotask`), and delegates layout, sizing, and visual tokens 100% to native CSS (`ButtonVui.css`, etc.) and `qx.theme.manager.Appearance`.
- **Implementation Rule:**
  1. **Never import or reference `qx.ui.core.Widget`, `qx.ui.core.LayoutItem`, or `qx.ui.core.queue.*` in Mode 3 classes.** All widgets extend `ville.ui.core.Widget`.
  2. **Use Native Qooxdoo States & `_syncModifierState` (No `setVuiModifier`):** Because `ville.ui.core.Widget` owns `this.__states` directly, do not use `setVuiModifier` or `_villeuiStates`. Define design modifiers (`variant`, `size`, `radius`, `iconPosition`, `fullWidth`) as `themeable: true` properties and translate them to states inside their `_apply*` methods using `this._syncModifierState(prefix, value, old)` or `addState` / `removeState` / `replaceState`.
  3. **Keep Widgets CSS-Engine Agnostic:** Widget classes (`ville.ui.form.Button`, etc.) must only manage behavior, child controls, accessibility (`aria-*`), and Qooxdoo states (`hovered`, `pressed`, `abandoned`, `focused`, `disabled`, `loading`, `variant-*`, `size-*`, `radius-*`). Never hardcode framework-specific `data-*` attributes or CSS class names inside widget classes.
  4. **Delegate Visual Tokens to CSS & Appearance Themes:** Appearance themes map widget states into `cssUtilityClass` and `cssStates` (`set-attributes`, `set-classes`, `set-styles`), while component stylesheets (e.g., `ButtonVui.css`) resolve visual tokens natively via `[data-variant]`, `[data-size]`, and CSS custom properties.

#### Property Routing Rule: State-Driven Modifiers vs. Direct DOM Properties

When adding properties to any `ville.ui.*` widget in Mode 3, classify the property into one of three categories:

1. **Visual & Layout Modifiers $\rightarrow$ Route Through Widget States (`_syncModifierState`)**
   - **Examples:** `variant`, `size`, `radius`, `color`, `orientation`, `iconPosition`, `fullWidth`, `loading`.
   - **Why:** Different CSS engines represent these differently (Mantine uses `data-*` attributes and `--button-*` CSS variables; Tailwind uses utility classes; Carbon/Tabler use BEM classes). Converting these properties into framework-neutral states (`variant-outline`, `size-lg`, `radius-md`) via `this._syncModifierState(prefix, value, old)` keeps widget classes 100% engine-agnostic, enables cross-state rules inside `style(states)`, and coalesces multi-property updates into a single microtask `syncAppearance()` pass.

2. **Appearance Output Properties $\rightarrow$ Direct DOM Delta-Diffing (`themeable: true`)**
   - **Examples:** `cssUtilityClass`, `cssStates`.
   - **Why:** These are the target transport properties that `syncAppearance()` writes *to* via `setThemedCssUtilityClass()` and `setThemedCssStates()`. Routing them through widget states would be circular.

3. **Universal W3C / HTML Primitives $\rightarrow$ Direct DOM Mutation in `_apply*`**
   - **Examples:** `ariaRole`, `enabled` (`disabled` / `aria-disabled`), `visibility`, `anonymous` (`pointer-events`), `href`, `type`.
   - **Why:** Standard HTML attributes, WAI-ARIA roles/states, and browser layout primitives (`display: none`, `pointer-events: none`) behave identically across all CSS frameworks and require no Appearance theme translation.

---

## Deployed Architecture Patches (Active in Mode 2)

When `ville.cssLayout` is active in Mode 2, the legacy `qx.ui.*` framework layout engine is neutralized using these explicit, isolated custom patches:

1. **`ville.cssuc.patch.MLayoutItem` (applied to `qx.ui.core.LayoutItem`)**
   - Completely overrides `renderLayout(left, top, width, height)` to simply `return null;`.
   - **Implication:** Bypasses all absolute pixel computations, preventing inline coordinates from wiping out external CSS layout classes.

2. **`ville.cssuc.patch.MLayoutQueue` (applied to `qx.ui.core.queue.Layout`)**
   - Direct static interceptor on the global `Layout.add(widget)` method to short-circuit queue additions.
   - **Implication:** Stops layout invalidation tasks from ever processing in the background, minimizing CPU layout cycles.

3. **`ville.cssuc.patch.MWidget` (applied to `qx.ui.core.Widget`)**
   - **Layout Neutralization:**
     - Overrides `_setLayout()` to a no-op: `return;`.
     - Replaces `_getLayout()` with a decoupled virtual layout mock containing zero dependencies on real layout classes:

       ```javascript
       _getLayout() {
         return {
           connectToWidget: function() {},
           disconnectFromWidget: function() {},
           invalidateLayoutCache: function() {},
           invalidateChildrenCache: function() {},
           verifyLayoutProperty: function(propName, value) { return true; },
           hasHeightForWidth: function() { return false; },
           getSizeHint: function() {
             return { width: 0, height: 0, minWidth: 0, minHeight: 0, maxWidth: Infinity, maxHeight: Infinity };
           }
         };
       }
       ```

     - Overrides `_afterAddChild(child)` and `_afterRemoveChild(child)` to fire `addChildWidget` / `removeChildWidget` data events and immediately `return;` without calling `layoutManager.addChild()` or `removeChild()`.
   - **Inline Style & Legacy Class Scrubbing:**
     - Overrides `__createContentElement()` and provides `clearAllInlineStyles`, `excludeInlineStyles`, and `removeCssClasses` themeable properties to strip inline styles injected by legacy `qx.ui.core.Widget` initialization (including in `qx.debug` builds).
     - Overrides `_applyFocusable`, `_applyCursor`, and `_applyZIndex` to prevent legacy inline outline, cursor, and z-index styles from polluting the DOM element.
   - **Direct DOM Passthrough API:**
     - Exposes `addClass`, `removeClass`, `setStyle`, `getStyle`, `setStyles`, `removeStyle`, `setAttribute`, `getAttribute`, `setAttributes`, and `removeAttribute` directly on the widget instance, delegating to `this.getContentElement()`.

---

## Mode 2 State Management & DOM Patching (`ville.cssuc.patch.MWidget`)

In Mode 1 and Mode 2, `ville.cssuc.patch.MWidget` patches `qx.ui.core.Widget` externally to decouple UI components from specific CSS framework APIs.

**CRITICAL DESIGN CONSTRAINT IN MODE 1 & 2 (Qooxdoo Private Members):** Qooxdoo enforces strict access control; Mixins and Patches *cannot* access target class variables prefixed with double underscores (e.g., `__states` on `qx.ui.core.Widget`). To circumvent this restriction in Mode 1 and Mode 2, state manipulations rely on a protected whitelist map (`_villeuiStates`) and public state methods (`hasState()`, `replaceState()`, `addState()`).

### 1. Agnostic State Assignment (`setVuiModifier` - Mode 1 & Mode 2)

```javascript
/** @type {Map} List of all available ville ui widget states. */
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
  "radius-xs": true,
  "radius-sm": true,
  "radius-md": true,
  "radius-lg": true,
  "radius-xl": true,
  "variant-default": true,
  "variant-filled": true,
  "variant-outline": true,
  "variant-subtle": true,
  "data-loading": true
},

/**
 * Sets a mutually exclusive namespaced state (e.g., category: "variant", value: "filled")
 * Results in the state "variant-filled" being added, and any other "variant-*" being removed.
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
    if (this.hasState(stateName) && stateName.startsWith(prefix)) {
      if (modState != stateName) {
        this.replaceState(stateName, modState);
        replaced = true;
        break;
      } else {
        locatedsame = true;
      }
    }
  }

  if (!replaced && !locatedsame) {
    this.addState(modState);
  }

  return;
}
```

### 2. Delta-Diffing State-to-DOM Resolution (`_applyCssStates` in `MWidget.js`)

In `ville.cssuc.patch.MWidget`, `_applyCssStates(value, old)` uses an $O(1)$ reference check (`!value || value === old`) and compares incoming entries against `old` so only changed attributes, classes, and inline styles are written to the DOM:

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
  // O(1) Reference Check (Bypasses heavy deep equality)
  if (!value || value === old) {
    return;
  }

  // 1. Set attributes (Map / Plain Object)
  const setAttrs = value["set-attributes"];
  if (setAttrs) {
    const oldAttrs = old ? old["set-attributes"] : null;
    let deltaAttrs = null;

    for (const key in setAttrs) {
      if (!oldAttrs || oldAttrs[key] !== setAttrs[key]) {
        deltaAttrs = deltaAttrs || {};
        deltaAttrs[key] = setAttrs[key];
      }
    }
    if (deltaAttrs) this.setAttributes(deltaAttrs, true);
  }

  // 2. Remove attributes (Array of strings)
  const removeAttrs = value["remove-attributes"];
  if (removeAttrs && removeAttrs.length > 0) {
    const oldRemAttrs = old ? old["remove-attributes"] : null;

    for (let i = 0, l = removeAttrs.length; i < l; i++) {
      const attr = removeAttrs[i];
      if (!oldRemAttrs || !oldRemAttrs.includes(attr)) {
        this.removeAttribute(attr, true);
      }
    }
  }

  // 3. Set / Add classes (Array of strings)
  const setClasses = value["set-classes"];
  if (setClasses && setClasses.length > 0) {
    const oldSetClasses = old ? old["set-classes"] : null;

    for (let i = 0, l = setClasses.length; i < l; i++) {
      const cls = setClasses[i];
      if (!oldSetClasses || !oldSetClasses.includes(cls)) {
        this.addClass(cls);
      }
    }
  }

  // 4. Remove classes (Array of strings)
  const removeClasses = value["remove-classes"];
  if (removeClasses && removeClasses.length > 0) {
    const oldRemClasses = old ? old["remove-classes"] : null;

    for (let i = 0, l = removeClasses.length; i < l; i++) {
      const cls = removeClasses[i];
      if (!oldRemClasses || !oldRemClasses.includes(cls)) {
        this.removeClass(cls);
      }
    }
  }

  // 5. Set / Add inline styles (Map / Plain Object)
  const setStyles = value["set-styles"];
  if (setStyles) {
    const oldStyles = old ? old["set-styles"] : null;
    let deltaStyles = null;

    for (const key in setStyles) {
      if (!oldStyles || oldStyles[key] !== setStyles[key]) {
        deltaStyles = deltaStyles || {};
        deltaStyles[key] = setStyles[key];
      }
    }
    if (deltaStyles) this.setStyles(deltaStyles, true);
  }

  // 6. Remove inline styles (Array of strings)
  const removeStyles = value["remove-styles"];
  if (removeStyles && removeStyles.length > 0) {
    const oldRemStyles = old ? old["remove-styles"] : null;

    for (let i = 0, l = removeStyles.length; i < l; i++) {
      const style = removeStyles[i];
      if (!oldRemStyles || !oldRemStyles.includes(style)) {
        this.removeStyle(style, true);
      }
    }
  }
}
```

---

## Mode 3 Architecture: `ville.ui.core.Widget` & Pure CSS Pipeline

In Mode 3, `ville.ui.core.Widget` replaces `qx.ui.core.Widget` entirely. It extends `qx.core.Object`, includes `qx.locale.MTranslation`, and implements `qx.core.IDisposable`.

### 1. Microtask-Coalesced Appearance Pipeline (Zero Queue Dependencies)

Mode 3 eliminates `qx.ui.core.queue.Appearance`, `qx.ui.core.queue.Layout`, and `qx.ui.core.queue.Manager`. Instead, `ville.ui.core.Widget` coalesces synchronous state and property changes into a single `syncAppearance()` execution per turn using `queueMicrotask` (annotated with `@ignore(queueMicrotask)` to satisfy `@qooxdoo/compiler` symbol checks):

- **Initialization:** `this.initAppearance()` is called at the end of `ville.ui.core.Widget.construct()`.
- **Invalidation (`_invalidateAppearance`):** Called whenever `addState`, `removeState`, `replaceState`, or `_applyAppearance` runs. Sets `this.__appearanceDirty = true` and schedules a microtask to invoke `this.syncAppearance()`. Also invalidates child controls with `__subcontrolId`.
- **Subcontrol Selector Resolution (`_getAppearanceSelector`):** Uses private `__subparent` and `__subcontrolId` references set in `getChildControl(id)` to construct hierarchical Qooxdoo appearance selectors (e.g., `"button/icon"`) without using `$$subcontrol` / `$$subparent` member names.
- **Theme Evaluation & DOM Flush (`syncAppearance`):**
  1. Queries `qx.theme.manager.Appearance.getInstance().styleFrom(selector, this.__states, null, this.getAppearance())`.
  2. Resets properties present in `this.__themeValues` that are no longer returned using `resetThemed<Prop>()`.
  3. Applies returned properties using `setThemed<Prop>(styles[prop])`.
  4. When `!this.__appearanceDirty` (all microtask passes have settled), calls `qx.html.Element.flush()` to commit buffered class, attribute, and style mutations to the live DOM in the same frame.
  5. **Strict Rule:** Never write a `data-states` debug attribute to the HTML element in `syncAppearance()`.

### 2. Direct `__states` Management & `_syncModifierState`

Because `ville.ui.core.Widget` owns `this.__states` directly, Mode 3 replaces `setVuiModifier` and `_villeuiStates` with an $O(1)$ protected helper `_syncModifierState(prefix, value, old)` called directly from `themeable: true` property `apply` methods:

```javascript
/**
 * @protected
 * O(1) helper for mutually exclusive modifier states (e.g., "variant-*", "size-*", "radius-*").
 *
 * @param prefix {String} State category prefix (without trailing hyphen)
 * @param value {String|null} New property value
 * @param old {String|null} Old property value
 */
_syncModifierState(prefix, value, old) {
  const prev = old ? prefix + "-" + old : null;
  const next = value ? prefix + "-" + value : null;

  if (prev && next) {
    this.replaceState(prev, next);
  } else if (prev) {
    this.removeState(prev);
  } else if (next) {
    this.addState(next);
  }
}
```

**Property Apply Pattern in `ville.ui.core.Widget` and Subclasses (`ville.ui.form.Button`):**

```javascript
// In ville.ui.core.Widget:
_applyVariant(value, old) {
  this._syncModifierState("variant", value, old);
},

// In ville.ui.form.Button:
_applySize(value, old) {
  this._syncModifierState("size", value, old);
},

_applyRadius(value, old) {
  this._syncModifierState("radius", value, old);
},

_applyIconPosition(value, old) {
  this._syncModifierState("iconPosition", value, old);
},

_applyFullWidth(value, old) {
  value ? this.addState("fullWidth") : this.removeState("fullWidth");
}
```

### 3. Auto-Cleaning Delta-Differs (`_applyCssUtilityClass` & `_applyCssStates`)

To avoid `@qooxdoo/compiler` global symbol warnings and unnecessary garbage collection, Mode 3 never instantiates ES6 `new Set()` or `new Map()`.

- **`_applyCssUtilityClass(value, old)`:** Splits `old` and `value` into plain `{}` lookup maps and calls `el.removeClass(cls)` only for removed classes and `el.addClass(cls)` only for newly added classes, preserving exact class order.
- **`_applyCssStates(value, old)`:** Diffs `set-attributes`, `set-classes`, and `set-styles` against `old` and **automatically removes** any attribute, class, or inline style that was present in `old` but omitted in `value` (while also honoring explicit `remove-attributes`, `remove-classes`, and `remove-styles` arrays).

### 4. Transparent Event Bridge & Interactive State Machine (`ville.ui.form.Button`)

`ville.ui.core.Widget` overrides `addListener`, `removeListener`, and `hasListener`:

- If `qx.Class.supportsEvent(this.constructor, type)` is `true`, the listener attaches to the Qooxdoo object (`super.addListener`).
- Otherwise, the listener delegates directly to `this.getContentElement().addListener(...)`.

`ville.ui.form.Button` extends `ville.ui.core.Widget`, includes `qx.ui.core.MExecutable`, and implements `qx.ui.form.IExecutable`:

- **Polymorphic Tag Support:** Accepts an optional `component` constructor parameter (`"button"` or `"a"`) stored in `this._contentElementTag` before calling `super()`.
- **Event-to-State Bridge (`_initEventBridge`):** Attaches `tap`, `pointerover`, `pointerout`, `pointerdown`, `pointerup`, `focusin`, `focusout`, `keydown`, and `keyup` directly to `this`, driving standard Qooxdoo methods `press()`, `release()`, `reset()`, and `execute()` across states `hovered`, `pressed`, `abandoned`, `focused`, `disabled`, and `loading`.
- **Flat DOM Child Controls:** Renders button text via a direct `qx.html.Text` node synchronized with an anonymous `ville.ui.basic.Label` child control (`changeValue`), and renders icons (`ville.ui.core.Widget` or `ville.ui.basic.Image`) as direct child elements without nested Mantine wrapper `<span>` tags.

### 5. Mode 3 Appearance Theme & Native CSS Token Resolution (`ButtonVui.css`)

In Mode 3, visual variant and size tokens (`--button-bg`, `--button-hover`, `--button-color`, `--button-bd`, `--button-height`, `--button-padding-x`, `--button-fz`) are resolved natively in `ButtonVui.css` via `:where([data-variant='...'])` and `:where([data-size='...'])` selectors rather than injecting inline styles from JavaScript.

- **Compile-Time `qx.debug` Class Stripping:** Always use a direct `if (qx.core.Environment.get("qx.debug")) { ... } else { ... }` block (never an intermediate boolean variable) when constructing `baseClasses` so `@qooxdoo/compiler` dead-code elimination strips debug-only class strings (`mantine-Button-root`, `mantine-UnstyledButton-root`) from production builds while preserving exact class order in debug builds.
- **Default Property Initialization via `"button"` Appearance Entry:** Default `themeable: true` properties (`variant`, `size`, `radius`, `fullWidth`, `iconPosition`, `show`) are returned by the `"button"` appearance entry so themes control default widget styling without requiring `this.init*()` calls in the widget constructor:

```javascript
"button-frame": {
  style(states) {
    let baseClasses;

    if (qx.core.Environment.get("qx.debug")) {
      baseClasses = [
        "mantine-focus-auto",
        "m_77c9d27d",
        "mantine-Button-root",
        "m_87cf2631",
        "mantine-UnstyledButton-root"
      ];
    } else {
      baseClasses = [
        "mantine-focus-auto",
        "m_77c9d27d",
        "m_87cf2631"
      ];
    }

    const attrs = {};
    const classes = [];
    const styles = {};

    // 1. Disabled / Loading states
    if (states.loading) {
      attrs["data-loading"] = "true";
    }
    if (states.disabled) {
      attrs["data-disabled"] = "true";
    } else {
      classes.push("mantine-active");
    }

    // 2. Full width layout state
    if (states.fullWidth) {
      attrs["data-block"] = "true";
    }

    // 3. Icon position (only emit data-position when an icon is active)
    if (states.hasIcon) {
      attrs["data-position"] = states["iconPosition-right"] ? "right" : "left";
    }

    // 4. Modifier states ("size-*", "variant-*", "radius-*")
    for (const stateName in states) {
      if (stateName.startsWith("size-")) {
        attrs["data-size"] = stateName.slice(5);
      } else if (stateName.startsWith("variant-")) {
        attrs["data-variant"] = stateName.slice(8);
      } else if (stateName.startsWith("radius-")) {
        styles["--button-radius"] = `var(--mantine-radius-${stateName.slice(7)})`;
      }
    }

    return {
      cssUtilityClass: baseClasses.join(" "),
      cssStates: {
        "set-attributes": attrs,
        "set-classes": classes,
        "set-styles": styles
      }
    };
  }
},

"button": {
  include: "button-frame",
  style(states) {
    return {
      variant: "filled",
      size: "sm",
      radius: "sm",
      fullWidth: false,
      iconPosition: "left",
      show: "both"
    };
  }
}
```

---

## Inline SVG Icon Architecture & Pipelines

To guarantee zero-wrapper `<svg>` rendering, maximum DOM performance, and zero XSS risk across all modes, all icons in `ville.ui` extend the base widget class (`qx.ui.core.Widget` in Mode 1/2 or `ville.ui.core.Widget` in Mode 3; never `qx.ui.embed.Html`, which introduces a wrapper `<div>` that breaks `inline-flex` gap alignment) and override `_createContentElement()` using `qx.html.Element.useMarkup()`.

Developers can implement icons using two compatible workflows:

- **Option A (Pre-Generator / Manual Standalone Qooxdoo Classes):** Hand-craft vendor-specific Qooxdoo icon classes (e.g., `ville.ui.icon.fluent.Airplane`) that store static SVG paths (`REGULAR` and `FILLED`) directly on the class without requiring external Node icon packages.
- **Option B (On-Demand Iconify Class Generator - `generate-icons.js`):** Use the offline `@iconify/json` and `@iconify/utils` Node packages to generate native Qooxdoo icon classes on demand from 200,000+ icons across 150+ icon sets.

Both workflows use the unified `ville.ui.icon.Abstract` base class and support three rendering patterns:

1. **Direct Inline `<svg><path .../></svg>` Widget (Default):** Renders the vector directly inside the `<svg>` root element and updates only `innerHTML` when `iconStyle` (`"regular"` vs `"filled"`) changes.
2. **Runtime `<symbol>` / `<use>` Sprite Deduplication (`useSprite = true`):** Registers the icon once inside a hidden global `<svg id="ville-icon-sprite-sheet"><defs>` block in `document.body` and renders `<svg><use href="#..."/></svg>`, saving DOM memory in high-density tables and virtual lists.
3. **Static CSS `clip-path` Values:** Exposes `REGULAR`, `FILLED`, `CLIP_REGULAR`, and `CLIP_FILLED` on the class `statics` map so any widget or Appearance theme can apply the icon shape directly via CSS `clip-path: path('...')`.

### 1. Unified Base Abstract Class (`ville.ui.icon.Abstract`)

```javascript
qx.Class.define("ville.ui.icon.Abstract", {
  extend: ville.ui.core.Widget, // Or qx.ui.core.Widget in Mode 1 & Mode 2
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
        const svgNS = "http://www.w3.org/2000/svg";
        const spriteSvg = document.createElementNS(svgNS, "svg");
        spriteSvg.setAttribute("id", "ville-icon-sprite-sheet");
        spriteSvg.setAttribute("aria-hidden", "true");
        spriteSvg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;";

        const defs = document.createElementNS(svgNS, "defs");
        spriteSvg.appendChild(defs);
        document.body.appendChild(spriteSvg);
        this.__spriteDefs = defs;
      }

      const svgNS = "http://www.w3.org/2000/svg";
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

      // width="1em" height="1em" scales automatically with CSS font-size in Mode 2/3,
      // while Mode 1 layout managers can override via inline pixel styles.
      const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="1em" height="1em" fill="${fill}" stroke="${stroke}"${strokeWidth}${strokeLinecap}${strokeLinejoin}>${innerMarkup}</svg>`;

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

- **Install Dependencies:** `npm install --save-dev @iconify/utils @iconify/json`
- **CLI Usage:**

  ```bash
  node generate-icons.js --icons fluent:airplane-20,tabler:check --out-dir source/class/ville/ui/icon --namespace ville.ui.icon
  ```

### 4. Application Usage Patterns (Inline, Sprite, & CSS `clip-path`)

```javascript
// 1. Standard Inline SVG Widget (<svg><path d="..."/></svg>)
const airplaneIcon = new ville.ui.icon.fluent.Airplane("regular");
airplaneIcon.setIconStyle("filled"); // Mutates innerHTML only, preserving root <svg>

// 2. High-Density Sprite Deduplication (<svg><use href="#..."/></svg>)
const spriteIcon = new ville.ui.icon.fluent.Airplane("filled", true, 20);

// 3. CSS clip-path via Static Class Reference
myWidget.getContentElement().setStyles({
  "width": "20px",
  "height": "20px",
  "background-color": "var(--mantine-primary-color-filled)",
  "clip-path": ville.ui.icon.fluent.Airplane.CLIP_FILLED
}, true);
```

---

## Floating Components, HTML Popover, & CSS Anchor Position APIs

- **Stylesheet Injection Rules:** `ville.ui.application.Standalone` injects CSS Anchor positioning directly to `.ville-popover` elements using `addRules()`:

  ```javascript
  this.addRules([
    "margin: 0;",
    "inset: auto;",
    "position-area: var(--ville-popover-position-area, bottom center);",
    "position-try-fallbacks: var(--ville-popover-position-try-fallbacks, flip-block);",
    "position-try-order: var(--ville-popover-position-try-order, most-height);"
  ], ".ville-popover");
  ```

- **Trigger Requirements:** Any opening widget element (e.g., button, anchor, input) must be set as a valid popover trigger in the DOM, carrying `popovertarget` and `popovertargetaction` attributes.
- **Target Widget Requirements:** Target widgets (`qx.ui.menu.Menu`, `qx.ui.popup.Popup`, and `qx.ui.window.Window`) must be injected with the `popover="auto"` DOM attribute.
- **Future Window Refactoring Rule:** When working with windows or modal overlays, prioritize migrating their underlying content container elements to either use the `popover` attribute or transform the structural DOM node to a native HTML `<dialog>` element.

---

## Mantine CSS Pipeline & Mapping

This project utilizes a specialized orchestration script (`bundle-mantine.js`) to bridge Qooxdoo's dependency-driven architecture with Mantine's component-based styling.

### 1. The Mapping Source of Truth (`mantine-map.json`)

Every component in the `ville.ui.*` namespace that utilizes Mantine styles **must** be registered in `source/resource/ville/mantine-map.json`.

- **The `map` Object:** Every new class must be mapped to an array of its required Mantine CSS filenames.
  - *Example (Mode 1/2):* `"ville.ui.form.Button": ["UnstyledButton.css", "Button.css"]`
  - *Example (Mode 3 flattened DOM):* `"ville.ui.form.Button": ["UnstyledButton.css", "ButtonVui.css"]`
- **The `order` Array:** Defines the master sequence for the CSS cascade. Any new Mantine CSS file dependency introduced **must** be added here.
  - *Constraint:* Fundamental/Reset styles (e.g., `baseline.css`, `default-css-variables.css`, `global.css`) must always reside at the top of this array.
  - *Constraint:* Component dependencies must precede the component style (e.g., `UnstyledButton.css` before `Button.css` / `ButtonVui.css`).

### 2. Application Integration via `@external`

To ensure the bundled CSS is injected into the application's DOM, the main application class (e.g., `source/class/<app_name>/Application.js`) **must** include the following JSDoc hint:

- **Format:** `@external(<app_name>/css/bundle.min.css)`
- **Purpose:** Tells the Qooxdoo compiler to automatically add the `<link>` tag to the generated `index.html`.

### 3. The CSS Cascade & `app.css`

The pipeline enforces a specific cascade: **Mantine Order -> Custom Application Styles**.

- Custom application-specific overrides must be placed in `source/resource/<app_name>/css/app.css`.
- **Warning:** Never manually edit `bundle.min.css`; it is a transient build artifact generated by the pipeline.

### 4. Build Pipeline Execution

- **Dependency:** Run `bundle-mantine.js` **after** `qx compile` or `qx clean` so it can analyze the `compiled/<target>/transpiled` directory.
- **Tooling:** `lightningcss` is the required compiler for `@import` resolution from `node_modules`.
- **Execution Arguments:** `--app-name` (default: `myapp`), `--target` (`source` or `build`), `--styles-dir` (defaults to `node_modules/@mantine/core/styles`), `--map-path` (defaults to `source/resource/ville`).

---

## AI Code Generation Constraints

- **Mode-Aware Generation:** Always determine whether the current task targets **Mode 1**, **Mode 2**, or **Mode 3** based on user prompt parameters and whether the target class extends `qx.ui.core.Widget` (Mode 1/2) or `ville.ui.core.Widget` (Mode 3).
- **In Mode 2 & Mode 3:** Completely ignore Qooxdoo layout hints like `alignX`, `allowGrowY`, `flex`, or `spacing`. All structural layout choices must be applied via CSS classes, `data-*` attributes, or CSS custom properties.
- **State Operations (Mode 2 vs. Mode 3):**
  - In **Mode 2** (`qx.ui.core.Widget` with `MWidget` patch), use `widget.setVuiModifier(category, value)` because `__states` is private on `qx.ui.core.Widget`.
  - In **Mode 3** (`ville.ui.core.Widget`), **never** use `setVuiModifier` or `_villeuiStates`. Define `themeable: true` properties (`variant`, `size`, `radius`, `iconPosition`, `fullWidth`) and call `this._syncModifierState(prefix, value, old)` or `addState` / `removeState` / `replaceState` inside their `_apply*` methods.
- **Compiler & Linter Safety (Mode 3):**
  - Never use ES6 `new Set()` or `new Map()` inside `ville.ui.core.Widget`; use plain `{}` objects so `@qooxdoo/compiler` lint rules and Qooxdoo `check: "Map"` assertions pass with zero warnings.
  - Annotate `_invalidateAppearance()` with `@ignore(queueMicrotask)` when calling `queueMicrotask`.
  - Always use direct `if (qx.core.Environment.get("qx.debug")) { ... } else { ... }` blocks for debug-only classes so `@qooxdoo/compiler` dead-code elimination strips them in production builds.
  - Never output a `data-states` attribute onto DOM elements.
- **SVG Icons:** Never use `qx.ui.embed.Html` for icons. Always extend `ville.ui.icon.Abstract` so the widget's root DOM element is a pure `<svg>` via `useMarkup()`.
