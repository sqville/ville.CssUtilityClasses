/**
 * Two-way reactive Form-to-Model controller (`ville.data.controller.Form` — `STRAT-CORE-09` #2).
 *
 * Preserves Qooxdoo's `qx.data.controller.Form` contract (`new FormController(model, targetForm)`,
 * `createModel()`, `updateModel()`, `addBindingOptions()`) while leveraging
 * `ville.data.marshal.Json` (`Proxy`-backed reactive JSON models) and `ville.ui.form.Form`.
 */
qx.Class.define("ville.data.controller.Form", {
  extend: qx.core.Object,

  /**
   * @param {qx.core.Object|null} [model=null] Reactive model instance.
   * @param {ville.ui.form.Form|null} [target=null] Target form instance.
   * @param {boolean} [selfUpdate=false] If `true`, waits for explicit `updateModel()` calls before writing back to the model.
   */
  construct(model = null, target = null, selfUpdate = false) {
    // @ts-ignore
    super();

    this.__bindingOptions = {};
    this.__bindings = [];
    this.setSelfUpdate(Boolean(selfUpdate));

    if (target != null) {
      this.setTarget(target);
    }
    if (model != null) {
      this.setModel(model);
    }
  },

  properties: {
    /**
     * Reactive data model bound to the target form's items.
     */
    model: {
      nullable: true,
      init: null,
      apply: "_applyModel",
      event: "changeModel"
    },

    /**
     * Target `ville.ui.form.Form` instance.
     */
    target: {
      nullable: true,
      init: null,
      apply: "_applyTarget",
      event: "changeTarget"
    },

    /**
     * Whether form control edits require an explicit `updateModel()` call to commit to `model`.
     */
    selfUpdate: {
      check: "Boolean",
      init: false
    }
  },

  members: {
    /** @type {Object<string, { target2model?: Object, model2target?: Object }>|null} @private */
    __bindingOptions: null,

    /** @type {Array<{ source: any, id: any }>|null} @private */
    __bindings: null,

    /**
     * Registers custom directional converters/options for a named form field.
     *
     * @param {string} name Form item name.
     * @param {Object} [model2target] Options (`{ converter }`) from model to form widget.
     * @param {Object} [target2model] Options (`{ converter }`) from form widget to model.
     */
    addBindingOptions(name, model2target, target2model) {
      this.__bindingOptions[name] = {
        model2target: model2target || undefined,
        target2model: target2model || undefined
      };
      if (this.getModel() && this.getTarget()) {
        this.__tearDownBindings();
        this.__setUpBindings();
      }
    },

    /**
     * Creates a new reactive `ville.data.marshal.Json` model from the target form's
     * current items and initial values, assigns it to `this.setModel(model)`, and returns it.
     *
     * @param {boolean} [includeBubbleEvents=true] Whether the created model should fire `changeBubble` events.
     * @returns {qx.core.Object|null} Newly created reactive model.
     */
    createModel(includeBubbleEvents = true) {
      const target = this.getTarget();
      if (!target || typeof target.getItems !== "function") {
        return null;
      }

      const items = target.getItems();
      const data = {};
      for (const name of Object.keys(items)) {
        const item = items[name];
        data[name] =
          typeof item.getValue === "function" ? item.getValue() : null;
      }

      const model = ville.data.marshal.Json.createModel(
        data,
        includeBubbleEvents
      );
      this.setModel(model);
      return model;
    },

    /**
     * Commits all current form widget values into the bound `model` (used when `selfUpdate` is `true`).
     */
    updateModel() {
      const model = this.getModel();
      const target = this.getTarget();
      if (!model || !target || typeof target.getItems !== "function") {
        return;
      }

      const items = target.getItems();
      for (const name of Object.keys(items)) {
        const item = items[name];
        let val = typeof item.getValue === "function" ? item.getValue() : null;
        const opts = this.__bindingOptions?.[name]?.target2model;
        if (opts && typeof opts.converter === "function") {
          val = opts.converter(val);
        }
        const up = name.charAt(0).toUpperCase() + name.slice(1);
        if (typeof model[`set${up}`] === "function") {
          model[`set${up}`](val);
        } else {
          model[name] = val;
        }
      }
    },

    /**
     * @param {qx.core.Object|null} value New model.
     * @protected
     */
    _applyModel(value) {
      this.__tearDownBindings();
      if (value && this.getTarget()) {
        this.__setUpBindings();
      }
    },

    /**
     * @param {ville.ui.form.Form|null} value New target form.
     * @protected
     */
    _applyTarget(value) {
      this.__tearDownBindings();
      if (value && this.getModel()) {
        this.__setUpBindings();
      }
    },

    /**
     * Establishes bidirectional bindings between `model` and `target.getItems()`.
     *
     * @private
     */
    __setUpBindings() {
      const model = this.getModel();
      const target = this.getTarget();
      if (!model || !target || typeof target.getItems !== "function") {
        return;
      }

      const items = target.getItems();
      for (const name of Object.keys(items)) {
        const item = items[name];
        const m2t = this.__bindingOptions?.[name]?.model2target;
        const t2m = this.__bindingOptions?.[name]?.target2model;

        if (typeof model.bind === "function") {
          const id1 = model.bind(name, item, "value", m2t);
          this.__bindings.push({ source: model, id: id1 });
        }

        if (!this.getSelfUpdate() && typeof item.bind === "function") {
          const id2 = item.bind("value", model, name, t2m);
          this.__bindings.push({ source: item, id: id2 });
        }
      }
    },

    /**
     * Removes all active bindings created by this controller.
     *
     * @private
     */
    __tearDownBindings() {
      if (!this.__bindings) {
        return;
      }
      for (const b of this.__bindings) {
        if (
          b.source &&
          !b.source.isDisposed?.() &&
          typeof b.source.removeBinding === "function"
        ) {
          b.source.removeBinding(b.id);
        }
      }
      this.__bindings.length = 0;
    }
  },

  destruct() {
    this.__tearDownBindings();
    this.__bindings = null;
    this.__bindingOptions = null;
  }
});
