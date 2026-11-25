/**
 * Path B Modeless / Floating Semantic `<dialog>` Window Widget (`STRAT-EVENT-02` & `STRAT-CORE-09`).
 *
 * Extends `ville.ui.overlay.Modal` with pointer-captured dragging (`MMovable`)
 * and edge/corner resizing (`MResizable`), opening via non-modal `<dialog>.show()`
 * by default (or `showModal()` when `modal: true`).
 */
qx.Class.define("ville.ui.overlay.Window", {
  extend: ville.ui.overlay.Modal,
  include: [ville.ui.core.MMovable, ville.ui.core.MResizable],

  construct(caption, icon) {
    super(caption, icon);

    const el = this.getContentElement();
    el.removeClass("ville-modal");
    el.addClass("ville-window");

    this._activateMoveHandle(this.getChildControl("header"));
  },

  properties: {
    appearance: {
      refine: true,
      init: "window"
    },

    /**
     * Whether this window opens as a modal (`showModal()`) or modeless floating
     * window (`show()`).
     */
    modal: {
      check: "Boolean",
      init: false
    },

    /**
     * Whether the window can be minimized.
     */
    showMinimize: {
      check: "Boolean",
      init: false
    },

    /**
     * Whether the window can be maximized.
     */
    showMaximize: {
      check: "Boolean",
      init: false
    }
  },

  members: {
    /**
     * Centers the floating window in the current viewport.
     */
    center() {
      if (typeof window === "undefined") {
        return;
      }
      const w = this.getWidth() || 420;
      const h = this.getHeight() || 280;
      const left = Math.max(16, Math.round((window.innerWidth - w) / 2));
      const top = Math.max(16, Math.round((window.innerHeight - h) / 2));
      this.getContentElement().setStyles({
        position: "fixed",
        margin: "0",
        left: `${left}px`,
        top: `${top}px`
      });
    },

    // Override Modal#_applyOpened to support non-modal `dialog.show()` when `modal: false`
    _applyOpened(value) {
      if (this.getModal()) {
        super._applyOpened(value);
        return;
      }
      const domEl = this._ensureInDocument();
      if (value) {
        if (domEl && typeof domEl.show === "function") {
          if (!domEl.open) {
            domEl.show();
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
    }
  }
});
