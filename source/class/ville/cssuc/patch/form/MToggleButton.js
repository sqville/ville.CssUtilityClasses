qx.Mixin.define("ville.cssuc.patch.form.MToggleButton", {

  members: {

    /**
     * Listener method for "pointerover" event.
     * <ul>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} Pointer event
     */
    _onPointerOver(e) {
      if (e.getTarget() !== this) {
        return;
      }
      if (this.getReadOnly()) {
        return;
      }

      // this.addState("hovered");

      if (this.hasState("abandoned")) {
        this.removeState("abandoned");
        this.addState("pressed");
      }
    },

    /**
     * Listener method for "pointerout" event.
     * <ul>
     * <li>Adds "abandoned" state (if "pressed" state is set)</li>
     * <li>Removes "pressed" state (if "pressed" state is set and button is not checked)
     * </ul>
     *
     * @param e {qx.event.type.Pointer} pointer event
     */
    _onPointerOut(e) {
      if (e.getTarget() !== this) {
        return;
      }

      if (this.hasState("pressed")) {
        if (!this.getValue()) {
          this.removeState("pressed");
        }

        this.addState("abandoned");
      }
    }
  }
});
