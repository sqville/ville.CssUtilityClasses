/**
 * A HoverButton fires the `"execute"` event repeatedly while the pointer
 * hovers over the button.
 */
qx.Class.define("ville.ui.form.HoverButton", {
  extend: ville.ui.form.Button,

  /**
   * @param {string|null} [label=null] Button label
   * @param {string|null} [icon=null] Optional icon spec
   */
  construct(label, icon) {
    // @ts-ignore
    super(label, icon);

    const el = this.getContentElement();
    if (el) {
      el.addListener("pointerenter", () => {
        if (this.getEnabled()) {
          this._startHoverTimer();
        }
      });
      el.addListener("pointerleave", () => this._stopHoverTimer());
    }
  },

  properties: {
    appearance: {
      refine: true,
      init: "hover-button"
    },

    /** Initial delay in milliseconds before repeating begins */
    firstInterval: {
      check: "Integer",
      init: 200
    },

    /** Repeat interval in milliseconds */
    interval: {
      check: "Integer",
      init: 80
    }
  },

  members: {
    __delayTimer: null,
    __repeatTimer: null,

    _startHoverTimer() {
      this._stopHoverTimer();
      this.__delayTimer = setTimeout(() => {
        this.__repeatTimer = setInterval(() => {
          if (this.getEnabled()) {
            this.execute();
          } else {
            this._stopHoverTimer();
          }
        }, this.getInterval());
      }, this.getFirstInterval());
    },

    _stopHoverTimer() {
      if (this.__delayTimer) {
        clearTimeout(this.__delayTimer);
        this.__delayTimer = null;
      }
      if (this.__repeatTimer) {
        clearInterval(this.__repeatTimer);
        this.__repeatTimer = null;
      }
    }
  },

  destruct() {
    this._stopHoverTimer();
  }
});
