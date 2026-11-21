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

      // Document is the application root and AppShell root
      const appShell = this.getRoot();
      appShell.setCssUtilityClass("m_89ab340 mantine-AppShell-root");
      appShell.getContentElement().setAttribute("data-mode", "fixed");

      /* Inline Styles */
      const rootAppShellcssVariables = new ville.ui.style.Style(true);
      const rootAppShellcssstr = ":root{--app-shell-navbar-width:calc(18.75rem * var(--mantine-scale));--app-shell-navbar-offset:calc(18.75rem * var(--mantine-scale));--app-shell-header-height:calc(3.75rem * var(--mantine-scale));--app-shell-header-offset:calc(3.75rem * var(--mantine-scale));--app-shell-padding:var(--mantine-spacing-md);}@media(min-width: 48em){:root{--app-shell-navbar-transform:translateX(calc(var(--app-shell-navbar-width) * -1));--app-shell-navbar-transform-rtl:translateX(var(--app-shell-navbar-width));--app-shell-navbar-offset:0px !important;}}@media(max-width: 47.99375em){:root{--app-shell-navbar-width:100%;--app-shell-navbar-offset:0px;--app-shell-navbar-transform:translateX(calc(var(--app-shell-navbar-width) * -1));--app-shell-navbar-transform-rtl:translateX(var(--app-shell-navbar-width));}}";
      rootAppShellcssVariables.set({styletype: "inline", value: rootAppShellcssstr});
      appShell.add(rootAppShellcssVariables);

      /* ::: Header ::: */
      var headerBox = new ville.ui.core.Box("header");
      headerBox.setCssUtilityClass("m_3b16f56b mantine-AppShell-header right-scroll-bar-position");
      headerBox.getContentElement().setAttribute("data-with-border", "true");
      headerBox.getContentElement().setStyle("--app-shell-header-z-index", "100");

      var headerInnerBox = new ville.ui.core.Box();
      headerInnerBox.getContentElement().setStyles({
        "--container-size": "var(--container-size-xl)",
        "padding-inline": "var(--mantine-spacing-md)",
        "display": "flex",
        "justify-content": "space-between",
        "align-items": "center",
        "height": "100%"
      });

      var headerLogoBurgerGroupBox = new ville.ui.layout.HGroup();
      headerLogoBurgerGroupBox.getContentElement().setStyles({
        "--group-gap": "var(--mantine-spacing-md)",
        "--group-align": "center",
        "--group-justify": "flex-start",
        "--group-wrap": "wrap"
      });

      var headerNavGroupBox = new ville.ui.layout.HGroup();
      headerNavGroupBox.getContentElement().setStyles({
        "--group-gap": "var(--mantine-spacing-md)",
        "--group-align": "center",
        "--group-justify": "flex-start",
        "--group-wrap": "wrap"
      });

      var headerLinksGroupBox = new ville.ui.layout.HGroup();
      headerLinksGroupBox.getContentElement().setStyles({
        "--group-gap": "calc(0.3125rem * var(--mantine-scale))",
        "--group-align": "center",
        "--group-justify": "flex-start",
        "--group-wrap": "wrap",
        "margin-left": "calc(3.125rem * var(--mantine-scale))"
      });

      // Logo
      var villeLogo = new ville.ui.basic.Image("images/ville_logo.png");
      villeLogo.getContentElement().setAttributes({
        "src": "resource/villeuiapp/images/ville_logo.png",
        "alt": "Ville Software Logo"
      }, true);
      villeLogo.getContentElement().setStyles({"width": "32px","height": "32px"});

      var headerLogoBox = new ville.ui.core.Box("span");
      headerLogoBox.getContentElement().setStyles({
        "font-weight": "bold",
        "font-style": "normal",
        "color": "inherit",
        "font-size": "20px"
      });
      headerLogoBox.getContentElement().setAttribute("html", "Ville.");

      // Links
      /*
      var btnProjects = new ville.ui.form.Button("Projects", null, null, "a");
      btnProjects.setHref("?page=projects");
      btnProjects.setAttribute("data-size", "md");
      btnProjects.setStyles({
        "--button-height": "var(--button-height-sm)",
        "--button-padding-x": "var(--button-padding-x-xs)",
        "--button-fz": "var(--mantine-font-size-md)",
        "--button-bg": "transparent",
        "--button-hover": "var(--mantine-color-default-hover)",
        "--button-color": "var(--mantine-color-default-color)",
        "--button-bd": "calc(0.0625rem * var(--mantine-scale)) solid transparent"
      });
      btnProjects.addListener("click", (e) => {
        window.location = window.location.origin + "?page=projects";
      });

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
      */

      // headerLinksGroupBox.add(btnProjects);
      // headerLinksGroupBox.add(btnTheme);

      /* ::: End of Header ::: */
      
      /* ::: Main ::: */

      const mainArea = new ville.ui.core.Box("main")
      mainArea.setCssUtilityClass("m_8983817 mantine-AppShell-main");
      
      // ---- ville.ui.form.Button -----
      const icon = new ville.ui.icon.fluent.Airplane(26);
      const btn = new ville.ui.form.Button("Execute Me", icon);
      // Application listening directly to framework custom event
      btn.addListener("execute", () => {
        btn.setLabel("Executed!");
        btn.setEnabled(false);
      });

      
      // ---- ville.ui.core.Divider -----

      var dividerPopups = new ville.ui.core.Divider("Dropdown, Popup testing").set({size: "xl"});

      // ---- ville.ui.form.MenuButton & ville.ui.menu.Menu -----

      // Menu
      var btnMenu = new ville.ui.menu.Menu();
      btnMenu.getContentElement().setStyles({
        "transition-property": "opacity",
        "backface-visibility": "hidden",
        "transition-duration": "150ms",
        "transition-timing-function": "ease"
      });

      var menuitem01 = new ville.ui.menu.Button("Update Works");
      menuitem01.getContentElement().setStyle("white-space", "nowrap");
      var menuitem02 = new ville.ui.menu.Button("Toggle Enabled");
      menuitem02.getContentElement().setStyle("white-space", "nowrap");
      btnMenu.add(menuitem01);
      btnMenu.add(menuitem02);

      // MenuButton
      var btnMenuButton = new ville.ui.form.MenuButton("Menu Button");
      btnMenuButton.setMenu(btnMenu);



      const centerArea = new ville.ui.layout.Center();
      const vstack = new ville.ui.layout.VStack("center");
      const titleh1 = new ville.ui.typography.Title(1, "Widget Sandbox");

      vstack.add(titleh1);
      vstack.add(btn);
      vstack.add(dividerPopups);
      vstack.add(btnMenuButton);
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
