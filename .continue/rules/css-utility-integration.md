---
title: Ville UI CSS Utility Integration
description: Canonical AI Agent Rules and architectural guidelines for Ville UI (Mode 3) and QxMods (Modes 1 & 2) in ville.CssUtilityClasses on qooxdoo v7.9.3
created: 2026-11-08
updated: 2026-11-23
type: architecture
status: active
baseline: v0.1-phase1-baseline
published: false
alwaysApply: true
aliases:
  - AI Agent Rules
  - Project Goal & Active Patches
  - Ville UI Development Guidelines
  - ville.CssUtilityClasses Project
tags:
  - architecture
  - project-overview
  - ai-agent-rules
  - approved-baseline
related:
---

You are an expert software architect assisting in the development of `ville.CssUtilityClasses`, a library running on **qooxdoo v7.9.3**. Always adhere to modern qooxdoo v7+ class syntax (`qx.Class.define`), strict ES6+ standards, and dual-compatible JSDoc tags (valid for both VS Code TypeScript IntelliSense and `@qooxdoo/compiler`). Avoid deprecated qooxdoo v5/v6 APIs.

## Glossary of Terms

- **Ville UI (Mode 3):** The standalone, browser-native widget, virtual DOM, and application architecture (`ville.ui.*`, `ville.html.*`, `villeuiapp.*`) with zero dependency on `qx.ui.*`, `qx.html.*`, `qx.event.handler.*`, Browserify / CommonJS, or legacy polyfills.
- **QxMods (Modes 1 & 2):** Legacy compatibility layers that patch `qx.ui.core.Widget` (`ville.cssuc.patch.*`) to accept CSS utility classes either alongside `QxLayout` (Mode 1) or with `QxLayout` neutralized (Mode 2).
- **QxLayout:** Qooxdoo's legacy JS layout engine (`qx.ui.layout.*`, `qx.ui.core.LayoutItem`, `qx.ui.core.queue.*`).

## Core Objective

Integrate external modern UI framework CSS utility tokens and build pipelines (Mantine, shadcn/Tailwind, Carbon Design SCSS, Tabler, UnoCSS) with Qooxdoo's OOP, property, data-binding, and Appearance theming DX while eliminating legacy DOM/JS bloat in **Ville UI (Mode 3)**.

---

## Ville UI (Mode 3) Founding Rules & Architectural Constraints

> **Scope:** Apply the rules in this section **exclusively** to **Ville UI (Mode 3)** (`ville.ui.*`, `ville.html.*`, and `villeuiapp.*`). **Do not** apply them to legacy Mode 1/2 QxMods applications (`mantineapp`, `qxapp`, `shadcnapp`, `tablerapp`, `twindapp`, `carbonapp`, `villewebsite`) or legacy `qx.ui.*` patches (`ville.cssuc.patch.*`).

### 1. Canonical Virtual DOM Layer (`ville.html.*`) & Zero Legacy Leaks
- **Use `ville.html.*` Exclusively:** Never import or instantiate `qx.html.*`, `qx.bom.Element`, `qx.bom.Input`, `qx.ui.core.Widget`, `qx.ui.core.LayoutItem`, `qx.ui.core.queue.*`, `qx.ui.core.MExecutable`, `qx.ui.form.I*`, or `qx.ui.style.Stylesheet` in Ville UI classes.
- **Canonical Classes:**
  - `ville.html.Node` — Base virtual DOM node and native event listener registry (`wrapNativeEvent`).
  - `ville.html.Element` — Generic HTML/SVG virtual element (`useMarkup`, `useElement`, buffered class/attribute/style flush queue).
  - `ville.html.Text` — Raw DOM `Text` node wrapper (`document.createTextNode`) for zero-span text rendering inside buttons and labels.
  - `ville.html.Root` — Live root DOM anchor wrapper (`<div id="ville-app">`).
  - `ville.html.Input` — Unified native form control element (`<input>`, `<textarea>`, `<select>`).
  - `ville.ui.core.MExecutable` & `ville.ui.form.I*` (`IExecutable`, `IForm`, `IField`, `IModel`, `IBooleanForm`, `INumberForm`, `IDateForm`, `IColorForm`, `IRange`, `IStringForm`, `IFormRenderer`) — Mode 3 interfaces and mixins.
