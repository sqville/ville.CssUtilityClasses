/**
 * Mode 3 horizontal flex group container (`ville.ui.layout.HGroup`).
 *
 * Routes layout modifiers (`justify`, `align`, `gap`, `wrap`, `grow`) through
 * CSS-provider-independent widget states (`justify-*`, `align-*`, `gap-*`, `wrap-*`, `grow`)
 * so the active Appearance theme can map them to Mantine CSS variables, Tailwind/UnoCSS
 * utility classes, or Carbon/Tabler styles.
 */
qx.Class.define("ville.ui.layout.HGroup", {
  extend: ville.ui.core.Box,

  /**
   * Creates a new HGroup container.
   *
   * @param {"center"|"flex-start"|"flex-end"|"space-between"|"space-around"|null} [justify] Horizontal alignment.
   * @param {string} [component="div"] Root HTML tag name.
   */
  construct(justify, component) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super(component);

    if (justify != null) {
      this.setJustify(justify);
    } else {
      this.initJustify();
    }

    this.initAlign();
    this.initGap();
    this.initWrap();
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"hgroup"`).
     */
    appearance: {
      refine: true,
      init: "hgroup"
    },

    /**
     * Horizontal `justify-content` distribution (`"justify-<value>"` state).
     */
    justify: {
      init: "flex-start",
      check: ["center", "flex-start", "flex-end", "space-between", "space-around"],
      apply: "_applyJustify",
      nullable: true,
      themeable: true,
      event: "changeJustify"
    },

    /**
     * Vertical `align-items` alignment (`"align-<value>"` state).
     */
    align: {
      init: "center",
      check: ["stretch", "center", "flex-start", "flex-end", "baseline"],
      apply: "_applyAlign",
      nullable: true,
      themeable: true,
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
     * Flex-wrap behavior (`"wrap-<value>"` state).
     */
    wrap: {
      init: "wrap",
      check: ["wrap", "nowrap", "wrap-reverse"],
      apply: "_applyWrap",
      themeable: true,
      nullable: true,
      event: "changeWrap"
    },

    /**
     * Whether children should grow to fill available row space (`"grow"` state).
     */
    grow: {
      init: false,
      check: "Boolean",
      apply: "_applyGrow",
      nullable: true,
      themeable: true,
      event: "changeGrow"
    }
  },

  members: {
    /**
     * @param {string|null} value New justify value.
     * @param {string|null} old Previous justify value.
     * @protected
     */
    _applyJustify(value, old) {
      this._syncModifierState("justify", value, old);
    },

    /**
     * @param {string|null} value New align value.
     * @param {string|null} old Previous align value.
     * @protected
     */
    _applyAlign(value, old) {
      this._syncModifierState("align", value, old);
    },

    /**
     * @param {string|null} value New gap token.
     * @param {string|null} old Previous gap token.
     * @protected
     */
    _applyGap(value, old) {
      this._syncModifierState("gap", value, old);
    },

    /**
     * @param {string|null} value New wrap mode.
     * @param {string|null} old Previous wrap mode.
     * @protected
     */
    _applyWrap(value, old) {
      this._syncModifierState("wrap", value, old);
    },

    /**
     * @param {boolean|null} value Whether grow mode is enabled.
     * @protected
     */
    _applyGrow(value) {
      if (value) {
        this.addState("grow");
      } else {
        this.removeState("grow");
      }
    }
  }
});
