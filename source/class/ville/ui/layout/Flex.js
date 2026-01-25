/**
 * Horizontal flex layout
 * @external(mantine/core/styles/Flex.css)
 */
qx.Class.define("ville.ui.layout.Flex", {
    
    extend: ville.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct() {

        super();

        this.setCssUtilityClass("m_8bffd616 mantine-Flex-root");

    }

  });