- **No Browserify / CommonJS or Legacy Polyfills:** Ville UI completely excludes Browserify, CommonJS bundles, and legacy polyfills. Integrate third-party libraries via **W3C Custom Elements / Web Components** (`new ville.html.Element("custom-tag")`), **native ES Modules (`ESM`)**, **`<script type="importmap">`**, and **dynamic `await import()`** (annotated with `@ignore(import)`).
- **Direct Defining-Class Static Access (Never `this.constructor.*` for Inherited Statics):** Because `qx.Class.define` does **not** copy `statics` onto subclass constructors, never access base-class static properties or methods via `this.constructor.<staticProp>` (e.g., always write `ville.html.Element._hasRoots`, `ville.html.Element._scheduleFlush()`, `ville.html.Node.wrapNativeEvent()`, `ville.ui.core.Widget.prefersReducedMotion()`). Only use `this.constructor` when reading subclass-overridden statics (`ctor.VIEWBOX`, `ctor.REGULAR`, `ctor.FILLED`) or passing the class to `qx.Class.supportsEvent(this.constructor, type)`.

### 2. Semantic HTML First & Flat DOM
- **Semantic Root Elements:** Return the most specific native HTML tag directly from `_createContentElement()` (`<button>`, `<a>`, `<img>`, `<svg>`, `<dialog>`, `<form>`, `<fieldset>`, `<legend>`, `<label>`, `<input>`, `<details>`, `<summary>`, `<h1>`–`<h6>`, `<hr>`) instead of wrapping it inside a `<div>`.
- **Avoid "Div Soup":** Flatten widget DOM trees to a single root element whenever possible. Expose a polymorphic `component` property on layout and text primitives (`Box`, `VStack`, `HGroup`, `Flex`, `Container`, `SimpleGrid`, `Text`) so callers can render `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`, or `<ul>`/`<li>` directly.
- **Native AOM & First Rule of ARIA:** Rely on native semantic elements to supply built-in keyboard/focus behavior (`Enter`/`Space` on `<button>`, `Escape` on `<dialog>` and `popover="auto"`, arrow keys on shared-`name` `<input type="radio">`). Omit redundant `role` and `tabindex` attributes on native tags.

### 3. 4-Tier Provider-Independent Widget State System (`STRAT-STATE-01`)
Never add JS pointer/focus listeners (`pointerover`, `pointerout`, `pointerdown`, `pointerup`, `focusin`, `focusout`) or toggle `data-hovered` / `"hovered"` / `"pressed"` / `"focused"` states for visual feedback that CSS handles natively. Classify every widget state into one of four tiers:

| Tier | Category | Canonical States / Pseudo-Classes | Ownership & DOM Mechanism |
| :--- | :--- | :--- | :--- |
| **Tier 0** | **Browser-Native Transient Pseudo-Classes (Zero JS State)** | `:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`, `:target`, `:empty`, `::placeholder` | **100% Native CSS.** Never track `hovered`, `pressed`, `abandoned`, or `focused` in `this.__states` or emit `data-hovered` from `Appearance.js`. |
| **Tier 1** | **Native HTML / ARIA / Form States (Direct DOM Sync + CSS Pseudo-Classes)** | `disabled` (`:disabled` / `aria-disabled`), `readonly` (`:read-only`), `required` (`:required`), `checked` (`:checked`), `indeterminate` (`:indeterminate`), `open` (`:popover-open` / `<dialog open>` / `<details open>`), `expanded` (`aria-expanded`) | Mutate the native HTML attribute/IDL property directly in `_apply*` (so CSS pseudo-classes and screen readers work across all frameworks) and add the Qooxdoo state only when `Appearance.js` needs extra utility classes or `data-*` hooks. |
| **Tier 2** | **Component Behavioral & Async Lifecycle States (`this.__states`)** | `loading`, `invalid`, `valid`, `active`, `selected`, `opened`, `expanded`, `collapsed`, `revealed`, `readOnly`, `hasIcon`, `withBorder`, `grow`, `fluid`, `fullWidth` | Managed via `this.addState()` / `this.removeState()` in `_apply*` methods; translated by the active `Appearance.js` theme into provider-specific `cssStates`. |
| **Tier 3** | **Design Token & Layout Modifier States (`_syncModifierState`)** | `variant-*`, `size-*`, `radius-*`, `color-*`, `orientation-*`, `iconPosition-*`, `justify-*`, `align-*`, `gap-*`, `wrap-*`, `cols-*`, `spacing-*` | Managed via `this._syncModifierState(prefix, value, old)` on `themeable: true` properties; translated by `Appearance.js` into CSS custom properties, utility classes, or `data-*` attributes. |

- **Immutable Base `cssUtilityClass` vs. Dynamic `cssStates` (`STRAT-STATE-03`):** Keep `cssUtilityClass` as the static base class list defined once per appearance entry (e.g., `"button-frame"`), while all state-driven mutations flow through `cssStates` (`set-attributes`, `set-classes`, `set-styles`).

