# ville.CssUtilityClasses

Demo applications to show how qooxdoo and CSS utility class frameworks can work together.

## Demos

[Tailwindcss App]()

[Tabler App]() 

## About the Project

This project consists of three namespaces, ville.cssuc (library), tlwindapp and tablerapp (applications).

**ville.cssuc** - Mixins for bypassing layout functionality.
**tlwindapp** - Qooxdoo application integrated with [Tailwindcss (version 3)](https://v3.tailwindcss.com/).
**tablerapp** - Qooxdoo applicaion loosly integrated with [Tabler's](https://docs.tabler.io/ui/getting-started/installation) bootstrap implementation.

## Getting Started

**Important Note:** This requires replacing or updating framework classes. It is advised to use a local installation of the qooxdoo framework.

**Update locally installed framework classes**
Update the following classes in your project's nodes_modules @qooxdoo/framework copy. Instead of replacing you can update your local copy with just the changes. Search replacement files for the "ville.cssuc" environment variable.

- Replace/Update local framework's qx.ui.form.AbstractField.js file with replacements/AbstractField.js
- Replace/Update local framework's local framework's qx.html.Label.js with replacements/Label.js
- Replace/Update local framework's local framework's qx.ui.core.Widget.js with replacements/Widget.js

## Serve Applications

Run the included bash scripts to 