/**
 * This is the most basic ui component
 * @external(mantine/core/styles/Divider.css)
 */
qx.Class.define("ville.ui.core.Divider", {
    extend: qx.ui.core.Widget,

    construct() {
        super();

        this._setLayout(new qx.ui.layout.Basic());
        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_3eebeb36 mantine-Divider-root");

        this.getContentElement().setAttribute('role', 'separator');
    },

    properties: {

        orientation: {
            init: "horizontal",
            check: ["horizontal", "vertical"],
            apply: "_applyOrientation",
            themeable: true,
            event: "changeOrientation"
        }
    },

    members: {
        // property apply
        _applyOrientation(value, old) {
            if (value) {
                this.getContentElement().setAttribute("data-orientation", value);
            }
        }
    }
  });
