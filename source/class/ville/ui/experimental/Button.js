/**
 * A modern CSS-driven Button widget implementing Qooxdoo's IExecutable interface.
 */
qx.Class.define("ville.ui.experimental.Button", {
  extend: ville.ui.basic.Atom,
  include: [qx.ui.core.MExecutable],
  implement: [qx.ui.form.IExecutable],

  /**
   * @param label {String?null} Label of the button
   * @param icon {String|ville.ui.core.Widget?null} Icon to use
   * @param command {qx.ui.command.Command?null} Command instance to connect with
   */
  construct(label, icon, command) {
    super(label, icon);

    // Safe constructor assignment after super()
    this._contentElementTag = "button";

    if (command != null) {
      this.setCommand(command);
    }

    // Set default accessible role
    this.setAriaRole("button");

    // Initialize Event Bridge
    this._initEventBridge();
  },

  properties: {
    appearance: {
      refine: true,
      init: "button"
    }
  },

  members: {
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      focused: true,
      hovered: true,
      pressed: true,
      disabled: true
    },

    _createContentElement() {
      const el = new qx.html.Element(this._contentElementTag);
      el.setAttribute("type", "button");
      return el;
    },

    // --- Event Bridge Infrastructure ---

    _initEventBridge() {
      // Standard Qooxdoo DX: attach directly to `this`
      this.addListener("tap", this._onTap, this);
      this.addListener("pointerdown", this._onPointerDown, this);
      this.addListener("pointerup", this._onPointerUp, this);
      this.addListener("pointerout", this._onPointerOut, this);

      // Keyboard interactions
      this.addListener("keydown", this._onKeyDown, this);
      this.addListener("keyup", this._onKeyUp, this);
    },

    _onTap(e) {
      if (!this.getEnabled()) {
        return;
      }
      this.execute();
    },

    _onPointerDown(e) {
      if (!this.getEnabled()) {
        return;
      }
      this.press();
    },

    _onPointerUp(e) {
      this.release();
    },

    _onPointerOut(e) {
      this.release();
    },

    _onKeyDown(e) {
      if (!this.getEnabled()) {
        return;
      }

      const key = e.getKeyIdentifier();
      if (key === "Enter" || key === "Space") {
        this.press();
        e.stopPropagation();
      }
    },

    _onKeyUp(e) {
      const key = e.getKeyIdentifier();
      if (key === "Enter" || key === "Space") {
        if (this.hasState("pressed")) {
          this.release();
          this.execute();
        }
        e.stopPropagation();
      }
    },

    /*
    ---------------------------------------------------------------------------
      USER API
    ---------------------------------------------------------------------------
    */

    press() {
      if (this.hasState("abandoned")) {
        return;
      }
      this.addState("pressed");
    },

    release() {
      if (this.hasState("pressed")) {
        this.removeState("pressed");
      }
    },

    reset() {
      this.removeState("pressed");
      this.removeState("abandoned");
      this.removeState("hovered");
    }
  }
});
