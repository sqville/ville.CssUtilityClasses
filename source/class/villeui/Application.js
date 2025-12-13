/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

/**
 * This is the main application class of "villeui"
 *
 * @external(villeui/css/villeui.css)
 * @asset(villeui/css/villeuilast.css)
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
      appShell.getContentElement().setStyles({
        "--app-shell-transition-duration": "200ms",
        "--app-shell-transition-timing-function": "ease"
      }, true);

      // Header
      var headerBox = new ville.ui.core.Box("header");
      headerBox.setCssUtilityClass("m_3b16f56b mantine-AppShell-header right-scroll-bar-position");
      headerBox.setAttribute("data-with-border", "true");
      headerBox.setStyle("--app-shell-header-z-index", "100");

      var headerGroupBox = new ville.ui.layout.HGroup();
      headerGroupBox.setStyles({
        "--group-gap": "var(--mantine-spacing-md)",
        "--group-align": "center",
        "--group-justify": "flex-start",
        "--group-wrap": "wrap",
        "padding-inline": "var(--mantine-spacing-md)",
        "height": "100%"
      });
      
      // Burger
      var headerBurger = new ville.ui.core.Burger();
      headerBurger.addClass("mantine-hidden-from-sm");
      headerBurger.setStyles({
        "--burger-size": "var(--burger-size-sm)",
        "--burger-line-size": "calc(0.125rem * var(--mantine-scale))"
      });

      var headerContentGroupBox = new ville.ui.layout.HGroup();
      headerContentGroupBox.setStyles({
        "--group-gap": "var(--mantine-spacing-md)",
        "--group-align": "center",
        "--group-justify": "space-between",
        "--group-wrap": "wrap",
        "flex": "1 1 0%"
      });
      headerContentGroupBox.setAttribute("html", "Ville UI");

      var headerLinkGroupBox = new ville.ui.layout.HGroup();
      //headerLinkGroupBox.addClass("mantine-hidden-from-sm");
      headerLinkGroupBox.setStyles({
        "--group-gap": "0rem",
        "--group-align": "center",
        "--group-justify": "flex-start",
        "--group-wrap": "wrap",
        "margin-left": "var(--mantine-spacing-xl)"
      });

      var navLinkDocs = new ville.ui.form.UnstyledButton("Docs");
      navLinkDocs.addClass("mantine-focus-auto MobileNavbar_control__jg3Mn");
      var navLinkGithub = new ville.ui.form.UnstyledButton("GitHub");
      navLinkGithub.addClass("mantine-focus-auto MobileNavbar_control__jg3Mn");
      var btnTheme = new ville.ui.form.UnstyledToggleButton(`&#9790;`);
      btnTheme.addClass("mantine-focus-auto MobileNavbar_control__jg3Mn");
      btnTheme.addListener("click", (e) => {
        if (btnTheme.getValue()) {
          document.documentElement.setAttribute("data-mantine-color-scheme", "dark");
          btnTheme.getContentElement().setAttribute("html", `&#9728;`); //"&#9728;");
        } else {
          document.documentElement.setAttribute("data-mantine-color-scheme", "light");
          btnTheme.getContentElement().setAttribute("html", `&#9790;`);
        }
      });
      headerLinkGroupBox.add(navLinkDocs);
      headerLinkGroupBox.add(navLinkGithub);
      headerLinkGroupBox.add(btnTheme);


      // Navbar
      var navBox = new ville.ui.core.Box("nav");
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
      navBox.add(navLinkGithubClone);
      
      // Main
      var mainBox = new ville.ui.core.Box("main");
      mainBox.setCssUtilityClass("m_8983817 mantine-AppShell-main");
      mainBox.setStyle("background-color", "var(--mantine-color-body)");
      mainBox.setAttribute("data-with-border", "true");

      var mainParagraph1 = new ville.ui.typography.Text("This is the main section, your app content here.");
      mainParagraph1.addClass("mantine-focus-auto");

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

      const tabView1 = this._getTabView();
      tabView1.setStyles({
        "--tabs-radius": "var(--mantine-radius-sm)",
        "--tabs-color": "var(--mantine-color-blue-filled)"
      });

      // Settings
      var settingsAffix = new ville.ui.overlay.Affix();
      settingsAffix.setStyles({
        "--affix-z-index": "200",
        "--affix-bottom": "calc(1.25rem * var(--mantine-scale))",
        "--affix-right": "calc(1.25rem * var(--mantine-scale))"
      });      

      // Assemble AppShell
      appShell.add(headerBox);
        headerBox.add(headerGroupBox);
          headerGroupBox.add(headerBurger);
          headerGroupBox.add(headerContentGroupBox);
            headerContentGroupBox.add(headerLinkGroupBox);
      appShell.add(navBox);
      appShell.add(mainBox);
        mainBox.add(mainParagraph1);
        mainBox.add(tabView1);


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
      // load the last css bundle
      //console.log(qx.util.ResourceManager.getInstance().toUri("villeui/css/villeuilast.css"));
      qx.bom.Stylesheet.includeFile(qx.util.ResourceManager.getInstance().toUri("villeui/css/villeuilast.css"));
    }

  }

});
