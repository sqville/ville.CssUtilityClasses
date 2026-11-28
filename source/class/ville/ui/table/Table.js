/**
 * Ville UI's `QxLayout`-Style Take on `qx.ui.table.Table` (`ville.ui.table.Table` — `STRAT-WIDGET-08`, `STRAT-CORE-07`, `STRAT-CORE-09`).
 *
 * Layers Qooxdoo's high-level `qx.ui.table.Table` developer ergonomics directly onto
 * Ville UI's pure semantic HTML5 `<table>` foundation (`SimpleTable`):
 *  - **Zero `TableScroller` / `TableClipper` / `TablePane` Bloat**: Renders a real semantic
 *    `<table>` (`<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th scope="col">`, `<td>`) inside a
 *    native overflow scroll container (`scrollend`) with sticky `<thead>` (`position: sticky`).
 *  - **100% `ITableModel` / `ville.ui.table.model.Simple` Contract**:
 *    Accepts `new ville.ui.table.Table(tableModel)` or `setTableModel(model)`, automatically
 *    synchronizing columns, sorting (`sortByColumn`), filtering (`searchQuery`), and edits (`setValue`).
 *  - **Two-Tier Scaling (`STRAT-WIDGET-08`)**:
 *    * **Tier 1 (< `virtualThreshold` rows, default 250)**: Native CSS `content-visibility: auto` on `<tr>`.
 *    * **Tier 2 (>= `virtualThreshold` rows, up to 100,000+ rows)**: Windowed `<tbody>` rendering
 *      only the visible viewport slice (~35 rows) + top/bottom `<tr class="ville-table-spacer">` rows
 *      driven by native `scroll` / `scrollend` events at 60/120 FPS.
 *  - **Inline Double-Click Cell Editing**: Double-clicking any cell in an editable column
 *    (`tableModel.isColumnEditable(colIndex)`) mounts an inline `<input>` inside the `<td>`
 *    that commits on `Enter` / `blur` (`dataEdited` event) and cancels on `Escape`.
 *  - **Pointer-Captured Column Resizing**: Dragging a column header border resizes the column
 *    live via `Element.setPointerCapture()`.
 *  - **Zero-DOM-Mutation Live Search Highlighting (`STRAT-CORE-06`)**: Highlights matching
 *    substrings across visible cells using the W3C CSS Custom Highlight API (`CSS.highlights`).
 *
 * @childControl scroll-viewport {ville.ui.core.Box} Native overflow scroll wrapper around the semantic `<table>`
 * @childControl table-el {ville.ui.core.Widget} The inner semantic `<table>` element
 * @childControl statusbar {ville.ui.basic.Label} Footer status bar displaying row & selection counts
 */
