/**
 * A toolbar-aware file selector button backed by a native `<input type="file">` element.
 */
qx.Class.define("ville.ui.toolbar.FileSelectorButton", {
  extend: ville.ui.form.FileSelectorButton,

  properties: {
    appearance: {
      refine: true,
      init: "toolbar-button"
    },

    show: {
      refine: true,
      init: "both"
    },

    focusable: {
      refine: true,
      init: false
    }
  }
});
