qx.Mixin.define("qxapp.patch.MWidget", {

  members: {

    // property apply
    _applyEnabled(value, old) {
      if (value === false) {
        this.addState("disabled");

        this.getContentElement().setAttribute("data-disabled", true);
        this.getContentElement().removeClass("mantine-active");

        // hovered not configured in widget, but as this is a
        // standardized name in qooxdoo and we never want a hover
        // state for disabled widgets, remove this state every time
        this.removeState("hovered");

        // Blur when focused
        if (this.isFocusable()) {
          // Remove focused state
          this.removeState("focused");

          // Remove tabIndex
          this._applyFocusable(false, true);
        }

        // Remove draggable
        if (this.isDraggable()) {
          this._applyDraggable(false, true);
        }

        // Remove droppable
        if (this.isDroppable()) {
          this._applyDroppable(false, true);
        }
      } else {
        this.removeState("disabled");

        this.getContentElement().removeAttribute("data-disabled");
        this.getContentElement().addClass("mantine-active");

        // Re-add tabIndex
        if (this.isFocusable()) {
          this._applyFocusable(true, false);
        }

        // Re-add draggable
        if (this.isDraggable()) {
          this._applyDraggable(true, false);
        }

        // Re-add droppable
        if (this.isDroppable()) {
          this._applyDroppable(true, false);
        }
      }
    },
  }
});
