/**
 * Table Model Interface (`ville.ui.table.ITableModel` — `STRAT-CORE-09`, `STRAT-WIDGET-08`).
 *
 * Preserves Qooxdoo's timeless `qx.ui.table.ITableModel` contract while decoupling
 * from legacy `TableScroller` / `TableClipper` DOM internals.
 */
qx.Interface.define("ville.ui.table.ITableModel", {
  events: {
    /** Fired when the table data changes (`firstRow`, `lastRow`, `firstColumn`, `lastColumn`). */
    dataChanged: "qx.event.type.Data",

    /** Fired when column metadata (sort state, editable flags, column headers) changes. */
    metaDataChanged: "qx.event.type.Event",

    /** Fired when the model is sorted (`columnIndex`, `ascending`). */
    sorted: "qx.event.type.Data"
  },

  members: {
    getRowCount() {},
    getRowData(rowIndex) {},
    getColumnCount() {},
    getColumnId(columnIndex) {},
    getColumnIndexById(columnId) {},
    getColumnName(columnIndex) {},
    isColumnEditable(columnIndex) {},
    isColumnSortable(columnIndex) {},
    sortByColumn(columnIndex, ascending) {},
    getSortColumnIndex() {},
    isSortAscending() {},
    getValue(columnIndex, rowIndex) {},
    getValueById(columnId, rowIndex) {},
    setValue(columnIndex, rowIndex, value) {},
    setValueById(columnId, rowIndex, value) {}
  }
});
