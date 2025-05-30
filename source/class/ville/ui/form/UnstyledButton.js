/**
 * Unstyled Button
 * @external(mantine/core/styles/UnstyledButton.css)
 */
qx.Class.define("ville.ui.form.UnstyledButton", {
    extend: qx.ui.form.Button,

    construct(label) {
        super();

        this.setExcludeBoundsFromDom(true);
        this.setClearAllInlineStyles(true);
        this.setCssUtilityClass("m_87cf2631 mantine-UnstyledButton-root");
        this.getContentElement().setAttribute('type', 'button');

        if (label) {
            this.getContentElement().setAttribute('html', label);
        }
    },

    members: {

        // overridden
        _createContentElement() {
            return new qx.html.Element("button");
        }
    }
  });
