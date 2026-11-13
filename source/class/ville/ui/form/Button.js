/**
 * Mode 3 CSS-driven Button widget (`ville.ui.form.Button`)[span_74](start_span)[span_74](end_span).
 *
 * Features a flattened DOM architecture (a single `<button>` or `<a>` root
 * element containing a direct `qx.html.Text` node and optional inline `<svg>` /
 * `<img>` icon sibling) styled via `ButtonVui.css` and Qooxdoo Appearance themes
 * without legacy Mantine wrapper `<span>` nodes or `QxLayout` calculations[span_75](start_span)[span_75](end_span).
 *
 * @childControl label {ville.ui.basic.Label} Anonymous label control synchronizing text to `qx.html.Text`[span_76](start_span)[span_76](end_span).
 * @childControl icon {ville.ui.basic.Image|ville.ui.core.Widget} Anonymous icon widget or image element[span_77](start_span)[span_77](end_span).
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
   * Creates a new Button instance[span_78](start_span)[span_78](end_span).
   *
   * @param {string|null} [label] Button text caption[span_79](start_span)[span_79](end_span).
   * @param {string|ville.ui.core.Widget|null} [icon] Image URI string or `ville.ui.core.Widget` icon instance (e.g., `ville.ui.icon.Abstract` subclass)[span_80](start_span)[span_80](end_span).
   * @param {ville.ui.command.Command|null} [command] Command instance bound via `MExecutable`[span_81](start_span)[span_81](end_span).
   * @param {"button"|"a"} [component="button"] Root HTML element tag to render (`"button"` or `"a"`)[span_82](start_span)[span_82](end_span).
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
  },

  properties: {
    /**
     * Appearance selector ID resolved against the active theme (defaults to `"button"`)[span_83](start_span)[span_83](end_span).
     */
    appearance: {
      refine: true,
      init: "button"
    },

    /**
     * Text caption displayed inside the button[span_84](start_span)[span_84](end_span).
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
     * (such as an inline SVG `ville.ui.icon.Abstract` subclass)[span_85](start_span)[span_85](end_span).
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
     * Controls which button parts are visible (`"both"`, `"label"`, or `"icon"`)[span_86](start_span)[span_86](end_span).
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
     * Synchronizes the mutually exclusive `"size-<value>"` state[span_87](start_span)[span_87](end_span).
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
     * Synchronizes the mutually exclusive `"radius-<value>"` state[span_88](start_span)[span_88](end_span).
     */
    radius: {
      check: ["xs", "sm", "md", "lg", "xl"],
      nullable: true,
      themeable: true,
      apply: "_applyRadius"
    },

    /**
     * Whether the button expands to fill 100% of its container width (`data-block="true"`).
     * Toggles the `"fullWidth"` widget state[span_89](start_span)[span_89](end_span).
     */
    fullWidth: {
      check: "Boolean",
      init: false,
      themeable: true,
      apply: "_applyFullWidth"
    },

    /**
     * Placement of the icon relative to the label (`"left"` or `"right"`).
     * Synchronizes the mutually exclusive `"iconPosition-<value>"` state[span_90](start_span)[span_90](end_span).
     */
    iconPosition: {
      check: ["left", "right"],
      init: "left",
      themeable: true,
      apply: "_applyIconPosition"
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
     * States automatically forwarded from the button to its `label` and `icon` child controls[span_91](start_span)[span_91](end_span).
     *
     * @type {Object<string, boolean>}
     * @protected
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      disabled: true,
      hovered: true,
      pressed: true,
      focused: true
    },

    /**
     * Creates the root `qx.html.Element` using the configured tag (`"button"` or `"a"`)[span_92](start_span)[span_92](end_span).
     *
     * @returns {qx.html.Element} Root button or anchor element[span_93](start_span)[span_93](end_span).
     * @protected
     */
    _createContentElement() {
      return new qx.html.Element(this.__contentElementTag);
    },

    /**
     * Instantiates internal child controls (`"label"` and `"icon"`) on demand[span_94](start_span)[span_94](end_span).
     *
     * - `"label"`: Creates an anonymous `ville.ui.basic.Label` and binds its
     *   `changeValue` event to a lightweight `qx.html.Text` node[span_95](start_span)[span_95](end_span).
     * - `"icon"`: Uses the provided `ville.ui.core.Widget` or creates a
     *   `ville.ui.basic.Image`, inserting it before or after `__textNode`[span_96](start_span)[span_96](end_span).
     *
     * @param {string} id Child control identifier (`"label"` or `"icon"`)[span_97](start_span)[span_97](end_span).
     * @param {*} [hash] Optional configuration map[span_98](start_span)[span_98](end_span).
     * @returns {ville.ui.core.Widget|null} Created child control instance[span_99](start_span)[span_99](end_span).
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control;

      switch (id) {
        case "label": {
          const initialText = this.getLabel();
          control = new ville.ui.basic.Label(initialText);
          control.setAnonymous(true);

          // 1. Create and cache the lightweight qx.html.Text node[span_100](start_span)[span_100](end_span)
          this.__textNode = new qx.html.Text(initialText);

          // 2. Sync qx.html.Text whenever the Label's value changes[span_101](start_span)[span_101](end_span)
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
          // Right icon -> append at end (after __textNode)[span_102](start_span)[span_102](end_span)
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

    // --- Label & Icon Property Appliers ---

    /**
     * Property apply handler for `label`[span_103](start_span)[span_103](end_span).
     *
     * @param {string|null} value New label string[span_104](start_span)[span_104](end_span).
     * @param {string|null} old Previous label string[span_105](start_span)[span_105](end_span).
     * @protected
     */
    _applyLabel(value, old) {
      if (value != null) {
        // Force creation of the "label" child control if initial label was null[span_106](start_span)[span_106](end_span)
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
     * or updates the image source URI[span_107](start_span)[span_107](end_span).
     *
     * @param {string|ville.ui.core.Widget|null} value New icon widget or URI string[span_108](start_span)[span_108](end_span).
     * @param {string|ville.ui.core.Widget|null} old Previous icon widget or URI string[span_109](start_span)[span_109](end_span).
     * @protected
     */
    _applyIcon(value, old) {
      if (value != null) {
        const icon = this.getChildControl("icon");
        if (value instanceof ville.ui.core.Widget) {
          // Handle swapping an existing icon widget if replaced at runtime[span_110](start_span)[span_110](end_span)
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
     * Property apply handler for `show`[span_111](start_span)[span_111](end_span).
     *
     * @param {"both"|"label"|"icon"} value New visibility mode[span_112](start_span)[span_112](end_span).
     * @param {"both"|"label"|"icon"} old Previous visibility mode[span_113](start_span)[span_113](end_span).
     * @protected
     */
    _applyShow(value, old) {
      this._syncShowVisibility();
    },

    /**
     * Synchronizes visibility of the `"label"` and `"icon"` child controls based
     * on the `show` property and whether non-null values are present[span_114](start_span)[span_114](end_span).
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
     * Property apply handler for `size`[span_115](start_span)[span_115](end_span).
     *
     * @param {string|null} value New size token[span_116](start_span)[span_116](end_span).
     * @param {string|null} old Previous size token[span_117](start_span)[span_117](end_span).
     * @protected
     */
    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    /**
     * Property apply handler for `radius`[span_118](start_span)[span_118](end_span).
     *
     * @param {string|null} value New radius token[span_119](start_span)[span_119](end_span).
     * @param {string|null} old Previous radius token[span_120](start_span)[span_120](end_span).
     * @protected
     */
    _applyRadius(value, old) {
      this._syncModifierState("radius", value, old);
    },

    /**
     * Property apply handler for `iconPosition`[span_121](start_span)[span_121](end_span).
     *
     * @param {"left"|"right"} value New icon position[span_122](start_span)[span_122](end_span).
     * @param {"left"|"right"} old Previous icon position[span_123](start_span)[span_123](end_span).
     * @protected
     */
    _applyIconPosition(value, old) {
      this._syncModifierState("iconPosition", value, old);
    },

    /**
     * Property apply handler for `fullWidth`[span_124](start_span)[span_124](end_span).
     *
     * @param {boolean} value Whether full-width block mode is enabled[span_125](start_span)[span_125](end_span).
     * @param {boolean} old Previous full-width state[span_126](start_span)[span_126](end_span).
     * @protected
     */
    _applyFullWidth(value, old) {
      value ? this.addState("fullWidth") : this.removeState("fullWidth");
    },

    /**
     * Property apply handler for `loading`. Resets active press states, toggles
     * `"loading"`, and locks interactive disabled attributes[span_127](start_span)[span_127](end_span).
     *
     * @param {boolean} value Whether loading state is active[span_128](start_span)[span_128](end_span).
     * @param {boolean} old Previous loading state[span_129](start_span)[span_129](end_span).
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
     * attribute (when rendered as a `<button>`) from `enabled` and `loading`[span_130](start_span)[span_130](end_span).
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
    }
  },

  /**
   * Disposes the internal `qx.html.Text` node on widget destruction[span_131](start_span)[span_131](end_span).
   */
  destruct() {
    if (this.__textNode) {
      this.__textNode.dispose();
      this.__textNode = null;
    }
  }
});
