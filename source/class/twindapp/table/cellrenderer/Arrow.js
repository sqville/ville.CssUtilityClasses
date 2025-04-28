/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/**
 * The default data cell renderer.
 */
qx.Class.define("twindapp.table.cellrenderer.Arrow", {
  extend: qx.ui.table.cellrenderer.Abstract,

  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {

    // overridden
    createDataCellHtml(cellInfo, htmlArr) {
      htmlArr.push(
        '<td class="w-px border-t" ',
        'data-qx-table-cell-row="',
        cellInfo.row,
        '" ',
        'data-qx-table-cell-col="',
        cellInfo.col,
        '" ',
        this._getCellAttributes(cellInfo),
        ">" + this._getContentHtml(cellInfo),
        "</td>"
      );
    },

    // overridden
    _getContentHtml(cellInfo) {
      //var cellval = qx.bom.String.escape(this._formatValue(cellInfo));
      //return `<div class="flex items-center px-6 py-4 focus:text-indigo-500">${cellval}</div>`;
      return `<a onclick="event.preventDefault();" tabindex="-1" class="flex items-center px-4" href="/user/90/edit">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="block w-6 h-6 fill-gray-400"><polygon points="12.95 10.707 13.657 10 8 4.343 6.586 5.757 10.828 10 6.586 14.243 8 15.657 12.95 10.707"></polygon></svg>
      </a>`;
    },

     /**
     * Formats a value.
     *
     * @param cellInfo {Map} A map containing the information about the cell to
     *          create. This map has the same structure as in
     *          {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     * @return {String} the formatted value.
     */
     _formatValue(cellInfo) {
      var value = cellInfo.value;
      var res;

      if (value == null) {
        return "";
      }

      if (typeof value == "string") {
        return value;
      } else if (typeof value == "number") {
        if (!qx.ui.table.cellrenderer.Default._numberFormat) {
          qx.ui.table.cellrenderer.Default._numberFormat =
            new qx.util.format.NumberFormat();
          qx.ui.table.cellrenderer.Default._numberFormat.setMaximumFractionDigits(
            2
          );
        }

        res = qx.ui.table.cellrenderer.Default._numberFormat.format(value);
      } else if (value instanceof Date) {
        res = qx.util.format.DateFormat.getDateInstance().format(value);
      } else {
        res = value.toString();
      }

      return res;
    }
  }
});
