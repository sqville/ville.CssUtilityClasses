/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * Decoupled UI command abstraction that binds global keyboard shortcuts
 * (`qx.bom.Shortcut`) and shared action metadata (`label`, `icon`, `enabled`,
 * `toolTipText`, `value`, `menu`) to one or more executable `ville.ui.*` widgets[span_154](start_span)[span_154](end_span).
 *
 * NOTE: Instances of this class must be disposed of after use to unregister
 * the underlying `qx.bom.Shortcut` listener[span_155](start_span)[span_155](end_span).
 *
 * @example
 * const saveCmd = new ville.ui.command.Command("Control+S");
 * saveCmd.setLabel("Save");
 * saveCmd.addListener("execute", (e) => saveDocument());
 * const saveBtn = new ville.ui.form.Button(null, null, saveCmd);
 */
qx.Class.define("ville.ui.command.Command", {
  extend: qx.core.Object,

  /**
   * Creates a new Command with an optional keyboard shortcut[span_156](start_span)[span_156](end_span).
   *
   * @param {string} [shortcut] Key combination string composed of optional modifiers
   *   (`Control`, `Alt`, `Shift`, `Meta`) and a key separated by `+` or `-`
   *   (e.g., `"Alt+F1"`, `"Control+C"`, `"Control+Alt+Delete"`)[span_157](start_span)[span_157](end_span).
   */
  construct(shortcut) {
    super();
    this._shortcut = new qx.bom.Shortcut(shortcut);
    this._shortcut.addListener("execute", this.execute, this);

    if (shortcut !== undefined) {
      this.setShortcut(shortcut);
    }
  },

  events: {
    /**
     * Fired when the command is executed (either via keyboard shortcut or `execute()`).
     * The event's `getData()` payload contains the originating widget or target object[span_158](start_span)[span_158](end_span).
     */
    execute: "qx.event.type.Data"
  },

  properties: {
    /**
     * Whether the command is currently active (typically controlled by a
     * `ville.ui.command.Group`). When `false`, `execute` will not fire even if
     * `enabled` is `true`[span_159](start_span)[span_159](end_span).
     */
    active: {
      init: true,
      check: "Boolean",
      event: "changeActive",
      apply: "_applyActive"
    },

    /**
     * Whether the command and its bound widgets are enabled. When `false`,
     * `execute` will not fire[span_160](start_span)[span_160](end_span).
     */
    enabled: {
      init: true,
      check: "Boolean",
      event: "changeEnabled",
      apply: "_applyEnabled"
    },

    /**
     * Keyboard shortcut combination string delegated to `qx.bom.Shortcut`[span_161](start_span)[span_161](end_span).
     */
    shortcut: {
      check: "String",
      apply: "_applyShortcut",
      nullable: true
    },

    /**
     * Shared text label synchronized to all connected widgets[span_162](start_span)[span_162](end_span).
     */
    label: {
      check: "String",
      nullable: true,
      event: "changeLabel"
    },

    /**
     * Shared icon URI or identifier synchronized to all connected widgets[span_163](start_span)[span_163](end_span).
     */
    icon: {
      check: "String",
      nullable: true,
      event: "changeIcon"
    },

    /**
     * Shared tooltip text synchronized to all connected widgets[span_164](start_span)[span_164](end_span).
     */
    toolTipText: {
      check: "String",
      nullable: true,
      event: "changeToolTipText"
    },

    /**
     * Shared value state (e.g., toggle/checked state) synchronized across connected widgets[span_165](start_span)[span_165](end_span).
     */
    value: {
      nullable: true,
      event: "changeValue"
    },

    /**
     * Shared `ville.ui.menu.Menu` instance synchronized to connected menu buttons[span_166](start_span)[span_166](end_span).
     */
    menu: {
      check: "ville.ui.menu.Menu",
      nullable: true,
      event: "changeMenu"
    }
  },

  members: {
    /**
     * Underlying BOM keyboard shortcut handler[span_167](start_span)[span_167](end_span).
     *
     * @type {qx.bom.Shortcut|null}
     * @protected
     */
    _shortcut: null,

    /**
     * Property apply handler for `active`[span_168](start_span)[span_168](end_span).
     *
     * @param {boolean} value New active state[span_169](start_span)[span_169](end_span).
     * @protected
     */
    _applyActive(value) {
      if (value === false) {
        this._shortcut.setEnabled(false);
      } else {
        // Synchronize shortcut with current "enabled" value of this command[span_170](start_span)[span_170](end_span)
        this._shortcut.setEnabled(this.getEnabled());
      }
    },

    /**
     * Property apply handler for `enabled`[span_171](start_span)[span_171](end_span).
     *
     * @param {boolean} value New enabled state[span_172](start_span)[span_172](end_span).
     * @protected
     */
    _applyEnabled(value) {
      if (this.getActive()) {
        this._shortcut.setEnabled(value);
      }
    },

    /**
     * Property apply handler for `shortcut`[span_173](start_span)[span_173](end_span).
     *
     * @param {string|null} value New keyboard shortcut combination[span_174](start_span)[span_174](end_span).
     * @protected
     */
    _applyShortcut(value) {
      this._shortcut.setShortcut(value);
    },

    /**
     * Fires the `"execute"` data event if both `active` and `enabled` are `true`[span_175](start_span)[span_175](end_span).
     *
     * @param {*} [target] Optional object or widget that triggered execution[span_176](start_span)[span_176](end_span).
     */
    execute(target) {
      if (this.getActive() && this.getEnabled()) {
        this.fireDataEvent("execute", target);
      }
    },

    /**
     * Returns the localized human-readable representation of the configured shortcut[span_177](start_span)[span_177](end_span).
     *
     * @returns {string} Formatted shortcut string[span_178](start_span)[span_178](end_span).
     */
    toString() {
      if (this._shortcut) {
        return this._shortcut.toString();
      }
      return super.toString();
    }
  },

  /**
   * Detaches the shortcut execute listener and disposes the internal `qx.bom.Shortcut`[span_179](start_span)[span_179](end_span).
   */
  destruct() {
    this._shortcut.removeListener("execute", this.execute, this);
    this._disposeObjects("_shortcut");
  }
});
