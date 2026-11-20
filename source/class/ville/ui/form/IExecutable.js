/**
 * Mode 3 form interface (`ville.ui.form.IExecutable`) for executable widgets
 * (such as `ville.ui.core.AbstractButton`, `ville.ui.form.Button`, and
 * `ville.ui.menu.Button`).
 *
 * Replaces `qx.ui.form.IExecutable` so Mode 3 classes reference
 * `ville.ui.command.Command` instead of pulling `qx.ui.command.Command` (and its
 * `qx.ui.menu.Menu` -> `qx.ui.core.Widget` dependency tree) into the build.
 */
qx.Interface.define("ville.ui.form.IExecutable", {
  events: {
    /**
     * Fired when the widget is executed.
     */
    execute: "qx.event.type.Event"
  },

  members: {
    /**
     * Sets the command bound to this executable widget.
     *
     * @param {ville.ui.command.Command|null} command Command instance to bind.
     */
    setCommand(command) {
      return arguments.length === 1;
    },

    /**
     * Returns the command currently bound to this executable widget.
     *
     * @returns {ville.ui.command.Command|null} Bound command instance, or `null`.
     */
    getCommand() {},

    /**
     * Initiates the executable action.
     */
    execute() {}
  }
});
