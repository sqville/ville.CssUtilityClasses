/**
 * Pure Semantic HTML5 `<table>` Widget (`ville.ui.table.SimpleTable` — `STRAT-WIDGET-05`, `STRAT-WIDGET-08`).
 *
 * A clean, zero-`TableScroller`, zero-`SelectionManager` semantic HTML5 `<table>` widget
 * built directly on `<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, and `<td>`:
 *  - Maps 1:1 to Mantine's `Table.css` (`mantine-Table-table`, `data-striped`, `data-hover`,
 *    `data-with-table-border`, `data-with-column-border`, `data-with-row-border`, `data-sticky`,
 *    `data-tabular-nums`), Obsidian's semantic `<table>` rules, and shadcn's table utilities.
 *  - Uses a single delegated `"click"` listener on the `<table>` root for optional column sorting
 *    (`sortable: true` on column definitions, updating `aria-sort="ascending" | "descending"`)
 *    and optional row selection (`selectable: true`, updating `data-selected="true"` and firing `rowSelect`).
 *  - Applies `content-visibility: auto` on `<tbody>` rows for C++ rendering speed.
 */
qx.Class.define("ville.ui.table.SimpleTable", {
  extend: ville.ui.core.Widget,

  /**
   * @param {Array<Object|string>} [columns] Optional initial columns (`[{ key, label, align, sortable, width }]`).
   * @param {Array<Object|Array>} [rows] Optional initial data rows (`[{ id, ... }]`).
   */
  construct(columns, rows) {
    // @ts-ignore
    super();

    this.__columns = [];
    this.__rows = [];
    this.__sortColumnKey = null;
    this.__sortDirection = "asc";

    const el = this.getContentElement();
    el.addListener("click", this._onTableClick, this);

    if (Array.isArray(columns)) {
      this.setColumns(columns);
    }
    if (Array.isArray(rows) || rows instanceof ville.data.Array) {
      this.setRows(rows);
    }
  },

  events: {
    /** Fired when a data row is clicked. Data: `{ index, row, rowKey }` */
    rowSelect: "qx.event.type.Data",

    /** Fired when a sortable column header (`<th>`) is clicked. Data: `{ column, direction }` */
    changeSort: "qx.event.type.Data"
  },

  properties: {
    appearance: {
      refine: true,
      init: "simpletable"
    },

    /** Optional table `<caption>` text. */
    caption: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_renderTable"
    },

    /** Caption placement (`"top"` or `"bottom"`). */
    captionSide: {
      check: ["top", "bottom"],
      init: "bottom",
      apply: "_renderTable"
    },

    /** Whether alternating rows are striped (`false`, `true` / `"odd"`, or `"even"`). */
    striped: {
      init: false,
      apply: "_renderTable"
    },

    /** Whether hovering over a `<tbody>` row highlights it (`data-hover`). */
    highlightOnHover: {
      check: "Boolean",
      init: true,
      apply: "_renderTable"
    },

    /** Whether an outer border is drawn around the `<table>` (`data-with-table-border`). */
    withTableBorder: {
      check: "Boolean",
      init: true,
      apply: "_renderTable"
    },

    /** Whether vertical borders are drawn between columns (`data-with-column-border`). */
    withColumnBorders: {
      check: "Boolean",
      init: false,
      apply: "_renderTable"
    },

    /** Whether horizontal borders are drawn between rows (`data-with-row-border`). */
    withRowBorders: {
      check: "Boolean",
      init: true,
      apply: "_renderTable"
    },

    /** Whether `<thead>` uses native CSS `position: sticky; top: 0` (`data-sticky`). */
    stickyHeader: {
      check: "Boolean",
      init: true,
      apply: "_renderTable"
    },

    /** Whether numeric columns use `font-variant-numeric: tabular-nums` (`data-tabular-nums`). */
    tabularNums: {
      check: "Boolean",
      init: true,
      apply: "_renderTable"
    },

    /** Whether clicking a `<tbody>` row selects it. */
    selectable: {
      check: "Boolean",
      init: true,
      apply: "_renderTable"
    },

    /** Property key used as the unique row identifier for selection (defaults to `"id"` or row index). */
    rowKeyProperty: {
      check: "String",
      init: "id"
    },

    /** Currently selected row key (or row index string). */
    selectedRowKey: {
      nullable: true,
      init: null,
      apply: "_renderTable",
      event: "changeSelectedRowKey"
    }
  },

  members: {
    /** @type {Array<Object>|null} @private */
    __columns: null,

    /** @type {Array<Object>|null} @private */
    __rows: null,

    /** @type {string|null} @private */
    __sortColumnKey: null,

    /** @type {"asc"|"desc"} @private */
    __sortDirection: "asc",

    /**
     * @override
     * @returns {ville.html.Element}
     * @protected
     */
    _createContentElement() {
      return new ville.html.Element("table");
    },

    /**
     * Configures the table's column definitions.
     *
     * @param {Array<string|{ key: string, label?: string, align?: "left"|"center"|"right", sortable?: boolean, width?: string }>} columns
     * @returns {this}
     */
    setColumns(columns) {
      const list = Array.isArray(columns) ? columns : [];
      this.__columns = list.map((col, idx) => {
        if (typeof col === "string") {
          return {
            key: col,
            label: col,
            align: "left",
            sortable: true,
            width: null
          };
        }
        return {
          key: String(col.key ?? col.id ?? idx),
          label: String(col.label ?? col.header ?? col.key ?? ""),
          align: col.align || "left",
          sortable: col.sortable !== false,
          width: col.width ? String(col.width) : null
        };
      });
      this._renderTable();
      return this;
    },

    /**
     * Returns the current column definitions.
     *
     * @returns {Array<Object>}
     */
    getColumns() {
      return this.__columns ? this.__columns.slice() : [];
    },

    /**
     * Sets the table's data rows and triggers a semantic `<thead>` / `<tbody>` render.
     *
     * @param {Array<Object|Array>|ville.data.Array} rows
     * @returns {this}
     */
    setRows(rows) {
      const raw =
        rows instanceof ville.data.Array
          ? rows.toArray()
          : Array.isArray(rows)
          ? rows
          : [];
      this.__rows = raw.slice();
      this._renderTable();
      return this;
    },

    /**
     * Returns the current data rows array.
     *
     * @returns {Array<Object>}
     */
    getRows() {
      return this.__rows ? this.__rows.slice() : [];
    },

    /**
     * Sorts the table by the given `columnKey` and `"asc"` / `"desc"` direction.
     *
     * @param {string} columnKey
     * @param {"asc"|"desc"} [direction]
     */
    sortBy(columnKey, direction) {
      if (direction) {
        this.__sortDirection = direction;
      } else if (this.__sortColumnKey === columnKey) {
        this.__sortDirection = this.__sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.__sortDirection = "asc";
      }
      this.__sortColumnKey = columnKey;
      this.fireDataEvent("changeSort", {
        column: columnKey,
        direction: this.__sortDirection
      });
      this._renderTable();
    },

    /**
     * Renders semantic `<caption>`, `<thead>`, and `<tbody>` markup inside `<table>`.
     *
     * @protected
     */
    _renderTable() {
      const el = this.getContentElement();
      if (!el) return;

      const cols = this.__columns || [];
      const rawRows = this.__rows ? this.__rows.slice() : [];

      // Sync table-level data-* attributes (compatible with Mantine Table.css + Layer 1 mechanics)
      this._setAttribute("data-with-table-border", this.getWithTableBorder() ? "true" : null);
      this._setAttribute("data-tabular-nums", this.getTabularNums() ? "true" : null);
      el.setStyle("--table-caption-side", this.getCaptionSide());

      // Apply active sort if a column is sorted
      if (this.__sortColumnKey) {
        const key = this.__sortColumnKey;
        const dirFactor = this.__sortDirection === "desc" ? -1 : 1;
        rawRows.sort((a, b) => {
          const va = a && typeof a === "object" ? a[key] : "";
          const vb = b && typeof b === "object" ? b[key] : "";
          if (typeof va === "number" && typeof vb === "number") {
            return (va - vb) * dirFactor;
          }
          return String(va ?? "").localeCompare(String(vb ?? ""), undefined, {
            numeric: true,
            sensitivity: "base"
          }) * dirFactor;
        });
      }

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
      const stickyAttr = this.getStickyHeader() ? ' data-sticky="true"' : "";

      const parts = [];

      // 1. Optional <caption>
      const caption = this.getCaption();
      if (caption) {
        parts.push(
          `<caption class="m_9e5a3ac7 mantine-Table-caption ville-simpletable-caption" data-side="${this.getCaptionSide()}">${escape(
            caption
          )}</caption>`
        );
      }

      // 2. Semantic <thead>
      if (cols.length > 0) {
        parts.push(
          `<thead class="m_b242d975 mantine-Table-thead ville-simpletable-thead"${stickyAttr}>`
        );
        parts.push(
          `<tr class="m_4e7aa4fd mantine-Table-tr ville-simpletable-tr"${rowBorderAttr}>`
        );

        for (let c = 0; c < cols.length; c++) {
          const col = cols[c];
          const isSorted = this.__sortColumnKey === col.key;
          const ariaSort = isSorted
            ? ` aria-sort="${this.__sortDirection === "asc" ? "ascending" : "descending"}"`
            : "";
          const sortIndicator = col.sortable
            ? isSorted
              ? this.__sortDirection === "asc"
                ? " ▲"
                : " ▼"
              : " ⇅"
            : "";
          const sortAttr = col.sortable
            ? ` data-sort-key="${escape(col.key)}" data-sortable="true"`
            : "";
          const styleParts = [`text-align:${escape(col.align || "left")};`];
          if (col.width) {
            styleParts.push(`width:${escape(col.width)};`);
          }
          if (col.sortable) {
            styleParts.push("cursor:pointer;user-select:none;");
          }

          parts.push(
            `<th scope="col" class="m_4e7aa4f3 mantine-Table-th ville-simpletable-th"${colBorderAttr}${sortAttr}${ariaSort} style="${styleParts.join(
              ""
            )}">${escape(col.label)}<span class="ville-simpletable-sort-icon" aria-hidden="true">${sortIndicator}</span></th>`
          );
        }

        parts.push(`</tr></thead>`);
      }

      // 3. Semantic <tbody>
      parts.push(
        `<tbody class="m_b2404537 mantine-Table-tbody ville-simpletable-tbody">`
      );

      const keyProp = this.getRowKeyProperty() || "id";
      const selKey = this.getSelectedRowKey();
      const selectable = this.getSelectable();

      for (let r = 0; r < rawRows.length; r++) {
        const row = rawRows[r];
        const rowKey =
          row && typeof row === "object" && row[keyProp] !== undefined
            ? String(row[keyProp])
            : String(r);
        const isSelected = selectable && selKey !== null && String(selKey) === rowKey;
        const selAttr = isSelected
          ? ' data-selected="true" aria-selected="true"'
          : selectable
          ? ' aria-selected="false"'
          : "";

        parts.push(
          `<tr class="m_4e7aa4fd mantine-Table-tr ville-simpletable-tr" data-row-index="${r}" data-row-key="${escape(
            rowKey
          )}"${rowBorderAttr}${hoverAttr}${stripedAttr}${selAttr} style="content-visibility:auto;contain-intrinsic-size:auto 36px;">`
        );

        for (let c = 0; c < cols.length; c++) {
          const col = cols[c];
          const cellVal =
            Array.isArray(row)
              ? row[c]
              : row && typeof row === "object"
              ? row[col.key]
              : "";
          parts.push(
            `<td class="m_4e7aa4ef mantine-Table-td ville-simpletable-td"${colBorderAttr} style="text-align:${escape(
              col.align || "left"
            )};">${escape(cellVal)}</td>`
          );
        }

        parts.push(`</tr>`);
      }

      parts.push(`</tbody>`);

      el.setAttribute("html", parts.join(""));
      ville.ui.core.Widget.scheduleFlush();
    },

    _onTableClick(e) {
      if (!this.getEnabled()) return;
      const nativeEvt = e && typeof e.getNativeEvent === "function" ? e.getNativeEvent() : e;
      const target = /** @type {HTMLElement|null} */ (nativeEvt ? nativeEvt.target : null);
      if (!target || typeof target.closest !== "function") return;

      // 1. Check if a sortable <th> header was clicked
      const th = target.closest("th[data-sort-key]");
      if (th) {
        const sortKey = th.getAttribute("data-sort-key");
        if (sortKey) {
          this.sortBy(sortKey);
        }
        return;
      }

      // 2. Check if a <tbody> data row was clicked
      const tr = target.closest("tr[data-row-key]");
      if (tr) {
        const rowKey = tr.getAttribute("data-row-key");
        const rowIndex = Number(tr.getAttribute("data-row-index"));
        const rowObj =
          this.__rows &&
          this.__rows.find((item, idx) => {
            const keyProp = this.getRowKeyProperty() || "id";
            const k =
              item && typeof item === "object" && item[keyProp] !== undefined
                ? String(item[keyProp])
                : String(idx);
            return k === rowKey;
          });

        if (this.getSelectable()) {
          this.setSelectedRowKey(rowKey);
        }
        this.fireDataEvent("rowSelect", {
          index: rowIndex,
          row: rowObj || null,
          rowKey
        });
      }
    }
  },

  destruct() {
    this.__columns = null;
    this.__rows = null;
  }
});
