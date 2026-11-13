/**
 * A Button widget which supports various states and allows it to be used
 * via the mouse, touch, pen and the keyboard.
 *
 * If the user presses the button by clicking on it, or the <code>Enter</code> or
 * <code>Space</code> keys, the button fires an {@link qx.ui.core.MExecutable#execute} event.
 *
 * If the {@link qx.ui.core.MExecutable#command} property is set, the
 * command is executed as well.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var button = new qx.ui.form.Button("Hello World");
 *
 *   button.addListener("execute", function(e) {
 *     alert("Button was clicked");
 *   }, this);
 *
 *   this.getRoot().add(button);
 * </pre>
 *
 * This example creates a button with the label "Hello World" and attaches an
 * event listener to the {@link #execute} event.
 *
 * *External Documentation*
 *
 */
qx.Class.define("ville.ui.experimental.ButtonLast", {
  extend: ville.ui.basic.Atom,
  include: [qx.ui.core.MExecutable],
  implement: [qx.ui.form.IExecutable],

  /**
   * @param label {String} label of the atom
   * @param icon {String|ville.ui.core.Widget?null} Icon to use
   * @param command {qx.ui.command.Command?null} Command instance to connect with
   */
  construct(label, icon, command) {
        
    super(label, icon);

    this._contentElementTag = "button";

    if (command != null) {
      this.setCommand(command);
    }

    // ARIA attrs
    //this.getContentElement().setAttribute("role", "button");
        
    },

    properties: {

        // overridden
        appearance: {
            refine: true,
            init: "button"
        }
    },

    members: {

        // overridden
        /**
         * @lint ignoreReferenceField(_forwardStates)
         */
        _forwardStates: {
            focused: true,
            hovered: true,
            pressed: true,
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
        press() {
            if (this.hasState("abandoned")) {
                return;
            }
            this.addState("pressed");
        },

        /**
         * Manually release the button
         */
        release() {
            if (this.hasState("pressed")) {
                this.removeState("pressed");
            }
        },

        /**
         * Completely reset the button (remove all states)
         */
        reset() {
            this.removeState("pressed");
            this.removeState("abandoned");
            this.removeState("hovered");
        }

    }
  });
