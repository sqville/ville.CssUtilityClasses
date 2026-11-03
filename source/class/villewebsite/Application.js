/**
 * This is the main application class of "villewebsite"
 *
 * @external(mantine/core/styles/AppShell.css)
 * @asset(villewebsite/images/ville_logo.png)
 * 
 */
qx.Class.define("villewebsite.Application",
{
  extend : ville.ui.application.Standalone,

  include : ville.cssuc.MSsg,

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

      // Set the current page from the 'page' UrlParameter
      this.markSsgPage();

      /*
      * Configure global CSS variables to support control styles
      */

      // App Shell
      this.addRules([
        "--app-shell-header-height : calc(3.75rem * var(--mantine-scale));",
        "--app-shell-header-offset : calc(3.75rem * var(--mantine-scale));",
        "--app-shell-padding : 0px;"
      ]);

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Document is the application root and AppShell root
      const appShell = this.getRoot();
      appShell.setCssUtilityClass("m_89ab340 mantine-AppShell-root");
      appShell.setAttribute("data-mode", "fixed");

      /* Inline Styles */
      var inlineStyles = new ville.ui.basic.Element("style");
      var ilstyles = ":root{--app-shell-navbar-width:calc(18.75rem * var(--mantine-scale));--app-shell-navbar-offset:calc(18.75rem * var(--mantine-scale));--app-shell-header-height:calc(3.75rem * var(--mantine-scale));--app-shell-header-offset:calc(3.75rem * var(--mantine-scale));--app-shell-padding:var(--mantine-spacing-md);}@media(min-width: 48em){:root{--app-shell-navbar-transform:translateX(calc(var(--app-shell-navbar-width) * -1));--app-shell-navbar-transform-rtl:translateX(var(--app-shell-navbar-width));--app-shell-navbar-offset:0px !important;}}@media(max-width: 47.99375em){:root{--app-shell-navbar-width:100%;--app-shell-navbar-offset:0px;--app-shell-navbar-transform:translateX(calc(var(--app-shell-navbar-width) * -1));--app-shell-navbar-transform-rtl:translateX(var(--app-shell-navbar-width));}}";
      inlineStyles.setAttributes({
        "html": ilstyles,
        "data-mantine-styles": "inline"
      });
      appShell.add(inlineStyles);

      /* ::: Header ::: */
      var headerBox = new ville.ui.core.Box("header");
      headerBox.setCssUtilityClass("m_3b16f56b mantine-AppShell-header right-scroll-bar-position");
      headerBox.setAttribute("data-with-border", "true");
      headerBox.setStyle("--app-shell-header-z-index", "100");

      var headerInnerBox = new ville.ui.core.Box();
      headerInnerBox.setStyles({
        "--container-size": "var(--container-size-xl)",
        "padding-inline": "var(--mantine-spacing-md)",
        "display": "flex",
        "justify-content": "space-between",
        "align-items": "center",
        "height": "100%"
      });

      var headerLogoBurgerGroupBox = new ville.ui.layout.HGroup();
      headerLogoBurgerGroupBox.setStyles({
        "--group-gap": "var(--mantine-spacing-md)",
        "--group-align": "center",
        "--group-justify": "flex-start",
        "--group-wrap": "wrap"
      });

      var headerNavGroupBox = new ville.ui.layout.HGroup();
      headerNavGroupBox.setStyles({
        "--group-gap": "var(--mantine-spacing-md)",
        "--group-align": "center",
        "--group-justify": "flex-start",
        "--group-wrap": "wrap"
      });

      var headerLinksGroupBox = new ville.ui.layout.HGroup();
      headerLinksGroupBox.setStyles({
        "--group-gap": "calc(0.3125rem * var(--mantine-scale))",
        "--group-align": "center",
        "--group-justify": "flex-start",
        "--group-wrap": "wrap",
        "margin-left": "calc(3.125rem * var(--mantine-scale))"
      });

      // Logo
      var villeLogo = new ville.ui.basic.Image();
      villeLogo.setAttributes({
        "src": "resource/villewebsite/images/ville_logo.png",
        "alt": "Ville Software Logo"
      }, true);
      villeLogo.setStyles({
        "width": "32px",
        "height": "32px"
      });

      var headerLogoBox = new ville.ui.core.Box("span");
      headerLogoBox.setStyles({
        "font-weight": "bold",
        "font-style": "normal",
        "color": "inherit",
        "font-size": "20px"
      });
      headerLogoBox.setAttribute("html", "Ville.");

      // Links
      var btnProjects = new ville.ui.form.Button("Projects", "default", null, null, "a");
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
      headerLinksGroupBox.add(btnProjects);
      headerLinksGroupBox.add(btnTheme);

      /* ::: End of Header ::: */
      
      /* ::: Main ::: */
      
      var clazznm = this.getSsgPage();
      clazznm = qx.lang.String.firstUp(clazznm);
      var clazz = qx.Class.getByName(`villewebsite.pages.${clazznm}`);
      var mainArea = new clazz();

      
      // Assemble AppShell
      appShell.add(headerBox);
        headerBox.add(headerInnerBox);
          headerInnerBox.add(headerLogoBurgerGroupBox);
            //headerLogoBurgerGroupBox.add(headerBurger);
            headerLogoBurgerGroupBox.add(villeLogo);
            headerLogoBurgerGroupBox.add(headerLogoBox);
          headerInnerBox.add(headerNavGroupBox);
            headerNavGroupBox.add(headerLinksGroupBox);
      appShell.add(mainArea);
      //appShell.add(footerBox);

    }

  }

});
