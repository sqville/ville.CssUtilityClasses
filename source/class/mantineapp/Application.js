/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

/**
 * This is the main application class of "mantineapp"
 *
 * @asset(mantineapp/*)
 * @external(mantineapp/css/mantineapp.css)
 */
qx.Class.define("mantineapp.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main()
    {
      // Call super class
      super.main();

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      if (qx.core.Environment.get("ville.cssuc")) {
        qx.Class.include(qx.ui.core.Widget, ville.cssuc.MCssUtilityClass);
        qx.Class.include(qx.ui.core.LayoutItem, ville.cssuc.MControl);

        // clear out all styling of html and body tags
        //document.documentElement.style = "";
        //document.body.style = "";
      } 

      // Document is the application root
      const doc = this.getRoot();
      doc.setCssUtilityClass("ville-mantineapp-Application");
      doc.setExcludeBoundsFromDom(true);
      doc.setClearAllInlineStyles(true);

      // Application Margin Box
      var docMarginBox = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      docMarginBox.setExcludeBoundsFromDom(true);
      docMarginBox.setClearAllInlineStyles(true);
      docMarginBox.setCssUtilityClass("ville-mantineapp-InnerAppContainer");

      // Login Center Box Container
      var centerbox = new ville.ui.core.Paper();
      centerbox.setWithBorder(true);
      centerbox.setRadius("md");
      centerbox.addClass("ville-mantineapp-LoginCenterBox");

      // Login Center Box Header Welcome Message
      var welcomeMsg = new ville.ui.typography.Text("Welcome to Mantine, login with");
      welcomeMsg.getContentElement().addClass("mantine-focus-auto");
      welcomeMsg.getContentElement().setAttribute("data-size", "lg");

      // Login Auth Group Box
      var LoginAuthGroupbox = new ville.ui.layout.Group();
      LoginAuthGroupbox.getContentElement().addClass("ville-mantineapp-AuthButtonGroup");
      LoginAuthGroupbox.getContentElement().setAttribute("data-grow", "true");

      // Google Button
      var googleButton = new ville.ui.form.Button("Google", "default", new ville.ui.icon.Google(14));
      googleButton.getContentElement().addClass("mantine-focus-auto mantine-active");

      // Twitter Button
      var twitButton = new ville.ui.form.Button("Twitter", "default", new ville.ui.icon.Photo(14));
      twitButton.getContentElement().addClass("mantine-focus-auto mantine-active"); 

      // Separator
      var separatorbox = new ville.ui.core.Divider();
      separatorbox.getContentElement().setAttributes({
        "data-orientation" : "horizontal", 
        "data-with-label" : "true"
      }, true);
      var sephtml = `<span class="m_9e365f20 mantine-Divider-label" data-position="center">Or continue with email</span>`;
      separatorbox.getContentElement().setAttribute("html", sephtml);

      // Form
      var form = new qx.ui.form.Form();

      // Email
      var txtemail = new qx.ui.form.TextField();//.set({ required : true });
      txtemail.setPlaceholder("youremail@email.com");
      txtemail.setCssUtilityClass("m_8fb7ebe7 mantine-Input-input mantine-TextInput-input");
      txtemail.setRemoveCssClasses(["qx-abstract-field", "qx-placeholder-color"]);
      txtemail.setExcludeBoundsFromDom(true);
      //txtemail.setExcludeInlineStyles(["position", "zIndex", "touch-action", "boxSizing"]);
      txtemail.setClearAllInlineStyles(true);
      txtemail.getContentElement().setAttribute("data-variant", "default");
      form.add(txtemail, "Email", qx.util.Validate.email(), null, null, {complexity : "email"});

      // Password
      var txtpassword = new qx.ui.form.PasswordField().set({ required : true });
      txtpassword.setPlaceholder("Your password");
      txtpassword.setCssUtilityClass("m_f2d85dd2 mantine-PasswordInput-innerInput");
      txtpassword.setRemoveCssClasses(["qx-abstract-field", "qx-placeholder-color"]);
      txtpassword.setExcludeBoundsFromDom(true);
      //txtpassword.setExcludeInlineStyles(["position", "zIndex", "touch-action", "boxSizing"]);
      txtpassword.setClearAllInlineStyles(true);
      //txtpassword.getContentElement().setAttribute("data-variant", "default");
      form.add(txtpassword, "Password", null, null, null, {complexity : "password"});

      // Form Bottom Buttons
      var registerbutton = new mantineapp.components.Anchor("Don't have an account? Register");
      registerbutton.setCssUtilityClass("mantine-focus-auto m_849cf0da m_b6d8b162 mantine-Text-root mantine-Anchor-root");
      registerbutton.getContentElement().setAttributes({"data-size" : "xs", "data-underline" : "hover"});
      var loginbutton = new mantineapp.components.Button("Login");
      loginbutton.setCssUtilityClass("mantine-focus-auto mantine-active m_77c9d27d mantine-Button-root m_87cf2631 mantine-UnstyledButton-root");

      form.addButton(registerbutton);
      form.addButton(loginbutton);

      // Form Renderer
      var loginForm = new mantineapp.form.renderer.LoginForm(form);
      
      

      LoginAuthGroupbox.add(googleButton);
      LoginAuthGroupbox.add(twitButton);

      centerbox.add(welcomeMsg);
      centerbox.add(LoginAuthGroupbox);
      centerbox.add(separatorbox);
      centerbox.add(loginForm);
      docMarginBox.add(centerbox);
      doc.add(docMarginBox);

      /*

     

      var loginForm = new mantineapp.form.renderer.LoginForm(form);
      loginForm.setCssUtilityClass("card-body");
      loginForm.setExcludeBoundsFromDom(true);
      loginForm.setClearAllInlineStyles(true);
      mainCard.add(loginForm);

      // Hr Text
      var hrText = new qx.ui.core.Widget();
      hrText.setCssUtilityClass("hr-text");
      hrText.getContentElement().setAttribute("html", "or");
      hrText.setExcludeBoundsFromDom(true);
      hrText.setClearAllInlineStyles(true);
      mainCard.add(hrText);

      // Or Card
      var orCard = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      orCard.setCssUtilityClass("card-body");
      orCard.setExcludeBoundsFromDom(true);
      orCard.setClearAllInlineStyles(true);
      mainCard.add(orCard);

      // AltButtons
      var altRow = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      altRow.setCssUtilityClass("row");
      altRow.setExcludeBoundsFromDom(true);
      altRow.setClearAllInlineStyles(true);
      orCard.add(altRow);
      var altCol1 = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      altCol1.setCssUtilityClass("col");
      altCol1.setExcludeBoundsFromDom(true);
      altCol1.setClearAllInlineStyles(true);
      altRow.add(altCol1);
      var btngh = new mantineapp.components.Link("Login with Github", null, ".", true);
      btngh.setCssUtilityClass("btn btn-4 w-100");
      btngh.setExcludeBoundsFromDom(true);
      btngh.setClearAllInlineStyles(true);
      altCol1.add(btngh);
      var altCol2 = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      altCol2.setCssUtilityClass("col");
      altCol2.setExcludeBoundsFromDom(true);
      altCol2.setClearAllInlineStyles(true);
      altRow.add(altCol2);
      var btntwit = new mantineapp.components.Link("Login with X", null, ".", true);
      btntwit.setCssUtilityClass("btn btn-4 w-100");
      btntwit.setExcludeBoundsFromDom(true);
      btntwit.setClearAllInlineStyles(true);
      altCol2.add(btntwit);
      */

      

    }
  }
});
