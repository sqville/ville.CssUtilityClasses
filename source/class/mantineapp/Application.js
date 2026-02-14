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

        qx.Class.patch(qx.ui.form.AbstractField, ville.cssuc.patch.MAbstractField);

      }

      // Document is the application root
      const doc = this.getRoot();
      doc.setCssUtilityClass("ville-mantineapp-Application");

      // Application Margin Box
      var docMarginBox = new ville.ui.core.Box();
      docMarginBox.setCssUtilityClass("ville-mantineapp-InnerAppContainer");

      // Login Center Box Container
      var centerbox = new ville.ui.core.Paper();
      centerbox.setAttribute("data-with-border", "true");
      centerbox.setStyles({
        "--paper-radius": "var(--mantine-radius-md)",
        "--paper-shadow": "var(--mantine-shadow-md)",
        "padding": "var(--mantine-spacing-lg)",
        "margin-bottom": "40px"
      });

      // Login Center Box Header Welcome Message
      var welcomeMsg = new ville.ui.typography.Text("Welcome to Ville UI (Qooxdoo + Mantine)");
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

      // Tooltip
      var tooltip = new qx.ui.tooltip.ToolTip("Test ToolTip");
      googleButton.setToolTip(tooltip);

      // Twitter Button
      var twitButton = new ville.ui.form.Button("Twitter", "default");//, new ville.ui.icon.Photo("14"));
      twitButton.addClass("mantine-focus-auto mantine-active");
      
      // Window testing
      var winDrawer = this._createVuiModalWindow();
      winDrawer.set({height: 200, width: 180});
      winDrawer.getContentElement().setStyles({
        "--modal-radius": "var(--mantine-radius-md)",
        "--modal-y-offset": "5dvh"
      });
      //winDrawer.setLayout(new qx.ui.layout.Canvas());
      var btnClosewin = new ville.ui.form.Button("Close window");
      btnClosewin.setStyles({
        "max-width": "140px",
        "margin-top": "60px"
      });
      winDrawer.add(btnClosewin);

      twitButton.addListener("execute", () => {
        //winDrawer.fadeIn(200);
        winDrawer.show();
        winDrawer.center();
      });

      btnClosewin.addListener("execute", () => {
        winDrawer.close();
      });
      
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
      //PopupTestingGroupbox.add(comboBox);

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
      //centerbox.add(PopupTestingGroupbox);
      centerbox.add(divider);
      centerbox.add(loginForm);

      // Separator
      var dividerPopups = new ville.ui.core.Divider().set({size: "xl"});
      dividerPopups.setLabel("Dropdown, Popup testing");

      // Menu Button
      var btnMenu = new ville.ui.menu.Menu();
      var menuitem01 = new ville.ui.menu.Button("Menu item 01");
      var menuitem02 = new ville.ui.menu.Button("Menu item 02");
      btnMenu.add(menuitem01);
      btnMenu.add(menuitem02);
      //btnMenu.setDomMove(true);
      var btnMenuButton = new ville.ui.form.MenuButton("Menu Button");
      btnMenuButton.setMenu(btnMenu);
      var PopupTestingGroupbox = new ville.ui.layout.HGroup("center");
      PopupTestingGroupbox.add(btnMenuButton);

      // Theme Affix
      var IconSun = new ville.ui.icon.IconSun();
      IconSun.setStyles({ "width" : "24", "height" : "24" });
      IconSun.setAttribute("stroke-width", "1.5");
      var IconMoon = new ville.ui.icon.IconMoon();

      var btnTheme = new ville.ui.form.ToggleActionIcon(IconMoon, IconSun);
      btnTheme.setStyles({
        "--ai-size": "var(--ai-size-lg)",
        "--ai-radius": "var(--mantine-radius-md)",
        "--ai-bg": "var(--mantine-color-default)",
        "--ai-hover": "var(--mantine-color-default-hover)",
        "--ai-color": "var(--mantine-color-default-color)",
        "--ai-bd": "calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-default-border)"
      });
      btnTheme.addListener("click", (e) => {
        if (btnTheme.getValue()) {
          document.documentElement.setAttribute("data-mantine-color-scheme", "light");
        } else {
          document.documentElement.setAttribute("data-mantine-color-scheme", "dark");
        }
      });

      var settingsAffix = new ville.ui.overlay.Affix();
      settingsAffix.setStyles({
        "--affix-z-index": "200",
        "--affix-top": "calc(1.25rem * var(--mantine-scale))",
        "--affix-right": "calc(1.25rem * var(--mantine-scale))"
      });
      settingsAffix.add(btnTheme);
      doc.add(settingsAffix);

      docMarginBox.add(centerbox);
      docMarginBox.add(dividerPopups);
      docMarginBox.add(btnMenuButton);
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
      mainCard.add(orCard);*/
      

    },

    _createVuiModalWindow() {
      // Create the Window
      var win = new ville.ui.window.Modal("Vui Modal Window");

      return win;
    },
    
    _createQxWindow() {
      // Create the Window
      var win = new qx.ui.window.Window("Qx Window").set({ allowMaximize : false, allowMinimize : false, modal: true, movable: false });
      win.setLayout(new qx.ui.layout.VBox(4));
      win.setShowStatusbar(true);
      win.setStatus("Generic Message"); 
      win.getChildControl("title").set({padding: [10,0,0,10]});

      return win;
    }

  }
});
