/**
 * Keyed registry for grouping related `ville.ui.command.Command` instances so
 * their `active` state can be toggled collectively (`STRAT-CORE-09`).
 *
 * @example
 * const editGroup = new ville.ui.command.Group();
 * editGroup.add("save", saveCommand);
 * editGroup.add("undo", undoCommand);
 * editGroup.setActive(false); // Deactivates all commands in the group
 */
qx.Class.define("ville.ui.command.Group", {
  extend: qx.core.Object,

  construct() {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();
    this._cmds = {};
  },

  properties: {
    /**
     * Activates or deactivates all `ville.ui.command.Command` instances registered in this group.
     */
    active: {
      init: true,
      check: "Boolean",
      apply: "_applyActive",
      event: "changeActive"
    }
  },

  members: {
    /**
     * Map of command keys to `ville.ui.command.Command` instances.
     *
     * @type {Object<string, ville.ui.command.Command>|null}
     * @protected
     */
    _cmds: null,

    /**
     * Property apply handler for `active`.
     *
     * @param {boolean} value New active state.
     * @protected
     */
    _applyActive(value) {
      for (const cmdkey in this._cmds) {
        this._cmds[cmdkey].setActive(value);
      }
    },

    /**
     * Registers a command under a unique string key and synchronizes its `active`
     * property with the group's current `active` state.
     *
     * @param {string} key Unique key identifying the command within the group.
     * @param {ville.ui.command.Command} command Command instance to register.
     * @returns {boolean} `true` if added; `false` if a command with `key` already exists.
     */
    add(key, command) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertString(key, "Key parameter must be a string.");
        qx.core.Assert.assertInstance(
          command,
          ville.ui.command.Command,
          "Given command is not an instance of ville.ui.command.Command"
        );
      }

      if (this.has(key)) {
        return false;
      }

      command.setActive(this.getActive());
      this._cmds[key] = command;
      return true;
    },

    /**
     * Retrieves a registered command by its string key.
     *
     * @param {string} key Key identifying the command.
     * @returns {ville.ui.command.Command|null} Matching command instance, or `null` if not found.
     */
    get(key) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertString(key, "Key parameter must be a string.");
      }
      return this._cmds[key] || null;
    },

    /**
     * Checks whether a command is registered under the specified key.
     *
     * @param {string} key Key identifying the command.
     * @returns {boolean} `true` if a command is registered for `key`.
     */
    has(key) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertString(key, "Key parameter must be a string.");
      }
      return Boolean(this._cmds && this._cmds[key]);
    },

    /**
     * Unregisters and returns a command by its string key.
     *
     * @param {string} key Key identifying the command to remove.
     * @returns {ville.ui.command.Command|null} Removed command instance, or `null` if not found.
     */
    remove(key) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertString(key, "Key parameter must be a string.");
      }
      const cmd = this._cmds[key];
      if (!cmd) {
        return null;
      }
      delete this._cmds[key];
      return cmd;
    }
  },

  destruct() {
    this._cmds = null;
  }
});
