/* ************************************************************************

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   Authors:
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * Keyed registry for grouping related `ville.ui.command.Command` instances so
 * their `active` state can be toggled collectively[span_133](start_span)[span_133](end_span).
 *
 * @example
 * const editGroup = new ville.ui.command.Group();
 * editGroup.add("save", saveCommand);
 * editGroup.add("undo", undoCommand);
 * editGroup.setActive(false); // Deactivates all commands in the group
 */
qx.Class.define("ville.ui.command.Group", {
  extend: qx.core.Object,

  /**
   * Creates a new empty command group[span_134](start_span)[span_134](end_span).
   */
  construct() {
    super();
    this._cmds = {};
  },

  properties: {
    /**
     * Activates or deactivates all `ville.ui.command.Command` instances registered in this group[span_135](start_span)[span_135](end_span).
     */
    active: {
      init: true,
      check: "Boolean",
      apply: "_applyActive"
    }
  },

  members: {
    /**
     * Map of command keys to `ville.ui.command.Command` instances[span_136](start_span)[span_136](end_span).
     *
     * @type {Object<string, ville.ui.command.Command>|null}
     * @protected
     */
    _cmds: null,

    /**
     * Property apply handler for `active`. Propagates the active flag to every
     * registered command in `_cmds`[span_137](start_span)[span_137](end_span).
     *
     * @param {boolean} value New active state[span_138](start_span)[span_138](end_span).
     * @protected
     */
    _applyActive(value) {
      for (var cmdkey in this._cmds) {
        this._cmds[cmdkey].setActive(value);
      }
    },

    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Registers a command under a unique string key and synchronizes its `active`
     * property with the group's current `active` state[span_139](start_span)[span_139](end_span).
     *
     * @param {string} key Unique key identifying the command within the group[span_140](start_span)[span_140](end_span).
     * @param {ville.ui.command.Command} command Command instance to register[span_141](start_span)[span_141](end_span).
     * @returns {boolean} `true` if added; `false` if a command with `key` already exists[span_142](start_span)[span_142](end_span).
     */
    add(key, command) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertArgumentsCount(
          arguments,
          2,
          2,
          "Given parameter count mismatch! Please provide a key as string " +
            "and a command intsance."
        );

        this.assertString(key, "Key parameter must be a string.");
        this.assertInstance(
          command,
          ville.ui.command.Command,
          "Given command is not an instance of ville.ui.command.Command"
        );
      }

      if (this.has(key)) {
        if (qx.core.Environment.get("qx.debug")) {
          this.debug("Command with key: '" + key + "' already exists!");
        }
        return false;
      }

      command.setActive(this.getActive());
      this._cmds[key] = command;

      return true;
    },

    /**
     * Retrieves a registered command by its string key[span_143](start_span)[span_143](end_span).
     *
     * @param {string} key Key identifying the command[span_144](start_span)[span_144](end_span).
     * @returns {ville.ui.command.Command|null} Matching command instance, or `null` if not found[span_145](start_span)[span_145](end_span).
     */
    get(key) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertString(key, "Key parameter must be a string.");
      }

      var cmd = this._cmds[key];
      if (!cmd) {
        if (qx.core.Environment.get("qx.debug")) {
          this.debug(
            "The key: '" +
              key +
              "' was not added before. Please use " +
              "'add()' method to add the command."
          );
        }

        return null;
      }

      return cmd;
    },

    /**
     * Checks whether a command is registered under the specified key[span_146](start_span)[span_146](end_span).
     *
     * @param {string} key Key identifying the command[span_147](start_span)[span_147](end_span).
     * @returns {boolean} `true` if a command is registered for `key`[span_148](start_span)[span_148](end_span).
     */
    has(key) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertString(key, "Key parameter must be a string.");
      }

      return !!this._cmds[key];
    },

    /**
     * Unregisters and returns a command by its string key[span_149](start_span)[span_149](end_span).
     *
     * @param {string} key Key identifying the command to remove[span_150](start_span)[span_150](end_span).
     * @returns {ville.ui.command.Command|null} Removed command instance, or `null` if not found[span_151](start_span)[span_151](end_span).
     */
    remove(key) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertString(key, "Key parameter must be a string.");
      }

      var cmd = this._cmds[key];
      if (!cmd) {
        if (qx.core.Environment.get("qx.debug")) {
          this.debug(
            "The key: '" +
              key +
              "' was not added before. Please use " +
              "'add()' method to add the command."
          );
        }

        return null;
      }

      delete this._cmds[key];

      return cmd;
    }
  },

  /**
   * Releases the internal command map reference[span_152](start_span)[span_152](end_span).
   */
  destruct() {
    this._cmds = null;
  }
});
