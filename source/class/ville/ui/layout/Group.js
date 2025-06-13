/**
 * Horizontal flex layout
 * @external(mantine/core/styles/Group.css)
 */
qx.Class.define("ville.ui.layout.Group", {
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct() {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_4081bf90 mantine-Group-root");
    },

    members: {
        // overridden
        _createContentElement() {
            return new qx.html.Element("div");
        }
    }
  });
