/**
 * Abstract semantic `<button type="button">` base class (`ville.ui.core.AbstractButton`)
 * for interactive button controls (`ville.ui.form.Button`, `ville.ui.form.MenuButton`,
 * and `ville.ui.menu.Button`).
 *
 * Enforces a native `<button>` root element so all subclasses natively support the
 * HTML Popover API (`popovertarget`) and Invoker Commands API (`commandfor` / `command`),
 * and binds exclusively to native DOM events (`click`, `pointerdown`, `pointerup`,
 * `pointerout`, `keydown`, `keyup`) via `getContentElement()` with zero dependencies
 * on `qx.event.handler.*`.
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
   * @param {string|ville.ui.core.Widget|null} [icon] Image URI string or `ville.ui.core.Widget` icon instance.
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
     * Text caption displayed inside the button.
     */
    label: {
      check: "String",
      apply: "_applyLabel",
      nullable: true,
      themeable: true,
      event: "changeLabel"
    },

    /**
     * Icon displayed alongside the button label. Accepts either an image URI string
     * (rendered via `ville.ui.basic.Image`) or a `ville.ui.core.Widget` instance.
     *
     * @type {string|ville.ui.core.Widget|null}
     */
    icon: {
      // @ts-ignore
      check: (value) => {
        return typeof value === "string" || value instanceof ville.ui.core.Widget;
      },
      apply: "_applyIcon",
      nullable: true,
      themeable: true,
      event: "changeIcon"
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
    }
  },

  members: {
    /**
     * Direct `qx.html.Text` node rendering the button's caption without a wrapper `<span>`.
     *
     * @type {qx.html.Text|null}
     * @protected
     */
    _textNode: null,

    /**
     * States automatically forwarded from the button to its child controls.
     *
     * @type {Record<string, boolean>}
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
     * the current pointer interaction has been `"abandoned"` or `"disabled"`.
     */
    press() {
      if (this.hasState("abandoned") || this.hasState("disabled")) {
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
     * Clears transient interactive states (`"pressed"` and `"abandoned"`).
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
     * Creates the semantic `<button type="button">` root `qx.html.Element`.
     *
     * @returns {qx.html.Element} Root `<button>` element.
     * @protected
     */
    _createContentElement() {
      const el = new qx.html.Element("button");
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

    /**
     * Instantiates internal child controls (`"label"` and `"icon"`) on demand.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {string} id Child control identifier (`"label"` or `"icon"`).
     * @param {Record<string, any>} [hash] Optional configuration map.
     * @returns {ville.ui.core.Widget|null} Created child control instance.
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control = null;

      switch (id) {
        case "label": {
          const initialText = this.getLabel();
          control = new ville.ui.basic.Label(initialText);
          control.setAnonymous(true);

          this._textNode = new qx.html.Text(initialText || "");

          control.addListener("changeValue", (e) => {
            if (this._textNode) {
              const show = this.getShow();
              const isVisible = show === "both" || show === "label";
              this._textNode.setText(isVisible ? (e.getData() || "") : "");
            }
          });

          const contentEl = this.getContentElement();
          const hasLeftIcon = this.hasChildControl("icon") && !this._isIconRight();

          if (hasLeftIcon) {
            contentEl.addAt(this._textNode, 1);
          } else {
            contentEl.addAt(this._textNode, 0);
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

          if (this._isIconRight()) {
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
     * Property apply handler for `enabled`. Delegates to `_syncDisabledState()`.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {boolean} value New enabled state.
     * @protected
     */
    _applyEnabled(value) {
      if (!value) {
        this.reset();
      }
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
     * Property apply handler for `label`.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {string|null} value New label string.
     * @protected
     */
    _applyLabel(value) {
      if (value != null) {
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
     * @this {ville.ui.core.AbstractButton}
     * @param {string|ville.ui.core.Widget|null} value New icon widget or URI string.
     * @param {string|ville.ui.core.Widget|null} old Previous icon widget or URI string.
     * @protected
     */
    _applyIcon(value, old) {
      if (value != null) {
        const icon = this.getChildControl("icon");
        if (value instanceof ville.ui.core.Widget) {
          if (old instanceof ville.ui.core.Widget && old !== value) {
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
        } else if (typeof icon.setSource === "function") {
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
     * @this {ville.ui.core.AbstractButton}
     * @protected
     */
    _applyShow() {
      this._syncShowVisibility();
    },

    /**
     * Synchronizes visibility of the `"label"` text node and `"icon"` child control
     * based on the `show` property.
     *
     * @this {ville.ui.core.AbstractButton}
     * @protected
     */
    _syncShowVisibility() {
      const show = this.getShow();
      const hasLabel = this.getLabel() != null;
      const hasIcon = this.getIcon() != null;

      if (this._textNode) {
        const labelVisible = hasLabel && (show === "both" || show === "label");
        this._textNode.setText(labelVisible ? (this.getLabel() || "") : "");
      }

      const icon = this.getChildControl("icon", true);
      if (icon) {
        const iconVisible = hasIcon && (show === "both" || show === "icon");
        icon.setVisibility(iconVisible ? "visible" : "excluded");
      }
    },

    /*
    ---------------------------------------------------------------------------
      NATIVE DOM EVENT BRIDGE INFRASTRUCTURE
    ---------------------------------------------------------------------------
    */

    /**
     * Registers native DOM pointer, click, and keyboard listeners on the `<button>`
     * content element to synchronize the `"pressed"` state and fire `execute()`.
     *
     * Native `<button type="button">` automatically synthesizes a `"click"` event
     * when activated via `Enter` or `Space`, so a single `"click"` listener covers
     * mouse, touch, pen, and keyboard execution without `qx.event.handler.*`.
     *
     * @this {ville.ui.core.AbstractButton}
     * @protected
     */
    _initEventBridge() {
      const contentEl = this.getContentElement();
      contentEl.addListener("click", this._onClick, this);
      contentEl.addListener("pointerout", this._onPointerOut, this);
      contentEl.addListener("pointerdown", this._onPointerDown, this);
      contentEl.addListener("pointerup", this._onPointerUp, this);
      contentEl.addListener("keydown", this._onKeyDown, this);
      contentEl.addListener("keyup", this._onKeyUp, this);
    },

    /**
     * Handles native `"click"` events by invoking `execute()` when interactive.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {qx.event.type.Native} e Native click event wrapper.
     * @protected
     */
    _onClick(e) {
      if (this.hasState("disabled")) {
        return;
      }
      this.execute();
    },

    /**
     * Releases `"pressed"` when the pointer leaves the button.
     *
     * @this {ville.ui.core.AbstractButton}
     * @protected
     */
    _onPointerOut() {
      this.release();
    },

    /**
     * Presses the button on primary pointer down (`button === 0`).
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {qx.event.type.Native} e Native pointerdown event wrapper.
     * @protected
     */
    _onPointerDown(e) {
      if (this.hasState("disabled")) {
        return;
      }
      const nativeEvent = /** @type {PointerEvent} */ (e.getNativeEvent());
      if (nativeEvent && nativeEvent.button !== 0) {
        return;
      }
      this.press();
    },

    /**
     * Releases `"pressed"` on pointer up.
     *
     * @this {ville.ui.core.AbstractButton}
     * @protected
     */
    _onPointerUp() {
      this.release();
    },

    /**
     * Presses the button on `Enter` or `Space` (`" "`) keydown.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {qx.event.type.Native} e Native keydown event wrapper.
     * @protected
     */
    _onKeyDown(e) {
      if (this.hasState("disabled")) {
        return;
      }
      const nativeEvent = /** @type {KeyboardEvent} */ (e.getNativeEvent());
      const key = nativeEvent ? nativeEvent.key : "";
      if (key === "Enter" || key === " " || key === "Spacebar") {
        this.press();
      }
    },

    /**
     * Releases `"pressed"` on `Enter` or `Space` (`" "`) keyup.
     *
     * @this {ville.ui.core.AbstractButton}
     * @param {qx.event.type.Native} e Native keyup event wrapper.
     * @protected
     */
    _onKeyUp(e) {
      const nativeEvent = /** @type {KeyboardEvent} */ (e.getNativeEvent());
      const key = nativeEvent ? nativeEvent.key : "";
      if (key === "Enter" || key === " " || key === "Spacebar") {
        if (this.hasState("pressed")) {
          this.release();
        }
      }
    }
  },

  destruct() {
    const contentEl = this.getContentElement();
    if (contentEl) {
      contentEl.removeListener("click", this._onClick, this);
      contentEl.removeListener("pointerout", this._onPointerOut, this);
      contentEl.removeListener("pointerdown", this._onPointerDown, this);
      contentEl.removeListener("pointerup", this._onPointerUp, this);
      contentEl.removeListener("keydown", this._onKeyDown, this);
      contentEl.removeListener("keyup", this._onKeyUp, this);
    }
    if (this._textNode) {
      this._textNode.dispose();
      this._textNode = null;
    }
  }
});
