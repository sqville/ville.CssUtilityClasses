qx.Mixin.define("ville.cssuc.patch.form.MButton", {

  members: {

    _forwardStates: {
      disabled: true
    },

    /*
    ---------------------------------------------------------------------------
      USER API
    ---------------------------------------------------------------------------
    */

    /**
     * Manually press the button
     */
    press() {},

    /**
     * Manually release the button
     */
    release() {},

    /**
     * Completely reset the button (remove all states)
     */
    reset() {},

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method for "pointerover" event
     * <ul>
     * <li>Adds state "hovered"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} Mouse event
     */
    _onPointerOver(e) {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }
    },

    /**
     * Listener method for "pointerout" event
     * <ul>
     * <li>Removes "hovered" state</li>
     * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} Mouse event
     */
    _onPointerOut(e) {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }
    },

    /**
     * Listener method for "pointerdown" event
     * <ul>
     * <li>Removes "abandoned" state</li>
     * <li>Adds "pressed" state</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} Mouse event
     */
    _onPointerDown(e) {
      if (!e.isLeftPressed()) {
        return;
      }

      e.stopPropagation();

      // Activate capturing if the button get a pointerout while
      // the button is pressed.
      this.capture();
    },

    /**
     * Listener method for "pointerup" event
     * <ul>
     * <li>Removes "pressed" state (if set)</li>
     * <li>Removes "abandoned" state (if set)</li>
     * <li>Adds "hovered" state (if "abandoned" state is not set)</li>
     *</ul>
     *
     * @param e {qx.event.type.Pointer} Mouse event
     */
    _onPointerUp(e) {
      this.releaseCapture();
      e.stopPropagation();
    },

    /**
     * Listener method for "tap" event which stops the propagation.
     *
     * @param e {qx.event.type.Pointer} Pointer event
     */
    _onTap(e) {
      // "execute" is fired here so that the button can be dragged
      // without executing it (e.g. in a TabBar with overflow)
      this.execute();
      e.stopPropagation();
    },

    /**
     * Listener method for "keydown" event.<br/>
     * Removes "abandoned" and adds "pressed" state
     * for the keys "Enter" or "Space"
     *
     * @param e {Event} Key event
     */
    _onKeyDown(e) {
      switch (e.getKeyIdentifier()) {
        case "Enter":
        case "Space":
          e.stopPropagation();
      }
    },

    /**
     * Listener method for "keyup" event.<br/>
     * Removes "abandoned" and "pressed" state (if "pressed" state is set)
     * for the keys "Enter" or "Space"
     *
     * @param e {Event} Key event
     */
    _onKeyUp(e) {
      switch (e.getKeyIdentifier()) {
        case "Enter":
        case "Space":
          this.execute();
          e.stopPropagation();
      }
    }
  }
});
