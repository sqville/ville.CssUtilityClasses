/**
 * Mode 3 Ville UI Application
 * @asset(villeuiapp/images/*)
 * @external(villeuiapp/css/bundle.min.css)
 */
qx.Class.define("villeuiapp.Application",
{
  extend : ville.ui.application.Standalone,

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
        // support native logging capabilities.
        qx.log.appender.Native;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      const appShell = this.getRoot();
      appShell.setAppearance("appshell");

      /* ::: Header ::: */
      var headerBox = new ville.ui.core.Box("header");
      headerBox.setAppearance("appshell-header");

      var headerInnerBox = new ville.ui.layout.HGroup("space-between");
      headerInnerBox.setAppearance("appshell-header-inner");

      var headerLogoBurgerGroupBox = new ville.ui.layout.HGroup();

      var headerNavGroupBox = new ville.ui.layout.HGroup();

      var headerLinksGroupBox = new ville.ui.layout.HGroup();
      headerLinksGroupBox.setGap("xs");
      headerLinksGroupBox.getContentElement().setStyles({
        "margin-left": "calc(3.125rem * var(--mantine-scale))"
      });

      // Logo (auto-resolves "images/ville_logo.png" -> "villeuiapp/images/ville_logo.png" via ResourceManager)
      var villeLogo = new ville.ui.basic.Image(
        "images/ville_logo.png",
        "Ville Software Logo",
        32,
        32
      );

      var headerLogoBox = new ville.ui.basic.Label("Ville.");
      headerLogoBox.setAppearance("appshell-logo-text");

      /* ::: End of Header ::: */

      /* ::: Main ::: */
      const mainArea = new ville.ui.core.Box("main");
      mainArea.setAppearance("appshell-main");

      // ---- ville.ui.form.Button (Native SVG Icon via ville.ui.icon.Default) -----
      const btn = new ville.ui.form.Button("Execute Me", "AIRPLANE");
      btn.setIconSize(26);
      btn.addListener("execute", () => {
        btn.setLabel("Executed!");
        btn.setEnabled(false);
      });

      // ---- ville.ui.core.Divider -----
      var dividerPopups = new ville.ui.core.Divider("Dropdown, Popup testing").set({
        size: "xl"
      });

      // ---- ville.ui.form.MenuButton & ville.ui.menu.Menu -----
      var btnMenu = new ville.ui.menu.Menu();

      var menuitem01 = new ville.ui.menu.Button("Update Works");
      var menuitem02 = new ville.ui.menu.Button("Toggle Enabled");
      btnMenu.add(menuitem01);
      btnMenu.add(menuitem02);

      var btnMenuButton = new ville.ui.form.MenuButton("Menu Button");
      btnMenuButton.setMenu(btnMenu);


      // ---- Form and form controls -----

      // Form
      var form = new ville.ui.form.Form();

      // Email
      var txtemail = new ville.ui.form.TextField();
      form.add(txtemail, "Email", null, null, null, {complexity : "email"});

      // Password
      var txtpassword = new ville.ui.form.PasswordField();//.set({ required : true });
      form.add(txtpassword, "Password", null, null, null, {complexity : "password"});

      // Form Bottom Buttons
      var registerbutton = new ville.ui.navigation.Anchor("Don't have an account? Register", "button");
      /*registerbutton.setStyles({
        color: "var(--mantine-color-dimmed)",
        "--text-fz": "var(--mantine-font-size-xs)",
        "--text-lh": "var(--mantine-line-height-xs)"
      });*/

      var loginbutton = new ville.ui.form.Button("Login");

      form.addButton(registerbutton);
      form.addButton(loginbutton);

      // Form Renderer
      var loginForm = new ville.ui.form.renderer.TestRenderer(form);


      // ----- Assemble everything ------

      const centerArea = new ville.ui.layout.Center();
      const vstack = new ville.ui.layout.VStack("center");
      const titleh1 = new ville.ui.typography.Title(1, "Widget Sandbox");

      vstack.add(titleh1);
      vstack.add(btn);
      vstack.add(dividerPopups);
      vstack.add(btnMenuButton);
      vstack.add(loginForm);
      centerArea.add(vstack);
      mainArea.add(centerArea);

      /* ::: Assemble AppShell ::: */
      appShell.add(headerBox);
        headerBox.add(headerInnerBox);
          headerInnerBox.add(headerLogoBurgerGroupBox);
            //headerLogoBurgerGroupBox.add(headerBurger);
            headerLogoBurgerGroupBox.add(villeLogo);
            headerLogoBurgerGroupBox.add(headerLogoBox);
          headerInnerBox.add(headerNavGroupBox);
            headerNavGroupBox.add(headerLinksGroupBox);
      appShell.add(mainArea);
    }
  }
});
