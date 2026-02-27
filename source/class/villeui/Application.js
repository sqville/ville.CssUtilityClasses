/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

/**
 * This is the main application class of "villeui"
 *
 * @external(mantine/core/styles/AppShell.css)
 * @asset(villeui/css/villeui-priority.css)
 * @asset(villeui/images/villeui_logo.png)
 * @asset(villeui/images/villeui_logo.svg)
 * @asset(villeui/images/ville_logo.png)
 * @asset(villeui/images/QxCSS_example_01.png)
 * @require(ville.cssuc.patch.MAbstractField)
 * @ignore(IntersectionObserver)
 * 
 */
qx.Class.define("villeui.Application",
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

      // Document is the application root and AppShell root
      const appShell = this.getRoot();
      //appShell.setAllowGrowY(true);
      //appShell.setLayout(new qx.ui.layout.VBox());
      appShell.setCssUtilityClass("m_89ab340 mantine-AppShell-root");

      /*appShell.addListener("resize", () => {
        var elemDims = qx.bom.element.Dimension.getSize(appShell.getContentElement().getDomElement());
        appShell.setUserBounds(0, 0, elemDims.width, elemDims.height);
      });*/

      // Menu Button TEST
      var btnMenutest = new ville.ui.menu.Menu();
      var menui01 = new ville.ui.menu.Button("Menu item 01");
      var menui02 = new ville.ui.menu.Button("Menu item 02");
      //var menui03 = new ville.ui.menu.Button("Menu item 03");
      //var menui04 = new ville.ui.menu.Button("Menu item 04");
      btnMenutest.add(menui01);
      btnMenutest.add(menui02);
      //btnMenutest.add(menui03);
      //btnMenutest.add(menui04);
      var btnMenuButt = new ville.ui.form.MenuButton("MB");
      btnMenuButt.setMenu(btnMenutest);
      btnMenuButt.addListener("appear", () => {
        var elemDims = qx.bom.element.Dimension.getSize(appShell.getContentElement().getDomElement());
        appShell.setUserBounds(0, 0, elemDims.width, elemDims.height);
      });

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
      var villeuiLogo = new ville.ui.basic.Image();
      villeuiLogo.setAttributes({
        "src": "resource/villeui/images/villeui_logo.svg",
        "alt": "Ville UI Logo"
      }, true);
      villeuiLogo.setStyles({
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
      headerLogoBox.setAttribute("html", "Ville UI");

      // Links
      var navLinkDocs = new ville.ui.basic.Element("a");
      navLinkDocs.setAttribute("href", "/docs");
      navLinkDocs.setAttribute("html", "Docs");
      navLinkDocs.addClass("HeaderSearch_link__qyDsk");
      var navLinkGithub = new ville.ui.form.UnstyledButton("a");
      navLinkGithub.addClass("maintine-focus-auto m_18a11a80");
      navLinkGithub.setStyles({
        "width": "34px",
        "height": "34px"
      });
      var IconGitHub = new ville.ui.icon.IconGitHub();
      IconGitHub.setViewBox("0 0 16 16");
      IconGitHub.setFill("currentColor");
      navLinkGithub.add(IconGitHub);

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
      headerLinksGroupBox.add(btnMenuButt);
      headerLinksGroupBox.add(navLinkGithub);
      headerLinksGroupBox.add(btnTheme);

      // Navbar
      /*var navBox = new ville.ui.core.Box("nav");
      navBox.setCssUtilityClass("m_45252eee mantine-AppShell-navbar");
      navBox.setAttribute("data-with-border", "true");
      navBox.setStyles({
        "--app-shell-navbar-z-index": "calc(100 + 1)",
        "padding-inline": "calc(0.25rem * var(--mantine-scale))",
        "padding-block": "var(--mantine-spacing-md)"
      });
      const navLinkDocsClone = navLinkDocs.clone();
      navLinkDocsClone.addClass("mantine-focus-auto MobileNavbar_control__jg3Mn");
      const navLinkGithubClone = navLinkGithub.clone();
      navLinkGithubClone.addClass("mantine-focus-auto MobileNavbar_control__jg3Mn");
      navBox.add(navLinkDocsClone);
      navBox.add(navLinkGithubClone);*/

      /* ::: End of Header ::: */
      
      /* ::: Main ::: */

      var mainBox = new ville.ui.core.Box();
      //var mainBox = new ville.ui.container.Composite(new qx.ui.layout.Basic());
      mainBox.setCssUtilityClass("m_8983817 mantine-AppShell-main");
      var mainShell = new ville.ui.core.Box();
      //var mainShell = new ville.ui.container.Composite(new qx.ui.layout.VBox());
      mainShell.setCssUtilityClass("Shell_main__g9BIV");
      mainBox.add(mainShell);
      
      // Banner
      var mainBannerwrapper = new ville.ui.core.Box();
      //var mainBannerwrapper = new ville.ui.container.Composite(new qx.ui.layout.Basic());
      mainBannerwrapper.setCssUtilityClass("Banner_wrapper__g6dkO");
      var svgmarkup1 = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 185 185" width="185" height="185" class="HeroText_dots__XvXkZ" style="position:absolute;left:0;top:0"> <circle cx="10" cy="10" r="5" /> <rect x="35" y="5" width="10" height="10" rx="2" /> <polygon points="70,5 75,15 65,15" /> <rect x="95" y="5" width="8" height="8" transform="rotate(45 99 9)" /> <circle cx="130" cy="10" r="5" /> <rect x="155" y="5" width="10" height="10" rx="2" /> <rect x="5" y="35" width="10" height="10" rx="2" /> <polygon points="40,35 45,45 35,45" /> <rect x="66" y="36" width="8" height="8" transform="rotate(45 70 40)" /> <circle cx="100" cy="40" r="5" /> <rect x="125" y="35" width="10" height="10" rx="2" /> <polygon points="160,35 165,45 155,45" /> <polygon points="10,65 15,75 5,75" /> <rect x="36" y="66" width="8" height="8" transform="rotate(45 40 70)" /> <circle cx="70" cy="70" r="5" /> <rect x="95" y="65" width="10" height="10" rx="2" /> <polygon points="130,65 135,75 125,75" /> <rect x="156" y="66" width="8" height="8" transform="rotate(45 160 70)" /> <circle cx="10" cy="100" r="5" /> <rect x="35" y="95" width="10" height="10" rx="2" /> <polygon points="70,95 75,105 65,105" /> <rect x="95" y="95" width="8" height="8" transform="rotate(45 99 99)" /> <circle cx="130" cy="100" r="5" /> <rect x="155" y="95" width="10" height="10" rx="2" /> <rect x="5" y="125" width="10" height="10" rx="2" /> <polygon points="40,125 45,135 35,135" /> <rect x="66" y="126" width="8" height="8" transform="rotate(45 70 130)" /> <circle cx="100" cy="130" r="5" /> <rect x="125" y="125" width="10" height="10" rx="2" /> <polygon points="160,125 165,135 155,135" /> <polygon points="10,155 15,165 5,165" /> <rect x="36" y="156" width="8" height="8" transform="rotate(45 40 160)" /> <circle cx="70" cy="160" r="5" /> <rect x="95" y="155" width="10" height="10" rx="2" /> <polygon points="130,155 135,165 125,165" /> <rect x="156" y="156" width="8" height="8" transform="rotate(45 160 160)" /> </svg>`;
      var svgmarkup2 = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 185 185" width="185" height="185" class="HeroText_dots__XvXkZ" style="position:absolute;left:180;top:0"> <circle cx="10" cy="10" r="5" /> <rect x="35" y="5" width="10" height="10" rx="2" /> <polygon points="70,5 75,15 65,15" /> <rect x="95" y="5" width="8" height="8" transform="rotate(45 99 9)" /> <circle cx="130" cy="10" r="5" /> <rect x="155" y="5" width="10" height="10" rx="2" /> <rect x="5" y="35" width="10" height="10" rx="2" /> <polygon points="40,35 45,45 35,45" /> <rect x="66" y="36" width="8" height="8" transform="rotate(45 70 40)" /> <circle cx="100" cy="40" r="5" /> <rect x="125" y="35" width="10" height="10" rx="2" /> <polygon points="160,35 165,45 155,45" /> <polygon points="10,65 15,75 5,75" /> <rect x="36" y="66" width="8" height="8" transform="rotate(45 40 70)" /> <circle cx="70" cy="70" r="5" /> <rect x="95" y="65" width="10" height="10" rx="2" /> <polygon points="130,65 135,75 125,75" /> <rect x="156" y="66" width="8" height="8" transform="rotate(45 160 70)" /> <circle cx="10" cy="100" r="5" /> <rect x="35" y="95" width="10" height="10" rx="2" /> <polygon points="70,95 75,105 65,105" /> <rect x="95" y="95" width="8" height="8" transform="rotate(45 99 99)" /> <circle cx="130" cy="100" r="5" /> <rect x="155" y="95" width="10" height="10" rx="2" /> <rect x="5" y="125" width="10" height="10" rx="2" /> <polygon points="40,125 45,135 35,135" /> <rect x="66" y="126" width="8" height="8" transform="rotate(45 70 130)" /> <circle cx="100" cy="130" r="5" /> <rect x="125" y="125" width="10" height="10" rx="2" /> <polygon points="160,125 165,135 155,135" /> <polygon points="10,155 15,165 5,165" /> <rect x="36" y="156" width="8" height="8" transform="rotate(45 40 160)" /> <circle cx="70" cy="160" r="5" /> <rect x="95" y="155" width="10" height="10" rx="2" /> <polygon points="130,155 135,165 125,165" /> <rect x="156" y="156" width="8" height="8" transform="rotate(45 160 160)" /> </svg>`;
      var svgmarkup3 = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 185 185" width="185" height="185" class="HeroText_dots__XvXkZ" style="position:absolute;left:0;top:180"> <circle cx="10" cy="10" r="5" /> <rect x="35" y="5" width="10" height="10" rx="2" /> <polygon points="70,5 75,15 65,15" /> <rect x="95" y="5" width="8" height="8" transform="rotate(45 99 9)" /> <circle cx="130" cy="10" r="5" /> <rect x="155" y="5" width="10" height="10" rx="2" /> <rect x="5" y="35" width="10" height="10" rx="2" /> <polygon points="40,35 45,45 35,45" /> <rect x="66" y="36" width="8" height="8" transform="rotate(45 70 40)" /> <circle cx="100" cy="40" r="5" /> <rect x="125" y="35" width="10" height="10" rx="2" /> <polygon points="160,35 165,45 155,45" /> <polygon points="10,65 15,75 5,75" /> <rect x="36" y="66" width="8" height="8" transform="rotate(45 40 70)" /> <circle cx="70" cy="70" r="5" /> <rect x="95" y="65" width="10" height="10" rx="2" /> <polygon points="130,65 135,75 125,75" /> <rect x="156" y="66" width="8" height="8" transform="rotate(45 160 70)" /> <circle cx="10" cy="100" r="5" /> <rect x="35" y="95" width="10" height="10" rx="2" /> <polygon points="70,95 75,105 65,105" /> <rect x="95" y="95" width="8" height="8" transform="rotate(45 99 99)" /> <circle cx="130" cy="100" r="5" /> <rect x="155" y="95" width="10" height="10" rx="2" /> <rect x="5" y="125" width="10" height="10" rx="2" /> <polygon points="40,125 45,135 35,135" /> <rect x="66" y="126" width="8" height="8" transform="rotate(45 70 130)" /> <circle cx="100" cy="130" r="5" /> <rect x="125" y="125" width="10" height="10" rx="2" /> <polygon points="160,125 165,135 155,135" /> <polygon points="10,155 15,165 5,165" /> <rect x="36" y="156" width="8" height="8" transform="rotate(45 40 160)" /> <circle cx="70" cy="160" r="5" /> <rect x="95" y="155" width="10" height="10" rx="2" /> <polygon points="130,155 135,165 125,165" /> <rect x="156" y="156" width="8" height="8" transform="rotate(45 160 160)" /> </svg>`;
      var svgmarkup4 = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 185 185" width="185" height="185" class="HeroText_dots__XvXkZ" style="position:absolute;right:0;top:60"> <circle cx="10" cy="10" r="5" /> <rect x="35" y="5" width="10" height="10" rx="2" /> <polygon points="70,5 75,15 65,15" /> <rect x="95" y="5" width="8" height="8" transform="rotate(45 99 9)" /> <circle cx="130" cy="10" r="5" /> <rect x="155" y="5" width="10" height="10" rx="2" /> <rect x="5" y="35" width="10" height="10" rx="2" /> <polygon points="40,35 45,45 35,45" /> <rect x="66" y="36" width="8" height="8" transform="rotate(45 70 40)" /> <circle cx="100" cy="40" r="5" /> <rect x="125" y="35" width="10" height="10" rx="2" /> <polygon points="160,35 165,45 155,45" /> <polygon points="10,65 15,75 5,75" /> <rect x="36" y="66" width="8" height="8" transform="rotate(45 40 70)" /> <circle cx="70" cy="70" r="5" /> <rect x="95" y="65" width="10" height="10" rx="2" /> <polygon points="130,65 135,75 125,75" /> <rect x="156" y="66" width="8" height="8" transform="rotate(45 160 70)" /> <circle cx="10" cy="100" r="5" /> <rect x="35" y="95" width="10" height="10" rx="2" /> <polygon points="70,95 75,105 65,105" /> <rect x="95" y="95" width="8" height="8" transform="rotate(45 99 99)" /> <circle cx="130" cy="100" r="5" /> <rect x="155" y="95" width="10" height="10" rx="2" /> <rect x="5" y="125" width="10" height="10" rx="2" /> <polygon points="40,125 45,135 35,135" /> <rect x="66" y="126" width="8" height="8" transform="rotate(45 70 130)" /> <circle cx="100" cy="130" r="5" /> <rect x="125" y="125" width="10" height="10" rx="2" /> <polygon points="160,125 165,135 155,135" /> <polygon points="10,155 15,165 5,165" /> <rect x="36" y="156" width="8" height="8" transform="rotate(45 40 160)" /> <circle cx="70" cy="160" r="5" /> <rect x="95" y="155" width="10" height="10" rx="2" /> <polygon points="130,155 135,165 125,165" /> <rect x="156" y="156" width="8" height="8" transform="rotate(45 160 160)" /> </svg>`;
      var svgmarkup5 = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 185 185" width="185" height="185" class="HeroText_dots__XvXkZ" style="position:absolute;right:0;top:480"> <circle cx="10" cy="10" r="5" /> <rect x="35" y="5" width="10" height="10" rx="2" /> <polygon points="70,5 75,15 65,15" /> <rect x="95" y="5" width="8" height="8" transform="rotate(45 99 9)" /> <circle cx="130" cy="10" r="5" /> <rect x="155" y="5" width="10" height="10" rx="2" /> <rect x="5" y="35" width="10" height="10" rx="2" /> <polygon points="40,35 45,45 35,45" /> <rect x="66" y="36" width="8" height="8" transform="rotate(45 70 40)" /> <circle cx="100" cy="40" r="5" /> <rect x="125" y="35" width="10" height="10" rx="2" /> <polygon points="160,35 165,45 155,45" /> <polygon points="10,65 15,75 5,75" /> <rect x="36" y="66" width="8" height="8" transform="rotate(45 40 70)" /> <circle cx="70" cy="70" r="5" /> <rect x="95" y="65" width="10" height="10" rx="2" /> <polygon points="130,65 135,75 125,75" /> <rect x="156" y="66" width="8" height="8" transform="rotate(45 160 70)" /> <circle cx="10" cy="100" r="5" /> <rect x="35" y="95" width="10" height="10" rx="2" /> <polygon points="70,95 75,105 65,105" /> <rect x="95" y="95" width="8" height="8" transform="rotate(45 99 99)" /> <circle cx="130" cy="100" r="5" /> <rect x="155" y="95" width="10" height="10" rx="2" /> <rect x="5" y="125" width="10" height="10" rx="2" /> <polygon points="40,125 45,135 35,135" /> <rect x="66" y="126" width="8" height="8" transform="rotate(45 70 130)" /> <circle cx="100" cy="130" r="5" /> <rect x="125" y="125" width="10" height="10" rx="2" /> <polygon points="160,125 165,135 155,135" /> <polygon points="10,155 15,165 5,165" /> <rect x="36" y="156" width="8" height="8" transform="rotate(45 40 160)" /> <circle cx="70" cy="160" r="5" /> <rect x="95" y="155" width="10" height="10" rx="2" /> <polygon points="130,155 135,165 125,165" /> <rect x="156" y="156" width="8" height="8" transform="rotate(45 160 160)" /> </svg>`;
      var svgWidget1 = new ville.ui.basic.Element();
      var svgWidget2 = new ville.ui.basic.Element();
      var svgWidget3 = new ville.ui.basic.Element();
      var svgWidget4 = new ville.ui.basic.Element();
      var svgWidget5 = new ville.ui.basic.Element();
      svgWidget1.getContentElement().useMarkup(svgmarkup1);
      svgWidget2.getContentElement().useMarkup(svgmarkup2);
      svgWidget3.getContentElement().useMarkup(svgmarkup3);
      svgWidget4.getContentElement().useMarkup(svgmarkup4);
      svgWidget5.getContentElement().useMarkup(svgmarkup5);
      mainBannerwrapper.add(svgWidget1);
      mainBannerwrapper.add(svgWidget2);
      mainBannerwrapper.add(svgWidget3);
      mainBannerwrapper.add(svgWidget4);
      mainBannerwrapper.add(svgWidget5);
      mainShell.add(mainBannerwrapper);

      var mainContainerroot = new ville.ui.layout.Container();
      //var mainContainerroot = new ville.ui.container.Composite(new qx.ui.layout.VBox());

      mainContainerroot.setStyles({
        "--container-size": "calc(43.75rem * var(--mantine-scale));",
        "padding-inline": "var(--mantine-spacing-md)"
      });
      mainContainerroot.setAttributes({
        "data-size": "xl",
        "data-strategy": "block"
      });
      mainBannerwrapper.add(mainContainerroot);
      var mainBannerbody = new ville.ui.core.Box();

      mainBannerbody.setCssUtilityClass("Banner_body__K_Xm0");
      mainContainerroot.add(mainBannerbody);
      var mainBannerVilleui = new ville.ui.typography.Text("Ville UI<br>", "span");
      mainBannerVilleui.setAttributes({
        "data-variant": "gradient",
        "data-inherit": "true"
      });
      mainBannerVilleui.setStyles({
        "font-weight": "bold",
        "--text-gradient": "linear-gradient(45deg, #25962b 0%, #25ef34 100%)"
      });
      var mainBannerMore1 = new ville.ui.typography.Text("Qooxdoo Components Library & Patterns", "span");
      mainBannerMore1.setAttributes({
        "data-inherit": "true"
      });
      var mainBannerTitle = new ville.ui.typography.Title(1);
      mainBannerTitle.addClass("Banner_title__PG16e");
      mainBannerTitle.setStyles({
        "--title-fw": "var(--mantine-h1-font-weight)",
        "--title-lh": "var(--mantine-h1-line-height)",
        "--title-fz": "var(--mantine-h1-font-size)",
        "text-align": "center"
      });
      mainBannerTitle.add(mainBannerVilleui);
      mainBannerTitle.add(mainBannerMore1);
      mainBannerbody.add(mainBannerTitle);

      var bannerVilleui = new ville.ui.typography.Text("Ville UI ", "span");
      bannerVilleui.setStyles({
        "color": "#25962b",
        "font-weight": "bold"
      });
      bannerVilleui.setAttribute("data-inherit", "true");
      var bannerMore1 = new ville.ui.typography.Text("is a ", "span");
      bannerMore1.setAttribute("data-inherit", "true");
      var bannerMore2Qooxdoo = new ville.ui.typography.Text("Qooxdoo", "span");
      bannerMore2Qooxdoo.setAttribute("data-inherit", "true");
      bannerMore2Qooxdoo.setStyles({
        "color": "var(--mantine-color-bright)",
        "font-weight": "bold",
        "text-decoration": "underline",
        "text-decoration-thickness": "2px",
        "text-decoration-color": "currentColor",
        "text-decoration-style": "double",
        "text-underline-offset": "calc(0.325rem * var(--mantine-scale))"
      });
      var bannerMore3 = new ville.ui.typography.Text(" component library for building modern, high-performance web apps.<br>Crafted with ", "span");
      bannerMore3.setAttribute("data-inherit", "true");
      var bannerMore4Mantine = new ville.ui.typography.Text("Mantine CSS ", "span");
      bannerMore4Mantine.setAttributes({
        "data-variant": "gradient",
        "data-inherit": "true"
      });
      bannerMore4Mantine.setStyles({
        "font-weight": "bold",
        "--text-gradient": "linear-gradient(45deg, var(--mantine-color-blue-filled) 0%, var(--mantine-color-cyan-filled) 100%)"
      });
      var bannerMore5 = new ville.ui.typography.Text("(and &#10084;&#65039; love)", "span");
      bannerMore5.setAttribute("data-inherit", "true");

      var mainBannerDesc = new ville.ui.typography.Text();
      mainBannerDesc.add(bannerVilleui);
      mainBannerDesc.add(bannerMore1);
      mainBannerDesc.add(bannerMore2Qooxdoo);
      mainBannerDesc.add(bannerMore3);
      mainBannerDesc.add(bannerMore4Mantine);
      mainBannerDesc.add(bannerMore5);
      mainBannerDesc.addClass("mantine-focus-auto Banner_description__asVMP");
      mainBannerbody.add(mainBannerDesc);

      // Buttons
      var mainButtonGroup = new ville.ui.layout.HGroup();
      mainButtonGroup.setStyles({
        "--group-gap": "var(--mantine-spacing-md)",
        "--group-align": "center",
        "--group-justify": "center",
        "--group-wrap": "wrap",
        "margin-top": "calc(var(--mantine-spacing-xl) * 2)",
        "margin-bottom": "var(--mantine-spacing-md)"
      });
      mainBannerbody.add(mainButtonGroup);

      var btnGetStarted = new ville.ui.form.Button("Get Started");
      btnGetStarted.setStyles({
        "--button-height": "var(--button-height-xl)",
        "--button-padding-x": "var(--button-padding-x-xl)",
        "--button-fz": "var(--mantine-font-size-xl)",
        "--button-bg": "linear-gradient(45deg, #25962b 0%, #25ef34 100%)",
        "--button-hover": "linear-gradient(45deg, #25962b 0%, #25ef34 100%)",
        "--button-color": "var(--mantine-color-white)",
        "--button-bd": "none"
      });
      mainButtonGroup.add(btnGetStarted);

      var btniconGitHub = new ville.ui.icon.IconGitHub();
      btniconGitHub.setViewBox("0 0 16 16");
      btniconGitHub.setFill("currentColor");
      var btnGitHub = new ville.ui.form.Button("GitHub", "default", btniconGitHub, null, "a");
      btnGitHub.setAttributes({
        "data-size": "xl",
        "data-with-left-section": "true",
        "href": "https://github.com/sqville/ville"
      });
      btnGitHub.setStyles({
        "--button-height": "var(--button-height-xl)",
        "--button-padding-x": "var(--button-padding-x-xl)",
        "--button-fz": "var(--mantine-font-size-xl)",
        "--button-bg": "var(--mantine-color-default)",
        "--button-hover": "var(--mantine-color-default-hover)",
        "--button-color": "var(--mantine-color-default-color)",
        "--button-bd": "calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-default-border)"
      });
      mainButtonGroup.add(btnGitHub);

      // FIRE Emoji &#x1F525;

      /* MAIN SECTION ::: Sponsored By ::: */
      var mainSponsoredBy = new ville.ui.layout.Container();
      mainSponsoredBy.setStyles({
        "--container-size": "calc(90rem * var(--mantine-scale))",
        "text-align": "center",
        "padding-bottom": "calc(5rem * var(--mantine-scale))"
      });
      mainSponsoredBy.setAttribute("data-strategy", "block");
      mainShell.add(mainSponsoredBy);

      // Sponsored by title
      var mainSponsoredByTitle = new ville.ui.typography.Text("Brought to you by");
      mainSponsoredByTitle.addClass("mantine-focus-auto");
      mainSponsoredByTitle.setStyles({
        "font-size": "var(--mantine-font-size-lg)",
        "margin-top": "var(--mantine-spacing-md)",
        "margin-bottom": "var(--mantine-spacing-md)"
      });
      mainSponsoredBy.add(mainSponsoredByTitle);

      // Sponsored by body
      // SQUpdate - was Box
      var mainSponsoredByBody = new ville.ui.layout.Container();

      mainSponsoredByBody.setCssUtilityClass("HomePageSponsors_sponsors__3YyzB");
      mainSponsoredBy.add(mainSponsoredByBody);

      // Sponsor link - Ville Software example
      var sponsorVilleSoftware = new ville.ui.core.Box("a");
      sponsorVilleSoftware.setCssUtilityClass("HomePageSponsors_sponsor__c9Sun");
      sponsorVilleSoftware.setAttributes({
        "href": "https://github.com/Ville-Software",
        "target": "_blank"
      });
      var sponsorVilleSoftwareLogo = new ville.ui.basic.Image();
      sponsorVilleSoftwareLogo.addClass("HomePageSponsors_image__DWa8c");
      sponsorVilleSoftwareLogo.setAttributes({
        "src": "resource/villeui/images/ville_logo.png",
        "alt": "Ville Software Logo",
        "width": "80px",
        "height": "80px"
      }, true);
      var sponsorVilleSoftwareText = new ville.ui.basic.Label("Ville Software");
      sponsorVilleSoftwareText.setStyles({
        "font-weight": "bold"
      });
      sponsorVilleSoftwareText.setCssUtilityClass("HomePageSponsors_name__MEYj1");
      sponsorVilleSoftware.add(sponsorVilleSoftwareLogo);
      sponsorVilleSoftware.add(sponsorVilleSoftwareText);
      mainSponsoredByBody.add(sponsorVilleSoftware);

      /* ::: End of Sponsored By ::: */

      /* MAIN SECTION ::: Widget Browser ::: */
      //var mainWidgetBrowserroot = new ville.ui.core.Box("section");
      var mainWidgetBrowserroot = new ville.ui.container.Composite(new qx.ui.layout.Basic(), "section");
      mainWidgetBrowserroot.setCssUtilityClass("HomePageComponents_root__uexW5");


      var mainWidgetBrowserTitle = new ville.ui.typography.Title(2);
      mainWidgetBrowserTitle.setAttributes({"data-order": "2"});
      mainWidgetBrowserTitle.setCssUtilityClass("HomePageTitle_title__Vmv_b");
      mainWidgetBrowserTitle.setStyles({
        "--title-fw": "var(--mantine-h2-font-weight)",
        "--title-lh": "var(--mantine-h2-line-height)",
        "--title-fz": "var(--mantine-h2-font-size)",
        "padding-inline": "var(--mantine-spacing-md)"
      });
      mainWidgetBrowserTitle.setAttribute("html", "Widget Browser");
      mainWidgetBrowserTitle.addListenerOnce("appear", () => {
        // Select the element you want to observe
        const targetElement = mainWidgetBrowserTitle.getContentElement().getDomElement();

        // Set options (optional)
        const options = {
          root: null, // use the viewport as the root
          rootMargin: '0px', // no margin around the root
          threshold: 0.5 // trigger when 50% of the element is visible
        };

        // Create the observer
        const observer = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            // entry.isIntersecting is true if the element is currently in the viewport
            if (entry.isIntersecting) {
              // Perform your action here (e.g., start animation, load data)
              qx.io.PartLoader.require(["WidgetBrowser"],() => {
                var mainWidgetBrowser = new villeui.WidgetBrowser();
                mainWidgetBrowserroot.add(mainWidgetBrowser);
                mainWidgetBrowser.addListenerOnce("appear", () => {
                  var elemDims = qx.bom.element.Dimension.getSize(appShell.getContentElement().getDomElement());
                  appShell.setUserBounds(appShell.getBounds().left, appShell.getBounds().top, appShell.getBounds().width, elemDims.height);
                });
              });
              // Optional: Stop observing the element after the action fires once
              observer.unobserve(entry.target);
            }
          });
        }, options);

        // Start observing the target element
        observer.observe(targetElement);
      });
      // ADD
      mainWidgetBrowserroot.add(mainWidgetBrowserTitle);

      var mainWidgetBrowserDesc1 = new ville.ui.typography.Text("Yup, that widget browser. Some familiar with the new. The best way to get aquainted with your new ");
      mainWidgetBrowserDesc1.setCssUtilityClass("mantine-focus-auto HomePageDescription_root__VdcJm HomePageComponents_description__JLMyY");
      mainWidgetBrowserDesc1.setStyles({
        "padding-inline": "var(--mantine-spacing-md)"
      });
      var mainWidgetBrowserDesc2 = new ville.ui.basic.Label("modern CSS super powers. &#128170;");
      mainWidgetBrowserDesc2.setAttribute("data-inherit", "true");
      mainWidgetBrowserDesc2.setStyles({
        "color": "var(--mantine-color-bright)",
        "font-weight": "bold"
      });

      // ADDS
      mainWidgetBrowserroot.add(mainWidgetBrowserDesc1);
      mainWidgetBrowserDesc1.add(mainWidgetBrowserDesc2);
      mainShell.add(mainWidgetBrowserroot);

      /* ::: End of Widget Browser ::: */

      /* MAIN SECTIION ::: Native CSS Powers ::: */
      var mainNativeCssroot = new ville.ui.core.Box("section");
      mainNativeCssroot.setCssUtilityClass("HomePageComponents_root__uexW5");
      mainNativeCssroot.setStyles({
        "margin-top": "150px"
      });
      mainShell.add(mainNativeCssroot);

      var mainNativeCssTitle = new ville.ui.typography.Title(2);
      mainNativeCssTitle.setAttributes({"data-order": "2"});
      mainNativeCssTitle.setCssUtilityClass("HomePageTitle_title__Vmv_b");
      mainNativeCssTitle.setStyles({
        "--title-fw": "var(--mantine-h2-font-weight)",
        "--title-lh": "var(--mantine-h2-line-height)",
        "--title-fz": "var(--mantine-h2-font-size)",
        "padding-inline": "var(--mantine-spacing-md)"
      });
      mainNativeCssTitle.setAttribute("html", "Qooxdoo + Native CSS = &#x1F525;");
      mainNativeCssroot.add(mainNativeCssTitle);
      var mainNativeCssDesc1 = new ville.ui.typography.Text("Flexible styling using native CSS.");
      mainNativeCssDesc1.setCssUtilityClass("mantine-focus-auto HomePageDescription_root__VdcJm HomePageComponents_description__JLMyY");
      mainNativeCssDesc1.setStyles({
        "padding-inline": "var(--mantine-spacing-md)"
      });
      mainNativeCssroot.add(mainNativeCssDesc1);

      mainNativeCssTitle.addListenerOnce("appear", () => {
        // Select the element you want to observe
        const targetElement = mainNativeCssTitle.getContentElement().getDomElement();

        // Set options (optional)
        const options = {
          root: null, // use the viewport as the root
          rootMargin: '0px', // no margin around the root
          threshold: 0 // trigger when 50% of the element is visible
        };

        // Create the observer
        const observerNC = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            // entry.isIntersecting is true if the element is currently in the viewport
            if (entry.isIntersecting) {
              // Perform your action here (e.g., start animation, load data)
              qx.io.PartLoader.require(["NativeCss"],() => {
                var mainNativeCss = new villeui.NativeCss();
                mainNativeCssroot.add(mainNativeCss);
                mainNativeCss.addListenerOnce("appear", () => {
                  var elemDims = qx.bom.element.Dimension.getSize(appShell.getContentElement().getDomElement());
                  appShell.setUserBounds(appShell.getBounds().left, appShell.getBounds().top, appShell.getBounds().width, elemDims.height);
                });
              });
              // Optional: Stop observing the element after the action fires once
              observerNC.unobserve(entry.target);
            }
          });
        }, options);

        // Start observing the target element
        observerNC.observe(targetElement);
      });

      /* ::: End of Native CSS Powers ::: */
      /* ::: End of Main ::: */

      /* ::: Footer ::: */
      var footerBox = new ville.ui.core.Box("footer");
      footerBox.setCssUtilityClass("m_3840c879 mantine-AppShell-footer right-scroll-bar-position");
      footerBox.setAttributes({
        "data-with-border": "true",
        "html": "Footer"
      });
      footerBox.setStyles({
        "--app-shell-footer-z-index": "100",
        "padding": "var(--mantine-spacing-md)"
      });
      /* ::: End of Footer ::: */


      //var tblAnchorElement = new ville.ui.core.Box();
      //var tbvQxAnchorElement = new ville.ui.core.Box();

      //docInnerMainBox.add(tblAnchorElement);
      //docInnerMainBox.add(tbvQxAnchorElement);
      
      //--tabs-radius: var(--mantine-radius-sm); --tabs-color: var(--mantine-color-blue-filled);

      /*const qxtable = this._getTable();

      //Inline tests
      tblAnchorElement.addListenerOnce("appear", (e) => {
        var el = e.getTarget().getContentElement().getDomElement();
        var tblIsle = new qx.ui.root.Inline(el, true, false);
        tblIsle.setLayout(new qx.ui.layout.Canvas());
        tblIsle.add(qxtable, {edge: 0});
      });*/

      //const qxtabview = this._getQxTabView();

      /*tbvQxAnchorElement.addListenerOnce("appear", (e) => {
        var el = e.getTarget().getContentElement().getDomElement();
        var tbvIsle = new qx.ui.root.Inline(el, true, false);
        tbvIsle.setLayout(new qx.ui.layout.Canvas());
        tbvIsle.add(qxtabview, {edge: 0});
      });*/

      // Settings
      //var settingsAffix = new ville.ui.overlay.Affix();
      /*settingsAffix.setStyles({
        "--affix-z-index": "200",
        "--affix-bottom": "calc(1.25rem * var(--mantine-scale))",
        "--affix-right": "calc(1.25rem * var(--mantine-scale))"
      });*/    

      // Assemble AppShell
      appShell.add(headerBox);
        headerBox.add(headerInnerBox);
          headerInnerBox.add(headerLogoBurgerGroupBox);
            //headerLogoBurgerGroupBox.add(headerBurger);
            headerLogoBurgerGroupBox.add(villeuiLogo);
            headerLogoBurgerGroupBox.add(headerLogoBox);
          headerInnerBox.add(headerNavGroupBox);
            headerNavGroupBox.add(headerLinksGroupBox);
      appShell.add(mainBox);
      //appShell.add(footerBox);

    },

    // overridden
    finalize () {
      // load the last css bundle to make it have highest priority
      qx.bom.Stylesheet.includeFile(qx.util.ResourceManager.getInstance().toUri("villeui/css/villeui-priority.css"));
      this.render();
    }

  }

});
