/**
 * Mode 3 / Path B Ville UI Application — Tier A1 Full Widget Showcase
 * @asset(villeuiapp/images/*)
 * @external(villeuiapp/css/bundle.min.css)
 */
qx.Class.define("villeuiapp.Application", {
  extend: ville.ui.application.Standalone,

  members: {
    /**
     * Application startup entry point called by `ville.core.Init.ready()`.
     */
    main() {
      super.main();

      const appShell = this.getRoot();
      appShell.setAppearance("appshell");
      const metaMgr = ville.ui.theme.manager.Meta.getInstance();
      const activeVendor =
        qx.core.Environment.get("ville.cssEngine") || "mantine";

      /* =====================================================================
       * 1. HEADER BAR (`Burger`, `Image`, `Label`, `NavLink`, Light/Dark Toggle)
       * =================================================================== */
      const headerBox = new ville.ui.core.Box("header");
      headerBox.setAppearance("appshell-header");

      const headerInnerBox = new ville.ui.layout.HGroup("space-between");
      headerInnerBox.setAppearance("appshell-header-inner");

      const headerLogoBurgerGroupBox = new ville.ui.layout.HGroup();
      headerLogoBurgerGroupBox.setGap("xs");

      const headerBurger = new ville.ui.navigation.Burger();

      const villeLogo = new ville.ui.basic.Image(
        "images/ville_logo.png",
        "Ville Software Logo",
        28,
        28
      );

      const headerLogoBox = new ville.ui.basic.Label(
        `Ville UI (${activeVendor})`
      );
      headerLogoBox.setAppearance("appshell-logo-text");

      headerLogoBurgerGroupBox.add(headerBurger);
      headerLogoBurgerGroupBox.add(villeLogo);
      headerLogoBurgerGroupBox.add(headerLogoBox);

      const headerNavGroupBox = new ville.ui.layout.HGroup();
      headerNavGroupBox.setGap("xs");

      const navActions = new ville.ui.navigation.NavLink(
        "Actions",
        null,
        "AIRPLANE"
      );
      navActions.setActive(true);
      const navOverlays = new ville.ui.navigation.NavLink(
        "Overlays",
        null,
        "FOLDER"
      );
      const navForms = new ville.ui.navigation.NavLink("Forms", null, "FILE");

      const activateNav = (activeItem) => {
        for (const item of [navActions, navOverlays, navForms]) {
          item.setActive(item === activeItem);
        }
      };
      navActions.addListener("execute", () => activateNav(navActions));
      navOverlays.addListener("execute", () => activateNav(navOverlays));
      navForms.addListener("execute", () => activateNav(navForms));

      // Header Light/Dark Toggle Button + Keyboard Shortcut (`Ctrl+J`)
      const themeToggleBtn = new ville.ui.form.Button(
        metaMgr.getColorScheme() === "dark" ? "Light Mode" : "Dark Mode",
        metaMgr.getColorScheme() === "dark" ? "SUN" : "MOON"
      );
      themeToggleBtn.setSize("sm");
      themeToggleBtn.addListener("execute", () => {
        this.toggleColorScheme();
      });

      const themeTooltip = new ville.ui.overlay.ToolTip(
        "Toggle Light / Dark color scheme (Mantine · Obsidian · shadcn)",
        "MOON"
      );
      themeTooltip.setPosition("bottom-center");
      themeTooltip.bindToWidget(themeToggleBtn);

      headerNavGroupBox.add(navActions);
      headerNavGroupBox.add(navOverlays);
      headerNavGroupBox.add(navForms);
      headerNavGroupBox.add(themeToggleBtn);

      headerInnerBox.add(headerLogoBurgerGroupBox);
      headerInnerBox.add(headerNavGroupBox);
      headerBox.add(headerInnerBox);

      /* =====================================================================
       * 2. MAIN CONTENT AREA (`Title`, `Text`, `Button`, `Command`, `ToggleButton`,
       *    `ActionIcon`, `MenuButton`, `Menu`, `ToolTip`, `Modal`, `Window`, `Form`)
       * =================================================================== */
      const mainArea = new ville.ui.core.Box("main");
      mainArea.setAppearance("appshell-main");

      const centerArea = new ville.ui.layout.Center();
      const vstack = new ville.ui.layout.VStack("center");
      vstack.setGap("md");

      const titleH1 = new ville.ui.typography.Title(
        1,
        "Ville UI — Path B Tier A1 Sandbox"
      );
      const subtitleText = new ville.ui.typography.Text(
        `Active Theme: ${activeVendor} (${metaMgr.getColorScheme()}) · 0 qx.* files · ~15 KB ville.core Kernel`
      );

      /* --- Section A: Actions, Commands, Toggles & Menus --- */
      const dividerActions = new ville.ui.core.Divider(
        "Actions, Commands & Toggles"
      ).set({
        size: "sm"
      });

      const actionRow = new ville.ui.layout.HGroup("center");
      actionRow.setGap("sm");

      // Declarative Keyboard Command (`Ctrl+E` + automatic `aria-keyshortcuts`)
      const execCmd = new ville.ui.command.Command("Control+E");
      execCmd.setLabel("Execute Command");

      const btn = new ville.ui.form.Button(
        "Execute (Ctrl+E)",
        "AIRPLANE",
        execCmd
      );
      btn.setVariant("filled");
      btn.addListener("execute", () => {
        btn.setLabel("Executed!");
      });

      // Top-Layer Tooltip bound to `btn`
      const btnTooltip = new ville.ui.overlay.ToolTip(
        "Press Ctrl+E or click to run command",
        "AIRPLANE"
      );
      btnTooltip.bindToWidget(btn);

      // ToggleButton & ActionIcon (`aria-pressed` + `data-active`)
      const toggleBtn = new ville.ui.form.ToggleButton("Pin Mode", "CHECK");
      const actionIconBtn = new ville.ui.form.ActionIcon(
        metaMgr.getColorScheme() === "dark" ? "SUN" : "MOON",
        "default"
      );
      actionIconBtn.setAriaLabel("Toggle Light/Dark Mode");
      actionIconBtn.addListener("execute", () => {
        this.toggleColorScheme();
      });

      // MenuButton + Top-Layer Popover Menu (`menu.Button` + `menu.Separator`)
      const btnMenu = new ville.ui.menu.Menu();
      const menuitem01 = new ville.ui.menu.Button(
        "Reset Execute Button",
        "CHECK"
      );
      menuitem01.addListener("execute", () => {
        btn.setLabel("Execute (Ctrl+E)");
        btn.setEnabled(true);
      });
      const menuSep = new ville.ui.menu.Separator();
      const menuitem02 = new ville.ui.menu.Button("Toggle Pin State", "FOLDER");
      menuitem02.addListener("execute", () => {
        toggleBtn.toggleValue();
      });
      const menuitem03 = new ville.ui.menu.Button(
        "Switch Light / Dark Mode",
        "MOON"
      );
      menuitem03.addListener("execute", () => {
        this.toggleColorScheme();
      });

      btnMenu.add(menuitem01);
      btnMenu.add(menuSep);
      btnMenu.add(menuitem02);
      btnMenu.add(menuitem03);

      const btnMenuButton = new ville.ui.form.MenuButton("Actions Menu");
      btnMenuButton.setMenu(btnMenu);

      actionRow.add(btn);
      actionRow.add(toggleBtn);
      actionRow.add(actionIconBtn);
      actionRow.add(btnMenuButton);

      /* --- Section B: Top-Layer `<dialog>` Modal & Modeless Draggable Window --- */
      const dividerOverlays = new ville.ui.core.Divider(
        "Top-Layer <dialog> Modal & Window"
      ).set({
        size: "sm"
      });

      const demoModal = new ville.ui.overlay.Modal(
        "Ville UI Top-Layer <dialog> Modal"
      );
      const modalText = new ville.ui.typography.Text(
        "Rendered via native HTML5 <dialog>.showModal() with ::backdrop, Escape key handling, and W3C Invoker Commands (commandfor / command)."
      );
      const modalCloseBtn = new ville.ui.form.Button("Close Modal", "CLOSE");
      modalCloseBtn.setVariant("filled");
      modalCloseBtn.addListener("execute", () => demoModal.close("confirmed"));
      demoModal.add(modalText);
      demoModal.add(modalCloseBtn);

      const demoWindow = new ville.ui.overlay.Window(
        "Floating Inspector Window"
      );
      const winText = new ville.ui.typography.Text(
        "Modeless <dialog>.show() floating window with pointer-captured header dragging (MMovable)."
      );
      demoWindow.add(winText);

      const overlayRow = new ville.ui.layout.HGroup("center");
      overlayRow.setGap("sm");

      const openModalBtn = new ville.ui.form.Button(
        "Open Modal (<dialog>)",
        "FOLDER_OPEN"
      );
      openModalBtn.setCommandFor(demoModal);
      openModalBtn.setCommandAction("show-modal");
      openModalBtn.addListener("execute", () => demoModal.open());

      const openWindowBtn = new ville.ui.form.Button(
        "Toggle Floating Window",
        "FILE"
      );
      openWindowBtn.addListener("execute", () => {
        demoWindow.setOpened(!demoWindow.getOpened());
      });

      overlayRow.add(openModalBtn);
      overlayRow.add(openWindowBtn);

      /* --- Section C: Semantic Form, Toggles & Schema Validation --- */
      const dividerForms = new ville.ui.core.Divider(
        "Form Controls & Schema Validation"
      ).set({
        size: "sm"
      });

      const form = new ville.ui.form.Form();

      const txtemail = new ville.ui.form.TextField();
      txtemail.setPlaceholder("you@example.com");
      form.add(
        txtemail,
        "Email",
        ville.ui.form.Validator.string().required().email(),
        "email",
        null,
        { complexity: "email" }
      );

      const txtpassword = new ville.ui.form.PasswordField();
      form.add(
        txtpassword,
        "Password",
        ville.ui.form.Validator.string().required().min(6),
        "password",
        null,
        { complexity: "password" }
      );

      const txtnotes = new ville.ui.form.TextArea();
      txtnotes.setPlaceholder("Deployment notes (auto-sizing textarea)...");
      txtnotes.setRows(2);
      txtnotes.setAutoSize(true);
      form.add(txtnotes, "Notes", null, "notes");

      // CheckBox, Dark Mode Switch & RadioButtonGroup
      const togglesRow = new ville.ui.layout.HGroup("space-between");
      togglesRow.setGap("md");

      const chkRemember = new ville.ui.form.CheckBox("Remember session");
      chkRemember.setValue(true);

      const swDarkMode = new ville.ui.form.Switch("Dark Mode");
      swDarkMode.setValue(metaMgr.getColorScheme() === "dark");
      swDarkMode.addListener("changeValue", (e) => {
        const wantDark = Boolean(e.getData());
        const targetScheme = wantDark ? "dark" : "light";
        if (metaMgr.getColorScheme() !== targetScheme) {
          this.setColorScheme(targetScheme);
        }
      });

      // Keep Header Button, ActionIcon, Subtitle, and Switch synchronized whenever colorScheme changes
      metaMgr.addListener("changeColorScheme", (e) => {
        const scheme = e.getData();
        const isDark = scheme === "dark";
        themeToggleBtn.setLabel(isDark ? "Light Mode" : "Dark Mode");
        themeToggleBtn.setIcon(isDark ? "SUN" : "MOON");
        actionIconBtn.setIcon(isDark ? "SUN" : "MOON");
        subtitleText.setText(
          `Active Theme: ${activeVendor} (${scheme}) · 0 qx.* files · ~15 KB ville.core Kernel`
        );
        if (swDarkMode.getValue() !== isDark) {
          swDarkMode.setValue(isDark);
        }
      });

      togglesRow.add(chkRemember);
      togglesRow.add(swDarkMode);

      const radioGroup = new ville.ui.form.RadioButtonGroup(
        new ville.ui.layout.HBox(12)
      );
      const rbWeb = new ville.ui.form.RadioButton("Web App", "web");
      rbWeb.setValue(true);
      const rbPwa = new ville.ui.form.RadioButton("Desktop PWA", "pwa");
      radioGroup.add(rbWeb);
      radioGroup.add(rbPwa);

      const registerbutton = new ville.ui.navigation.Anchor(
        "Reset form defaults",
        "button"
      );
      registerbutton.addListener("click", () => form.reset());

      const loginbutton = new ville.ui.form.Button(
        "Validate & Sign In",
        "CHECK"
      );
      loginbutton.setVariant("filled");
      loginbutton.addListener("execute", () => {
        if (form.submit()) {
          loginbutton.setLabel("Valid! Signed In");
        } else {
          loginbutton.setLabel("Check Invalid Fields");
        }
      });

      form.addButton(registerbutton);
      form.addButton(loginbutton);

      const loginForm = new ville.ui.form.renderer.TestRenderer(form);

      /* =====================================================================
       * 3. ASSEMBLE SANDBOX LAYOUT
       * =================================================================== */
      vstack.add(titleH1);
      vstack.add(subtitleText);
      vstack.add(dividerActions);
      vstack.add(actionRow);
      vstack.add(dividerOverlays);
      vstack.add(overlayRow);
      vstack.add(dividerForms);
      vstack.add(togglesRow);
      vstack.add(radioGroup);
      vstack.add(loginForm);

      centerArea.add(vstack);
      mainArea.add(centerArea);

      appShell.add(headerBox);
      appShell.add(mainArea);
    }
  }
});
