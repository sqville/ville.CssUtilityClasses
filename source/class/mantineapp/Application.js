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
  extend : ville.ui.application.Standalone,

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
        //qx.Class.include(qx.ui.core.Widget, ville.cssuc.MCssUtilityClass);
        //qx.Class.include(qx.ui.core.LayoutItem, ville.cssuc.MControl);

        qx.Class.patch(qx.ui.form.AbstractField, ville.cssuc.patch.MAbstractField);

        // clear out all styling of html and body tags
        //document.documentElement.style = "";
        //document.body.style = "";
      }

      // Document is the application root
      const doc = this.getRoot();
      doc.setCssUtilityClass("ville-mantineapp-Application");
      //doc.setExcludeBoundsFromDom(true);
      //doc.setClearAllInlineStyles(true);

      // Application Margin Box
      //var docMarginBox = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      var docMarginBox = new ville.ui.core.Box();
      //docMarginBox.setExcludeBoundsFromDom(true);
      //docMarginBox.setClearAllInlineStyles(true);
      docMarginBox.setCssUtilityClass("ville-mantineapp-InnerAppContainer");

      // Login Center Box Container
      var centerbox = new ville.ui.core.Paper();
      centerbox.setAttribute("data-with-border", "true");
      centerbox.setStyle("--paper-radius", `var(--mantine-radius-md)`);
      centerbox.setStyle("padding", "var(--mantine-spacing-lg)");

      // Login Center Box Header Welcome Message
      var welcomeMsg = new ville.ui.typography.Text("Welcome to Mantine, login with");
      welcomeMsg.set({ size : "lg", fontWeight : 500 });
      welcomeMsg.addClass("mantine-focus-auto");

      // Login Auth Group Box
      var LoginAuthGroupbox = new ville.ui.layout.HGroup("center");
      LoginAuthGroupbox.addClass("ville-mantineapp-AuthButtonGroup");      

      // Google Button
      //var googleicon = new ville.ui.icon.Google();
      //googleicon.setStyles({ width: "14px", height: "14px" });
      var googleButton = new ville.ui.form.Button("Google", "default");
      googleButton.addClass("mantine-focus-auto mantine-active");

      // Twitter Button
      var twitButton = new ville.ui.form.Button("Twitter", "default");//, new ville.ui.icon.Photo("14"));
      twitButton.addClass("mantine-focus-auto mantine-active"); 

      // Dropdown, Popup testing
      // Menu Button
      var btnMenu = new ville.ui.menu.Menu();
      var menuitem01 = new ville.ui.menu.Button("Menu item 01");
      var menuitem02 = new ville.ui.menu.Button("Menu item 02");
      btnMenu.add(menuitem01);
      btnMenu.add(menuitem02);
      //btnMenu.setDomMove(true);
      var btnMenuButton = new ville.ui.form.MenuButton("Menu Button", btnMenu);
      var PopupTestingGroupbox = new ville.ui.layout.HGroup("center");
      //PopupTestingGroupbox.add(btnMenuButton);
      // ComboBox
      //var lblComboBox = new ville.ui.form.Label("ComboBox").set({size : "lg"});
      //lblComboBox.setCssUtilityClass("m_8fdc1311 mantine-InputWrapper-label mantine-TextInput-label");
      //vstackTextWidgets.add(lblComboBox);
      var comboBox = new ville.ui.form.ComboBox();
      for (var i = 1; i < 31; i++) {
        var tempItem = new qx.ui.form.ListItem(
          "2^ " + i + " = " + Math.pow(2, i)
        );
        comboBox.add(tempItem);
      }
      var cmbobtn = comboBox.getChildControl("button");
      cmbobtn.setWidth(16);
      cmbobtn.setBackgroundColor("yellow");
      PopupTestingGroupbox.add(comboBox);

      // Separator
      var divider = new ville.ui.core.Divider();
      divider.setLabel("Or continue with email");

      // Form
      var form = new qx.ui.form.Form();

      // Email
      var txtemail = new ville.ui.form.TextField();//.set({ required : true });
      txtemail.setAttribute("id", "villetxtemail123");
      txtemail.setPlaceholder("youremail@email.com");
      form.add(txtemail, "Email", qx.util.Validate.email(), null, null, {complexity : "email"});

      // Password
      var txtpassword = new ville.ui.form.PasswordField();//.set({ required : true });
      txtpassword.setAttribute("id", "villetxtpassword123", true);
      txtpassword.setPlaceholder("Your password");
      form.add(txtpassword, "Password", null, null, null, {complexity : "password"});

      // Remember Me - CheckBox
      var chkrememberme = new ville.ui.form.CheckBox("Remember me").set({ id : "villechkrme123" });
      form.add(chkrememberme, "rememberme", null, null, null, {complexity : "checkbox"});

      // Form Bottom Buttons
      var registerbutton = new ville.ui.form.Anchor("Don't have an account? Register", "button");
      registerbutton.setStyles({
        color: "var(--mantine-color-dimmed)",
        "--text-fz": "var(--mantine-font-size-xs)",
        "--text-lh": "var(--mantine-line-height-xs)"
      });

      var loginbutton = new ville.ui.form.Button("Login", "filled");
      loginbutton.addClass("mantine-focus-auto mantine-active");

      form.addButton(registerbutton);
      form.addButton(loginbutton);

      // Form Renderer
      var loginForm = new mantineapp.form.renderer.LoginForm(form);

      // Experimental Widget
      //var expwidget = new ville.ui.experimental.Widget();
      
      // Add Auth buttons to Auth GroupBox 
      LoginAuthGroupbox.add(googleButton);
      LoginAuthGroupbox.add(twitButton);
      // Need to be set after adding layout children
      LoginAuthGroupbox.setGrow(true);

      centerbox.add(welcomeMsg);
      centerbox.add(LoginAuthGroupbox);
      centerbox.add(PopupTestingGroupbox);
      centerbox.add(divider);
      centerbox.add(loginForm);

      //centerbox.add(expwidget);

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
