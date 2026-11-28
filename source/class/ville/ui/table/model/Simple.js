/**
 * Ville UI's `QxLayout`-Style Take on `qx.ui.table.model.Simple` (`ville.ui.table.model.Simple` — `STRAT-CORE-09`, `STRAT-CORE-07`, `STRAT-WIDGET-08`).
 *
 * Preserves 100% of Qooxdoo's beloved `qx.ui.table.model.Simple` developer contract:
 *  - `setColumns(columnNameArr, columnIdArr)`
 *  - `setData(rowArr)` (2D array) and `setDataAsMapArray(mapArr, rememberMaps)` (array of objects)
 *  - `getRowCount()`, `getValue(col, row)`, `getValueById(id, row)`, `setValue(col, row, val)`
 *  - `addRows()`, `addRowsAsMapArray()`, `removeRows()`
 *  - `setEditable()`, `setColumnEditable()`, `setColumnSortable()`, `sortByColumn(col, ascending)`
 *
 * While adding first-class Baseline 2025 capabilities:
 *  - Built-in live filtering (`filter(queryOrFn)` / `setSearchQuery(query)` / `resetFilter()`) without needing a separate model class.
 *  - Optional off-thread Web Worker sorting & filtering (`useWorker: true`) powered by `ville.core.WorkerClient` (`STRAT-CORE-07`), with a reactive `busy` property (`model.bind("busy", button, "loading")`).
 */
