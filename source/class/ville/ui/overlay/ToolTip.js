/**
 * Path B Top-Layer Tooltip Widget (`STRAT-EVENT-02` & `STRAT-WIDGET-03`).
 *
 * Extends `ville.ui.overlay.Popup` and renders its text caption and optional
 * icon directly inside the popover element with zero `qx.ui.basic.Atom` or
 * child `Widget` instance overhead.
 */
qx.Class.define("ville.ui.overlay.ToolTip", {
  extend: ville.ui.overlay.Popup,

  construct(label, icon) {
    super();

    this._labelEl = new ville.html.Text("span");
    this.getContentElement().add(this._labelEl);
    this.getContentElement().setAttribute("role", "tooltip");

    if (label != null) {
      this.setLabel(label);
    }
    if (icon != null) {
      this.setIcon(icon);
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "tooltip"
    },

    position: {
      refine: true,
      init: "top-center"
    },

    /**
     * Tooltip text content.
     */
    label: {
      check: "String",
      nullable: true,
      event: "changeLabel",
      apply: "_applyLabel"
    },

    /**
     * Optional icon identifier from `ville.ui.icon.Default` or image URI.
     */
    icon: {
      check: "String",
      nullable: true,
      event: "changeIcon",
      apply: "_applyIcon"
    },

    /**
     * Hover open delay in milliseconds.
     */
    showTimeout: {
      check: "Integer",
      init: 250
    },

    /**
     * Hover close delay in milliseconds.
     */
    hideTimeout: {
      check: "Integer",
      init: 100
    }
  },

  members: {
    _labelEl: null,
    _iconEl: null,
    __showTimer: null,
    __hideTimer: null,

    /**
     * Attaches hover and focus listeners to `targetWidget` so this tooltip
     * automatically anchors and opens/closes in `#top-layer`.
     *
     * @param {ville.ui.core.Widget} targetWidget The widget that triggers this tooltip
     * @return {this}
     */
    bindToWidget(targetWidget) {
      if (!targetWidget) {
        return this;
      }
      const el = targetWidget.getContentElement();
      const scheduleShow = () => {
        this.__clearTimers();
        this.placeToWidget(targetWidget);
        const delay = this.getShowTimeout();
        if (delay <= 0) {
          this.open();
        } else {
          this.__showTimer = setTimeout(() => this.open(), delay);
        }
      };
      const scheduleHide = () => {
        this.__clearTimers();
        const delay = this.getHideTimeout();
        if (delay <= 0) {
          this.close();
        } else {
          this.__hideTimer = setTimeout(() => this.close(), delay);
        }
      };

      el.addListener("pointerenter", scheduleShow);
      el.addListener("focusin", scheduleShow);
      el.addListener("pointerleave", scheduleHide);
      el.addListener("focusout", scheduleHide);
      return this;
    },

    __clearTimers() {
      if (this.__showTimer) {
        clearTimeout(this.__showTimer);
        this.__showTimer = null;
      }
      if (this.__hideTimer) {
        clearTimeout(this.__hideTimer);
        this.__hideTimer = null;
      }
    },

    _applyLabel(value) {
      if (this._labelEl) {
        this._labelEl.setText(value ? String(value) : "");
      }
    },

    _applyIcon(value) {
      if (this._iconEl) {
        this.getContentElement().remove(this._iconEl);
        this._iconEl = null;
      }
      if (value) {
        this._iconEl = ville.ui.icon.Default.createElement(value, { size: 14 });
        if (this._iconEl) {
          this.getContentElement().addAt(this._iconEl, 0);
        }
      }
    }
  },

  destruct() {
    this.__clearTimers();
    this._labelEl = null;
    this._iconEl = null;
  }
});
