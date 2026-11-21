/**
 * Mode 3 virtual DOM text node (`ville.html.Text`) wrapping a browser `Text` node
 * (`document.createTextNode`).
 *
 * Replaces `qx.html.Text` without pulling in `qx.html.*` or `qx.util.DeferredCall`.
 */
qx.Class.define("ville.html.Text", {
  extend: ville.html.Node,

  /**
   * Creates a new virtual text node.
   *
   * @param {string} [text=""] Initial plain-text value (never interpreted as HTML).
   */
  construct(text) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super("#text");
    this.__text = text != null ? String(text) : "";
  },

  members: {
    /** @type {string} @private */
    __text: "",

    /**
     * Creates the underlying browser `Text` node.
     *
     * @override
     * @returns {Text} Browser DOM text node.
     * @protected
     */
    _createDomElement() {
      return document.createTextNode(this.__text);
    },

    /**
     * Updates the text content and schedules a flush if the DOM node already exists.
     *
     * @param {string} value New plain-text string.
     * @returns {this} This instance for chaining.
     */
    setText(value) {
      const next = value != null ? String(value) : "";
      if (this.__text === next) {
        return this;
      }
      this.__text = next;

      if (this._domNode) {
        ville.html.Element._modified[this.toHashCode()] = this;
        ville.html.Element._scheduleFlush();
      }
      return this;
    },

    /**
     * Returns the current plain-text string.
     *
     * @returns {string} Current text content.
     */
    getText() {
      return this.__text;
    },

    /**
     * Copies the text value into the newly created DOM `Text` node.
     *
     * @override
     * @protected
     */
    _copyData() {
      if (this._domNode) {
        this._domNode.nodeValue = this.__text;
      }
    },

    /**
     * Synchronizes updated text content to the live DOM `Text` node on flush.
     *
     * @override
     * @protected
     */
    _syncData() {
      if (this._domNode) {
        this._domNode.nodeValue = this.__text;
      }
    }
  },

  destruct() {
    const hash = this.toHashCode();
    if (hash) {
      delete ville.html.Element._modified[hash];
    }
  }
});
