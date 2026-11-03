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

// ... existing code ...

## Mantine CSS Pipeline & Mapping

This project utilizes a specialized orchestration script (`bundle-mantine.js`) to bridge Qooxdoo's dependency-driven architecture with Mantine's component-based styling.

### 1. The Mapping Source of Truth (`mantine-map.json`)

Every component in the `ville.ui.*` namespace that utilizes Mantine styles **must** be registered in `source/resource/ville/mantine-map.json`.

* **The `map` Object:** Every new class must be mapped to an array of its required Mantine CSS filenames.
  * *Example:* `"ville.ui.form.Button": ["UnstyledButton.css", "Button.css"]`

* **The `order` Array:** Defines the master sequence for the CSS cascade. Any new Mantine CSS file dependency introduced **must** be added here.
  * *Constraint:* Fundamental/Reset styles (e.g., `core.css`) must always reside at the top of this array.
    * *Constraint:* Component dependencies must precede the component style (e.g., `UnstyledButton.css` before `Button.css`).

### 2. Class Creation Workflow

When developing a new `ville.ui` component:

1. Identify the required Mantine CSS files from `@mantine/core/styles` in `node_modules`.
2. Update `mantine-map.json` (both `map` and `order`).
3. Ensure the widget applies the appropriate Mantine classes via `this.setCssUtilityClass()` or the `appearance` theme mapping.

### 3. Application Integration via `@external`

To ensure the bundled CSS is injected into the application's DOM, the main application class (e.g., `source/class/ville/Application.js`) **must** include the following JSDoc hint:

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

### 6. Environment Configuration

The pipeline logic is only active when:

* `ville.cssEngine` is set to `"mantine"` in the application's environment configuration in `compile.json`.

## AI Code Generation Constraints

* **Mode-Aware Generation:** Always determine if the current task is targeting Mode 1 or Mode 2 based on user prompt parameters or file scope.
* **In Mode 2:** Completely ignore layout hints like `alignX`, `allowGrowY`, `flex`, or `spacing` properties on layouts. All structural choices must be applied via CSS classes using DOM element accessors (`widget.getContentElement().addClass()`, `widget.setCssUtilityClass()`, `widget.getContentElement().setStyle()`).
