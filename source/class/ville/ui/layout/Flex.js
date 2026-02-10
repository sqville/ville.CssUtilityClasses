/**
 * Horizontal flex layout
 * 2/10/2026 - removed external call out to "mantine/core/styles/Flex.css"
 * and replaced with addRule call. Too much overhead for one css class with one rule
 */
qx.Class.define("ville.ui.layout.Flex", {
    
    extend: ville.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct() {

        super();

        var sheet = qx.ui.style.Stylesheet.getInstance();
        
        if (!sheet.hasRule("m_8bffd616")) {
            sheet.addRule("m_8bffd616", "display: flex;");
        }

        this.setCssUtilityClass("m_8bffd616 mantine-Flex-root");

    }

  });
