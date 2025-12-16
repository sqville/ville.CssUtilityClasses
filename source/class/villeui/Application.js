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
      var IconGitHub = new ville.ui.icon.IconGitHub();
      IconGitHub.setViewBox("0 0 16 16");
      IconGitHub.setFill("currentColor");
      navLinkGithub.add(IconGitHub);


              /*<svg xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" 
        stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-sun m_83c3d5d1 m_f4e3c6be">
            </svg>*/
      
      var btnTheme = new ville.ui.form.UnstyledToggleButton(`&#9790;`);
      btnTheme.addClass("maintine-focus-auto m_18a11a80");
      btnTheme.addListener("click", (e) => {
        if (btnTheme.getValue()) {
          document.documentElement.setAttribute("data-mantine-color-scheme", "dark");
          btnTheme.getContentElement().setAttribute("html", `&#9728;`); //"&#9728;");
        } else {
          document.documentElement.setAttribute("data-mantine-color-scheme", "light");
          btnTheme.getContentElement().setAttribute("html", `&#9790;`);
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
      var mainBannerTitle = new ville.ui.typography.Title(1, "Qooxdoo Components Library & Patterns");
      mainBannerTitle.addClass("Banner_title__PG16e");
      mainBannerTitle.setStyles({
        "--title-fw": "var(--mantine-h1-font-weight)",
        "--title-lh": "var(--mantine-h1-line-height)",
        "--title-fz": "var(--mantine-h1-font-size)"
      });
        mainBannerbody.add(mainBannerTitle);
      var mainBannerDesc = new ville.ui.typography.Text("Comprehensive Qooxdoo component library for building modern, high-performance web apps. Copy-paste UI components library & patterns crafted with Mantine CSS");
      mainBannerDesc.addClass("mantine-focus-auto Banner_description__asVMP");
      mainBannerDesc.setStyle("--text-color", "var(--mantine-color-dimmed)");
        mainBannerbody.add(mainBannerDesc);

      //var mainParagraph1 = new ville.ui.typography.Text("This is the main section, your app content here.");
      //mainParagraph1.addClass("mantine-focus-auto");

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
