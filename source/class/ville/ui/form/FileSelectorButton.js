/**
 * A file selector button backed by a native `<input type="file">` element.
 */
qx.Class.define("ville.ui.form.FileSelectorButton", {
  extend: ville.ui.form.Button,

  /**
   * @param {string|null} [label=null] Button label
   * @param {string|null} [icon=null] Optional icon spec
   * @param {ville.ui.command.Command|null} [command=null] Optional keyboard command
   */
  construct(label, icon, command) {
    // @ts-ignore
    super(label, icon, command);

    const fileInputEl = (this.__fileInputEl = new ville.html.Element(
      "input",
      { display: "none" },
      { type: "file" }
    ));
    fileInputEl.addListener("change", () => {
      const domInput = /** @type {HTMLInputElement|null} */ (
        fileInputEl.getDomElement()
      );
      this.fireDataEvent("changeFileSelection", domInput ? domInput.files : null);
    });

    const el = this.getContentElement();
    if (el) {
      el.add(fileInputEl);
    }

    this.addListener("execute", () => {
      if (this.getEnabled()) {
        const domInput = /** @type {HTMLInputElement|null} */ (
          fileInputEl.getDomElement()
        );
        if (domInput) {
          domInput.click();
        }
      }
    });
  },

  events: {
    /** Fired when the user selects one or more files. Data: `{FileList}` */
    changeFileSelection: "qx.event.type.Data"
  },

  properties: {
    /** Whether multiple files can be selected */
    multiple: {
      check: "Boolean",
      init: false,
      apply: "_applyMultiple"
    },

    /** Comma-separated list of accepted file MIME types or extensions */
    accept: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyAccept"
    }
  },

  members: {
    /** @type {ville.html.Element|null} @private */
    __fileInputEl: null,

    _applyMultiple(value) {
      if (this.__fileInputEl) {
        if (value) {
          this.__fileInputEl.setAttribute("multiple", "multiple");
        } else {
          this.__fileInputEl.removeAttribute("multiple");
        }
      }
    },

    _applyAccept(value) {
      if (this.__fileInputEl) {
        if (value) {
          this.__fileInputEl.setAttribute("accept", value);
        } else {
          this.__fileInputEl.removeAttribute("accept");
        }
      }
    },

    /**
     * Returns the currently selected `FileList` from the underlying `<input type="file">`.
     *
     * @returns {FileList|null}
     */
    getFiles() {
      const domInput = /** @type {HTMLInputElement|null} */ (
        this.__fileInputEl ? this.__fileInputEl.getDomElement() : null
      );
      return domInput ? domInput.files : null;
    }
  },

  destruct() {
    this.__fileInputEl = null;
  }
});
