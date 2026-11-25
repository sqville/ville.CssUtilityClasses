/**
 * Mode 3 Hamburger Menu Toggle Button (`ville.ui.navigation.Burger` — `STRAT-WIDGET-03`).
 *
 * Renders a semantic `<button type="button" aria-label="Toggle navigation">`
 * containing a lightweight `ville.html.Element("div")` bar indicator (`.mantine-Burger-burger`
 * / `.ville-burger-bars`) with **zero child `Widget` instances**, synchronizing
 * `"opened"` state, `data-opened`, and `aria-expanded` whenever `value` (`opened`) toggles.
 *
 * Also aliased to `ville.ui.core.Burger` for backward compatibility.
 *
 * @example
 * const burger = new ville.ui.navigation.Burger();
 * burger.bind("value", appShell, "navbarCollapsed", { converter: (v) => !v });
 */
qx.Class.define("ville.ui.navigation.Burger", {
  extend: ville.ui.form.ToggleButton,

  /**
   * @param {boolean} [opened=false] Initial opened state.
   * @param {"xs"|"sm"|"md"|"lg"|"xl"} [size="md"] Burger button size scale.
   */
  construct(opened = false, size = "md") {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(null, null, opened);

    this.setAriaState("label", "Toggle navigation");
    this.setAriaState("expanded", opened ? "true" : "false");

    this.__barsElement = new ville.html.Element("div");
    this.__barsElement.setAttributes({
      class: "m_d4fb9cad mantine-Burger-burger ville-burger-bars",
      "data-reduce-motion": "true"
    });
    if (opened) {
      this.__barsElement.setAttribute("data-opened", "true");
    }
    this.getContentElement().add(this.__barsElement);

    if (size) {
      this.setSize(size);
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "burger"
    }
  },

  members: {
    /** @type {ville.html.Element|null} @private */
    __barsElement: null,

    /**
     * Convenience alias for `getValue()`.
     *
     * @returns {boolean} `true` if opened.
     */
    isOpened() {
      return Boolean(this.getValue());
    },

    /**
     * Convenience alias for `setValue(opened)`.
     *
     * @param {boolean} opened Whether the burger is in the opened `"X"` state.
     */
    setOpened(opened) {
      this.setValue(Boolean(opened));
    },

    /**
     * @override
     * @param {boolean|null} value New opened state.
     * @param {boolean|null} old Previous opened state.
     * @protected
     */
    _applyValue(value, old) {
      super._applyValue(value, old);
      const isOpen = Boolean(value);
      if (isOpen) {
        this.addState("opened");
        this.setAriaState("expanded", "true");
        if (this.__barsElement) {
          this.__barsElement.setAttribute("data-opened", "true");
        }
      } else {
        this.removeState("opened");
        this.setAriaState("expanded", "false");
        if (this.__barsElement) {
          this.__barsElement.removeAttribute("data-opened");
        }
      }
    }
  },

  defer(statics) {
    if (typeof ville !== "undefined" && ville.ui && ville.ui.core) {
      ville.ui.core.Burger = statics;
    }
  },

  destruct() {
    if (this.__barsElement) {
      this.__barsElement.dispose();
      this.__barsElement = null;
    }
  }
});
