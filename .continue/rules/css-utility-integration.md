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

### 1. Agnostic State Assignment (`setUiModifier`)

Base `ville.ui` widgets must remain framework-agnostic. Modifiers (e.g., variant, size, radius) are stored in the widget's internal `__states` map using a namespaced prefix approach.

```javascript
/**
 * Sets a mutually exclusive namespaced state (e.g., category: "variant", value: "filled")
 * Results in the state "variant-filled" being added, and any other "variant-*" being removed.
 */
setUiModifier(category, value) {
  const prefix = category + "-";
  const states = this.__states;
  
  // 1. Remove any existing state with this prefix
  if (states) {
    for (const stateName in states) {
      if (stateName.startsWith(prefix)) {
        this.removeState(stateName);
      }
    }
  }
  
  // 2. Add the new state if a value is provided
  if (value) {
    this.addState(prefix + value);
  }
  
  return this;
}
```

**Implementation Example on an Application Widget:**

```javascript
var pButton = new ville.ui.form.Button("Button");
// Agnostic, native Qooxdoo state management
pButton.setUiModifier("variant", "outline"); 
pButton.setUiModifier("size", "xl");
pButton.setUiModifier("radius", "sm");
```

### 2. State-to-DOM Resolution (`_applyCssStates`)

The `MWidget` mixin provides a unified method to handle the CSS framework-specific payload dispatched by the current Appearance theme. It natively supports bulk assignment maps and iterative array removals.

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

  // 1. Set attributes (Map / Plain Object)
  const setAttrs = value["set-attributes"];
  if (setAttrs) {
    this.setAttributes(setAttrs);
  }

  // 2. Remove attributes (Array of strings)
  const removeAttrs = value["remove-attributes"];
  if (qx.lang.Type.isArray(removeAttrs)) {
    for (const attname of removeAttrs) {
      this.removeAttribute(attname);
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

  // 5. Set / Add inline styles (Map / Plain Object)
  const setStyles = value["set-styles"];
  if (setStyles) {
    this.setStyles(setStyles);
  }

  // 6. Remove inline styles (Array of strings)
  const removeStyles = value["remove-styles"];
  if (qx.lang.Type.isArray(removeStyles)) {
    for (const stylename of removeStyles) {
      this.removeStyle(stylename);
    }
  }
}
```

## CSS Framework Appearance Theming (The Accumulator Pattern)

Appearance themes (e.g., `ville.cssuc.theme.mantine.Appearance`) must use the accumulator pattern. Instead of mapping Qooxdoo decorators, the `style(states)` method evaluates the flat `states` hashmap and builds a structured DOM manipulation object targeting `cssStates`.

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
      changes["remove-classes"].push("mantine-active");
    } else {
      changes["remove-attributes"].push("data-disabled");
      changes["set-classes"].push("mantine-active");
    }

    // 2. Size Modifiers (Driven entirely by CSS Variables, no data-attribute)
    if (states["size-xs"]) {
      changes["set-styles"]["--button-height"] = "var(--button-height-xs)";
      changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-xs)";
      changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-xs)";
    } else if (states["size-md"]) {
      changes["set-styles"]["--button-height"] = "var(--button-height-md)";
      changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-md)";
      changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-md)";
    } else if (states["size-lg"]) {
      changes["set-styles"]["--button-height"] = "var(--button-height-lg)";
      changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-lg)";
      changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-lg)";
    } else if (states["size-xl"]) {
      changes["set-styles"]["--button-height"] = "var(--button-height-xl)";
      changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-xl)";
      changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-xl)";
    } else {
      // Default Size (sm)
      changes["set-styles"]["--button-height"] = "var(--button-height-sm)";
      changes["set-styles"]["--button-padding-x"] = "var(--button-padding-x-sm)";
      changes["set-styles"]["--button-fz"] = "var(--mantine-font-size-sm)";
    }

    // 3. Radius Modifiers (Driven entirely by CSS Variables, no data-attribute)
    if (states["radius-xs"]) {
      changes["set-styles"]["--button-radius"] = "var(--mantine-radius-xs)";
    } else if (states["radius-sm"]) {
      changes["set-styles"]["--button-radius"] = "var(--mantine-radius-sm)";
    } else if (states["radius-lg"]) {
      changes["set-styles"]["--button-radius"] = "var(--mantine-radius-lg)";
    } else if (states["radius-xl"]) {
      changes["set-styles"]["--button-radius"] = "var(--mantine-radius-xl)";
    } else {
      // Default Radius (md)
      changes["set-styles"]["--button-radius"] = "var(--mantine-radius-md)";
    }

    // 4. Variant Modifiers & CSS Variable Assignments
    if (states["variant-filled"]) {
      changes["set-attributes"]["data-variant"] = "filled";
      
      changes["set-styles"]["--button-bg"] = "var(--mantine-color-blue-filled)";
      changes["set-styles"]["--button-color"] = "var(--mantine-color-white)";
      changes["remove-styles"].push("--button-hover", "--button-bd");
      
    } else if (states["variant-outline"]) {
      changes["set-attributes"]["data-variant"] = "outline";
      
      changes["set-styles"]["--button-bg"] = "transparent";
      changes["set-styles"]["--button-hover"] = "var(--mantine-color-blue-outline-hover)";
      changes["set-styles"]["--button-color"] = "var(--mantine-color-blue-outline)";
      changes["set-styles"]["--button-bd"] = "calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-blue-outline)";
      
    } else if (states["variant-subtle"]) {
      changes["set-attributes"]["data-variant"] = "subtle";
      
      changes["set-styles"]["--button-bg"] = "transparent";
      changes["set-styles"]["--button-color"] = "var(--mantine-color-blue-filled)";
      changes["remove-styles"].push("--button-hover", "--button-bd");
      
    } else {
      // Default Variant
      changes["set-attributes"]["data-variant"] = "default";
      
      // Clean up inline styles so the base class can take over
      changes["remove-styles"].push(
        "--button-bg", 
        "--button-hover", 
        "--button-color", 
        "--button-bd"
      );
    }

    return {
      cssStates: changes
    };
  }
}
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
* **State Operations:** Never assign CSS framework-specific layout attributes directly to a base widget instance. Instead, use `widget.setUiModifier()` with a namespaced category.
* **Appearance Modifications:** Always utilize the `cssStates` accumulator pattern in `style(states)` theme definitions to manage bulk attributes, classes, and styles efficiently.
