/**
 * Mode 3 vertical flex stack container (`ville.ui.layout.VStack`).
 *
 * Routes layout modifiers (`align`, `justify`, `gap`) through CSS-provider-independent
 * widget states (`align-*`, `justify-*`, `gap-*`) so the active Appearance theme
 * can map them to Mantine CSS variables, Tailwind/UnoCSS utility classes, or Carbon/Tabler styles.
 */
qx.Class.define("ville.ui.layout.VStack", {
  extend: ville.ui.core.Box,

  /**
   * Creates a new VStack container.
   *
   * @param {"stretch"|"center"|"flex-start"|"flex-end"|null} [align] Cross-axis alignment.
   * @param {"center"|"flex-start"|"flex-end"|"space-between"|"space-around"|null} [justify] Main-axis alignment.
   * @param {"xs"|"sm"|"md"|"lg"|"xl"|null} [gap] Spacing gap token.
   * @param {string} [component="div"] Root HTML tag name.
   */
  construct(align, justify, gap, component) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(component);

    if (align != null) {
      this.setAlign(align);
    } else {
      this.initAlign();
    }

    if (justify != null) {
      this.setJustify(justify);
    } else {
      this.initJustify();
    }

    if (gap != null) {
      this.setGap(gap);
    } else {
      this.initGap();
    }
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"vstack"`).
     */
    appearance: {
      refine: true,
      init: "vstack"
    },

    /**
     * Cross-axis `align-items` alignment (`"align-<value>"` state).
     */
    align: {
      init: "stretch",
      check: ["stretch", "center", "flex-start", "flex-end"],
      apply: "_applyAlign",
      themeable: true,
      nullable: true,
      event: "changeAlign"
    },

    /**
     * Spacing gap scale between items (`"gap-<value>"` state).
     */
    gap: {
      init: "md",
      check: ["xs", "sm", "md", "lg", "xl"],
      apply: "_applyGap",
      themeable: true,
      nullable: true,
      event: "changeGap"
    },

    /**
     * Main-axis `justify-content` alignment (`"justify-<value>"` state).
     */
    justify: {
      init: "flex-start",
      check: ["center", "flex-start", "flex-end", "space-between", "space-around"],
      apply: "_applyJustify",
      nullable: true,
      themeable: true,
      event: "changeJustify"
    }
  },

  members: {
    /**
     * @param {string|null} value New align value.
     * @param {string|null} old Previous align value.
     * @protected
     */
    _applyAlign(value, old) {
      this._syncModifierState("align", value, old);
    },

    /**
     * @param {string|null} value New justify value.
     * @param {string|null} old Previous justify value.
     * @protected
     */
    _applyJustify(value, old) {
      this._syncModifierState("justify", value, old);
    },

    /**
     * @param {string|null} value New gap token.
     * @param {string|null} old Previous gap token.
     * @protected
     */
    _applyGap(value, old) {
      this._syncModifierState("gap", value, old);
    }
  }
});
