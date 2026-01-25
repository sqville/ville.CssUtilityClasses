/**
 * Menu
 * @external(mantine/core/styles/Popover.css)
 * @external(mantine/core/styles/Menu.css)
 */
qx.Class.define("ville.ui.menu.Menu", {
    
    extend: qx.ui.menu.Menu,

    include: ville.ui.core.MWidget,

    construct() {

        super();

        //this._setLayout(new qx.ui.layout.Basic());

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_38a85659 mantine-Menu-dropdown m_dc9b7c9f");
        this.setAttribute('role', "menu");

    },

    members: {

        // overridden
        _createContentElement() {
            return new qx.html.Element();
        }
    }
  });
