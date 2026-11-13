/* ************************************************************************

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   Authors:
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * Coordinator for mutually exclusive `ville.ui.command.Group` instances[span_191](start_span)[span_191](end_span).
 *
 * Ensures that at most one registered command group is active at any time
 * (for example, switching active shortcut contexts between views or modals)
 * and provides global `block()` / `unblock()` controls[span_192](start_span)[span_192](end_span).
 *
 * @example
 * const manager = new ville.ui.command.GroupManager();
 * manager.add(editorGroup);
 * manager.add(modalGroup);
 * manager.setActive(modalGroup); // Activates modalGroup and deactivates editorGroup
 */
qx.Class.define("ville.ui.command.GroupManager", {
  extend: qx.core.Object,

  /**
   * Creates a new command group manager[span_193](start_span)[span_193](end_span).
   */
  construct() {
    super();
    this.__groups = [];
  },

  members: {
    /**
     * List of registered command groups[span_194](start_span)[span_194](end_span).
     *
     * @type {ville.ui.command.Group[]|null}
     * @private
     */
    __groups: null,

    /**
     * Currently active command group, or `null` if none is active[span_195](start_span)[span_195](end_span).
     *
     * @type {ville.ui.command.Group|null}
     * @private
     */
    __activeGroup: null,

    /**
     * Registers a command group with the manager and deactivates it initially
     * to prevent shortcut collisions[span_196](start_span)[span_196](end_span).
     *
     * @param {ville.ui.command.Group} group Command group to register[span_197](start_span)[span_197](end_span).
     * @returns {boolean} `true` if added; `false` if already registered[span_198](start_span)[span_198](end_span).
     */
    add(group) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(
          group,
          ville.ui.command.Group,
          "Given group is not an instance of ville.ui.command.Group"
        );
      }

      if (this.__groups.includes(group)) {
        if (qx.core.Environment.get("qx.debug")) {
          this.debug("Group is already added!");
        }
        return false;
      }

      this.__groups.push(group);

      // Deactivate added group to prevent collisions[span_199](start_span)[span_199](end_span)
      group.setActive(false);

      return true;
    },

    /**
     * Checks whether a command group is registered with this manager[span_200](start_span)[span_200](end_span).
     *
     * @param {ville.ui.command.Group} group Command group to test[span_201](start_span)[span_201](end_span).
     * @returns {boolean} `true` if the group is registered[span_202](start_span)[span_202](end_span).
     */
    has(group) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(
          group,
          ville.ui.command.Group,
          "Given group is not an instance of ville.ui.command.Group"
        );
      }

      return !!this._getGroup(group);
    },

    /**
     * Removes a command group from the manager, clearing `activeGroup` if the
     * removed group was active[span_203](start_span)[span_203](end_span).
     *
     * @param {ville.ui.command.Group} group Command group to remove[span_204](start_span)[span_204](end_span).
     * @returns {ville.ui.command.Group|null} The removed command group[span_205](start_span)[span_205](end_span).
     */
    remove(group) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(
          group,
          ville.ui.command.Group,
          "Group must be an instance of ville.ui.command.Group"
        );
      }

      var index = this.__groups.indexOf(group);
      if (index === -1) {
        if (qx.core.Environment.get("qx.debug")) {
          this.debug(
            "Group was not added before. Please use " +
              "'add()' method to add the group."
          );
        }
      }

      // Reset active group[span_206](start_span)[span_206](end_span)
      if (this.getActive() === group) {
        this.__activeGroup = null;
      }

      // Remove group from internal array[span_207](start_span)[span_207](end_span)
      this.__groups.splice(index, 1);

      return group;
    },

    /**
     * Activates the specified registered command group and deactivates all
     * other groups managed by this instance[span_208](start_span)[span_208](end_span).
     *
     * @param {ville.ui.command.Group} group Command group to activate[span_209](start_span)[span_209](end_span).
     * @returns {boolean} `true` if activated; `false` if the group is not registered[span_210](start_span)[span_210](end_span).
     */
    setActive(group) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(
          group,
          ville.ui.command.Group,
          "Given group is not an instance of ville.ui.command.Group"
        );
      }

      if (!this.has(group)) {
        if (qx.core.Environment.get("qx.debug")) {
          this.debug(
            "Group was not added before! You have to use 'addCommand()' method before activating!"
          );
        }
        return false;
      }

      // Iterate through all groups and deactivate all except the given one[span_211](start_span)[span_211](end_span)
      for (var i = 0; i < this.__groups.length; i++) {
        var item = this.__groups[i];
        if (item == group) {
          item.setActive(true);
          this.__activeGroup = item;
          continue;
        }
        item.setActive(false);
      }

      return true;
    },

    /**
     * Returns the currently active command group[span_212](start_span)[span_212](end_span).
     *
     * @returns {ville.ui.command.Group|null} Active command group, or `null`[span_213](start_span)[span_213](end_span).
     */
    getActive() {
      return this.__activeGroup;
    },

    /**
     * Temporarily deactivates the currently active command group without
     * clearing the `activeGroup` reference[span_214](start_span)[span_214](end_span).
     */
    block() {
      if (this.__activeGroup) {
        this.__activeGroup.setActive(false);
      }
    },

    /**
     * Re-activates the currently active command group after a `block()` call[span_215](start_span)[span_215](end_span).
     */
    unblock() {
      if (this.__activeGroup) {
        this.__activeGroup.setActive(true);
      }
    },

    /**
     * Internal lookup helper that finds a registered group by reference[span_216](start_span)[span_216](end_span).
     *
     * @param {ville.ui.command.Group} group Command group to locate[span_217](start_span)[span_217](end_span).
     * @returns {ville.ui.command.Group|null} Matching group instance, or `null`[span_218](start_span)[span_218](end_span).
     * @protected
     */
    _getGroup(group) {
      var index = this.__groups.indexOf(group);
      if (index === -1) {
        return null;
      }

      return this.__groups[index];
    }
  },

  /**
   * Releases internal group array and active group references[span_219](start_span)[span_219](end_span).
   */
  destruct() {
    this.__groups = this.__activeGroup = null;
  }
});
