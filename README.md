# ville.CssUtilityClasses

Demo applications to show how qooxdoo and CSS utility class frameworks can work together.

## Demos

[Tailwindcss App](https://sqville.github.io/ville.CssUtilityClasses/published/tailwindapp/)

[Tabler App](https://sqville.github.io/ville.CssUtilityClasses/published/tablerapp/)

## About the Project

This project consists of five namespaces:

* ville.cssuc (library) - Mixins for bypassing qooxdoo layout functionality.
* twindapp (application) - Qooxdoo application integrated with [Tailwindcss (version 3)](https://v3.tailwindcss.com/).
* tablerapp (application) - Qooxdoo applicaion loosly integrated with [Tabler's](https://docs.tabler.io/ui/getting-started/installation) bootstrap implementation.

## Getting Started

**Important Note:** This requires patching framework classes using qx.Class.patch().

### Patching framework classes

Add an environment variable named "ville.cssuc" to your project's compile.json file. This variable is only used during a build.

```json
"environment": {
    "ville.cssuc": true
},
```

Any standalone application wanting to use utility classes must include the block of code below:

```javascript
// Add this to the top of the application class
if (qx.core.Environment.get("ville.cssuc")) {
    qx.Class.patch(qx.ui.core.LayoutItem, ville.cssuc.patch.MLayoutItem);
    qx.Class.patch(qx.ui.core.Widget, ville.cssuc.patch.MWidget);
    qx.Class.patch(qx.html.Label, ville.cssuc.patch.MLabel);
    qx.Class.patch(qx.ui.form.AbstractField, ville.cssuc.patch.MAbstractField);
}
```

### Install Tailwindcss V3

```sh
npm install tailwindcss@3
```

### Serve Applications

Run the included bash scripts to build and serve an application:

```sh
bash twindserve.sh
```

```sh
bash tablerserve.sh
```
