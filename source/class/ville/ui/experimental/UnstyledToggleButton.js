/**
 * Unstyled Button
 * @external(mantine/core/styles/UnstyledButton.css)
 */
qx.Class.define("ville.ui.experimental.UnstyledToggleButton", {
    extend: qx.ui.form.ToggleButton,

    include: [qx.ui.core.MChildrenHandling, ville.ui.core.MWidget],

    construct(label, icon) {
        
        super();

        if (label != null)
            this.setLabel(label);

        if (icon != null)
            this.setIcon(icon);

        //this.setExcludeBoundsFromDom(true);
        //this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_87cf2631 mantine-UnstyledButton-root");
        this.setAttribute('type', 'button');
    },

    properties: {
        appearance: {
            refine: true,
            init: "vui-button"
        }
    },

    members: {

        // overridden
        _createContentElement() {
            return new qx.html.Element("div");
        }
    }
  });