### 4. Hybrid Event Architecture & Single-Click `AbstractButton`
- **Exclude Legacy Qooxdoo DOM Event Handlers:** Never import or `@require` `qx.event.Registration` or `qx.event.handler.*`, and never attach synthesized Qooxdoo DOM events (`"tap"`, `"pointerdown"`, `"keyinput"`).
- **Bind Native DOM Events via `getContentElement()`:** `ville.ui.core.Widget` overrides `addListener` so that if `qx.Class.supportsEvent(this.constructor, type)` is `true`, it attaches to the Qooxdoo object (`super.addListener`); otherwise it delegates directly to `this.getContentElement().addListener(type, listener, this, useCapture)`.
- **Lean `ville.ui.core.AbstractButton`:** Extends `ville.ui.core.Widget`, includes `ville.ui.core.MExecutable`, and implements `ville.ui.form.IExecutable`. Its `_initEventBridge()` attaches **only a single native `"click"` listener** that guards `!this.getEnabled() || this.hasState("loading")` and calls `this.execute()`. Native `<button>` automatically synthesizes `click` on keyboard `Enter` and `Space`.
- **Emit Bubbling `CustomEvent`s via `_dispatchNativeEvent()`:** Dispatch widget-level semantic UI events (`"ville:input"`, `"ville:change"`, `"ville:select"`, `"ville:dismiss"`) using `this._dispatchNativeEvent(type, detail, options)`.
- **Preserve `qx.core.MEvent` (`change*`) for Properties & Data Binding:** Keep `event: "change*"` on stateful Qooxdoo properties (`value`, `checked`, `open`, `selected`) so `widget.bind(...)` and `qx.data.controller.*` work seamlessly.

### 5. Form & Input Architecture (`ville.html.Input`, `ville.ui.form.*`)
- **Single Semantic Root (`ville.ui.form.core.Input`):** Build form controls (`TextField`, `PasswordField`, `CheckBox`, `Switch`, `RadioButton`, etc.) on `ville.ui.form.core.Input` wrapping `ville.html.Input`.
- **Zero-JS `:checked` Selection Controls:** Use native `<input type="checkbox">` / `<input type="radio">` with CSS `:checked` (and `label:has(> input:checked)`) for `CheckBox`, `Switch`, `Chip`, `RadioButton`, and `SegmentedControl`, eliminating `qx.ui.form.RadioGroup` and manual DOM icon swapping.
- **Dynamic `type` Switching Rules:** Mutate `domEl.type = nextType` directly (and call `setAttribute("type", nextType, true)`), restricting runtime `setType()` transitions to compatible text-entry types (`text`, `password`, `email`, `search`, `tel`, `url`) while preserving `selectionStart`/`selectionEnd`.
- **Non-Visual `ville.ui.form.Form` & Semantic `<form>` / `<fieldset>` Renderers:** `ville.ui.form.Form` is a non-visual object collector (`qx.core.Object`) that delegates visual layout to an `IFormRenderer` (`AbstractVStackRenderer` rendering a `<form>` root element, and `FieldSet` rendering a `<fieldset>` root with a `<legend>` child control).

### 6. Floating Components, Popover API, CSS Anchor Positioning & Accessible Motion
- **No `qx.ui.style.Stylesheet` in Ville UI (`STRAT-CSS-07`):** Never call `qx.ui.style.Stylesheet` in Ville UI. Place static/responsive `:root` variables (`--app-shell-*`), `.ville-popover` anchor positioning rules, and `@starting-style` transitions in static CSS files (`source/resource/<app>/css/app.css` or `source/resource/ville/ville-menu.css`), reserving `ville.ui.style.Style` strictly for runtime-computed dynamic CSS rules.
- **Native Popover & Anchor Positioning:** Trigger buttons set `popovertarget` and `popovertargetaction`, while target menus/popovers (`ville.ui.menu.Menu`, `ville.ui.overlay.Popover`) use `popover="auto"` and CSS Anchor Positioning (`anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks`).
- **Accessible Motion (`@starting-style` + `prefers-reduced-motion` + `widget.animate()`, `STRAT-EVENT-03`):** Wrap CSS `@starting-style` and `transition` rules (including `overlay` and `display` `allow-discrete` transitions) inside `@media (prefers-reduced-motion: no-preference)`. Route programmatic Web Animations API calls through `widget.animate(keyframes, options)`, which checks `ville.ui.core.Widget.prefersReducedMotion()` (honoring both OS `prefers-reduced-motion: reduce` and explicit `Widget.setReduceMotion(true|false)`) and collapses duration to `0` when reduced motion is active.

