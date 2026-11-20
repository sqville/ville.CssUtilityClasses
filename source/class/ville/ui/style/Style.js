/**
 * Mode 3 `<style>` widget (`ville.ui.style.Style`) for injecting CSS custom
 * properties and scoped rules into the document without `innerHTML`.
 */
qx.Class.define("ville.ui.style.Style", {
  extend: ville.ui.core.Widget,

  /**
   * @param {boolean|null} [blocking] If `true`, sets `blocking="render"`.
   */
  construct(blocking) {
    super();

    if (blocking !== undefined) {
      this.setBlocking(blocking);
    } else {
      this.initBlocking();
    }
  },

  properties: {
    blocking: {
      check: "Boolean",
      apply: "_applyBlocking",
      init: true,
      nullable: true
    },

    styletype: {
      check: ["inline", "classes", "true", "false"],
      apply: "_applyStyletype",
      nullable: true
    },

    value: {
      check: "String",
      apply: "_applyValue",
      nullable: true
    }
  },

  members: {

    __contentElementTag: "style",

    /** @type {qx.html.Text|null} @private */
    __textNode: null,

    /**
     * Creates an inline `<style>` `qx.html.Element`.
     *
     * @returns {qx.html.Element} style element.
     * @protected
     */
    _createContentElement() {
      return new qx.html.Element(this.__contentElementTag);
    },

    /**
     * Property apply handler for `blocking`.
     *
     * @param {boolean|null} value New blocking state.
     * @protected
     */
    _applyBlocking(value) {
      if (value === true) {
        this.getContentElement().setAttribute("blocking", "render");
      } else {
        this.getContentElement().removeAttribute("blocking");
      }
    },

    /**
     * Property apply handler for `styletype`.
     *
     * @param {string|null} value New value for `data-cssengine-styles`.
     * @protected
     */
    _applyStyletype(value) {
      if (value === null || value === "false") {
        this.getContentElement().removeAttribute("data-cssengine-styles");
      } else {
        this.getContentElement().setAttribute("data-cssengine-styles", value);
      }
    },

    /**
     * Updates the `<style>` element's CSS text via a `qx.html.Text` node
     * instead of `innerHTML` (`setAttribute("html", ...)`).
     *
     * @param {string|null} value Raw CSS text.
     * @protected
     */
    _applyValue(value) {
      const contentEl = this.getContentElement();

      if (value) {
        if (!this.__textNode) {
          this.__textNode = new qx.html.Text(value);
          contentEl.add(this.__textNode);
        } else {
          this.__textNode.setText(value);
        }
      } else if (this.__textNode) {
        this.__textNode.setText("");
      }

    }
  },

  destruct() {
    if (this.__textNode) {
      this.__textNode.dispose();
      this.__textNode = null;
    }
  }
});
