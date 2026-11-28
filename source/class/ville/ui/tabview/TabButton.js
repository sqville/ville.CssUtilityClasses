/**
 * A TabButton is the clickable button sitting on the `ville.ui.tabview.TabView` bar.
 *
 * Uses a semantic `<button role="tab">` element via `ville.ui.core.AbstractButton`
 * (which renders its caption and icon with zero child `Widget` overhead), plus
 * `aria-selected`, `data-active`, and an optional close button element.
 */
qx.Class.define("ville.ui.tabview.TabButton", {
  extend: ville.ui.core.AbstractButton,
  implement: [ville.ui.form.IRadioItem],

  /**
   * @param {string} [label=""] Tab button label
   * @param {string|null} [icon=null] Optional icon spec
   */
  construct(label, icon) {
    // @ts-ignore
    super(label, icon);

    this.setAttribute("role", "tab");
    this.setAttribute("aria-selected", "false");

    this.addListener("execute", this._onExecute, this);
  },

  events: {
    /**
     * Fired by `{ville.ui.tabview.Page}` if the close button is tapped.
     * Event data: the `{ville.ui.tabview.TabButton}` instance.
     */
    close: "qx.event.type.Data",

    /** Fired when the active selection value changes. */
    changeValue: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "tabview-page/button"
    },

    /** Active selection state (`IRadioItem`) */
    value: {
      check: "Boolean",
      init: false,
      event: "changeValue",
      apply: "_applyValue"
    },

    /** Assigned radio group manager (`IRadioItem`) */
    group: {
      check: "ville.ui.form.RadioGroup",
      nullable: true,
      apply: "_applyGroup"
    },

    /** Whether a close icon button is shown inside the tab button */
    showCloseButton: {
      check: "Boolean",
      init: false,
      apply: "_applyShowCloseButton"
    }
  },

  members: {
    /** @type {ville.html.Element|null} @private */
    __closeBtnEl: null,

    _applyGroup(value, old) {
      if (old) {
        old.remove(this);
      }
      if (value) {
        value.add(this);
      }
    },

    _applyValue(value) {
      if (value) {
        this.addState("checked");
        this.setAttribute("aria-selected", "true");
        this.setAttribute("data-active", "true");
        this.setAttribute("tabindex", "0");
      } else {
        this.removeState("checked");
        this.setAttribute("aria-selected", "false");
        this.removeAttribute("data-active");
        this.setAttribute("tabindex", "-1");
      }
    },

    _applyShowCloseButton(value) {
      const el = this.getContentElement();
      if (!el) return;

      if (value) {
        if (!this.__closeBtnEl) {
          const closeSpan = new ville.html.Element("span", null, {
            class: "ville-tab-close-button",
            role: "button",
            "aria-label": "Close tab"
          });
          closeSpan.setStyles({
            marginLeft: "6px",
            opacity: "0.7",
            cursor: "pointer",
            display: "inline-flex"
          });
          closeSpan.add(new ville.html.Text("×"));
          closeSpan.addListener("click", (e) => {
            if (e && typeof e.stopPropagation === "function") {
              e.stopPropagation();
            }
            this.fireDataEvent("close", this);
          });
          this.__closeBtnEl = closeSpan;
          el.add(closeSpan);
        } else {
          this.__closeBtnEl.setStyle("display", "inline-flex");
        }
      } else if (this.__closeBtnEl) {
        this.__closeBtnEl.setStyle("display", "none");
      }
      ville.ui.core.Widget.scheduleFlush();
    },

    _onExecute() {
      if (this.getGroup()) {
        this.setValue(true);
      } else {
        this.toggleValue();
      }
    }
  },

  destruct() {
    this.__closeBtnEl = null;
  }
});
