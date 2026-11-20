/* ************************************************************************

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   Authors:
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * Coordinator for mutually exclusive `ville.ui.command.Group` instances.
 *
 * Ensures that at most one registered command group is active at any time
 * (for example, switching active shortcut contexts between views or modals)
 * and provides global `block()` / `unblock()` controls.
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
   * Creates a new command group manager.
   */
  construct() {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();
    this.__groups = [];
  },

  members: {
    /**
     * List of registered command groups.
     *
     * @type {ville.ui.command.Group[]|null}
     * @private
     */
    __groups: null,

    /**
     * Currently active command group, or `null` if none is active.
     *
     * @type {ville.ui.command.Group|null}
     * @private
     */
    __activeGroup: null,

    /**
     * Registers a command group with the manager and deactivates it initially
     * to prevent shortcut collisions.
     *
     * @param {ville.ui.command.Group} group Command group to register.
     * @returns {boolean} `true` if added; `false` if already registered.
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

      // Deactivate added group to prevent collisions
      group.setActive(false);

      return true;
    },

    /**
     * Checks whether a command group is registered with this manager.
     *
     * @param {ville.ui.command.Group} group Command group to test.
     * @returns {boolean} `true` if the group is registered.
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
     * removed group was active.
     *
     * @param {ville.ui.command.Group} group Command group to remove.
     * @returns {ville.ui.command.Group|null} The removed command group, or `null` if not found.
     */
    remove(group) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(
          group,
          ville.ui.command.Group,
          "Group must be an instance of ville.ui.command.Group"
        );
      }

      const index = this.__groups.indexOf(group);
      if (index === -1) {
        if (qx.core.Environment.get("qx.debug")) {
          this.debug(
            "Group was not added before. Please use " +
              "'add()' method to add the group."
          );
        }
        return null;
      }

      // Reset active group
      if (this.getActive() === group) {
        this.__activeGroup = null;
      }

      // Remove group from internal array
      this.__groups.splice(index, 1);

      return group;
    },

    /**
     * Activates the specified registered command group and deactivates all
     * other groups managed by this instance.
     *
     * @param {ville.ui.command.Group} group Command group to activate.
     * @returns {boolean} `true` if activated; `false` if the group is not registered.
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
            "Group was not added before! You have to use 'add()' method before activating!"
          );
        }
        return false;
      }

      // Iterate through all groups and deactivate all except the given one
      for (let i = 0; i < this.__groups.length; i++) {
        const item = this.__groups[i];
        if (item === group) {
          item.setActive(true);
          this.__activeGroup = item;
          continue;
        }
        item.setActive(false);
      }

      return true;
    },

    /**
     * Returns the currently active command group.
     *
     * @returns {ville.ui.command.Group|null} Active command group, or `null`.
     */
    getActive() {
      return this.__activeGroup;
    },

    /**
     * Temporarily deactivates the currently active command group without
     * clearing the `activeGroup` reference.
     */
    block() {
      if (this.__activeGroup) {
        this.__activeGroup.setActive(false);
      }
    },

    /**
     * Re-activates the currently active command group after a `block()` call.
     */
    unblock() {
      if (this.__activeGroup) {
        this.__activeGroup.setActive(true);
      }
    },

    /**
     * Internal lookup helper that finds a registered group by reference.
     *
     * @param {ville.ui.command.Group} group Command group to locate.
     * @returns {ville.ui.command.Group|null} Matching group instance, or `null`.
     * @protected
     */
    _getGroup(group) {
      const index = this.__groups.indexOf(group);
      if (index === -1) {
        return null;
      }

      return this.__groups[index];
    }
  },

  /**
   * Releases internal group array and active group references.
   */
  destruct() {
    this.__groups = this.__activeGroup = null;
  }
});
