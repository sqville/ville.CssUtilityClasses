qx.Mixin.define("ville.cssuc.patch.form.MToggleButtonOld", {

  members: {

    /**
     * Listener method for "pointerover" event.
     *
     * @param e {qx.event.type.Pointer} Pointer event
     */
    _onPointerOver(e) {
      return;
    },

    /**
     * Listener method for "pointerout" event.
     *
     * @param e {qx.event.type.Pointer} pointer event
     */
    _onPointerOut(e) {
      return;
    },

    /**
     * Listener method for "pointerdown" event.
     * <ul>
     * <li>Activates capturing</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} pointer event
     */
    _onPointerDown(e) {
      if (!e.isLeftPressed()) {
        return;
      }
      if (this.getReadOnly()) {
        return;
      }

      // Activate capturing if the button get a pointerout while
      // the button is pressed.
      this.capture();

      e.stopPropagation();
    },

      /**
       * Listener method for "pointerup" event.
       * Releases capturing
       *
       * @param e {qx.event.type.Pointer} pointer event
       */
      _onPointerUp(e) {
        this.releaseCapture();
        e.stopPropagation();
      },

      /**
       * Listener method for "keydown" event.
       * for the keys "Enter" or "Space"
       *
       * @param e {Event} Key event
       */
      _onKeyDown(e) {
        if (this.getReadOnly()) {
          return;
        }
        switch (e.getKeyIdentifier()) {
          case "Enter":
          case "Space":
            e.stopPropagation();
        }
      },

      /**
       * Listener method for "keyup" event.
       * for the keys "Enter" or "Space". It also toggles the {@link #value} property.
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