### 7. 100% Native Icon Architecture (`ville.ui.icon.Default`, Iconify CSS & `ville.ui.basic.Icon`)
- **Icons Are Native `ville.html.Element`s, Not Per-Icon `Widget` Subclasses:** Never generate or instantiate per-icon `ville.ui.core.Widget` subclasses for icons. All icons render as lightweight native `ville.html.Element` nodes (`<svg>` with global `<symbol>`/`<use>` sprite deduplication, `<span class="i-...">` for Iconify CSS icons, or `<img>` for raster assets) via `ville.ui.icon.Default.createElement(iconSpec, options)`.
- **Built-In Widget Chrome (`ville.ui.icon.Default.GLYPHS`):** Core widgets (`CheckBox`, `RadioButton`, `PasswordField`, `SelectBox`, `ComboBox`, `Spinner`, `DateField`, `Menu.Button`, `Tree`, `Table`, `Modal`, `Window`) pull their default glyphs (`"CHECK"`, `"INDETERMINATE"`, `"RADIO_DOT"`, `"CHEVRON_DOWN"`, `"CHEVRON_RIGHT"`, `"CHEVRON_UP_DOWN"`, `"CLOSE"`, `"EYE"`, `"EYE_OFF"`, `"SORT_ASC"`, `"SORT_DESC"`, `"FOLDER"`, `"FILE"`) from `ville.ui.icon.Default` using `<symbol>`/`<use>` sprite deduplication for high-density scalability.
- **Zero-Child-Widget `AbstractButton`:** `ville.ui.core.AbstractButton` renders its caption via a direct `ville.html.Text` node (`this._textNode`) and its icon via a direct `ville.html.Element` (`this._iconElement`), allocating zero child `ville.ui.core.Widget` instances. Use `ville.ui.basic.Icon` only when adding a standalone non-interactive icon directly into a layout container (`HGroup`, `VStack`, `Box`).

---

## QxMods Legacy Architecture (Modes 1 & 2 Only)

### Mode 1: Hybrid Approach (Qooxdoo Layouts + CSS Styling)
- **Trigger:** `qx.core.Environment.get("ville.cssEngine")` is active AND `ville.cssLayout` is `false`.
- **Mechanism:** Uses `qx.Class.include` to patch `qx.ui.core.Widget` with `ville.cssuc.patch.MWidget` while preserving Qooxdoo's JS layout managers (`VBox`, `HBox`, `Grid`).

### Mode 2: CSS Adapted (Bypassing Qooxdoo Layout Engine on `qx.ui.core.Widget`)
- **Trigger:** `qx.core.Environment.get("ville.cssLayout") == true` on `qx.ui.*` classes.
- **Mechanism:** Neutralizes `QxLayout` via `ville.cssuc.patch.MLayoutItem`, `ville.cssuc.patch.MLayoutQueue`, `ville.cssuc.patch.MWidget`, and `ville.cssuc.patch.MLabel`. Because `MWidget` patches `qx.ui.core.Widget` externally and cannot access private `__states`, Mode 1/2 widgets use `setVuiModifier(category, value)` with `_villeuiStates`. (Never use `setVuiModifier` or `_villeuiStates` in Mode 3 `ville.ui.*` classes.)

---

## Mantine CSS Pipeline & Mapping (`bundle-mantine.js` & `mantine-map.json`)

1. **The Mapping Source of Truth (`source/resource/ville/mantine-map.json`):**
   - Register every `ville.ui.*` component that uses Mantine styles in the `map` object (e.g., `"ville.ui.form.Button": ["UnstyledButton.css", "ButtonVui.css"]`) and ensure all CSS files are sequenced in the `order` array (with `baseline.css`, `default-css-variables.css`, and `global.css` first).
2. **Application Integration via `@external`:**
   - Include `@external(<app_name>/css/bundle.min.css)` in the application class (`source/class/<app_name>/Application.js`) and place custom app styles in `source/resource/<app_name>/css/app.css`. Never manually edit `bundle.min.css`.
3. **Compile-Time `qx.debug` Class Stripping in `Appearance.js`:**
   - Always use a direct `if (qx.core.Environment.get("qx.debug")) { ... } else { ... }` block (never an intermediate boolean variable) when constructing `baseClasses` in `Appearance.js` so `@qooxdoo/compiler` strips human-readable debug classes (`mantine-Button-root`, etc.) from production builds.
4. **Leak Verification Gate (`npm run audit:leaks`):**
   - After modifying any `ville.ui.*`, `ville.html.*`, or `villeuiapp.*` file, compile with `npx qx compile --config-file compile-villeuiapp.json` and run `npm run audit:leaks` (`node check-ville-leaks.js`) to verify zero forbidden `qx.ui.*`, `qx.html.*`, `qx.bom.Element`, or `qx.event.handler.*` classes leaked into the build.
