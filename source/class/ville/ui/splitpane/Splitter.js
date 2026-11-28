/**
 * The Splitter is the interactive draggable divider bar between two panes inside a `{ville.ui.splitpane.Pane}`.
 *
 * @childControl knob {ville.ui.core.Widget} Visual grip knob centered inside the splitter
 */
qx.Class.define("ville.ui.splitpane.Splitter", {
  extend: ville.ui.core.Box,

  /**
   * @param parentPane {ville.ui.splitpane.Pane} Owning split pane
   */
  construct(parentPane) {
    super(new ville.ui.layout.HBox());
    this.setAlignX("center");
    this.setAlignY("middle");
    this.setAttribute("role", "separator");
    this._createChildControl("knob");
  },

  properties: {
    appearance: {
      refine: true,
      init: "splitpane/splitter"
    }
  },

  members: {
    _createChildControlImpl(id) {
      let control;
      switch (id) {
        case "knob":
          control = new ville.ui.core.Widget();
          this._add(control);
          break;
      }
      return control || super._createChildControlImpl(id);
    }
  }
});
