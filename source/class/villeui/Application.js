/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

/**
 * This is the main application class of "villeui"
 *
 * @external(mantine/core/styles/baseline.css)
 * @external(mantine/core/styles/default-css-variables.css)
 * @external(mantine/core/styles/global.css)
 * @external(mantine/core/styles/AppShell.css)
 * @external(villeui/css/villeui-styles.css)
 * @asset(villeui/css/villeui-priority.css)
 * @asset(villeui/images/villeui_logo.png)
 * @asset(villeui/images/villeui_logo.svg)
 * @asset(villeui/images/ville_logo.png)
 */
qx.Class.define("villeui.Application",
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
      }

      // Document is the application root and AppShell root
      const appShell = this.getRoot();
      appShell.setCssUtilityClass("m_89ab340 mantine-AppShell-root");
      appShell.setExcludeBoundsFromDom(true);
      appShell.setClearAllInlineStyles(true);

      // Header
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
      
      // Burger
      /*var headerBurger = new ville.ui.core.Burger();
      headerBurger.addClass("mantine-hidden-from-sm");
      headerBurger.setStyles({
        "--burger-size": "var(--burger-size-sm)",
        "--burger-line-size": "calc(0.125rem * var(--mantine-scale))"
      });*/

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
      var IconMoon = new ville.ui.icon.IconMoon();

      var btnTheme = new ville.ui.form.ToggleActionIcon(IconSun, IconMoon);
      btnTheme.setStyles({
        "--ai-size": "var(--ai-size-lg)",
        "--ai-radius": "var(--mantine-radius-md)",
        "--ai-bg": "var(--mantine-color-default)",
        "--ai-hover": "var(--mantine-color-default-hover)",
        "--ai-color": "var(--mantine-color-default-color)",
        "--ai-bd": "calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-default-border)"
      });
      
      //var btnTheme = new ville.ui.form.UnstyledToggleButton(`&#9790;`);
      //btnTheme.addClass("maintine-focus-auto m_18a11a80");
      btnTheme.addListener("click", (e) => {
        if (btnTheme.getValue()) {
          document.documentElement.setAttribute("data-mantine-color-scheme", "dark");
          //btnTheme.getContentElement().setAttribute("html", `&#9728;`); //"&#9728;");
        } else {
          document.documentElement.setAttribute("data-mantine-color-scheme", "light");
          //btnTheme.getContentElement().setAttribute("html", `&#9790;`);
        }
      });
      //headerLinksGroupBox.add(navLinkDocs);
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
      
      // Main
      var mainBox = new ville.ui.core.Box();
      mainBox.setCssUtilityClass("m_8983817 mantine-AppShell-main");
      var mainShell = new ville.ui.core.Box();
      mainShell.setCssUtilityClass("Shell_main__g9BIV");
        mainBox.add(mainShell);
      var mainBannerwrapper = new ville.ui.core.Box();
      mainBannerwrapper.setCssUtilityClass("Banner_wrapper__g6dkO");
      var svgmarkup1 = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 185 185" width="185" height="185" class="HeroText_dots__XvXkZ" style="position:absolute;left:0;top:0"> <circle cx="10" cy="10" r="5" /> <rect x="35" y="5" width="10" height="10" rx="2" /> <polygon points="70,5 75,15 65,15" /> <rect x="95" y="5" width="8" height="8" transform="rotate(45 99 9)" /> <circle cx="130" cy="10" r="5" /> <rect x="155" y="5" width="10" height="10" rx="2" /> <rect x="5" y="35" width="10" height="10" rx="2" /> <polygon points="40,35 45,45 35,45" /> <rect x="66" y="36" width="8" height="8" transform="rotate(45 70 40)" /> <circle cx="100" cy="40" r="5" /> <rect x="125" y="35" width="10" height="10" rx="2" /> <polygon points="160,35 165,45 155,45" /> <polygon points="10,65 15,75 5,75" /> <rect x="36" y="66" width="8" height="8" transform="rotate(45 40 70)" /> <circle cx="70" cy="70" r="5" /> <rect x="95" y="65" width="10" height="10" rx="2" /> <polygon points="130,65 135,75 125,75" /> <rect x="156" y="66" width="8" height="8" transform="rotate(45 160 70)" /> <circle cx="10" cy="100" r="5" /> <rect x="35" y="95" width="10" height="10" rx="2" /> <polygon points="70,95 75,105 65,105" /> <rect x="95" y="95" width="8" height="8" transform="rotate(45 99 99)" /> <circle cx="130" cy="100" r="5" /> <rect x="155" y="95" width="10" height="10" rx="2" /> <rect x="5" y="125" width="10" height="10" rx="2" /> <polygon points="40,125 45,135 35,135" /> <rect x="66" y="126" width="8" height="8" transform="rotate(45 70 130)" /> <circle cx="100" cy="130" r="5" /> <rect x="125" y="125" width="10" height="10" rx="2" /> <polygon points="160,125 165,135 155,135" /> <polygon points="10,155 15,165 5,165" /> <rect x="36" y="156" width="8" height="8" transform="rotate(45 40 160)" /> <circle cx="70" cy="160" r="5" /> <rect x="95" y="155" width="10" height="10" rx="2" /> <polygon points="130,155 135,165 125,165" /> <rect x="156" y="156" width="8" height="8" transform="rotate(45 160 160)" /> </svg>`;
      var svgmarkup2 = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 185 185" width="185" height="185" class="HeroText_dots__XvXkZ" style="position:absolute;left:180;top:0"> <circle cx="10" cy="10" r="5" /> <rect x="35" y="5" width="10" height="10" rx="2" /> <polygon points="70,5 75,15 65,15" /> <rect x="95" y="5" width="8" height="8" transform="rotate(45 99 9)" /> <circle cx="130" cy="10" r="5" /> <rect x="155" y="5" width="10" height="10" rx="2" /> <rect x="5" y="35" width="10" height="10" rx="2" /> <polygon points="40,35 45,45 35,45" /> <rect x="66" y="36" width="8" height="8" transform="rotate(45 70 40)" /> <circle cx="100" cy="40" r="5" /> <rect x="125" y="35" width="10" height="10" rx="2" /> <polygon points="160,35 165,45 155,45" /> <polygon points="10,65 15,75 5,75" /> <rect x="36" y="66" width="8" height="8" transform="rotate(45 40 70)" /> <circle cx="70" cy="70" r="5" /> <rect x="95" y="65" width="10" height="10" rx="2" /> <polygon points="130,65 135,75 125,75" /> <rect x="156" y="66" width="8" height="8" transform="rotate(45 160 70)" /> <circle cx="10" cy="100" r="5" /> <rect x="35" y="95" width="10" height="10" rx="2" /> <polygon points="70,95 75,105 65,105" /> <rect x="95" y="95" width="8" height="8" transform="rotate(45 99 99)" /> <circle cx="130" cy="100" r="5" /> <rect x="155" y="95" width="10" height="10" rx="2" /> <rect x="5" y="125" width="10" height="10" rx="2" /> <polygon points="40,125 45,135 35,135" /> <rect x="66" y="126" width="8" height="8" transform="rotate(45 70 130)" /> <circle cx="100" cy="130" r="5" /> <rect x="125" y="125" width="10" height="10" rx="2" /> <polygon points="160,125 165,135 155,135" /> <polygon points="10,155 15,165 5,165" /> <rect x="36" y="156" width="8" height="8" transform="rotate(45 40 160)" /> <circle cx="70" cy="160" r="5" /> <rect x="95" y="155" width="10" height="10" rx="2" /> <polygon points="130,155 135,165 125,165" /> <rect x="156" y="156" width="8" height="8" transform="rotate(45 160 160)" /> </svg>`;
      var svgmarkup3 = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 185 185" width="185" height="185" class="HeroText_dots__XvXkZ" style="position:absolute;left:0;top:180"> <circle cx="10" cy="10" r="5" /> <rect x="35" y="5" width="10" height="10" rx="2" /> <polygon points="70,5 75,15 65,15" /> <rect x="95" y="5" width="8" height="8" transform="rotate(45 99 9)" /> <circle cx="130" cy="10" r="5" /> <rect x="155" y="5" width="10" height="10" rx="2" /> <rect x="5" y="35" width="10" height="10" rx="2" /> <polygon points="40,35 45,45 35,45" /> <rect x="66" y="36" width="8" height="8" transform="rotate(45 70 40)" /> <circle cx="100" cy="40" r="5" /> <rect x="125" y="35" width="10" height="10" rx="2" /> <polygon points="160,35 165,45 155,45" /> <polygon points="10,65 15,75 5,75" /> <rect x="36" y="66" width="8" height="8" transform="rotate(45 40 70)" /> <circle cx="70" cy="70" r="5" /> <rect x="95" y="65" width="10" height="10" rx="2" /> <polygon points="130,65 135,75 125,75" /> <rect x="156" y="66" width="8" height="8" transform="rotate(45 160 70)" /> <circle cx="10" cy="100" r="5" /> <rect x="35" y="95" width="10" height="10" rx="2" /> <polygon points="70,95 75,105 65,105" /> <rect x="95" y="95" width="8" height="8" transform="rotate(45 99 99)" /> <circle cx="130" cy="100" r="5" /> <rect x="155" y="95" width="10" height="10" rx="2" /> <rect x="5" y="125" width="10" height="10" rx="2" /> <polygon points="40,125 45,135 35,135" /> <rect x="66" y="126" width="8" height="8" transform="rotate(45 70 130)" /> <circle cx="100" cy="130" r="5" /> <rect x="125" y="125" width="10" height="10" rx="2" /> <polygon points="160,125 165,135 155,135" /> <polygon points="10,155 15,165 5,165" /> <rect x="36" y="156" width="8" height="8" transform="rotate(45 40 160)" /> <circle cx="70" cy="160" r="5" /> <rect x="95" y="155" width="10" height="10" rx="2" /> <polygon points="130,155 135,165 125,165" /> <rect x="156" y="156" width="8" height="8" transform="rotate(45 160 160)" /> </svg>`;
      var svgmarkup4 = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 185 185" width="185" height="185" class="HeroText_dots__XvXkZ" style="position:absolute;right:0;top:60"> <circle cx="10" cy="10" r="5" /> <rect x="35" y="5" width="10" height="10" rx="2" /> <polygon points="70,5 75,15 65,15" /> <rect x="95" y="5" width="8" height="8" transform="rotate(45 99 9)" /> <circle cx="130" cy="10" r="5" /> <rect x="155" y="5" width="10" height="10" rx="2" /> <rect x="5" y="35" width="10" height="10" rx="2" /> <polygon points="40,35 45,45 35,45" /> <rect x="66" y="36" width="8" height="8" transform="rotate(45 70 40)" /> <circle cx="100" cy="40" r="5" /> <rect x="125" y="35" width="10" height="10" rx="2" /> <polygon points="160,35 165,45 155,45" /> <polygon points="10,65 15,75 5,75" /> <rect x="36" y="66" width="8" height="8" transform="rotate(45 40 70)" /> <circle cx="70" cy="70" r="5" /> <rect x="95" y="65" width="10" height="10" rx="2" /> <polygon points="130,65 135,75 125,75" /> <rect x="156" y="66" width="8" height="8" transform="rotate(45 160 70)" /> <circle cx="10" cy="100" r="5" /> <rect x="35" y="95" width="10" height="10" rx="2" /> <polygon points="70,95 75,105 65,105" /> <rect x="95" y="95" width="8" height="8" transform="rotate(45 99 99)" /> <circle cx="130" cy="100" r="5" /> <rect x="155" y="95" width="10" height="10" rx="2" /> <rect x="5" y="125" width="10" height="10" rx="2" /> <polygon points="40,125 45,135 35,135" /> <rect x="66" y="126" width="8" height="8" transform="rotate(45 70 130)" /> <circle cx="100" cy="130" r="5" /> <rect x="125" y="125" width="10" height="10" rx="2" /> <polygon points="160,125 165,135 155,135" /> <polygon points="10,155 15,165 5,165" /> <rect x="36" y="156" width="8" height="8" transform="rotate(45 40 160)" /> <circle cx="70" cy="160" r="5" /> <rect x="95" y="155" width="10" height="10" rx="2" /> <polygon points="130,155 135,165 125,165" /> <rect x="156" y="156" width="8" height="8" transform="rotate(45 160 160)" /> </svg>`;
    
      var svgWidget1 = new ville.ui.basic.Element();
      var svgWidget2 = new ville.ui.basic.Element();
      var svgWidget3 = new ville.ui.basic.Element();
      var svgWidget4 = new ville.ui.basic.Element();
      svgWidget1.getContentElement().useMarkup(svgmarkup1);
      svgWidget2.getContentElement().useMarkup(svgmarkup2);
      svgWidget3.getContentElement().useMarkup(svgmarkup3);
      svgWidget4.getContentElement().useMarkup(svgmarkup4);
      mainBannerwrapper.add(svgWidget1);
      mainBannerwrapper.add(svgWidget2);
      mainBannerwrapper.add(svgWidget3);
      mainBannerwrapper.add(svgWidget4);
        mainShell.add(mainBannerwrapper);
      var mainContainerroot = new ville.ui.layout.Container();
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
        "font-weight": "bold",
        "text-decoration": "underline",
        "text-decoration-thickness": "2px",
        "text-decoration-color": "currentColor",
        "text-decoration-style": "wavy",
        "text-underline-offset": "calc(0.125rem * var(--mantine-scale))"
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
        "margin-top": "calc(var(--mantine-spacing-xl) * 2)"
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

      // Sponsored by section
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
        "margin-bottom": "var(--mantine-spacing-md)"
      });
      mainSponsoredBy.add(mainSponsoredByTitle);

      // Sponsored by body
      var mainSponsoredByBody = new ville.ui.core.Box();
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

      // Sponsor link - You?
      /*var sponsorYou = new ville.ui.core.Box("a");
      sponsorYou.setCssUtilityClass("HomePageSponsors_sponsor__c9Sun");
      sponsorYou.setAttributes({
        "href": "https://github.com/Ville-Software",
        "target": "_blank"
      });
      var sponsorYouText = new ville.ui.basic.Label("📣");
      sponsorYouText.setCssUtilityClass("HomePageSponsors_name__MEYj1");
      sponsorYou.add(sponsorYouText);
      var sponsorYouDesc = new ville.ui.basic.Element();
      sponsorYouDesc.setAttribute("html", "We specialize in modernizing and advancing Qooxdoo applications. Let us help you advance your digital products."); 
      sponsorYouDesc.setCssUtilityClass("HomePageSponsors_description__UOTKq");
      sponsorYouDesc.setStyle("text-align", "left");
      sponsorYou.add(sponsorYouDesc);
      mainSponsoredByBody.add(sponsorYou);*/

      // Widget Browser section
      var mainWidgetBrowserroot = new ville.ui.core.Box("section");
      mainWidgetBrowserroot.setCssUtilityClass("HomePageComponents_root__uexW5");
      mainShell.add(mainWidgetBrowserroot);
      var mainWidgetBrowser = new ville.ui.layout.Container();
      mainWidgetBrowser.setStyles({"--container-size": "calc(90rem * var(--mantine-scale))"});
      mainWidgetBrowser.setAttributes({"data-strategy": "block"});
      mainWidgetBrowserroot.add(mainWidgetBrowser);
      var mainWidgetBrowserTitle = new ville.ui.typography.Title(2);
      mainWidgetBrowserTitle.setAttributes({"data-order": "2"});
      mainWidgetBrowserTitle.setCssUtilityClass("HomePageTitle_title__Vmv_b");
      mainWidgetBrowserTitle.setStyles({
        "--title-fw": "var(--mantine-h2-font-weight)",
        "--title-lh": "var(--mantine-h2-line-height)",
        "--title-fz": "var(--mantine-h2-font-size)"
      });
      mainWidgetBrowserTitle.setAttribute("html", "Widget Browser");
      mainWidgetBrowser.add(mainWidgetBrowserTitle);
      var mainWidgetBrowserDesc = new ville.ui.typography.Text("Explore the available widgets and components in Ville UI.");
      mainWidgetBrowserDesc.setCssUtilityClass("mantine-focus-auto HomePageDescription_root__VdcJm HomePageComponents_description__JLMyY");
      mainWidgetBrowser.add(mainWidgetBrowserDesc);

      // Widget Browser stack
      var mainWidgetBrowserButtons = new ville.ui.core.Box();
      mainWidgetBrowserButtons.setCssUtilityClass("HomePageTabs_controls___TiQU");
      mainWidgetBrowser.add(mainWidgetBrowserButtons);

      // Widget Browser buttons - Form
      var btnForm = new ville.ui.form.UnstyledToggleButton();
      btnForm.addClass("mantine-focus-auto HomePageTabs_control__Oee_u");
      btnForm.setAttribute("data-active", "true", true);
      var btnFormText = new ville.ui.basic.Element("span");
      btnFormText.setCssUtilityClass("HomePageTabs_controlLabel__cdlU8");
      btnFormText.setAttribute("html", "Form", true);
      btnForm.add(btnFormText);

      // Widget Browser buttons - Tab
      var btnTab = new ville.ui.form.UnstyledToggleButton();
      btnTab.addClass("mantine-focus-auto HomePageTabs_control__Oee_u");
      var btnTabText = new ville.ui.basic.Element("span");
      btnTabText.setCssUtilityClass("HomePageTabs_controlLabel__cdlU8");
      btnTabText.setAttribute("html", "Tab");
      btnTab.add(btnTabText);

      // Widget Browser buttons - Basic
      var btnBasic = new ville.ui.form.UnstyledToggleButton();
      btnBasic.addClass("mantine-focus-auto HomePageTabs_control__Oee_u");
      var btnBasicText = new ville.ui.basic.Element("span");
      btnBasicText.setCssUtilityClass("HomePageTabs_controlLabel__cdlU8");
      btnBasicText.setAttribute("html", "Basic", true);
      btnBasic.add(btnBasicText);

      // Widget Browser buttons - FloatingIndicator
      var wbButtonIndicator = new ville.ui.overlay.FloatingIndicator();
      wbButtonIndicator.addClass("HomePageTabs_indicator__U7Dx4");
      wbButtonIndicator.setStyles({
        "transform": "translateY(0px) translateX(0px)",
        "width":"83px",
        "height":"48px"
      }, true);
      wbButtonIndicator.setAttributes({
        "data-initialized": "true"
      }, true);

      mainWidgetBrowserButtons.add(btnForm);
      mainWidgetBrowserButtons.add(btnTab);
      mainWidgetBrowserButtons.add(btnBasic);
      mainWidgetBrowserButtons.add(wbButtonIndicator);

      var wbRadioGroup = new qx.ui.form.RadioGroup(
        btnForm,
        btnTab,
        btnBasic
      );

      btnForm.addListenerOnce("appear", (e) => {
        var movetobounds = e.getTarget().getContentElement().getDomElement().clientWidth;//.getDimensions();
        console.log(e.getTarget().getContentElement());
        /*wbButtonIndicator.getContentElement().setStyles({
          transform: `translateY(0px) translateX(0px)`,
          width: `${movetobounds.width}px`,
          height: `${movetobounds.height}px`
        }, true);*/
      });

      wbRadioGroup.addListener("changeSelection", (e) => {
        e.getOldData()[0].getContentElement().removeAttribute("data-active");
        e.getData()[0].getContentElement().setAttribute("data-active", "true");
        var movetobounds = e.getData()[0].getContentElement().getDimensions();
        wbButtonIndicator.getContentElement().setStyles({
          transform: `translateY(0px) translateX(${(movetobounds.left - 16)}px)`,
          width: `${movetobounds.width}px`,
          height: `${movetobounds.height}px`
        }, true);
      });

      /*mainWidgetBrowserButtons.addListenerOnce("appear", (e) => {
        var movetobounds = wbRadioGroup.getSelection()[0].getContentElement();
        console.log("movetobounds: ", movetobounds);
        wbButtonIndicator.getContentElement().setStyles({
          transform: `translateY(0px) translateX(${movetobounds.left}px)`,
          width: `${movetobounds.width}px`,
          height: `${movetobounds.height}px`
        }, true);
      });*/

      var mainParagraph1 = new ville.ui.typography.Text("This is the main section, your app content here.");
      mainParagraph1.setStyle("margin-top", "100px");
      mainParagraph1.addClass("mantine-focus-auto");
      mainWidgetBrowserroot.add(mainParagraph1);


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

      /*const tabView1 = this._getTabView();
      tabView1.setStyles({
        "--tabs-radius": "var(--mantine-radius-sm)",
        "--tabs-color": "var(--mantine-color-blue-filled)"
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
      //appShell.add(navBox);
      appShell.add(mainBox);
        //mainBox.add(mainParagraph1);
        //mainBox.add(tabView1);


      /** End of Table test */

    },

    _getTable() {
      // Add traditional Table widget
      /*** Table island test */
      const tableConfig = {
        columnNames    : ["ID", "Name", "Phone"],
        columnIds      : ["id", "name", "phone"],
        columnWidths   : ["20%", "40%", "40%"]
      };

      var model = new qx.ui.table.model.Simple();
      model.setColumns(tableConfig.columnNames, tableConfig.columnIds);
      model.setEditable(false);
      for (let s = 0; s < model.getColumnCount(); s++) {
        model.setColumnSortable(s, false);
      }
      var rowData = [
        [1, "John Doe", "555-1234"],
        [2, "Jane Smith", "555-5678"],
        [3, "Bob Johnson", "555-8765"],
        [4, "Alice Williams", "555-4321"]
      ];
      model.setData(rowData);

      // Customize the table column model.  We want one that automatically resizes columns.
      var custom = {
        tableColumnModel() {return new qx.ui.table.columnmodel.Resize()}
      };

      var table = new qx.ui.table.Table(model, custom);

      // Obtain the behavior object to manipulate
      var colrb = table.getTableColumnModel().getBehavior();
      for (let i = 0; i < tableConfig.columnWidths.length; i++) {
        colrb.set(i, { width: tableConfig.columnWidths[i] });
      }

      table.set({
        maxHeight: 140,
        width: 400,
        showCellFocusIndicator: false,
        focusCellOnPointerMove: true
      });

      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.NO_SELECTION);

      return table;

    },

    _getQxTabView() {

      var tabView = new qx.ui.tabview.TabView();
      tabView.setWidth(500);

      ////////////////// TEST PAGE 1 ////////////////////
      var page1 = new qx.ui.tabview.Page("Layout");
      page1.setLayout(new qx.ui.layout.VBox());
      page1.add(new qx.ui.basic.Label("Layout-Settings"));
      tabView.add(page1);

      ////////////////// TEST PAGE 2 ////////////////////
      var page2 = new qx.ui.tabview.Page("Notes");
      page2.setLayout(new qx.ui.layout.VBox());
      page2.add(new qx.ui.basic.Label("Notes..."));
      tabView.add(page2);

      ////////////////// TEST PAGE 3 ////////////////////
      var page3 = new qx.ui.tabview.Page("Calculator");
      page3.setLayout(new qx.ui.layout.VBox());
      page3.add(new qx.ui.basic.Label("Calculator..."));
      tabView.add(page3);

      return tabView;
    },

    _getTabView() {

      var tabView = new ville.ui.tabview.TabView();
      //tabView.setWidth(500);

      ////////////////// TEST PAGE 1 ////////////////////
      var page1 = new ville.ui.tabview.Page("Layout");
      var page1Paragraph = new ville.ui.typography.Text("Layout tab page message...");
      page1.add(page1Paragraph);
      tabView.add(page1);

      ////////////////// TEST PAGE 2 ////////////////////
      var page2 = new ville.ui.tabview.Page("Notes");
      var page2Paragraph = new ville.ui.typography.Text("Notes tab page message...");
      page2.add(page2Paragraph);
      tabView.add(page2);

      ////////////////// TEST PAGE 3 ////////////////////
      var page3 = new ville.ui.tabview.Page("Calculator");
      var page3Paragraph = new ville.ui.typography.Text("Calculator tab page message...");
      page3.add(page3Paragraph);
      tabView.add(page3);

      return tabView;
    },

    finalize () {
      // load the last css bundle to make it have highest priority
      qx.bom.Stylesheet.includeFile(qx.util.ResourceManager.getInstance().toUri("villeui/css/villeui-priority.css"));
    }

  }

});
