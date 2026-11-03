/**
 * This is the innerwrapper widget for Button, TextFieldWrapper
 * external(mantine/core/styles/InlineInput.css)
 */
qx.Class.define("ville.ui.core.InnerWrapper", {
    extend: qx.ui.core.Widget,

    include: qx.ui.core.MChildrenHandling,

    construct(component) {

        this._contentElementTag = component ?? "span";

        super();

    }

  });
