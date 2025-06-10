/**
 * Vertical flex layout
 * @external(mantine/core/styles/Stack.css)
 */
qx.Class.define("ville.ui.layout.Stack", {
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct() {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_6d731127 mantine-Stack-root");
    }
  });
