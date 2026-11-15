/**
 * Mode 3 CSS-driven Button widget (`ville.ui.form.Button`).
 *
 * Features a flattened DOM architecture (a single `<button>` or `<a>` root
 * element containing a direct `qx.html.Text` node and optional inline `<svg>` /
 * `<img>` icon sibling) styled via `ButtonVui.css` and Qooxdoo Appearance themes
 * without legacy Mantine wrapper `<span>` nodes or `QxLayout` calculations.
 *
 * @childControl label {ville.ui.basic.Label} Anonymous label control synchronizing text to `qx.html.Text`.
 * @childControl icon {ville.ui.basic.Image|ville.ui.core.Widget} Anonymous icon widget or image element.
 *
 * @example
 * const btn = new ville.ui.form.Button("Save Changes", new ville.ui.icon.tabler.Check());
 * btn.setVariant("filled");
 * btn.setSize("md");
 * btn.addListener("execute", () => console.log("Saved!"));
 */
qx.Class.define("ville.ui.form.Button", {
  extend: ville.ui.core.Widget,
  include: [qx.ui.core.MExecutable],
  implement: [qx.ui.form.IExecutable],

  /**
   * Creates a new Button instance.
   *
   * @param {string|null} [label] Button text caption.
   * @param {string|ville.ui.core.Widget|null} [icon] Image URI string or `ville.ui.core.Widget` icon instance (e.g., `ville.ui.icon.Abstract` subclass).
   * @param {ville.ui.command.Command|null} [command] Command instance bound via `MExecutable`.
   * @param {"button"|"a"} [component="button"] Root HTML element tag to render (`"button"` or `"a"`).
   */
  construct(label, icon, command, component) {
    if (qx.core.Environment.get("qx.debug")) {
      if (component !== undefined) {
        qx.core.Assert.assertInArray(
          component,
          ["button", "a"],
          `Invalid component tag '${component}'. Allowed tags are 'button' or 'a'.`
        );
      }
    }

    if (component) {
      this.__contentElementTag = component;
    }

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

    // Set default accessible role
    this.setAriaRole("button");

    // Initialize Event Bridge
    this._initEventBridge();
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"button"`).
     */
    appearance: {
      refine: true,
      init: "button"
    },

    /**
     * Text caption displayed inside the button.
     */
    label: {
      check: "String",
      apply: "_applyLabel",
      nullable: true,
      themeable: true
    },

    /**
     * Icon displayed alongside the button label. Accepts either an image URI string
     * (rendered via `ville.ui.basic.Image`) or a `ville.ui.core.Widget` instance
     * (such as an inline SVG `ville.ui.icon.Abstract` subclass).
     *
     * @type {string|ville.ui.core.Widget|null}
     */
    icon: {
      check(value) {
        return typeof value === "string" || value instanceof ville.ui.core.Widget;
      },
      apply: "_applyIcon",
      nullable: true,
      themeable: true
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
     * Button size scale (`"xs"`–`"xl"` or `"compact-xs"`–`"compact-xl"`).
     * Synchronizes the mutually exclusive `"size-<value>"` state.
     */
    size: {
      check: [
        "xs", "sm", "md", "lg", "xl",
        "compact-xs", "compact-sm", "compact-md", "compact-lg", "compact-xl"
      ],
      nullable: true,
      themeable: true,
      apply: "_applySize"
    },

    /**
     * Border radius scale (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`).
     * Synchronizes the mutually exclusive `"radius-<value>"` state.
     */
    radius: {
      check: ["xs", "sm", "md", "lg", "xl"],
      nullable: true,
      themeable: true,
      apply: "_applyRadius"
    },

    /**
     * Whether the button expands to fill 100% of its container width (`data-block="true"`).
     * Toggles the `"fullWidth"` widget state.
     */
    fullWidth: {
      check: "Boolean",
      init: false,
      themeable: true,
      apply: "_applyFullWidth"
    },

    /**
     * Placement of the icon relative to the label (`"left"` or `"right"`).
     * Synchronizes the mutually exclusive `"iconPosition-<value>"` state.
     */
    iconPosition: {
      check: ["left", "right"],
      init: "left",
      themeable: true,
      apply: "_applyIconPosition"
    },

    /**
     * Whether the button is in an active loading state.
     * Adds the `"loading"` state, resets active press states, and locks user interaction.
     */
    loading: {
      check: "Boolean",
      init: false,
      themeable: true,
      apply: "_applyLoading",
      event: "changeLoading"
    }
  },

  members: {
    /**
     * Root HTML tag name (`"button"` or `"a"`).
     *
     * @type {"button"|"a"}
     * @private
     */
    __contentElementTag: "button",

    /**
     * Direct `qx.html.Text` node rendering the button's caption without a wrapper `<span>`.
     *
     * @type {qx.html.Text|null}
     * @private
     */
    __textNode: null,

    /**
     * States automatically forwarded from the button to its `label` and `icon` child controls.
     *
     * @type {Object<string, boolean>}
     * @protected
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      disabled: true
    },

    /*
    ---------------------------------------------------------------------------
      USER API
    ---------------------------------------------------------------------------
    */

    /**
     * Programmatically puts the button into its `"pressed"` visual state unless
     * the current pointer interaction has been `"abandoned"`.
     */
    press() {
      if (this.hasState("abandoned")) {
        return;
      }
      this.addState("pressed");
    },

    /**
     * Programmatically releases the button's `"pressed"` visual state.
     */
    release() {
      if (this.hasState("pressed")) {
        this.removeState("pressed");
      }
    },

    /**
     * Clears transient interactive states (`"pressed"`, `"abandoned"`, and `"hovered"`).
     */
    reset() {
      this.removeState("pressed");
      this.removeState("abandoned");
    },

    /*
    ---------------------------------------------------------------------------
      ELEMENT & CHILD CONTROLS
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the root `qx.html.Element` using the configured tag (`"button"` or `"a"`).
     *
     * @returns {qx.html.Element} Root button or anchor element.
     * @protected
     */
    _createContentElement() {
      return new qx.html.Element(this.__contentElementTag);
    },

    /**
     * Instantiates internal child controls (`"label"` and `"icon"`) on demand.
     *
     * - `"label"`: Creates an anonymous `ville.ui.basic.Label` and binds its
     *   `changeValue` event to a lightweight `qx.html.Text` node.
     * - `"icon"`: Uses the provided `ville.ui.core.Widget` or creates a
     *   `ville.ui.basic.Image`, inserting it before or after `__textNode`.
     *
     * @param {string} id Child control identifier (`"label"` or `"icon"`).
     * @param {*} [hash] Optional configuration map.
     * @returns {ville.ui.core.Widget|null} Created child control instance.
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control;

      switch (id) {
        case "label": {
          const initialText = this.getLabel();
          control = new ville.ui.basic.Label(initialText);
          control.setAnonymous(true);

          // 1. Create and cache the lightweight qx.html.Text node
          this.__textNode = new qx.html.Text(initialText);

          // 2. Sync qx.html.Text whenever the Label's value changes
          control.addListener("changeValue", (e) => {
            if (this.__textNode) {
              const nextVal = e.getData();
              this.__textNode.setText(nextVal);
            }
          });

          const contentEl = this.getContentElement();
          const hasLeftIcon = this.hasChildControl("icon") && this.getIconPosition() === "left";

          if (hasLeftIcon) {
            contentEl.add(this.__textNode);
          } else {
            contentEl.addAt(this.__textNode, 0);
          }

          break;
        }

        case "icon": {
          const iconVal = this.getIcon();
          if (iconVal instanceof ville.ui.core.Widget) {
            control = iconVal;
          } else {
            control = new ville.ui.basic.Image(iconVal);
          }
          control.setAnonymous(true);

          // Deterministic insertion relative to __textNode:
          // Left icon -> index 0 (before __textNode)
          // Right icon -> append at end (after __textNode)
          if (this.getIconPosition() === "right") {
            this._add(control);
          } else {
            this._addAt(control, 0);
          }

          break;
        }
      }

      return control || super._createChildControlImpl(id, hash);
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIERS
    ---------------------------------------------------------------------------
    */

    /**
     * Property apply handler for `enabled`. Delegates to `__syncDisabledState()`
     * so `enabled` and `loading` remain synchronized.
     *
     * @param {boolean} value New enabled state.
     * @param {boolean} old Previous enabled state.
     * @protected
     */
    _applyEnabled(value, old) {
      if (!value) {
        this.reset();
      }
      this.__syncDisabledState();
    },

    /**
     * Property apply handler for `label`.
     *
     * @param {string|null} value New label string.
     * @param {string|null} old Previous label string.
     * @protected
     */
    _applyLabel(value, old) {
      if (value != null) {
        // Force creation of the "label" child control if initial label was null
        const label = this.getChildControl("label");
        label.setValue(value);
      } else {
        const label = this.getChildControl("label", true);
        if (label) {
          label.setValue("");
        }
      }
      this._syncShowVisibility();
    },

    /**
     * Property apply handler for `icon`. Swaps existing widget icons in place
     * or updates the image source URI.
     *
     * @param {string|ville.ui.core.Widget|null} value New icon widget or URI string.
     * @param {string|ville.ui.core.Widget|null} old Previous icon widget or URI string.
     * @protected
     */
    _applyIcon(value, old) {
      if (value != null) {
        const icon = this.getChildControl("icon");
        if (value instanceof ville.ui.core.Widget) {
          // Handle swapping an existing icon widget if replaced at runtime
          if (old && old !== value) {
            const contentEl = this.getContentElement();
            const children = contentEl.getChildren();
            const idx = children ? children.indexOf(old.getContentElement()) : -1;
            this._remove(old);
            if (idx !== -1) {
              this._addAt(value, idx);
            } else {
              this._add(value);
            }
          }
        } else {
          icon.setSource(value);
        }
      } else {
        const icon = this.getChildControl("icon", true);
        if (icon && typeof icon.setSource === "function") {
          icon.setSource(null);
        }
      }
      this._syncShowVisibility();
    },

    /**
     * Property apply handler for `show`.
     *
     * @param {"both"|"label"|"icon"} value New visibility mode.
     * @param {"both"|"label"|"icon"} old Previous visibility mode.
     * @protected
     */
    _applyShow(value, old) {
      this._syncShowVisibility();
    },

    /**
     * Synchronizes visibility of the `"label"` and `"icon"` child controls based
     * on the `show` property and whether non-null values are present.
     *
     * @protected
     */
    _syncShowVisibility() {
      const show = this.getShow();
      const hasLabel = this.getLabel() != null;
      const hasIcon = this.getIcon() != null;

      const label = this.getChildControl("label", true);
      if (label) {
        const visible = hasLabel && (show === "both" || show === "label");
        label.setVisibility(visible ? "visible" : "excluded");
      }

      const icon = this.getChildControl("icon", true);
      if (icon) {
        const visible = hasIcon && (show === "both" || show === "icon");
        icon.setVisibility(visible ? "visible" : "excluded");
      }
    },

    /**
     * Property apply handler for `size`.
     *
     * @param {string|null} value New size token.
     * @param {string|null} old Previous size token.
     * @protected
     */
    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    /**
     * Property apply handler for `radius`.
     *
     * @param {string|null} value New radius token.
     * @param {string|null} old Previous radius token.
     * @protected
     */
    _applyRadius(value, old) {
      this._syncModifierState("radius", value, old);
    },

    /**
     * Property apply handler for `iconPosition`.
     *
     * @param {"left"|"right"} value New icon position.
     * @param {"left"|"right"} old Previous icon position.
     * @protected
     */
    _applyIconPosition(value, old) {
      this._syncModifierState("iconPosition", value, old);
    },

    /**
     * Property apply handler for `fullWidth`.
     *
     * @param {boolean} value Whether full-width block mode is enabled.
     * @param {boolean} old Previous full-width state.
     * @protected
     */
    _applyFullWidth(value, old) {
      value ? this.addState("fullWidth") : this.removeState("fullWidth");
    },

    /**
     * Property apply handler for `loading`. Resets active press states, toggles
     * `"loading"`, and locks interactive disabled attributes.
     *
     * @param {boolean} value Whether loading state is active.
     * @param {boolean} old Previous loading state.
     * @protected
     */
    _applyLoading(value, old) {
      if (value) {
        this.reset();
        this.addState("loading");
      } else {
        this.removeState("loading");
      }
      this.__syncDisabledState();
    },

    /**
     * Synchronizes the `"disabled"` state, `aria-disabled`, and native `disabled`
     * attribute (when rendered as a `<button>`) from `enabled` and `loading`.
     *
     * @private
     */
    __syncDisabledState() {
      const el = this.getContentElement();
      const isDisabled = !this.getEnabled() || this.getLoading();

      if (isDisabled) {
        this.addState("disabled");
        this.setAriaState("disabled", true);
        if (this._contentElementTag === "button") {
          el.setAttribute("disabled", "disabled");
        }
      } else {
        this.removeState("disabled");
        this.setAriaState("disabled", null);
        if (this._contentElementTag === "button") {
          el.removeAttribute("disabled");
        }
      }
    },

    /*
    ---------------------------------------------------------------------------
      EVENT BRIDGE INFRASTRUCTURE
    ---------------------------------------------------------------------------
    */

    /**
     * Registers DOM pointer, focus, and keyboard listeners on the button via
     * `Widget`'s transparent event delegation to synchronize interactive Qooxdoo
     * states (`hovered`, `pressed`, `focused`) and trigger `execute()`.
     *
     * @protected
     */
    _initEventBridge() {
      // Pointer & tap interactions
      this.addListener("tap", this._onTap, this);
      this.addListener("pointerout", this._onPointerOut, this);
      this.addListener("pointerdown", this._onPointerDown, this);
      this.addListener("pointerup", this._onPointerUp, this);

      // Keyboard interactions
      this.addListener("keydown", this._onKeyDown, this);
      this.addListener("keyup", this._onKeyUp, this);
    },

    /**
     * Handles `"tap"` events by invoking `execute()` when the button is interactive.
     *
     * @param {qx.event.type.Tap} e Tap event object.
     * @protected
     */
    _onTap(e) {
      if (this.hasState("disabled")) {
        return;
      }
      this.execute();
    },

    /**
     * Handles `"pointerover"` events by activating the `"hovered"` state.
     *
     * @param {qx.event.type.Pointer} e Pointer event object.
     * @protected
     */
    _onPointerOver(e) {
      if (this.hasState("disabled")) {
        return;
      }
      this.addState("hovered");
    },

    /**
     * Handles `"pointerout"` events by clearing `"hovered"` and releasing `"pressed"`.
     *
     * @param {qx.event.type.Pointer} e Pointer event object.
     * @protected
     */
    _onPointerOut(e) {
      this.release();
    },

    /**
     * Handles `"pointerdown"` events by pressing the button when interactive.
     *
     * @param {qx.event.type.Pointer} e Pointer event object.
     * @protected
     */
    _onPointerDown(e) {
      if (this.hasState("disabled")) {
        return;
      }
      this.press();
    },

    /**
     * Handles `"pointerup"` events by releasing the `"pressed"` state.
     *
     * @param {qx.event.type.Pointer} e Pointer event object.
     * @protected
     */
    _onPointerUp(e) {
      this.release();
    },

    /**
     * Handles `"focusin"` events by activating the `"focused"` state.
     *
     * @param {qx.event.type.Focus} e Focus event object.
     * @protected
     */
    _onFocusIn(e) {
      if (this.hasState("disabled")) {
        return;
      }
      this.addState("focused");
    },

    /**
     * Handles `"focusout"` events by clearing `"focused"` and releasing `"pressed"`.
     *
     * @param {qx.event.type.Focus} e Focus event object.
     * @protected
     */
    _onFocusOut(e) {
      this.removeState("focused");
      this.release();
    },

    /**
     * Handles `"keydown"` events for `Enter` and `Space`, pressing the button
     * and stopping propagation when interactive.
     *
     * @param {qx.event.type.KeySequence} e Keyboard event object.
     * @protected
     */
    _onKeyDown(e) {
      if (this.hasState("disabled")) {
        return;
      }

      const key = e.getKeyIdentifier();
      if (key === "Enter" || key === "Space") {
        this.press();
        e.preventDefault();
        e.stopPropagation();
      }
    },

    /**
     * Handles `"keyup"` events for `Enter` and `Space`, releasing `"pressed"` and
     * firing `execute()` if the button was pressed.
     *
     * @param {qx.event.type.KeySequence} e Keyboard event object.
     * @protected
     */
    _onKeyUp(e) {
      const key = e.getKeyIdentifier();
      if (key === "Enter" || key === "Space") {
        if (this.hasState("pressed")) {
          this.release();
          if (!this.hasState("disabled")) {
            this.execute();
          }
        }
        e.preventDefault();
        e.stopPropagation();
      }
    }
  },

  /**
   * Disposes the internal `qx.html.Text` node on widget destruction.
   */
  destruct() {
    if (this.__textNode) {
      this.__textNode.dispose();
      this.__textNode = null;
    }
  }
});
