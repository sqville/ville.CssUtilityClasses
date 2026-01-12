/**
 * Tree
 * @external(mantine/core/styles/Tree.css)
 */
qx.Class.define("ville.ui.tree.TreeFile", {
    extend: qx.ui.tree.TreeFile,

    include: ville.ui.core.MWidget,

    construct() {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setCssUtilityClass("m_f6970eb1 mantine-Tree-node");
        //this.setSelectable(null);
        this.setExcludeInlineStyles(["position"]);

        this.setAttribute("role", "treeitem");
    
    }
  });
