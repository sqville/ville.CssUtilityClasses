/**
 * PasswordWrapper
 * @childControl innerwrapper {ville.ui.core.InnerWrapper}
 * @childControl sectionleft {ville.ui.form.InputSection}
 * @childControl sectionright {ville.ui.form.InputSection}
 * @external(mantine/core/styles/PasswordInput.css)
 */
qx.Class.define("ville.ui.form.PasswordWrapper", {
    extend: ville.ui.form.TextFieldWrapper,

    construct(textfield, variant, sectionleft, sectionright) {
        super(null, variant, sectionleft, sectionright); 

        this.setCssUtilityClass("m_f61ca620 mantine-PasswordInput-root m_46b77525 mantine-InputWrapper-root mantine-PasswordInput-root");
        this.getChildControl("innerwrapper").setCssUtilityClass("m_6c018570 mantine-Input-wrapper mantine-PasswordInput-wrapper");
    }
  });
