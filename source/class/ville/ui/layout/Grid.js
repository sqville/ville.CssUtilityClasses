/**
 * Standards-Backed 2D Grid Layout (`ville.ui.layout.Grid` — `STRAT-LAYOUT-01`).
 *
 * Implements Qooxdoo's `qx.ui.layout.Grid` API (`spacingX`, `spacingY`, `setSpacing`,
 * `setColumnFlex`, `setRowFlex`, `setColumnWidth`, `setRowHeight`, `setColumnMinWidth`,
 * `setColumnMaxWidth`, `setColumnAlign`, `setRowAlign`, and per-child 0-indexed
 * `{ row, column, rowSpan, colSpan }`) directly on top of the browser's C++ CSS Grid
 * Layout engine (`display: grid`).
 */
qx.Class.define("ville.ui.layout.Grid", {
  extend: ville.ui.layout.Abstract,

  /**
   * @param {number|string} [spacingX=0] Horizontal column gap (in px or theme token `"xs".."xl"`).
   * @param {number|string} [spacingY=0] Vertical row gap (in px or theme token `"xs".."xl"`).
   */
  construct(spacingX = 0, spacingY = 0) {
    // @ts-ignore
    super();

    this.__colConfig = {};
    this.__rowConfig = {};
    this.__maxCol = -1;
    this.__maxRow = -1;

    if (spacingX) {
      this.setSpacingX(spacingX);
    }
    if (spacingY) {
      this.setSpacingY(spacingY);
    }
  },

  properties: {
    /** Horizontal column gap (`column-gap`). */
    spacingX: {
      init: 0,
      apply: "_applyGridTemplate"
    },

    /** Vertical row gap (`row-gap`). */
    spacingY: {
      init: 0,
      apply: "_applyGridTemplate"
    }
  },

  members: {
    /** @type {Object<number, { flex?: number, width?: number|string, minWidth?: number|string, maxWidth?: number|string, hAlign?: string, vAlign?: string }>} @private */
    __colConfig: null,

    /** @type {Object<number, { flex?: number, height?: number|string, minHeight?: number|string, maxHeight?: number|string, hAlign?: string, vAlign?: string }>} @private */
    __rowConfig: null,

    /** @type {number} @private */
    __maxCol: -1,

    /** @type {number} @private */
    __maxRow: -1,

    /**
     * Convenience shortcut to set both `spacingX` and `spacingY` simultaneously.
     *
     * @param {number|string} spacing Gap value in px or theme token.
     * @returns {this} This layout instance for chaining.
     */
    setSpacing(spacing) {
      this.setSpacingX(spacing);
      this.setSpacingY(spacing);
      return this;
    },

    /**
     * Sets the flex grow weight (`<flex>fr`) for a zero-indexed column.
     *
     * @param {number} column Zero-indexed column number.
     * @param {number} flex Flex factor (`0` disables flex).
     * @returns {this} This layout instance for chaining.
     */
    setColumnFlex(column, flex) {
      this.__ensureCol(column).flex = flex;
      this._applyGridTemplate();
      return this;
    },

    /**
     * Returns the flex weight for `column` (defaults to `0`).
     *
     * @param {number} column Zero-indexed column number.
     * @returns {number} Flex factor.
     */
    getColumnFlex(column) {
      return this.__colConfig[column]?.flex || 0;
    },

    /**
     * Sets the flex grow weight (`<flex>fr`) for a zero-indexed row.
     *
     * @param {number} row Zero-indexed row number.
     * @param {number} flex Flex factor (`0` disables flex).
     * @returns {this} This layout instance for chaining.
     */
    setRowFlex(row, flex) {
      this.__ensureRow(row).flex = flex;
      this._applyGridTemplate();
      return this;
    },

    /**
     * Returns the flex weight for `row` (defaults to `0`).
     *
     * @param {number} row Zero-indexed row number.
     * @returns {number} Flex factor.
     */
    getRowFlex(row) {
      return this.__rowConfig[row]?.flex || 0;
    },

    /**
     * Sets an explicit width for a zero-indexed column.
     *
     * @param {number} column Zero-indexed column number.
     * @param {number|string} width Column width in px or CSS length.
     * @returns {this} This layout instance for chaining.
     */
    setColumnWidth(column, width) {
      this.__ensureCol(column).width = width;
      this._applyGridTemplate();
      return this;
    },

    /**
     * Sets an explicit minimum width for a zero-indexed column.
     *
     * @param {number} column Zero-indexed column number.
     * @param {number|string} minWidth Minimum width in px or CSS length.
     * @returns {this} This layout instance for chaining.
     */
    setColumnMinWidth(column, minWidth) {
      this.__ensureCol(column).minWidth = minWidth;
      this._applyGridTemplate();
      return this;
    },

    /**
     * Sets an explicit maximum width for a zero-indexed column.
     *
     * @param {number} column Zero-indexed column number.
     * @param {number|string} maxWidth Maximum width in px or CSS length.
     * @returns {this} This layout instance for chaining.
     */
    setColumnMaxWidth(column, maxWidth) {
      this.__ensureCol(column).maxWidth = maxWidth;
      this._applyGridTemplate();
      return this;
    },

    /**
     * Sets an explicit height for a zero-indexed row.
     *
     * @param {number} row Zero-indexed row number.
     * @param {number|string} height Row height in px or CSS length.
     * @returns {this} This layout instance for chaining.
     */
    setRowHeight(row, height) {
      this.__ensureRow(row).height = height;
      this._applyGridTemplate();
      return this;
    },

    /**
     * Sets default horizontal and vertical cell alignment for a column.
     *
     * @param {number} column Zero-indexed column number.
     * @param {"left"|"center"|"right"} hAlign Horizontal cell alignment.
     * @param {"top"|"middle"|"bottom"|"baseline"} [vAlign="middle"] Vertical cell alignment.
     * @returns {this} This layout instance for chaining.
     */
    setColumnAlign(column, hAlign, vAlign = "middle") {
      const col = this.__ensureCol(column);
      col.hAlign = hAlign;
      col.vAlign = vAlign;
      this.__reapplyAllChildren();
      return this;
    },

    /**
     * Sets default horizontal and vertical cell alignment for a row.
     *
     * @param {number} row Zero-indexed row number.
     * @param {"left"|"center"|"right"} hAlign Horizontal cell alignment.
     * @param {"top"|"middle"|"bottom"|"baseline"} [vAlign="middle"] Vertical cell alignment.
     * @returns {this} This layout instance for chaining.
     */
    setRowAlign(row, hAlign, vAlign = "middle") {
      const r = this.__ensureRow(row);
      r.hAlign = hAlign;
      r.vAlign = vAlign;
      this.__reapplyAllChildren();
      return this;
    },

    /**
     * @param {number} column Zero-indexed column.
     * @returns {Object} Column config object.
     * @private
     */
    __ensureCol(column) {
      if (column > this.__maxCol) {
        this.__maxCol = column;
      }
      return (
        this.__colConfig[column] || (this.__colConfig[column] = {})
      );
    },

    /**
     * @param {number} row Zero-indexed row.
     * @returns {Object} Row config object.
     * @private
     */
    __ensureRow(row) {
      if (row > this.__maxRow) {
        this.__maxRow = row;
      }
      return this.__rowConfig[row] || (this.__rowConfig[row] = {});
    },

    /**
     * Builds the CSS `grid-template-columns` and `grid-template-rows` track definitions.
     *
     * @protected
     */
    _applyGridTemplate() {
      const widget = this._getWidget();
      if (widget) {
        this._applyContainerStyles(widget);
        ville.ui.core.Widget.scheduleFlush();
      }
    },

    // overridden
    _applyContainerStyles(widget) {
      const colTracks = [];
      for (let c = 0; c <= this.__maxCol; c++) {
        const cfg = this.__colConfig[c] || {};
        const minW =
          cfg.minWidth != null
            ? ville.ui.core.Widget.formatCssDimension(cfg.minWidth)
            : "0";
        if (cfg.flex && cfg.flex > 0) {
          colTracks.push(`minmax(${minW}, ${cfg.flex}fr)`);
        } else if (cfg.width != null) {
          colTracks.push(ville.ui.core.Widget.formatCssDimension(cfg.width));
        } else if (cfg.minWidth != null || cfg.maxWidth != null) {
          const maxW =
            cfg.maxWidth != null
              ? ville.ui.core.Widget.formatCssDimension(cfg.maxWidth)
              : "auto";
          colTracks.push(`minmax(${minW}, ${maxW})`);
        } else {
          colTracks.push("auto");
        }
      }

      const rowTracks = [];
      for (let r = 0; r <= this.__maxRow; r++) {
        const cfg = this.__rowConfig[r] || {};
        if (cfg.flex && cfg.flex > 0) {
          rowTracks.push(`minmax(0, ${cfg.flex}fr)`);
        } else if (cfg.height != null) {
          rowTracks.push(ville.ui.core.Widget.formatCssDimension(cfg.height));
        } else {
          rowTracks.push("auto");
        }
      }

      const sx = this.getSpacingX();
      const sy = this.getSpacingY();
      widget.getContentElement().setStyles({
        display: "grid",
        "grid-template-columns":
          colTracks.length > 0 ? colTracks.join(" ") : null,
        "grid-template-rows":
          rowTracks.length > 0 ? rowTracks.join(" ") : null,
        "column-gap":
          sx !== 0 && sx !== null
            ? ville.ui.core.Widget.formatCssDimension(sx)
            : null,
        "row-gap":
          sy !== 0 && sy !== null
            ? ville.ui.core.Widget.formatCssDimension(sy)
            : null
      });
    },

    // overridden
    _disconnectContainerStyles(widget) {
      widget.getContentElement().setStyles({
        display: null,
        "grid-template-columns": null,
        "grid-template-rows": null,
        "column-gap": null,
        "row-gap": null
      });
    },

    // overridden
    applyChildLayout(child, options = {}) {
      const el = child.getContentElement();
      const row = options.row;
      const column = options.column;
      const rowSpan = options.rowSpan || 1;
      const colSpan = options.colSpan || 1;

      if (typeof column === "number") {
        const endCol = column + colSpan - 1;
        if (endCol > this.__maxCol) {
          this.__maxCol = endCol;
          this._applyGridTemplate();
        }
        el.setStyle(
          "grid-column",
          colSpan > 1 ? `${column + 1} / span ${colSpan}` : `${column + 1}`
        );
      }

      if (typeof row === "number") {
        const endRow = row + rowSpan - 1;
        if (endRow > this.__maxRow) {
          this.__maxRow = endRow;
          this._applyGridTemplate();
        }
        el.setStyle(
          "grid-row",
          rowSpan > 1 ? `${row + 1} / span ${rowSpan}` : `${row + 1}`
        );
      }

      const justifySelfMap = {
        left: "start",
        center: "center",
        right: "end"
      };
      const alignSelfMap = {
        top: "start",
        middle: "center",
        bottom: "end",
        baseline: "baseline"
      };

      const colCfg = typeof column === "number" ? this.__colConfig[column] : null;
      const rowCfg = typeof row === "number" ? this.__rowConfig[row] : null;

      const hAlign =
        child.getAlignX() || rowCfg?.hAlign || colCfg?.hAlign || null;
      const vAlign =
        child.getAlignY() || rowCfg?.vAlign || colCfg?.vAlign || null;

      if (hAlign && justifySelfMap[hAlign]) {
        el.setStyle("justify-self", justifySelfMap[hAlign]);
      } else if (!child.getAllowGrowX()) {
        el.setStyle("justify-self", "start");
      } else {
        el.setStyle("justify-self", "stretch");
      }

      if (vAlign && alignSelfMap[vAlign]) {
        el.setStyle("align-self", alignSelfMap[vAlign]);
      } else if (!child.getAllowGrowY()) {
        el.setStyle("align-self", "start");
      } else {
        el.setStyle("align-self", "stretch");
      }
    },

    /**
     * Re-evaluates cell alignment across all attached children.
     *
     * @private
     */
    __reapplyAllChildren() {
      const children = this._getLayoutChildren();
      for (let i = 0; i < children.length; i++) {
        this.applyChildLayout(children[i], children[i].getLayoutProperties());
      }
      ville.ui.core.Widget.scheduleFlush();
    }
  }
});
