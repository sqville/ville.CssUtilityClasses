/**
 * This is the most basic ui component
 * @external(mantine/core/styles/Paper.css)
 */
qx.Class.define("ville.ui.core.Paper", {
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct() {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_1b7284a3 mantine-Paper-root");
    }
  });