qx.Class.define("ville.ui.table.Table", {
  extend: ville.ui.core.Box,

  /**
   * @param {ville.ui.table.ITableModel|null} [tableModel=null] Optional initial table model.
   */
  construct(tableModel = null) {
    // @ts-ignore
    super(new ville.ui.layout.VBox(0));

    this.__columnWidths = {};
    this.__columnAlignments = {};
    this.__selectedRowIndices = new Set();
    this.__scrollTop = 0;

    this._createChildControl("scroll-viewport");
    this._createChildControl("statusbar");

    if (tableModel) {
      this.setTableModel(tableModel);
    } else {
      this.setTableModel(new ville.ui.table.model.Simple());
    }
  },

  events: {
    /** Fired when a row is clicked/selected. Data: `{ rowIndex, rowData, selectedIndices }` */
    rowSelect: "qx.event.type.Data",

    /** Fired when the selection changes (`changeSelection` compatibility). */
    changeSelection: "qx.event.type.Data",

    /** Fired when an editable cell's value is modified by the user. Data: `{ row, col, value, oldValue }` */
    dataEdited: "qx.event.type.Data",

    /** Fired when a cell is tapped/clicked. Data: `{ row, col }` */
    cellTap: "qx.event.type.Data",

    /** Fired when a cell is double-clicked. Data: `{ row, col }` */
    cellDbltap: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "table"
    },

    /** Attached `ville.ui.table.ITableModel` (e.g. `ville.ui.table.model.Simple`). */
    tableModel: {
      check: "ville.ui.table.ITableModel",
      nullable: true,
      init: null,
      apply: "_applyTableModel",
      event: "changeTableModel"
    },

    /** Row height in pixels used for `contain-intrinsic-size` and Tier 2 windowing. */
    rowHeight: {
      check: "Integer",
      init: 34,
      apply: "_scheduleTableRender"
    },

    /** Row count threshold at which Tier 2 windowed `<tbody>` virtualization activates. */
    virtualThreshold: {
      check: "Integer",
      init: 250,
      apply: "_scheduleTableRender"
    },

    /** Maximum viewport height of the scrollable table area (in pixels or CSS string). */
    viewportHeight: {
      init: 260,
      apply: "_applyViewportHeight"
    },

    /** Whether alternating rows are striped (`false`, `true` / `"odd"`, or `"even"`). */
    striped: {
      init: true,
      apply: "_scheduleTableRender"
    },

    /** Whether hovering over a `<tbody>` row highlights it (`data-hover`). */
    highlightOnHover: {
      check: "Boolean",
      init: true,
      apply: "_scheduleTableRender"
    },

    /** Whether vertical borders are drawn between columns (`data-with-column-border`). */
    withColumnBorders: {
      check: "Boolean",
      init: true,
      apply: "_scheduleTableRender"
    },

    /** Whether horizontal borders are drawn between rows (`data-with-row-border`). */
    withRowBorders: {
      check: "Boolean",
      init: true,
      apply: "_scheduleTableRender"
    },

    /** Whether the footer status bar (`"Showing X of Y rows"`) is visible. */
    statusBarVisible: {
      check: "Boolean",
      init: true,
      apply: "_applyStatusBarVisible"
    },

    /** Selection mode (`"none"`, `"single"`, `"multi"`). */
    selectionMode: {
      check: ["none", "single", "multi"],
      init: "single"
    },

    /** Live search substring highlighted across visible cells via `CSS.highlights`. */
    highlightQuery: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applyHighlightQuery"
    }
  },

  members: {
    /** @type {Object<number, number|string>} @private */
    __columnWidths: null,

    /** @type {Object<number, "left"|"center"|"right">} @private */
    __columnAlignments: null,

    /** @type {Set<number>} @private */
    __selectedRowIndices: null,

    /** @type {number} @private */
    __scrollTop: 0,

    /** @type {boolean} @private */
    __renderScheduled: false,

    /** @type {string[]} @private */
    __modelListenerIds: null,

    _createChildControlImpl(id) {
      let control;

      switch (id) {
        case "scroll-viewport": {
          control = new ville.ui.core.Box();
          control.setStyles({
            overflowY: "auto",
            overflowX: "auto",
            maxHeight: `${this.getViewportHeight()}px`,
            width: "100%",
            position: "relative"
          });
          const vpEl = control.getContentElement();
          vpEl.addListener("scroll", () => {
            const domVp = vpEl.getDomElement();
            if (!domVp) return;
            const nextTop = domVp.scrollTop;
            const model = this.getTableModel();
            const rowCount = model ? model.getRowCount() : 0;
            if (rowCount >= this.getVirtualThreshold()) {
              const rowH = this.getRowHeight() || 34;
              if (Math.abs(nextTop - this.__scrollTop) >= rowH * 2) {
                this.__scrollTop = nextTop;
                this._renderTableDom();
              }
            }
          });

          const tableWidget = this._createChildControl("table-el");
          control.add(tableWidget);
          this._add(control, { flex: 1 });
          break;
        }

        case "table-el": {
          control = new ville.ui.core.Box("table");
          const tblEl = control.getContentElement();
          tblEl.setAttributes({
            "data-with-table-border": "true",
            "data-tabular-nums": "true"
          });
          tblEl.addListener("click", this._onTableClick, this);
          tblEl.addListener("dblclick", this._onTableDblClick, this);
          tblEl.addListener("pointerdown", this._onHeaderResizePointerDown, this);
          break;
        }

        case "statusbar":
          control = new ville.ui.basic.Label("0 rows");
          control.setStyles({
            fontSize: "0.75rem",
            opacity: "0.75",
            padding: "6px 10px"
          });
          this._add(control);
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    _applyViewportHeight(value) {
      const vp = this.getChildControl("scroll-viewport", true);
      if (vp) {
        vp.setStyle(
          "maxHeight",
          typeof value === "number" ? `${value}px` : String(value)
        );
      }
    },

    _applyStatusBarVisible(value) {
      const sb = this.getChildControl("statusbar", true);
      if (sb) {
        value ? sb.show() : sb.exclude();
      }
    },

    _applyTableModel(value, old) {
      if (old && this.__modelListenerIds) {
        for (const id of this.__modelListenerIds) {
          old.removeListenerById(id);
        }
      }
      this.__modelListenerIds = [];
      this.__selectedRowIndices.clear();
      this.__scrollTop = 0;

      if (value) {
        this.__modelListenerIds.push(
          value.addListener("dataChanged", this._scheduleTableRender, this),
          value.addListener("metaDataChanged", this._scheduleTableRender, this),
          value.addListener("sorted", this._scheduleTableRender, this)
        );
        if (typeof value.getSearchQuery === "function") {
          this.__modelListenerIds.push(
            value.addListener(
              "changeSearchQuery",
              (e) => this.setHighlightQuery(e.getData()),
              this
            )
          );
        }
      }

      this._scheduleTableRender();
    },

    /**
     * Sets the width of a specific column in pixels (or CSS string).
     *
     * @param {number} columnIndex
     * @param {number|string} width
     */
    setColumnWidth(columnIndex, width) {
      this.__columnWidths[columnIndex] =
        typeof width === "number" ? `${width}px` : String(width);
      this._scheduleTableRender();
    },

    /**
     * Sets horizontal alignment (`"left"`, `"center"`, `"right"`) for a specific column.
     *
     * @param {number} columnIndex
     * @param {"left"|"center"|"right"} align
     */
    setColumnAlignment(columnIndex, align) {
      this.__columnAlignments[columnIndex] = align;
      this._scheduleTableRender();
    },

    /**
     * Returns the selected row indices as an array of integers.
     *
     * @returns {number[]}
     */
    getSelectedRowIndices() {
      return Array.from(this.__selectedRowIndices);
    },

    /**
     * Returns the data maps for all currently selected rows.
     *
     * @returns {Array<Object>}
     */
    getSelectedRows() {
      const model = this.getTableModel();
      if (!model) return [];
      return this.getSelectedRowIndices().map((idx) =>
        typeof model.getRowDataAsMap === "function"
          ? model.getRowDataAsMap(idx)
          : model.getRowData(idx)
      );
    },

    /**
     * Selects the specified row index (or array of indices).
     *
     * @param {number|number[]} rowIndexOrArr
     */
    setSelectedRowIndices(rowIndexOrArr) {
      this.__selectedRowIndices.clear();
      const list = Array.isArray(rowIndexOrArr) ? rowIndexOrArr : [rowIndexOrArr];
      for (const idx of list) {
        if (typeof idx === "number" && idx >= 0) {
          this.__selectedRowIndices.add(idx);
        }
      }
      this._scheduleTableRender();
    },

    /**
     * Clears the current row selection.
     */
    resetSelection() {
      this.__selectedRowIndices.clear();
      this._scheduleTableRender();
    },

    _scheduleTableRender() {
      if (this.__renderScheduled) return;
      this.__renderScheduled = true;
      queueMicrotask(() => {
        this.__renderScheduled = false;
        if (!this.isDisposed()) {
          this._renderTableDom();
        }
      });
    },

    /**
     * Renders the semantic `<thead>` and Tier 1 / Tier 2 `<tbody>` into `table-el`.
     *
     * @protected
     */
    _renderTableDom() {
      const tableWidget = this.getChildControl("table-el", true);
      const model = this.getTableModel();
      if (!tableWidget || !model) return;

      const colCount = model.getColumnCount();
      const rowCount = model.getRowCount();
      const totalUnfiltered =
        typeof model.getUnfilteredRowCount === "function"
          ? model.getUnfilteredRowCount()
          : rowCount;
      const sortCol = model.getSortColumnIndex();
      const sortAsc = model.isSortAscending();

      const escape = (str) =>
        String(str ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");

      const withRowBorders = this.getWithRowBorders();
      const withColBorders = this.getWithColumnBorders();
      const hoverAttr = this.getHighlightOnHover() ? ' data-hover="true"' : "";
      const rowBorderAttr = withRowBorders ? ' data-with-row-border="true"' : "";
      const colBorderAttr = withColBorders ? ' data-with-column-border="true"' : "";
      const stripedVal = this.getStriped();
      const stripedAttr =
        stripedVal === true || stripedVal === "odd"
          ? ' data-striped="odd"'
          : stripedVal === "even"
          ? ' data-striped="even"'
          : "";

      const parts = [];

      // 1. Sticky Semantic <thead> with sort indicators & pointer-captured resize handles
      if (colCount > 0) {
        parts.push(
          `<thead class="m_b242d975 mantine-Table-thead ville-simpletable-thead" data-sticky="true">`
        );
        parts.push(
          `<tr class="m_4e7aa4fd mantine-Table-tr ville-simpletable-tr"${rowBorderAttr}>`
        );

        for (let c = 0; c < colCount; c++) {
          const colName = model.getColumnName(c) || "";
          const sortable = model.isColumnSortable(c);
          const editable = model.isColumnEditable(c);
          const isSorted = sortCol === c;
          const ariaSort = isSorted
            ? ` aria-sort="${sortAsc ? "ascending" : "descending"}"`
            : "";
          const sortIndicator = sortable
            ? isSorted
              ? sortAsc
                ? " ▲"
                : " ▼"
              : " ⇅"
            : "";
          const editBadge = editable ? " ✎" : "";
          const align = this.__columnAlignments[c] || "left";
          const widthStyle = this.__columnWidths[c]
            ? `width:${escape(this.__columnWidths[c])};`
            : "";
          const cursorStyle = sortable ? "cursor:pointer;user-select:none;" : "";

          parts.push(
            `<th scope="col" class="m_4e7aa4f3 mantine-Table-th ville-simpletable-th" data-col-index="${c}"${
              sortable ? ' data-sortable="true"' : ""
            }${colBorderAttr}${ariaSort} style="position:relative;text-align:${align};${widthStyle}${cursorStyle}">` +
              `<span>${escape(colName)}${editBadge}</span>` +
              `<span class="ville-simpletable-sort-icon" aria-hidden="true">${sortIndicator}</span>` +
              `<span class="ville-table-col-resizer" data-resize-col="${c}" style="position:absolute;top:0;right:0;bottom:0;width:6px;cursor:col-resize;"></span>` +
            `</th>`
          );
        }

        parts.push(`</tr></thead>`);
      }

      // 2. Semantic <tbody> (Tier 1 content-visibility: auto OR Tier 2 windowed DOM pool)
      parts.push(
        `<tbody class="m_b2404537 mantine-Table-tbody ville-simpletable-tbody">`
      );

      const threshold = this.getVirtualThreshold() || 250;
      const rowH = this.getRowHeight() || 34;
      const useTier2 = rowCount >= threshold;

      let startRow = 0;
      let endRow = rowCount;

      if (useTier2) {
        const vp = this.getChildControl("scroll-viewport", true);
        const vpDom = vp ? vp.getContentElement().getDomElement() : null;
        const scrollTop = vpDom ? vpDom.scrollTop : this.__scrollTop;
        const viewportH =
          (vpDom && vpDom.clientHeight) || Number(this.getViewportHeight()) || 260;
        const overscan = 10;
        startRow = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
        endRow = Math.min(
          rowCount,
          Math.ceil((scrollTop + viewportH) / rowH) + overscan
        );
      }

      if (useTier2 && startRow > 0) {
        parts.push(
          `<tr class="ville-table-spacer-top" aria-hidden="true" style="height:${
            startRow * rowH
          }px;"><td colspan="${Math.max(1, colCount)}" style="padding:0;border:0;"></td></tr>`
        );
      }

      for (let r = startRow; r < endRow; r++) {
        const isSelected = this.__selectedRowIndices.has(r);
        const selAttr = isSelected
          ? ' data-selected="true" aria-selected="true"'
          : ' aria-selected="false"';
        const cvStyle = useTier2
          ? `height:${rowH}px;`
          : `content-visibility:auto;contain-intrinsic-size:auto ${rowH}px;`;

        parts.push(
          `<tr class="m_4e7aa4fd mantine-Table-tr ville-simpletable-tr" data-row-index="${r}"${rowBorderAttr}${hoverAttr}${stripedAttr}${selAttr} style="${cvStyle}">`
        );

        for (let c = 0; c < colCount; c++) {
          const val = model.getValue(c, r);
          const align =
            this.__columnAlignments[c] ||
            (typeof val === "number" ? "right" : "left");
          const editableAttr = model.isColumnEditable(c)
            ? ' data-editable="true"'
            : "";

          parts.push(
            `<td class="m_4e7aa4ef mantine-Table-td ville-simpletable-td" data-row-index="${r}" data-col-index="${c}"${editableAttr}${colBorderAttr} style="text-align:${align};">${escape(
              val
            )}</td>`
          );
        }

        parts.push(`</tr>`);
      }

      if (useTier2 && endRow < rowCount) {
        parts.push(
          `<tr class="ville-table-spacer-bottom" aria-hidden="true" style="height:${
            (rowCount - endRow) * rowH
          }px;"><td colspan="${Math.max(1, colCount)}" style="padding:0;border:0;"></td></tr>`
        );
      }

      parts.push(`</tbody>`);

      tableWidget.getContentElement().setAttribute("html", parts.join(""));

      // Update statusbar readout
      const sb = this.getChildControl("statusbar", true);
      if (sb) {
        const tierLabel = useTier2
          ? `Tier 2 Virtual Window (${endRow - startRow} DOM rows mounted)`
          : `Tier 1 CSS content-visibility`;
        const filterLabel =
          rowCount !== totalUnfiltered
            ? `${rowCount} of ${totalUnfiltered} rows`
            : `${rowCount} rows`;
        const selCount = this.__selectedRowIndices.size;
        const selLabel = selCount > 0 ? ` · ${selCount} selected` : "";
        sb.setValue(`${filterLabel}${selLabel} · ${tierLabel}`);
      }

      ville.ui.core.Widget.scheduleFlush();

      // Apply W3C CSS Custom Highlight API (`CSS.highlights`) after DOM flush
      queueMicrotask(() => {
        if (this.isDisposed()) return;
        const domTbl = tableWidget.getContentElement().getDomElement();
        const q =
          this.getHighlightQuery() ||
          (typeof model.getSearchQuery === "function" ? model.getSearchQuery() : null);
        ville.ui.core.MDataView.applyCssHighlight(domTbl, q);
      });
    },

    _applyHighlightQuery(value) {
      const tableWidget = this.getChildControl("table-el", true);
      const domTbl = tableWidget
        ? tableWidget.getContentElement().getDomElement()
        : null;
      ville.ui.core.MDataView.applyCssHighlight(domTbl, value);
    },

    _onTableClick(e) {
      if (!this.getEnabled()) return;
      const model = this.getTableModel();
      if (!model) return;

      const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
      const target = /** @type {HTMLElement|null} */ (nativeEvt ? nativeEvt.target : null);
      if (!target || typeof target.closest !== "function") return;

      // Ignore clicks directly on the column resize handle or active inline editor input
      if (target.closest("[data-resize-col]") || target.tagName === "INPUT") {
        return;
      }

      // 1. Sortable column header click
      const th = target.closest("th[data-col-index]");
      if (th) {
        const colIdx = Number(th.getAttribute("data-col-index"));
        if (model.isColumnSortable(colIdx)) {
          const nextAsc =
            model.getSortColumnIndex() === colIdx ? !model.isSortAscending() : true;
          model.sortByColumn(colIdx, nextAsc);
        }
        return;
      }

      // 2. Data cell / row click
      const td = target.closest("td[data-row-index]");
      const tr = target.closest("tr[data-row-index]");
      if (!tr) return;

      const rowIdx = Number(tr.getAttribute("data-row-index"));
      const colIdx = td ? Number(td.getAttribute("data-col-index")) : 0;

      this.fireDataEvent("cellTap", { row: rowIdx, col: colIdx });

      const selMode = this.getSelectionMode();
      if (selMode !== "none") {
        if (selMode === "multi" && (nativeEvt.metaKey || nativeEvt.ctrlKey)) {
          if (this.__selectedRowIndices.has(rowIdx)) {
            this.__selectedRowIndices.delete(rowIdx);
          } else {
            this.__selectedRowIndices.add(rowIdx);
          }
        } else {
          this.__selectedRowIndices.clear();
          this.__selectedRowIndices.add(rowIdx);
        }

        this._renderTableDom();
        const rowData =
          typeof model.getRowDataAsMap === "function"
            ? model.getRowDataAsMap(rowIdx)
            : model.getRowData(rowIdx);
        const selIndices = this.getSelectedRowIndices();
        this.fireDataEvent("rowSelect", {
          rowIndex: rowIdx,
          rowData,
          selectedIndices: selIndices
        });
        this.fireDataEvent("changeSelection", selIndices);
      }
    },

    /**
     * Handles double-clicking a cell: fires `cellDbltap` and, if the column is editable,
     * mounts a native inline `<input>` editor inside the `<td>`.
     *
     * @param {Object} e
     * @protected
     */
    _onTableDblClick(e) {
      if (!this.getEnabled()) return;
      const model = this.getTableModel();
      if (!model) return;

      const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
      const target = /** @type {HTMLElement|null} */ (nativeEvt ? nativeEvt.target : null);
      if (!target || typeof target.closest !== "function") return;

      const td = /** @type {HTMLElement|null} */ (
        target.closest("td[data-row-index][data-col-index]")
      );
      if (!td || td.querySelector("input")) return;

      const rowIdx = Number(td.getAttribute("data-row-index"));
      const colIdx = Number(td.getAttribute("data-col-index"));

      this.fireDataEvent("cellDbltap", { row: rowIdx, col: colIdx });

      if (!model.isColumnEditable(colIdx)) return;

      const oldVal = model.getValue(colIdx, rowIdx);
      const isNumeric = typeof oldVal === "number";
      const input = document.createElement("input");
      input.type = isNumeric ? "number" : "text";
      input.value = oldVal !== undefined && oldVal !== null ? String(oldVal) : "";
      input.className = "ville-table-inline-editor";
      input.style.width = "100%";
      input.style.boxSizing = "border-box";
      input.style.font = "inherit";
      input.style.padding = "2px 4px";

      let committed = false;
      const commit = (save) => {
        if (committed) return;
        committed = true;
        if (save) {
          const nextVal = isNumeric ? Number(input.value) : input.value;
          if (nextVal !== oldVal) {
            model.setValue(colIdx, rowIdx, nextVal);
            this.fireDataEvent("dataEdited", {
              row: rowIdx,
              col: colIdx,
              value: nextVal,
              oldValue: oldVal
            });
          } else {
            this._renderTableDom();
          }
        } else {
          this._renderTableDom();
        }
      };

      input.addEventListener("keydown", (ke) => {
        if (ke.key === "Enter") {
          ke.preventDefault();
          commit(true);
        } else if (ke.key === "Escape") {
          ke.preventDefault();
          commit(false);
        }
      });
      input.addEventListener("blur", () => commit(true), { once: true });

      td.textContent = "";
      td.appendChild(input);
      input.focus();
      input.select();
    },

    /**
     * Pointer-captured column resize handler (`[data-resize-col]`).
     *
     * @param {Object} e
     * @protected
     */
    _onHeaderResizePointerDown(e) {
      const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
      const target = /** @type {HTMLElement|null} */ (nativeEvt ? nativeEvt.target : null);
      if (!target || typeof target.closest !== "function") return;

      const handle = /** @type {HTMLElement|null} */ (
        target.closest("[data-resize-col]")
      );
      if (!handle) return;

      const th = handle.closest("th");
      if (!th) return;

      if (typeof e.preventDefault === "function") {
        e.preventDefault();
      }
      if (typeof e.stopPropagation === "function") {
        e.stopPropagation();
      }

      const colIdx = Number(handle.getAttribute("data-resize-col"));
      const startX = nativeEvt.clientX;
      const startWidth = th.getBoundingClientRect().width;
      const pointerId = nativeEvt.pointerId;

      if (pointerId != null && typeof handle.setPointerCapture === "function") {
        try {
          handle.setPointerCapture(pointerId);
        } catch (_) {}
      }

      const onMove = (me) => {
        const nextW = Math.max(48, Math.round(startWidth + (me.clientX - startX)));
        th.style.width = `${nextW}px`;
        this.__columnWidths[colIdx] = `${nextW}px`;
      };

      const onUp = () => {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        handle.removeEventListener("pointercancel", onUp);
        this._scheduleTableRender();
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    }
  },

  destruct() {
    const model = this.getTableModel();
    if (model && this.__modelListenerIds) {
      for (const id of this.__modelListenerIds) {
        model.removeListenerById(id);
      }
    }
    this.__modelListenerIds = null;
    this.__columnWidths = null;
    this.__columnAlignments = null;
    this.__selectedRowIndices = null;
  }
});
