/**
 * Lightweight, non-DOM option/item descriptor for Ville UI data views
 * (`SelectBox`, `ComboBox`, `List`, `CheckedList` — `STRAT-WIDGET-08`).
 *
 * Unlike legacy `qx.ui.form.ListItem` (which allocated a full `Widget` + `Atom` +
 * `Image` + `Label` layout hierarchy per option), `ville.ui.form.ListItem` is a
 * pure reactive data descriptor (`ville.core.Object`) whose rows are materialized
 * in C++ via `ville.ui.core.MDataView`'s pre-compiled `<template>` cloner.
 *
 * Preserves 100% API compatibility with classic Qooxdoo `new ListItem(label, icon, model)`
 * and `MModelSelection` (`getModel()`, `setModel()`).
 */
qx.Class.define("ville.ui.form.ListItem", {
  extend: qx.core.Object,
  include: [ville.ui.form.MModelProperty],

  /**
   * @param {string} [label=""] Display text for the option.
   * @param {string|null} [icon=null] Optional `ville.ui.icon.Default` glyph name or Iconify class.
   * @param {*} [model=null] Optional bound model or value payload.
   */
  construct(label, icon, model) {
    // @ts-ignore
    super();

    if (label !== undefined && label !== null) {
      this.setLabel(String(label));
    }
    if (icon !== undefined && icon !== null) {
      this.setIcon(icon);
    }
    if (model !== undefined) {
      this.setModel(model);
      if (this.getValue() === null && (typeof model === "string" || typeof model === "number")) {
        this.setValue(String(model));
      }
    }
  },

  properties: {
    /** Display text for the option item. */
    label: {
      check: "String",
      init: "",
      event: "changeLabel"
    },

    /** Optional secondary description or subtitle shown in rich dropdowns/lists. */
    description: {
      check: "String",
      nullable: true,
      init: null,
      event: "changeDescription"
    },

    /** Optional `ville.ui.icon.Default` glyph key (e.g. `"FOLDER"`) or Iconify class. */
    icon: {
      check: "String",
      nullable: true,
      init: null,
      event: "changeIcon"
    },

    /** Form/option value string (falls back to `model` or `label` when `null`). */
    value: {
      check: "String",
      nullable: true,
      init: null,
      event: "changeValue"
    },

    /** Whether the item can be selected by the user. */
    enabled: {
      check: "Boolean",
      init: true,
      event: "changeEnabled"
    }
  },

  members: {
    /**
     * Resolves the effective form value of this item (`value` -> `model` -> `label`).
     *
     * @returns {*} Effective option value.
     */
    getEffectiveValue() {
      const val = this.getValue();
      if (val !== null && val !== undefined) {
        return val;
      }
      const model = this.getModel();
      if (model !== null && model !== undefined) {
        return model;
      }
      return this.getLabel();
    }
  }
});
