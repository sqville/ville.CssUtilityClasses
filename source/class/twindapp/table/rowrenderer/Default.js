/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2007 Visionet GmbH, http://www.visionet.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132) STZ-IDA
     * Dietrich Streifert (level420) Visionet

************************************************************************ */

/**
 * The default data row renderer.
 */
qx.Class.define("twindapp.table.rowrenderer.Default", {
  extend: qx.core.Object,
  implement: qx.ui.table.IRowRenderer,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct() {
    super();

    this.initThemeValues();

    // dynamic theme switch
    if (qx.core.Environment.get("qx.dyntheme")) {
      this.__changeThemeRowRendererListenerId = qx.theme.manager.Meta.getInstance().addListener(
        "changeTheme",
        this.initThemeValues,
        this
      );
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /** Whether the focused row should be highlighted. */
    highlightFocusRow: {
      check: "Boolean",
      init: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    _colors: null,
    _fontStyle: null,
    _fontStyleString: null,

    /**
     * Initializes the colors from the color theme.
     * @internal
     */
    initThemeValues() {
      this._fontStyleString = "";
      this._fontStyle = {};

      this._colors = {};

      // link to font theme
      this._renderFont(qx.theme.manager.Font.getInstance().resolve("default"));

      // link to color theme
      var colorMgr = qx.theme.manager.Color.getInstance();
      this._colors.bgcolFocusedSelected = colorMgr.resolve(
        "table-row-background-focused-selected"
      );

      this._colors.bgcolFocused = colorMgr.resolve(
        "table-row-background-focused"
      );

      this._colors.bgcolSelected = colorMgr.resolve(
        "table-row-background-selected"
      );

      this._colors.bgcolEven = colorMgr.resolve("table-row-background-even");
      this._colors.bgcolOdd = colorMgr.resolve("table-row-background-odd");
      this._colors.colSelected = colorMgr.resolve("table-row-selected");
      this._colors.colNormal = colorMgr.resolve("table-row");
      this._colors.horLine = colorMgr.resolve("table-row-line");
    },

    /**
     * the sum of the vertical insets. This is needed to compute the box model
     * independent size
     */
    _insetY: 1, // borderBottom

    /**
     * Render the new font and update the table pane content
     * to reflect the font change.
     *
     * @param font {qx.bom.Font} The font to use for the table row
     */
    _renderFont(font) {
      if (font) {
        this._fontStyle = font.getStyles();
        this._fontStyleString = qx.bom.element.Style.compile(this._fontStyle);
        this._fontStyleString = this._fontStyleString.replace(/"/g, "'");
      } else {
        this._fontStyleString = "";
        this._fontStyle = qx.bom.Font.getDefaultStyles();
      }
    },

    // interface implementation
    updateDataRowElement(rowInfo, rowElem) {},

    /**
     * Get the row's height CSS style taking the box model into account
     *
     * @param height {Integer} The row's (border-box) height in pixel
     * @return {String} CSS rule for the row height
     */
    getRowHeightStyle(height) {
      if (qx.core.Environment.get("css.boxmodel") == "content") {
        height -= this._insetY;
      }

      return "height:" + height + "px;";
    },

    // interface implementation
    createRowStyle(rowInfo) {
      return "";
    },

    getRowClass(rowInfo) {
      return "hover:bg-gray-100 focus-within:bg-gray-100";
    },

    /**
     * Add extra attributes to each row.
     *
     * @param rowInfo {Object}
     *   The following members are available in rowInfo:
     *   <dl>
     *     <dt>table {qx.ui.table.Table}</dt>
     *     <dd>The table object</dd>
     *
     *     <dt>styleHeight {Integer}</dt>
     *     <dd>The height of this (and every) row</dd>
     *
     *     <dt>row {Integer}</dt>
     *     <dd>The number of the row being added</dd>
     *
     *     <dt>selected {Boolean}</dt>
     *     <dd>Whether the row being added is currently selected</dd>
     *
     *     <dt>focusedRow {Boolean}</dt>
     *     <dd>Whether the row being added is currently focused</dd>
     *
     *     <dt>rowData {Array}</dt>
     *     <dd>The array row from the data model of the row being added</dd>
     *   </dl>
     *
     * @return {String}
     *   Any additional attributes and their values that should be added to the
     *   div tag for the row.
     */
    getRowAttributes(rowInfo) {
      return "role=row "; // Space important!
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this._colors = this._fontStyle = this._fontStyleString = null;

    // remove dynamic theme listener
    if (qx.core.Environment.get("qx.dyntheme") && this.__changeThemeRowRendererListenerId) {
      qx.theme.manager.Meta.getInstance().removeListenerById(
        this.__changeThemeRowRendererListenerId
      );
    }
  }
});
