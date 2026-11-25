/**
 * Path B Native Placement Mixin (`STRAT-CORE-09` & `STRAT-EVENT-02`).
 *
 * Preserves Qooxdoo's declarative `placeToWidget(target)`, `placeToPoint(point)`,
 * `position`, and `offset` API contract while delegating geometry to CSS Anchor
 * Positioning (`anchor-name`, `position-anchor`, `data-placement`) with automatic
 * `getBoundingClientRect()` fallback for point placement or browsers without
 * CSS Anchor Positioning.
 *
 * @ignore(CSS, CSS.*)
 */
qx.Mixin.define("ville.ui.core.MPlacement", {
  properties: {
    /**
     * Placement position relative to the anchor target.
     */
    position: {
      check: [
        "bottom-left",
        "bottom-center",
        "bottom-right",
        "top-left",
        "top-center",
        "top-right",
        "right-top",
        "right-center",
        "right-bottom",
        "left-top",
        "left-center",
        "left-bottom"
      ],
      init: "bottom-left",
      apply: "_applyPlacementPosition"
    },

    /**
     * Pixel offset gap from the anchor target.
     */
    offset: {
      check: "Number",
      init: 6,
      apply: "_applyPlacementOffset"
    }
  },

  members: {
    __anchorTarget: null,
    __anchorName: null,

    /**
     * Associates this overlay with a target widget and synchronizes CSS Anchor
     * Positioning (`anchor-name` on target, `position-anchor` on overlay) plus
     * fallback coordinates.
     *
     * @param {ville.ui.core.Widget} target The anchor widget
     * @param {Boolean ? true} updatePosition Whether to compute coordinates immediately
     * @return {this}
     */
    placeToWidget(target, updatePosition = true) {
      if (!target) {
        return this;
      }
      this.__anchorTarget = target;
      const targetEl = target.getContentElement();
      const selfEl = this.getContentElement();
      if (!targetEl || !selfEl) {
        return this;
      }

      const hash =
        typeof target.toHashCode === "function"
          ? target.toHashCode()
          : target.$$hash || "anchor";
      const anchorIdent = `--ville-anchor-${hash}`;
      this.__anchorName = anchorIdent;

      targetEl.setStyle("anchor-name", anchorIdent);
      selfEl.setStyle("position-anchor", anchorIdent);
      selfEl.setStyle("--ville-anchor", anchorIdent);
      selfEl.setAttribute("data-placement", this.getPosition());
      selfEl.setStyle("--ville-popover-offset", `${this.getOffset()}px`);

      if (updatePosition) {
        this.updatePlacement();
      }
      return this;
    },

    /**
     * Places the overlay at explicit viewport coordinates `{ left, top }`.
     *
     * @param {{left: Number, top: Number}} point Viewport coordinates
     * @return {this}
     */
    placeToPoint(point) {
      if (!point) {
        return this;
      }
      this.__anchorTarget = null;
      const selfEl = this.getContentElement();
      if (selfEl) {
        selfEl.setStyle("position", "fixed");
        selfEl.setStyle("margin", "0");
        selfEl.setStyle("left", `${Math.round(point.left || 0)}px`);
        selfEl.setStyle("top", `${Math.round(point.top || 0)}px`);
      }
      return this;
    },

    /**
     * Returns the current anchor target widget, if any.
     *
     * @return {ville.ui.core.Widget|null}
     */
    getLayoutTarget() {
      return this.__anchorTarget || null;
    },

    /**
     * Synchronizes viewport fallback coordinates from the anchor widget's
     * bounding client rectangle when CSS Anchor Positioning is not active or
     * when opening in the top layer.
     */
    updatePlacement() {
      const target = this.__anchorTarget;
      if (!target) {
        return;
      }
      const targetDom = target.getContentElement()?.getDomElement();
      const selfEl = this.getContentElement();
      if (!targetDom || !selfEl) {
        return;
      }

      const supportsAnchor =
        typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("anchor-name", "--ville-a");

      if (supportsAnchor) {
        return;
      }

      const rect = targetDom.getBoundingClientRect();
      const gap = this.getOffset() || 0;
      const pos = this.getPosition();
      let left = rect.left;
      let top = rect.bottom + gap;

      if (pos.startsWith("top-")) {
        top = Math.max(4, rect.top - gap - 36);
      } else if (pos.startsWith("right-")) {
        left = rect.right + gap;
        top = rect.top;
      } else if (pos.startsWith("left-")) {
        left = Math.max(4, rect.left - gap - 160);
        top = rect.top;
      }

      if (pos.endsWith("-right")) {
        left = Math.max(4, rect.right - 160);
      } else if (pos.endsWith("-center")) {
        left = Math.max(4, rect.left + rect.width / 2 - 80);
      }

      selfEl.setStyle("position", "fixed");
      selfEl.setStyle("margin", "0");
      selfEl.setStyle("left", `${Math.round(left)}px`);
      selfEl.setStyle("top", `${Math.round(top)}px`);
    },

    _applyPlacementPosition(value) {
      this.getContentElement().setAttribute("data-placement", value || "bottom-left");
      this.updatePlacement();
    },

    _applyPlacementOffset(value) {
      this.getContentElement().setStyle(
        "--ville-popover-offset",
        `${Number(value) || 0}px`
      );
      this.updatePlacement();
    }
  }
});
