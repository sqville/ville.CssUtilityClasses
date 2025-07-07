/**
 * Tree
 * @external(mantine/core/styles/Tree.css)
 */
qx.Class.define("ville.ui.tree.TreeFolder", {
    extend: qx.ui.tree.TreeFolder,

    include: ville.ui.core.MWidget,

    construct(label) {
        super(label);

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setCssUtilityClass("m_f6970eb1 mantine-Tree-node");
        this.setSelectable(null);
        this.setExcludeInlineStyles(["position"]);

        this.setAttribute("role", "treeitem");
    
    },

    properties: {

        openIcon: {
            check: "qx.ui.core.Widget",
            nullable: true,
            themeable: true
        },

        closeIcon: {
            check: "qx.ui.core.Widget",
            nullable: true,
            themeable: true
        }

    },

    members: {

        /** overridden */
        getTree() {
            var treeItem = this;
            while (treeItem.getParent()) {
                treeItem = treeItem.getParent();
            }

            var tree = treeItem.getLayoutParent()
                ? treeItem.getLayoutParent().getLayoutParent()
                : 0;
            if (tree) {
                return tree.getLayoutParent();
            }
            return null;
        },

        // overridden
        _createChildControlImpl(id, hash) {
        var control;

        switch (id) {
            case "label":
            control = new ville.ui.layout.Group(this.getLabel(), "div").set({
                anonymous: true
            });
            control.setCssUtilityClass("m_dc283425 mantine-Tree-label");
            break;

            case "open":
            control = new qx.ui.tree.core.FolderOpenButton().set({
                alignY: "middle"
            });
            control.addListener("changeOpen", this._onChangeOpen, this);
            //control.addListener("resize", this._updateIndent, this);
            break;
        }

        return control || super._createChildControlImpl(id);
        },

        // overridden
        _addWidgets() {
            //this.addSpacer();
            this.addOpenButton();
            this.addIcon();
            this.addLabel();
        }

    }
  });
