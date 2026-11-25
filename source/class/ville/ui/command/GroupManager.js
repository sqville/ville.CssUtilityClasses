/**
 * Coordinator for mutually exclusive `ville.ui.command.Group` instances (`STRAT-CORE-09`).
 *
 * Ensures that at most one registered command group is active at any time
 * (for example, switching active shortcut contexts between views or modals)
 * and provides global `block()` / `unblock()` controls.
 */
qx.Class.define("ville.ui.command.GroupManager", {
  extend: qx.core.Object,

  construct() {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();
    this.__groups = [];
  },

  members: {
    /** @type {ville.ui.command.Group[]|null} @private */
    __groups: null,

    /** @type {ville.ui.command.Group|null} @private */
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
        qx.core.Assert.assertInstance(
          group,
          ville.ui.command.Group,
          "Given group is not an instance of ville.ui.command.Group"
        );
      }

      if (this.__groups.includes(group)) {
        return false;
      }

      this.__groups.push(group);
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
        qx.core.Assert.assertInstance(
          group,
          ville.ui.command.Group,
          "Given group is not an instance of ville.ui.command.Group"
        );
      }
      return Boolean(this._getGroup(group));
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
        qx.core.Assert.assertInstance(
          group,
          ville.ui.command.Group,
          "Group must be an instance of ville.ui.command.Group"
        );
      }

      const index = this.__groups.indexOf(group);
      if (index === -1) {
        return null;
      }

      if (this.getActive() === group) {
        this.__activeGroup = null;
      }

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
        qx.core.Assert.assertInstance(
          group,
          ville.ui.command.Group,
          "Given group is not an instance of ville.ui.command.Group"
        );
      }

      if (!this.has(group)) {
        return false;
      }

      for (let i = 0; i < this.__groups.length; i++) {
        const item = this.__groups[i];
        if (item === group) {
          item.setActive(true);
          this.__activeGroup = item;
        } else {
          item.setActive(false);
        }
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
      return index === -1 ? null : this.__groups[index];
    }
  },

  destruct() {
    this.__groups = this.__activeGroup = null;
  }
});
