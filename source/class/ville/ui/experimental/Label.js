/**
 * A modern CSS-driven Label widget supporting text, rich HTML, and dynamic localization.
 */
qx.Class.define("ville.ui.experimental.Label", {
  extend: ville.ui.core.Widget,
  implement: [qx.ui.form.IStringForm],

  /**
   * @param value {String|?null} Text or HTML content to display.
   */
  construct(value) {
    this._contentElementTag = "span";
    super();

    if (value != null) {
      this.setValue(value);
    }

    if (qx.core.Environment.get("qx.dynlocale")) {
      this.__changeLocaleLabelListenerId = qx.locale.Manager.getInstance().addListener(
        "changeLocale",
        this._onChangeLocale,
        this
      );
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "label"
    },

    /**
     * Text or HTML string to display. Supports localized strings.
     */
    value: {
      check: "String",
      apply: "_applyValue",
      event: "changeValue",
      nullable: true
    }

  },

  members: {
    __tapListenerId: null,
    __changeLocaleLabelListenerId: null,

    // --- Content Element Lifecycle ---

    _onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
      true(e) {
        const content = this.getValue();
        if (content && content.translate) {
          this.setValue(content.translate());
        }
      },
      false: null
    }),

    _applyValue: qx.core.Environment.select("qx.dynlocale", {
      true(value, old) {
        if (value && value.translate) {
          this.getContentElement().setAttribute("html", value.translate());
        } else {
          this.getContentElement().setAttribute("html", value || "");
        }
      },
      false(value, old) {
        this.getContentElement().setAttribute("html", value || "");
      }
    })
  },

  destruct() {
    if (qx.core.Environment.get("qx.dynlocale") && this.__changeLocaleLabelListenerId) {
      qx.locale.Manager.getInstance().removeListenerById(this.__changeLocaleLabelListenerId);
    }
    if (this.__tapListenerId) {
      this.removeListenerById(this.__tapListenerId);
    }
  }
});
