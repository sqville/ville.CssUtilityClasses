/**
 * Mode 3 executable mixin (`ville.ui.core.MExecutable`) included by interactive
 * action widgets such as `ville.ui.core.AbstractButton`, `ville.ui.form.Button`,
 * and `ville.ui.menu.Button`.
 *
 * Architectural differences from legacy `qx.ui.core.MExecutable`:
 * - Binds `command` to `ville.ui.command.Command` instead of `qx.ui.command.Command`,
 *   eliminating the transitive `qx.ui.menu.Menu` -> `qx.ui.core.Widget` dependency leak.
 * - Implements the Mode 3 two-tier hybrid event dispatch inside `execute()`:
 *   1. Fires the Qooxdoo `"execute"` event (`qx.core.MEvent`) for controller/binding compatibility.
 *   2. Dispatches a bubbling native `CustomEvent("ville:execute", { detail: { command } })`
 *      via `_dispatchNativeEvent()` when mixed into a `ville.ui.core.Widget`.
 * - Replaces legacy `this.$$resyncNeeded = true` and `qx.util.PropertyUtil.getThemeValue`
 *   with `ville.ui.core.Widget#syncAppearance()`.
 */
qx.Mixin.define("ville.ui.core.MExecutable", {
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Fired when the {@link #execute} method is invoked.
     */
    execute: "qx.event.type.Event"
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /**
     * A `ville.ui.command.Command` invoked whenever {@link #execute} is called
     * (e.g., on a button click or keyboard activation).
     */
    command: {
      check: "ville.ui.command.Command",
      apply: "_applyCommand",
      event: "changeCommand",
      nullable: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * Map of property names to active `qx.data.SingleValueBinding` IDs.
     *
     * @type {Object<string, *>|null}
     * @private
     */
    __executableBindingIds: null,

    /**
     * Re-entrancy guard preventing recursive command <-> widget execution loops.
     *
     * @type {boolean}
     * @private
     */
    __commandExecuted: false,

    /**
     * Listener ID for the bound command's `"execute"` event.
     *
     * @type {*}
     * @private
     */
    __executeListenerId: null,

    /**
     * List of properties synchronized from the bound `ville.ui.command.Command`
     * to the including widget via `qx.data` single-value binding.
     *
     * @type {string[]}
     * @protected
     * @lint ignoreReferenceField(_bindableProperties)
     */
    _bindableProperties: qx.core.Environment.select("qx.command.bindEnabled", {
      true: ["enabled", "label", "icon", "toolTipText", "value", "menu"],
      false: ["label", "icon", "toolTipText", "value", "menu"]
    }),

    /**
     * Initiates the executable action:
     * 1. Invokes `command.execute(this)` if a command is bound.
     * 2. Fires the Qooxdoo `"execute"` event (`qx.core.MEvent`).
     * 3. Dispatches a bubbling native `"ville:execute"` `CustomEvent` on the DOM element.
     */
    execute() {
      const cmd = this.getCommand();

      if (cmd) {
        if (this.__commandExecuted) {
          this.__commandExecuted = false;
        } else {
          this.__commandExecuted = true;
          cmd.execute(this);
        }
      }

      this.fireEvent("execute");

      if (typeof this._dispatchNativeEvent === "function") {
        this._dispatchNativeEvent("ville:execute", {
          command: cmd || null
        });
      }
    },

    /**
     * Handler for the bound command's `"execute"` event (e.g., triggered via global
     * keyboard shortcut).
     *
     * @param {qx.event.type.Data} e Command execute event.
     * @private
     */
    __onCommandExecute(e) {
      if (this.__commandExecuted) {
        this.__commandExecuted = false;
        return;
      }
      this.__commandExecuted = true;
      if (typeof this.isEnabled !== "function" || this.isEnabled()) {
        this.execute();
      }
    },

    /**
     * Property apply handler for `command`. Wires bidirectional execution and
     * binds shared metadata properties (`label`, `icon`, `toolTipText`, `value`, `menu`,
     * and optionally `enabled`) from the command to this widget.
     *
     * @param {ville.ui.command.Command|null} value New command instance.
     * @param {ville.ui.command.Command|null} old Previous command instance.
     * @protected
     */
    _applyCommand(value, old) {
      if (old != null && this.__executeListenerId != null) {
        old.removeListenerById(this.__executeListenerId);
        this.__executeListenerId = null;
      }

      if (value != null) {
        this.__executeListenerId = value.addListener(
          "execute",
          this.__onCommandExecute,
          this
        );
      }

      let ids = this.__executableBindingIds;
      if (ids == null) {
        this.__executableBindingIds = ids = {};
      }

      for (let i = 0; i < this._bindableProperties.length; i++) {
        const property = this._bindableProperties[i];

        // Remove old binding
        if (old != null && !old.isDisposed() && ids[property] != null) {
          old.removeBinding(ids[property]);
          ids[property] = null;
        }

        // Add new binding if the widget defines the target property
        if (value != null && qx.Class.hasProperty(this.constructor, property)) {
          let selfPropertyValue = null;
          const cmdPropertyValue = value.get(property);

          if (cmdPropertyValue == null) {
            selfPropertyValue = this.get(property);
            if (
              selfPropertyValue == null &&
              typeof this.syncAppearance === "function"
            ) {
              this.syncAppearance();
              selfPropertyValue = this.get(property);
            }
          }

          ids[property] = value.bind(property, this, property);

          if (selfPropertyValue != null) {
            this.set(property, selfPropertyValue);
          }
        }
      }

      if (typeof this.getContentElement === "function") {
        const el = this.getContentElement();
        if (el) {
          const shortcut =
            value && typeof value.getShortcut === "function"
              ? value.getShortcut()
              : null;
          if (shortcut) {
            el.setAttribute(
              "aria-keyshortcuts",
              String(shortcut).replace(/\+/g, "+")
            );
          } else {
            el.removeAttribute("aria-keyshortcuts");
          }
        }
      }
    }
  },

  /**
   * Unbinds any active command listeners and property bindings on disposal.
   */
  destruct() {
    this._applyCommand(null, this.getCommand());
    this.__executableBindingIds = null;
  }
});
