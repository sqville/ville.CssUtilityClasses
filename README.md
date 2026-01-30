# ville.CssUtilityClasses

Demo applications to show how qooxdoo and CSS utility class frameworks can work together.

## Demos

[Ville UI](https://sqville.github.io/ville.CssUtilityClasses/published/villeui/)

[Tailwindcss App](https://sqville.github.io/ville.CssUtilityClasses/published/tailwindapp/)

[Tabler App](https://sqville.github.io/ville.CssUtilityClasses/published/tablerapp/)

## About the Project

This project consists of five namespaces:

* ville.cssuc (library) - Mixins for bypassing qooxdoo layout functionality.
* ville.ui (library) - Controls for building full applications using Qooxdoo and [Mantine CSS](https://mantine.dev).
* twindapp (application) - Qooxdoo application integrated with [Tailwindcss (version 3)](https://v3.tailwindcss.com/).
* tablerapp (application) - Qooxdoo applicaion loosly integrated with [Tabler's](https://docs.tabler.io/ui/getting-started/installation) bootstrap implementation.
* villeui (application) - Qooxdoo application showing Ville UI controls using Mantine's native CSS implementation

## Getting Started

**Important Note:** This requires patching framework classes using qx.Class.patch(). We recommend using a local installation of Qooxdoo.

### Edit framework classes

Ideally all core classes can be modified using the qx.Class.patch function. However, in practice this approach does not seem to work for key, core classes such as qx.ui.core.LayoutItem and qx.ui.core.Widget. So for now, these types of classes must be updated directly.

* **qx.ui.core.Widget** - Update your local copy with three edits from **replacements/Widget.js**. Search replacements/Widget.js file for the environment variable **"ville.cssuc"**, and update your local copy with the changes. Note: For now, this is the only core class that needs direct updating.

### Set environment variables

Add an environment variable named "ville.cssuc" to your project's compile.json file. This variable is only used during build. Set qx.nativeScrollBars to true.

```json
"environment": {
    "ville.cssuc": true,
    "qx.nativeScrollBars": true
},
```

### Extend, and patch framework classes

Any standalone application wanting to use utility classes must include the block of code below:

```javascript
// Add this to the top of the application class
if (qx.core.Environment.get("ville.cssuc")) {
    qx.Class.include(qx.ui.core.LayoutItem, ville.cssuc.MControl);
    qx.Class.include(qx.ui.core.Widget, ville.cssuc.MCssUtilityClass);
    qx.Class.patch(qx.html.Label, ville.cssuc.patch.MLabel);
    qx.Class.patch(qx.ui.form.AbstractField, ville.cssuc.patch.MAbstractField);
}
```

### Tailwindcss V3 example

```sh
npm install tailwindcss@3
```

### Serve Applications

Run any of the included bash scripts to build and serve a particular application:

#### Ville UI

```sh
bash villeuiserve.sh
```

Or, a smaller project showing just an example login form:

```sh
bash mantineserve.sh
```

#### Tailwind CSS

```sh
bash twindserve.sh
```

#### Tabler CSS

```sh
bash tablerserve.sh
```
