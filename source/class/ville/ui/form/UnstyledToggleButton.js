/**
 * Unstyled Button
 * external(mantine/core/styles/UnstyledButton.css)
 */
qx.Class.define("ville.ui.form.UnstyledToggleButton", {
    extend: qx.ui.form.ToggleButton,

    include: [qx.ui.core.MChildrenHandling],

    construct(label) {

        this._contentElementTag = "button";
        
        super();

        this.setCssUtilityClass("m_87cf2631 mantine-UnstyledButton-root");
        this.getContentElement().setAttribute('type', 'button');

        if (label) {
            this.getContentElement().setAttribute('html', label);
        }
    }

  });