qx.Class.define("ville.ui.table.model.Simple", {
  extend: qx.core.Object,
  implement: [ville.ui.table.ITableModel],

  construct() {
    // @ts-ignore
    super();

    this.__columnNameArr = [];
    this.__columnIdArr = [];
    this.__columnIndexMap = {};
    this.__editableColMap = {};
    this.__sortableColMap = {};
    this.__rawRowArr = [];
    this.__viewRowArr = [];
    this.__rememberMaps = false;
  },

  events: {
    /** Fired when table row/cell data changes. */
    dataChanged: "qx.event.type.Data",

    /** Fired when column metadata or sort state changes. */
    metaDataChanged: "qx.event.type.Event",

    /** Fired after sorting completes. Data: `{ columnIndex, ascending }` */
    sorted: "qx.event.type.Data"
  },

  properties: {
    /** Whether all columns are editable by default unless overridden per column. */
    editable: {
      check: "Boolean",
      init: false,
      apply: "_applyEditable"
    },

    /** Whether sorting comparison is case-sensitive. */
    caseSensitiveSorting: {
      check: "Boolean",
      init: false
    },

    /** Live search query string used to filter rows across all columns. */
    searchQuery: {
      check: "String",
      nullable: true,
      init: null,
      apply: "_applySearchQuery",
      event: "changeSearchQuery"
    },

    /**
     * Whether sorting and filtering should execute off the main UI thread inside
     * a `ville.core.WorkerClient` Web Worker (`STRAT-CORE-07`).
     */
    useWorker: {
      check: "Boolean",
      init: false
    },

    /**
     * Reactive flag (`true` while an off-thread `WorkerClient` sort/filter request is running).
     */
    busy: {
      check: "Boolean",
      init: false,
      event: "changeBusy"
    }
  },

  members: {
    /** @type {string[]} @private */
    __columnNameArr: null,

    /** @type {string[]} @private */
    __columnIdArr: null,

    /** @type {Object<string, number>} @private */
    __columnIndexMap: null,

    /** @type {Object<number, boolean>} @private */
    __editableColMap: null,

    /** @type {Object<number, boolean>} @private */
    __sortableColMap: null,

    /** @type {Array<Array|Object>} @private */
    __rawRowArr: null,

    /** @type {Array<Array|Object>} @private */
    __viewRowArr: null,

    /** @type {boolean} @private */
    __rememberMaps: false,

    /** @type {number} @private */
    __sortColumnIndex: -1,

    /** @type {boolean} @private */
    __sortAscending: true,

    /** @type {Function|null} @private */
    __filterPredicate: null,

    /** @type {ville.core.WorkerClient|null} @private */
    __workerClient: null,

    /*
    ---------------------------------------------------------------------------
      COLUMN CONFIGURATION (`setColumns`, `getColumnName`, `getColumnId`)
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the table column labels and optional column IDs.
     *
     * @param {string[]} columnNameArr Display names for each column.
     * @param {string[]} [columnIdArr] Optional programmatic IDs (defaults to `columnNameArr`).
     */
    setColumns(columnNameArr, columnIdArr) {
      this.__columnNameArr = Array.isArray(columnNameArr)
        ? columnNameArr.map((n) => String(n))
        : [];
      this.__columnIdArr = Array.isArray(columnIdArr)
        ? columnIdArr.map((id) => String(id))
        : this.__columnNameArr.slice();

      this.__columnIndexMap = {};
      for (let i = 0; i < this.__columnIdArr.length; i++) {
        this.__columnIndexMap[this.__columnIdArr[i]] = i;
      }

      this.fireEvent("metaDataChanged");
    },

    getColumnCount() {
      return this.__columnNameArr ? this.__columnNameArr.length : 0;
    },

    getColumnId(columnIndex) {
      return this.__columnIdArr ? this.__columnIdArr[columnIndex] : undefined;
    },

    getColumnIndexById(columnId) {
      return this.__columnIndexMap && columnId in this.__columnIndexMap
        ? this.__columnIndexMap[columnId]
        : undefined;
    },

    getColumnName(columnIndex) {
      return this.__columnNameArr ? this.__columnNameArr[columnIndex] : undefined;
    },

    setColumnEditable(columnIndex, editable) {
      this.__editableColMap[columnIndex] = Boolean(editable);
      this.fireEvent("metaDataChanged");
    },

    isColumnEditable(columnIndex) {
      if (columnIndex in this.__editableColMap) {
        return this.__editableColMap[columnIndex];
      }
      return this.getEditable();
    },

    setColumnSortable(columnIndex, sortable) {
      this.__sortableColMap[columnIndex] = Boolean(sortable);
      this.fireEvent("metaDataChanged");
    },

    isColumnSortable(columnIndex) {
      if (columnIndex in this.__sortableColMap) {
        return this.__sortableColMap[columnIndex];
      }
      return true;
    },

    _applyEditable() {
      this.fireEvent("metaDataChanged");
    },

    /*
    ---------------------------------------------------------------------------
      ROW DATA MANAGEMENT (`setData`, `setDataAsMapArray`, `getValue`, `setValue`)
    ---------------------------------------------------------------------------
    */

    /**
     * Sets table data as an array of row arrays (`[[col0, col1, ...], ...]`).
     *
     * @param {Array<Array>} rowArr
     * @param {boolean} [clearSorting=true]
     */
    setData(rowArr, clearSorting = true) {
      this.__rememberMaps = false;
      this.__rawRowArr = Array.isArray(rowArr) ? rowArr.slice() : [];
      if (clearSorting) {
        this.__sortColumnIndex = -1;
      }
      this._recomputeViewData();
    },

    /**
     * Returns the current visible 2D row array.
     *
     * @returns {Array<Array>}
     */
    getData() {
      return this.__viewRowArr || [];
    },

    /**
     * Sets table data from an array of plain objects (`[{ id: 1, name: "Alpha" }, ...]`),
     * mapping each object's properties to columns via `columnIdArr`.
     *
     * @param {Array<Object>} mapArr
     * @param {boolean} [rememberMaps=true]
     * @param {boolean} [clearSorting=true]
     */
    setDataAsMapArray(mapArr, rememberMaps = true, clearSorting = true) {
      this.__rememberMaps = Boolean(rememberMaps);
      const list = Array.isArray(mapArr) ? mapArr : [];
      this.__rawRowArr = list.map((map) => this._mapToRowArray(map));
      if (clearSorting) {
        this.__sortColumnIndex = -1;
      }
      this._recomputeViewData();
    },

    /**
     * Returns the visible table data as an array of column-keyed maps.
     *
     * @returns {Array<Object>}
     */
    getDataAsMapArray() {
      const rows = this.__viewRowArr || [];
      return rows.map((_, idx) => this.getRowDataAsMap(idx));
    },

    _mapToRowArray(map) {
      const colCount = this.getColumnCount();
      const row = new Array(colCount);
      for (let c = 0; c < colCount; c++) {
        const id = this.__columnIdArr[c];
        row[c] = map && id in map ? map[id] : undefined;
      }
      if (this.__rememberMaps && map && typeof map === "object") {
        row.originalMap = map;
      }
      return row;
    },

    getRowCount() {
      return this.__viewRowArr ? this.__viewRowArr.length : 0;
    },

    /**
     * Returns the total unfiltered row count.
     *
     * @returns {number}
     */
    getUnfilteredRowCount() {
      return this.__rawRowArr ? this.__rawRowArr.length : 0;
    },

    getRowData(rowIndex) {
      return this.__viewRowArr ? this.__viewRowArr[rowIndex] : null;
    },

    getRowDataAsMap(rowIndex) {
      const row = this.getRowData(rowIndex);
      if (!row) return null;
      if (row.originalMap) {
        const out = Object.assign({}, row.originalMap);
        for (let c = 0; c < this.getColumnCount(); c++) {
          out[this.__columnIdArr[c]] = row[c];
        }
        return out;
      }
      const map = {};
      for (let c = 0; c < this.getColumnCount(); c++) {
        map[this.__columnIdArr[c]] = row[c];
      }
      return map;
    },

    getValue(columnIndex, rowIndex) {
      const row = this.__viewRowArr ? this.__viewRowArr[rowIndex] : null;
      if (!row) return undefined;
      return row[columnIndex];
    },

    getValueById(columnId, rowIndex) {
      const colIdx = this.getColumnIndexById(columnId);
      return colIdx !== undefined ? this.getValue(colIdx, rowIndex) : undefined;
    },

    setValue(columnIndex, rowIndex, value) {
      const row = this.__viewRowArr ? this.__viewRowArr[rowIndex] : null;
      if (!row) return;
      if (row[columnIndex] === value) return;
      row[columnIndex] = value;
      if (row.originalMap && this.__columnIdArr[columnIndex]) {
        row.originalMap[this.__columnIdArr[columnIndex]] = value;
      }
      this.fireDataEvent("dataChanged", {
        firstRow: rowIndex,
        lastRow: rowIndex,
        firstColumn: columnIndex,
        lastColumn: columnIndex
      });
    },

    setValueById(columnId, rowIndex, value) {
      const colIdx = this.getColumnIndexById(columnId);
      if (colIdx !== undefined) {
        this.setValue(colIdx, rowIndex, value);
      }
    },

    addRows(rowArr, startIndex = null, clearSorting = false) {
      if (!Array.isArray(rowArr) || rowArr.length === 0) return;
      if (startIndex === null || startIndex === undefined) {
        this.__rawRowArr.push(...rowArr);
      } else {
        this.__rawRowArr.splice(startIndex, 0, ...rowArr);
      }
      if (clearSorting) {
        this.__sortColumnIndex = -1;
      }
      this._recomputeViewData();
    },

    addRowsAsMapArray(mapArr, startIndex = null, rememberMaps = true, clearSorting = false) {
      this.__rememberMaps = Boolean(rememberMaps);
      const rows = (Array.isArray(mapArr) ? mapArr : []).map((m) => this._mapToRowArray(m));
      this.addRows(rows, startIndex, clearSorting);
    },

    removeRows(startIndex, howMany = 1, clearSorting = false) {
      const targetRow = this.__viewRowArr[startIndex];
      if (!targetRow) return;
      const toRemove = this.__viewRowArr.slice(startIndex, startIndex + howMany);
      const removeSet = new Set(toRemove);
      this.__rawRowArr = this.__rawRowArr.filter((r) => !removeSet.has(r));
      if (clearSorting) {
        this.__sortColumnIndex = -1;
      }
      this._recomputeViewData();
    },

    /*
    ---------------------------------------------------------------------------
      SORTING, FILTERING & OFF-THREAD WORKER EXECUTION (`STRAT-CORE-07`)
    ---------------------------------------------------------------------------
    */

    sortByColumn(columnIndex, ascending = true) {
      if (!this.isColumnSortable(columnIndex)) return;
      this.__sortColumnIndex = columnIndex;
      this.__sortAscending = Boolean(ascending);
      this._recomputeViewData(true);
    },

    clearSorting() {
      if (this.__sortColumnIndex !== -1) {
        this.__sortColumnIndex = -1;
        this._recomputeViewData(true);
      }
    },

    getSortColumnIndex() {
      return this.__sortColumnIndex;
    },

    isSortAscending() {
      return this.__sortAscending;
    },

    /**
     * Filters the table rows by a search substring or a custom predicate `(rowMap, rowIndex) => boolean`.
     *
     * @param {string|Function|null} queryOrPredicate
     */
    filter(queryOrPredicate) {
      if (typeof queryOrPredicate === "function") {
        this.__filterPredicate = queryOrPredicate;
        this._recomputeViewData();
      } else {
        this.__filterPredicate = null;
        this.setSearchQuery(queryOrPredicate ? String(queryOrPredicate) : null);
      }
    },

    /**
     * Resets all active filters and restores the full dataset.
     */
    resetFilter() {
      this.__filterPredicate = null;
      this.setSearchQuery(null);
      this._recomputeViewData();
    },

    _applySearchQuery() {
      this._recomputeViewData();
    },

    /**
     * Returns or lazily creates the model's `ville.core.WorkerClient` instance.
     *
     * @returns {ville.core.WorkerClient}
     */
    getWorkerClient() {
      if (!this.__workerClient) {
        this.__workerClient = new ville.core.WorkerClient();
        this.__workerClient.bind("busy", this, "busy");
      }
      return this.__workerClient;
    },

    /**
     * Recomputes `__viewRowArr` by applying active filters and column sorting
     * (either synchronously or via `ville.core.WorkerClient` when `useWorker: true`
     * and no function predicate is active).
     *
     * @param {boolean} [emitSorted=false]
     * @protected
     */
    _recomputeViewData(emitSorted = false) {
      const raw = this.__rawRowArr ? this.__rawRowArr.slice() : [];
      const query = this.getSearchQuery() ? String(this.getSearchQuery()).trim() : "";
      const colIdx = this.__sortColumnIndex;
      const asc = this.__sortAscending;

      if (this.getUseWorker() && !this.__filterPredicate && raw.length > 0) {
        const worker = this.getWorkerClient();
        // Strip non-cloneable originalMap references if needed or pass pure arrays
        const pureRows = raw.map((r, i) => ({ __idx: i, cells: Array.from(r) }));
        worker
          .request("sortAndFilter", {
            rows: pureRows.map((p) => p.cells),
            query,
            columnKey: colIdx >= 0 ? colIdx : null,
            direction: asc ? "asc" : "desc"
          })
          .then((resultRows) => {
            if (this.isDisposed()) return;
            this.__viewRowArr = Array.isArray(resultRows) ? resultRows : [];
            if (emitSorted && colIdx >= 0) {
              this.fireDataEvent("sorted", {
                columnIndex: colIdx,
                ascending: asc
              });
            }
            this.fireEvent("metaDataChanged");
            this.fireDataEvent("dataChanged", {
              firstRow: 0,
              lastRow: Math.max(0, this.__viewRowArr.length - 1),
              firstColumn: 0,
              lastColumn: Math.max(0, this.getColumnCount() - 1)
            });
          })
          .catch(() => {
            this._recomputeViewDataSync(raw, query, colIdx, asc, emitSorted);
          });
        return;
      }

      this._recomputeViewDataSync(raw, query, colIdx, asc, emitSorted);
    },

    _recomputeViewDataSync(raw, query, colIdx, asc, emitSorted) {
      let filtered = raw;

      if (this.__filterPredicate) {
        filtered = filtered.filter((row, idx) =>
          this.__filterPredicate(this._rowToMap(row), idx, row)
        );
      }

      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter((row) => {
          for (let c = 0; c < row.length; c++) {
            if (row[c] != null && String(row[c]).toLowerCase().includes(q)) {
              return true;
            }
          }
          return false;
        });
      }

      if (colIdx >= 0 && colIdx < this.getColumnCount()) {
        const dir = asc ? 1 : -1;
        const caseSensitive = this.getCaseSensitiveSorting();
        const collator = new Intl.Collator(undefined, {
          numeric: true,
          sensitivity: caseSensitive ? "variant" : "base"
        });
        filtered.sort((a, b) => {
          const va = a[colIdx];
          const vb = b[colIdx];
          if (typeof va === "number" && typeof vb === "number") {
            return (va - vb) * dir;
          }
          return collator.compare(String(va ?? ""), String(vb ?? "")) * dir;
        });
      }

      this.__viewRowArr = filtered;

      if (emitSorted && colIdx >= 0) {
        this.fireDataEvent("sorted", {
          columnIndex: colIdx,
          ascending: asc
        });
      }
      this.fireEvent("metaDataChanged");
      this.fireDataEvent("dataChanged", {
        firstRow: 0,
        lastRow: Math.max(0, filtered.length - 1),
        firstColumn: 0,
        lastColumn: Math.max(0, this.getColumnCount() - 1)
      });
    },

    _rowToMap(row) {
      if (row && row.originalMap) {
        return row.originalMap;
      }
      const map = {};
      for (let c = 0; c < this.getColumnCount(); c++) {
        map[this.__columnIdArr[c]] = row[c];
      }
      return map;
    }
  },

  destruct() {
    this._disposeObjects("__workerClient");
    this.__columnNameArr = null;
    this.__columnIdArr = null;
    this.__columnIndexMap = null;
    this.__editableColMap = null;
    this.__sortableColMap = null;
    this.__rawRowArr = null;
    this.__viewRowArr = null;
    this.__filterPredicate = null;
  }
});
