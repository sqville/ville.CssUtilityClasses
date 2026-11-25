/**
 * Path B Semantic `<textarea>` Widget (`STRAT-FORM-01` & `STRAT-WIDGET-03`).
 *
 * Replaces legacy `qx.ui.form.TextArea` (`qx.ui.form.AbstractField`) by extending
 * `ville.ui.form.core.Input` directly with a `<textarea>` root tag, supporting
 * `rows`, `wrap`, and CSS `field-sizing: content` (`autoSize`).
 */
qx.Class.define("ville.ui.form.TextArea", {
  extend: ville.ui.form.core.Input,

  construct(value) {
    super(value);
    this.initRows();
    this.initWrap();
    this.initAutoSize();
  },

  properties: {
    appearance: {
      refine: true,
      init: "textarea"
    },

    /**
     * Visible number of text lines (`rows` attribute on `<textarea>`).
     */
    rows: {
      check: "Integer",
      init: 3,
      apply: "_applyRows"
    },

    /**
     * Whether lines wrap inside the textarea (`wrap="soft"` vs `"off"`).
     */
    wrap: {
      check: "Boolean",
      init: true,
      apply: "_applyWrap"
    },

    /**
     * Enables modern CSS `field-sizing: content` so the `<textarea>` grows
     * and shrinks automatically with its text content without JS measurement.
     */
    autoSize: {
      check: "Boolean",
      init: false,
      apply: "_applyAutoSize"
    },

    /**
     * Minimum height in pixels when `autoSize` is enabled.
     */
    minimalLineHeight: {
      check: "Integer",
      init: 3
    }
  },

  members: {
    _getTagName() {
      return "textarea";
    },

    _applyRows(value) {
      const el = this.getContentElement();
      if (value != null && value > 0) {
        el.setAttribute("rows", String(value));
      } else {
        el.removeAttribute("rows");
      }
    },

    _applyWrap(value) {
      const el = this.getContentElement();
      el.setAttribute("wrap", value ? "soft" : "off");
    },

    _applyAutoSize(value) {
      const el = this.getContentElement();
      if (value) {
        el.setStyle("field-sizing", "content");
      } else {
        el.removeStyle("field-sizing");
      }
    }
  }
});
