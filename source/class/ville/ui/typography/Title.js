/**
 * Mode 3 CSS-driven Title widget (`ville.ui.typography.Title`) that renders
 * semantic `<h1>`–`<h6>` heading elements with safe `ville.html.Text` content
 * and `"order-<1..6>"` modifier states for Appearance themes.
 *
 * @example
 * const heading = new ville.ui.typography.Title(2, "Section Heading");
 */
qx.Class.define("ville.ui.typography.Title", {
  extend: ville.ui.core.Widget,

  /**
   * Creates a new Title heading widget.
   *
   * @param {1|2|3|4|5|6} [order=1] Heading level (`1` through `6`, rendering `<h1>`–`<h6>`).
   * @param {string|qx.locale.LocalizedString|null} [text] Heading text content.
   */
  construct(order, text) {
    super();

    if (order !== undefined) {
      this.setOrder(order);
    } else {
      this.initOrder();
    }

    if (text != null) {
      this.setText(text);
    }
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"typography-title"`).
     */
    appearance: {
      refine: true,
      init: "typography-title"
    },

    /**
     * Semantic heading level (`1`–`6`). Sets the initial `<h1–h6>` tag before
     * DOM creation and synchronizes the `"order-<value>"` widget state.
     *
     * @type {1|2|3|4|5|6}
     */
    order: {
      check: [1, 2, 3, 4, 5, 6],
      init: 1,
      apply: "_applyOrder",
      event: "changeOrder",
      themeable: true
    },

    /**
     * Plain-text heading content rendered via `ville.html.Text`.
     * Accepts standard strings or `qx.locale.LocalizedString` instances.
     *
     * @type {string|qx.locale.LocalizedString|null}
     */
    text: {
      check(value) {
        return qx.lang.Type.isString(value);
      },
      apply: "_applyText",
      event: "changeText",
      nullable: true
    }
  },

  members: {
    /** @type {"h1"|"h2"|"h3"|"h4"|"h5"|"h6"} @private */
    __contentElementTag: "h1",

    /** @type {ville.html.Text|null} @private */
    __textNode: null,

    /**
     * Creates the semantic `<h1–h6>` `ville.html.Element`.
     *
     * @returns {ville.html.Element} Root heading element.
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element(this.__contentElementTag);
    },

    /**
     * Property apply handler for `order`. Updates the target heading tag prior
     * to element instantiation and synchronizes the `"order-<value>"` state.
     *
     * @param {1|2|3|4|5|6} value New heading order.
     * @param {1|2|3|4|5|6|undefined} old Previous heading order.
     * @protected
     */
    _applyOrder(value, old) {
      this.__contentElementTag = "h" + value;
      this._syncModifierState(
        "order",
        value != null ? String(value) : null,
        old != null ? String(old) : null
      );
    },

    /**
     * Property apply handler for `text`. Updates the heading's `ville.html.Text`
     * node safely without `innerHTML` and flushes buffered DOM mutations.
     *
     * @param {string|qx.locale.LocalizedString|null} value New heading text.
     * @protected
     */
    _applyText(value) {
      const resolved = value && value.translate ? value.translate() : value;
      const textContent = resolved != null ? String(resolved) : "";

      if (!this.__textNode) {
        this.__textNode = new ville.html.Text(textContent);
        this.getContentElement().add(this.__textNode);
      } else {
        this.__textNode.setText(textContent);
      }
    }
  },

  /**
   * Disposes the internal `ville.html.Text` node on widget destruction.
   */
  destruct() {
    if (this.__textNode) {
      this.__textNode.dispose();
      this.__textNode = null;
    }
  }
});
