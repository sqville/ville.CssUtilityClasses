/**
 * A RepeatButton fires the `"execute"` event repeatedly while the pointer
 * remains pressed down on the button.
 */
qx.Class.define("ville.ui.form.RepeatButton", {
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
      el.addListener("pointerdown", (e) => {
        const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
        if ((nativeEvt && nativeEvt.button !== 0) || !this.getEnabled()) return;
        this._startRepeat();
      });
      el.addListener("pointerup", () => this._stopRepeat());
      el.addListener("pointerleave", () => this._stopRepeat());
      el.addListener("pointercancel", () => this._stopRepeat());
    }
  },

  properties: {
    /** Initial delay in milliseconds before repeating begins */
    firstInterval: {
      check: "Integer",
      init: 300
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

    _startRepeat() {
      this._stopRepeat();
      this.__delayTimer = setTimeout(() => {
        this.__repeatTimer = setInterval(() => {
          if (this.getEnabled()) {
            this.execute();
          } else {
            this._stopRepeat();
          }
        }, this.getInterval());
      }, this.getFirstInterval());
    },

    _stopRepeat() {
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
    this._stopRepeat();
  }
});
