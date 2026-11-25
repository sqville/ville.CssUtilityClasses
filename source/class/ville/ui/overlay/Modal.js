/**
 * Path B Top-Layer Semantic `<dialog>` Modal Widget (`STRAT-EVENT-02` & `STRAT-CORE-09`).
 *
 * Replaces legacy `qx.ui.window.Window` + `qx.ui.window.Manager` with the native
 * HTML5 `<dialog class="ville-modal">` element (`showModal()`, `close()`,
 * `::backdrop`, top-layer promotion, native focus trapping, `Escape` cancel,
 * and W3C Invoker Commands `command="show-modal"` / `command="close"`).
 *
 * Includes `MRemoteChildrenHandling` and `MRemoteLayoutHandling` so calling
 * `modal.add(child)` transparently populates the inner `pane` child control.
 *
 * @ignore(CommandEvent)
 */
qx.Class.define("ville.ui.overlay.Modal", {
  extend: ville.ui.core.Widget,
  include: [
    ville.ui.core.MRemoteChildrenHandling,
    ville.ui.core.MRemoteLayoutHandling,
    ville.ui.core.MContentPadding
  ],

  construct(caption, icon) {
    super();

    const el = this.getContentElement();
    el.addClass("ville-modal");

    this.getChildControl("header");
    this.getChildControl("title");
    if (this.getShowCloseButton()) {
      this.getChildControl("close-button");
    }
    this.getChildControl("pane");

    if (caption != null) {
      this.setCaption(caption);
    }
    if (icon != null) {
      this.setIcon(icon);
    }

    el.addListener("close", () => {
      const domEl = el.getDomElement();
      if (domEl && domEl.returnValue !== undefined) {
        this.setReturnValue(domEl.returnValue);
      }
      this.setOpened(false);
      this.fireDataEvent("close", this.getReturnValue());
    });

    el.addListener("cancel", (e) => {
      if (!this.getCloseOnEscape()) {
        const nativeEvt = e?.getNativeEvent ? e.getNativeEvent() : e;
        if (nativeEvt && typeof nativeEvt.preventDefault === "function") {
          nativeEvt.preventDefault();
        }
      }
    });

    // Optional backdrop click dismissal on `<dialog>` outer box
    el.addListener("click", (e) => {
      if (!this.getCloseOnClickOutside()) {
        return;
      }
      const nativeEvt = e?.getNativeEvent ? e.getNativeEvent() : e;
      const domEl = el.getDomElement();
      if (nativeEvt && domEl && nativeEvt.target === domEl) {
        this.close();
      }
    });

    // W3C Invoker Commands API (`command="show-modal"` | `"close"`) support
    el.addListener("command", (e) => {
      const nativeEvt = e?.getNativeEvent ? e.getNativeEvent() : e;
      const cmd = nativeEvt?.command;
      if (cmd === "show-modal" || cmd === "--open") {
        this.open();
      } else if (cmd === "close" || cmd === "--close") {
        this.close();
      }
    });
  },

  events: {
    /** Fired when the modal opens in `#top-layer`. */
    open: "qx.event.type.Event",

    /** Fired when the modal closes, passing `returnValue` as event data. */
    close: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "modal"
    },

    /**
     * Modal title displayed in the header bar.
     */
    caption: {
      check: "String",
      nullable: true,
      event: "changeCaption",
      apply: "_applyCaption"
    },

    /**
     * Optional header icon identifier.
     */
    icon: {
      check: "String",
      nullable: true,
      event: "changeIcon",
      apply: "_applyIcon"
    },

    /**
     * Modal width preset (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"full"`).
     */
    size: {
      check: ["xs", "sm", "md", "lg", "xl", "full"],
      init: "md",
      themeable: true,
      apply: "_applySize",
      event: "changeSize"
    },

    /**
     * Whether to display the header close button.
     */
    showCloseButton: {
      check: "Boolean",
      init: true,
      apply: "_applyShowCloseButton"
    },

    /**
     * Whether pressing `Escape` closes the modal.
     */
    closeOnEscape: {
      check: "Boolean",
      init: true
    },

    /**
     * Whether clicking the `::backdrop` outside the dialog closes the modal.
     */
    closeOnClickOutside: {
      check: "Boolean",
      init: true
    },

    /**
     * Reactive open state synchronized with native `<dialog open>`.
     */
    opened: {
      check: "Boolean",
      init: false,
      event: "changeOpened",
      apply: "_applyOpened"
    },

    /**
     * Native `<dialog>.returnValue` string set when closing the dialog.
     */
    returnValue: {
      check: "String",
      init: "",
      event: "changeReturnValue"
    }
  },

  members: {
    __syncingDialog: false,

    _createContentElement() {
      return new ville.html.Element("dialog");
    },

    getChildrenContainer() {
      return this.getChildControl("pane");
    },

    _getContentPaddingTarget() {
      return this.getChildControl("pane");
    },

    _createChildControlImpl(id) {
      let control;
      switch (id) {
        case "header":
          control = new ville.ui.core.Box(new ville.ui.layout.HBox(8));
          this._add(control);
          break;

        case "title":
          control = new ville.ui.basic.Label(this.getCaption() || "");
          this.getChildControl("header").add(control, { flex: 1 });
          break;

        case "close-button":
          control = new ville.ui.form.ActionIcon("CLOSE", "subtle");
          control.setAriaLabel("Close dialog");
          control.addListener("execute", () => this.close(), this);
          this.getChildControl("header").add(control);
          break;

        case "pane":
          control = new ville.ui.core.Box(new ville.ui.layout.VBox(12));
          this._add(control, { flex: 1 });
          break;
      }
      return control || super._createChildControlImpl(id);
    },

    _ensureInDocument() {
      const contentEl = this.getContentElement();
      if (!contentEl.getParent()) {
        const appRoot = qx.core.Init.getApplication?.()?.getRoot?.();
        if (appRoot) {
          appRoot.add(this);
        }
      }
      contentEl.flush();
      const domEl = contentEl.getDomElement();
      if (domEl && !domEl.isConnected && typeof document !== "undefined") {
        document.body.appendChild(domEl);
      }
      return domEl;
    },

    /**
     * Opens the modal in the browser `#top-layer` via native `dialog.showModal()`.
     */
    open() {
      this.setOpened(true);
    },

    /**
     * Alias for `open()` matching native `<dialog>.showModal()`.
     */
    showModal() {
      this.setOpened(true);
    },

    /**
     * Closes the modal via native `dialog.close(returnValue)`.
     *
     * @param {String ?} returnValue Optional dialog return value
     */
    close(returnValue) {
      if (returnValue !== undefined) {
        this.setReturnValue(String(returnValue));
      }
      this.setOpened(false);
    },

    _applyCaption(value) {
      const titleCtrl = this.getChildControl("title", true);
      if (titleCtrl) {
        titleCtrl.setValue(value || "");
      }
    },

    _applyIcon() {},

    _applySize(value, old) {
      this._syncModifierState("size", value, old);
    },

    _applyShowCloseButton(value) {
      const btn = this.getChildControl("close-button", true);
      if (value) {
        this.getChildControl("close-button").show();
      } else if (btn) {
        btn.exclude();
      }
    },

    _applyOpened(value) {
      if (this.__syncingDialog) {
        return;
      }
      this.__syncingDialog = true;
      try {
        const domEl = this._ensureInDocument();
        if (value) {
          if (domEl && typeof domEl.showModal === "function") {
            if (!domEl.open) {
              domEl.showModal();
            }
          } else {
            this.getContentElement().setAttribute("open", "open");
          }
          this.fireEvent("open");
        } else {
          if (domEl && typeof domEl.close === "function") {
            if (domEl.open) {
              domEl.close(this.getReturnValue() || "");
            }
          } else {
            this.getContentElement().removeAttribute("open");
          }
        }
      } finally {
        this.__syncingDialog = false;
      }
    }
  }
});
