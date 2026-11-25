/**
 * Abstract semantic `<button type="button">` base class (`ville.ui.core.AbstractButton`)
 * for interactive button controls (`ville.ui.form.Button`, `ville.ui.form.MenuButton`,
 * and `ville.ui.menu.Button`).
 *
 * Enforces a native `<button>` root element so all subclasses natively support the
 * HTML Popover API (`popovertarget`) and Invoker Commands API (`commandfor` / `command`),
 * renders both its text caption (`ville.html.Text`) and its icon (`ville.html.Element`
 * created via `ville.ui.icon.Default.createElement`) directly inside the `<button>` with
 * **zero child `ville.ui.core.Widget` overhead**, delegates transient interaction visuals
 * (`:hover`, `:active`, `:focus-visible`) to native CSS pseudo-classes, and binds a single
 * native `"click"` listener via `getContentElement()`.
 */
qx.Class.define("ville.ui.core.AbstractButton", {
  extend: ville.ui.core.Widget,
  include: [ville.ui.core.MExecutable],
  implement: [ville.ui.form.IExecutable],

  type: "abstract",

  /**
   * Creates a new AbstractButton instance.
   *
   * @param {string|null} [label] Button text caption.
   * @param {string|Object|ville.html.Element|ville.ui.core.Widget|null} [icon] Built-in glyph key (`"CHECK"`, `"AIRPLANE"`), Iconify CSS class (`"i-tabler-check"`), raw `<svg>`, image URI, or widget.
   * @param {ville.ui.command.Command|null} [command] Optional command instance bound via `ville.ui.core.MExecutable`.
   */
  construct(label, icon, command) {
    // @ts-ignore - @qooxdoo/compiler transforms super() inside qx.Class.define
    super();

    if (label != null) {
      this.setLabel(label);
    }

    if (icon !== undefined) {
      this.setIcon(icon);
    }

    if (command != null) {
      this.setCommand(command);
    }

    this._initEventBridge();
  },

  properties: {
    /**
     * Text caption displayed directly inside the `<button>` as a raw `ville.html.Text` node.
     */
    label: {
      check: "String",
      apply: "_applyLabel",
      nullable: true,
      themeable: true,
      event: "changeLabel"
    },

    /**
     * Icon displayed alongside the button label. Accepts a `ville.ui.icon.Default`
     * glyph key (`"CHECK"`, `"AIRPLANE"`), an Iconify CSS token (`"i-tabler-check"`),
     * raw `<svg>` markup, an image URI string, a `ville.html.Element`, or a
     * `ville.ui.core.Widget` instance.
     *
     * @type {string|Object|ville.html.Element|ville.ui.core.Widget|null}
     */
    icon: {
      // @ts-ignore
      check: (value) => {
        return (
          typeof value === "string" ||
          typeof value === "object" ||
          value instanceof ville.html.Element ||
          value instanceof ville.ui.core.Widget
        );
      },
      apply: "_applyIcon",
      nullable: true,
      themeable: true,
      event: "changeIcon"
    },

    /**
     * Optional explicit icon size in pixels (`null` scales with `1em` font-size).
     */
    iconSize: {
      check: "Number",
      nullable: true,
      themeable: true,
      apply: "_applyIconSize"
    },

    /**
     * Controls which button parts are visible (`"both"`, `"label"`, or `"icon"`).
     */
    show: {
      check: ["both", "label", "icon"],
      init: "both",
      nullable: false,
      themeable: true,
      apply: "_applyShow"
    },

    /**
     * W3C Invoker Commands API target (`commandfor` attribute on `<button>` — `STRAT-EVENT-02`).
     * Accepts either a target DOM element ID string or a target `ville.ui.core.Widget`
     * (such as a `Modal`, `Window`, `Menu`, or `Popup`), automatically assigning a
     * deterministic `domId` to the target widget if it does not yet have one.
     *
     * @type {string|ville.ui.core.Widget|null}
     */
    commandFor: {
      nullable: true,
      init: null,
      apply: "_applyCommandFor",
      event: "changeCommandFor"
    },

    /**
     * W3C Invoker Commands API action (`command` attribute on `<button>` — `STRAT-EVENT-02`),
     * such as `"show-modal"`, `"close"`, `"toggle-popover"`, `"show-popover"`, `"hide-popover"`,
     * or a custom `"--my-action"` command token.
     */
    commandAction: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyCommandAction",
      event: "changeCommandAction"
    }
  },

  members: {
    /**
     * Direct `ville.html.Text` node rendering the button's caption with zero wrapper `<span>`
     * and zero child `Widget` overhead.
     *
     * @type {ville.html.Text|null}
     * @protected
     */
    _textNode: null,

    /**
     * Direct `ville.html.Element` rendering the button's native `<svg>`, `<span class="i-...">`,
     * or `<img>` icon with zero child `Widget` overhead.
     *
     * @type {ville.html.Element|null}
     * @protected
     */
    _iconElement: null,

    /*
    ---------------------------------------------------------------------------
      ELEMENT & NATIVE CONTENT SYNCHRONIZATION
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the semantic `<button type="button">` root `ville.html.Element`.
     *
     * @returns {ville.html.Element} Root `<button>` element.
     * @protected
     */
    _createContentElement() {
      const el = new ville.html.Element("button");
      el.setAttribute("type", "button");
      return el;
    },

    /**
     * Returns whether the icon should be placed on the right of the label.
     * Subclasses (`ville.ui.form.Button`) may override this.
     *
     * @returns {boolean} `true` if the icon renders after the label.
     * @protected
     */
    _isIconRight() {
      return false;
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIERS
    ---------------------------------------------------------------------------
    */

    /**
     * Property apply handler for `enabled`. Delegates to `_syncDisabledState()`.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {boolean} value New enabled state.
     * @protected
     */
    _applyEnabled(value) {
      this._syncDisabledState();
    },

    /**
     * Synchronizes the `"disabled"` state and native `<button disabled>` attribute.
     * Subclasses (`form.Button`) can override `_isInteractionLocked()` to include `loading`.
     *
     * @this {ville.ui.core.AbstractButton}
     * @protected
     */
    _syncDisabledState() {
      const el = this.getContentElement();
      const isDisabled = this._isInteractionLocked();

      if (isDisabled) {
        this.addState("disabled");
        el.setAttribute("disabled", "disabled");
      } else {
        this.removeState("disabled");
        el.removeAttribute("disabled");
      }
    },

    /**
     * Returns whether the button should be locked/disabled.
     *
     * @this {ville.ui.core.AbstractButton}
     * @returns {boolean} `true` when disabled.
     * @protected
     */
    _isInteractionLocked() {
      return !this.getEnabled();
    },

    /**
     * Property apply handler for `label`. Mutates or creates `this._textNode` directly
     * without allocating a child `Label` widget.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {string|null} value New label string.
     * @protected
     */
    _applyLabel(value) {
      const contentEl = this.getContentElement();
      if (value != null) {
        if (!this._textNode) {
          this._textNode = new ville.html.Text(value);
          const hasLeftIcon =
            this._iconElement &&
            this._iconElement.getParent() === contentEl &&
            !this._isIconRight();
          contentEl.addAt(this._textNode, hasLeftIcon ? 1 : 0);
        } else {
          this._textNode.setText(value);
        }
      } else if (this._textNode) {
        this._textNode.setText("");
      }
      this._syncShowVisibility();
    },

    /**
     * Property apply handler for `icon`. Creates or swaps a native `ville.html.Element`
     * directly inside `<button>` via `ville.ui.icon.Default.createElement()`.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {string|Object|ville.html.Element|ville.ui.core.Widget|null} value New icon spec.
     * @protected
     */
    _applyIcon(value) {
      const contentEl = this.getContentElement();

      if (this._iconElement && this._iconElement.getParent() === contentEl) {
        contentEl.remove(this._iconElement);
      }
      this._iconElement = null;

      if (value != null) {
        this.addState("hasIcon");

        let nextIconEl = null;
        if (value instanceof ville.ui.core.Widget) {
          value.setAnonymous(true);
          nextIconEl = value.getContentElement();
        } else {
          nextIconEl = ville.ui.icon.Default.createElement(value, {
            size: this.getIconSize()
          });
        }

        if (nextIconEl) {
          this._iconElement = nextIconEl;
          if (this._isIconRight()) {
            const textIdx =
              this._textNode && this._textNode.getParent() === contentEl
                ? contentEl.indexOf(this._textNode)
                : -1;
            contentEl.addAt(nextIconEl, textIdx !== -1 ? textIdx + 1 : 0);
          } else {
            contentEl.addAt(nextIconEl, 0);
          }
        }
      } else {
        this.removeState("hasIcon");
      }

      this._syncShowVisibility();
    },

    /**
     * Property apply handler for `iconSize`.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {number|null} value Explicit pixel width/height for the icon.
     * @protected
     */
    _applyIconSize(value) {
      if (!this._iconElement) {
        return;
      }
      if (value != null) {
        const dim = `${value}px`;
        if (this._iconElement.getNodeName() === "svg") {
          this._iconElement.setAttribute("width", dim);
          this._iconElement.setAttribute("height", dim);
        } else {
          this._iconElement.setStyles({ width: dim, height: dim });
        }
      } else {
        if (this._iconElement.getNodeName() === "svg") {
          this._iconElement.setAttribute("width", "1em");
          this._iconElement.setAttribute("height", "1em");
        } else {
          this._iconElement.removeStyle("width");
          this._iconElement.removeStyle("height");
        }
      }
    },

    /**
     * Property apply handler for `show`.
     *
     * @this {ville.ui.core.AbstractButton}
     * @protected
     */
    _applyShow() {
      this._syncShowVisibility();
    },

    /**
     * Property apply handler for `commandFor` (`STRAT-EVENT-02`).
     * Sets the native HTML `commandfor` attribute on `<button>`, assigning a
     * deterministic DOM `id` to a target `ville.ui.core.Widget` when passed an object.
     *
     * @param {string|ville.ui.core.Widget|null} value Target widget or DOM ID.
     * @protected
     */
    _applyCommandFor(value) {
      const el = this.getContentElement();
      if (!value) {
        el.removeAttribute("commandfor");
        return;
      }
      let targetId = typeof value === "string" ? value : null;
      if (!targetId && value instanceof ville.ui.core.Widget) {
        targetId = value.getDomId();
        if (!targetId) {
          targetId = `ville-cmd-target-${value.toHashCode()}`;
          value.setDomId(targetId);
        }
      }
      if (targetId) {
        el.setAttribute("commandfor", targetId);
      }
    },

    /**
     * Property apply handler for `commandAction` (`STRAT-EVENT-02`).
     * Sets the native HTML `command` attribute on `<button>`.
     *
     * @param {string|null} value Invoker command action token.
     * @protected
     */
    _applyCommandAction(value) {
      const el = this.getContentElement();
      if (value) {
        el.setAttribute("command", value);
      } else {
        el.removeAttribute("command");
      }
    },

    /**
     * Synchronizes visibility of the `"label"` text node and `"icon"` element
     * based on the `show` property.
     *
     * @this {ville.ui.core.AbstractButton}
     * @protected
     */
    _syncShowVisibility() {
      const show = this.getShow();
      const hasLabel = this.getLabel() != null;
      const hasIcon = this._iconElement != null;

      if (this._textNode) {
        const labelVisible = hasLabel && (show === "both" || show === "label");
        this._textNode.setText(labelVisible ? this.getLabel() || "" : "");
      }

      if (this._iconElement) {
        const iconVisible = hasIcon && (show === "both" || show === "icon");
        if (iconVisible) {
          this._iconElement.include();
          this._iconElement.setVisible(true);
        } else {
          this._iconElement.exclude();
        }
      }
    },

    /*
    ---------------------------------------------------------------------------
      NATIVE DOM EVENT BRIDGE INFRASTRUCTURE
    ---------------------------------------------------------------------------
    */

    /**
     * Registers a single native DOM `"click"` listener on the `<button>` content element.
     *
     * Native `<button type="button">` automatically synthesizes `"click"` when
     * activated via `Enter` or `Space`, while CSS `:hover`, `:active`, and `:focus-visible`
     * handle all transient interaction visuals without JavaScript state churn.
     *
     * @this {ville.ui.core.AbstractButton}
     * @protected
     */
    _initEventBridge() {
      const contentEl = this.getContentElement();
      contentEl.addListener("click", this._onClick, this);
    },

    /**
     * Handles native `"click"` events by invoking `execute()` when interactive.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {Object} e Native click event wrapper.
     * @protected
     */
    _onClick(e) {
      if (this.hasState("disabled")) {
        return;
      }
      this.execute();
    }
  },

  destruct() {
    const contentEl = this.getContentElement();
    if (contentEl) {
      contentEl.removeListener("click", this._onClick, this);
    }
    if (this._textNode) {
      this._textNode.dispose();
      this._textNode = null;
    }
    if (this._iconElement) {
      this._iconElement.dispose();
      this._iconElement = null;
    }
  }
});
