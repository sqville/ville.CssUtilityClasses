/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

/**
 * This is the main application class of "villeui"
 *
 * @external(villeui/css/villeui.css)
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
      const doc = this.getRoot();
      doc.setCssUtilityClass("m_89ab340 mantine-AppShell-root");
      doc.setExcludeBoundsFromDom(true);
      doc.setClearAllInlineStyles(true);
      doc.getContentElement().setStyles({
        "--app-shell-transition-duration": "200ms",
        "--app-shell-transition-timing-function": "ease"
      });

      // Header
      var docInnerHeaderBox = new ville.ui.core.Box("header");
      docInnerHeaderBox.setCssUtilityClass("m_3b16f56b mantine-AppShell-header right-scroll-bar-position");
      docInnerHeaderBox.setAttribute("data-with-border", "true");
      docInnerHeaderBox.setStyle("--app-shell-header-z-index", "100");

      var headerGroupbox = new ville.ui.layout.Group();
      headerGroupbox.setStyles({
        "--group-gap": "var(--mantine-spacing-md)",
        "--group-align": "center",
        "--group-justify": "flex-start",
        "--group-wrap": "wrap",
        "padding-inline": "var(--mantine-spacing-md)",
        "height": "100%"
      });
      headerGroupbox.setAttribute("html", "Header");
      docInnerHeaderBox.add(headerGroupbox);
      doc.add(docInnerHeaderBox);

      // Navbar
      var docInnerNavBox = new ville.ui.core.Box("nav");
      docInnerNavBox.setCssUtilityClass("m_45252eee mantine-AppShell-navbar");
      docInnerNavBox.setAttribute("data-with-border", "true");
      docInnerNavBox.setStyles({
        "--app-shell-navbar-z-index": "calc(100 + 1)",
        "padding": "var(--mantine-spacing-md)"
      });
      docInnerNavBox.setAttribute("html", "Navbar");
      doc.add(docInnerNavBox);
      
      // Main
      var docInnerMainBox = new ville.ui.core.Box("main");
      docInnerMainBox.setCssUtilityClass("m_8983817 mantine-AppShell-main");
      docInnerMainBox.setStyle("background-color", "var(--mantine-color-body)");
      docInnerMainBox.setAttribute("data-with-border", "true");

      var mainParagraph1 = new ville.ui.typography.Text("This is the main section, your app content here.");
      mainParagraph1.addClass("mantine-focus-auto");
      var mainParagraph2 = new ville.ui.typography.Text("Header Footer height and Navbar Aside width can be responsive. Try resizing the screen to see sizes changes.");
      mainParagraph2.addClass("mantine-focus-auto");

      var tblAnchorElement = new ville.ui.core.Box();

      docInnerMainBox.add(mainParagraph1);
      docInnerMainBox.add(mainParagraph2);
      //docInnerMainBox.add(tblAnchorElement);

      doc.add(docInnerMainBox);

      docInnerNavBox.add(tblAnchorElement);

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

      //Inline test
      tblAnchorElement.addListenerOnce("appear", (e) => {
        var el = e.getTarget().getContentElement().getDomElement();
        var tblIsle = new qx.ui.root.Inline(el, true, false);
        tblIsle.setLayout(new qx.ui.layout.Canvas());
        tblIsle.add(table, {edge: 0});
      });
      //tblAnchorElement.setAttribute("id", "tableisle1");

      //table.setExcludeInlineStyles(["left", "top"]);

      //tblAnchorElement.setStyle("position", "relative");
      //tblAnchorElement.add(table);

      var tblAnchorInnerElement = new ville.ui.core.Box();
      tblAnchorInnerElement.setAttribute("html", "Traditional Table widget inside Inline root:");
      //tblAnchorElement.add(tblAnchorInnerElement);

      var qxlabel = new qx.ui.basic.Label("Below is a traditional Qx Table widget added to an Inline root:");
      //tblAnchorElement.add(qxlabel);

      //docInnerMainBox.add(table);
      /** End of Table test */


      /*
// Header
      var Header = new ville.ui.core.Box("header");
      Header.addClass("HeaderSearch_header__UPZlW");
      docInnerBox.add(Header);
      var HeaderInner = new ville.ui.core.Box();
      HeaderInner.addClass("HeaderSearch_inner__KCxXP");
      Header.add(HeaderInner);
      var HeaderGroupLogo = new ville.ui.layout.Group();
      HeaderGroupLogo.setStyles({
        "--group-gap" : "var(--mantine-spacing-md)",
        "--group-align" : "center",
        "--group-justify" : "flex-start",
        "--group-wrap" : "wrap"
      });
      HeaderGroupLogo.setAttribute("html", "villePM");
      HeaderInner.add(HeaderGroupLogo);

      var HeaderGroupButtons = new ville.ui.layout.Group();
      HeaderGroupButtons.setGap("md");
      HeaderGroupButtons.setStyles({
        "--group-align" : "center",
        "--group-justify" : "flex-start",
        "--group-wrap" : "wrap"
      });

      var HeaderActionButton1 = new ville.ui.form.Button("Action 1", "default");
      HeaderActionButton1.addClass("mantine-focus-auto mantine-active");
      var HeaderActionButton2 = new ville.ui.form.Button("Action 2", "default");
      HeaderActionButton2.addClass("mantine-focus-auto mantine-active");

      HeaderGroupButtons.add(HeaderActionButton1);
      HeaderGroupButtons.add(HeaderActionButton2);
      // Need to be set grow property after adding layout children
      HeaderGroupButtons.setGrow(true);
      HeaderInner.add(HeaderGroupButtons);



    <div id="__next">
      <div style="padding:0">
        <div style="margin-left:unset;margin-right:unset;padding-top:0rem;max-width:100%" class="">
          <header class="HeaderSearch_header__UPZlW">
            <div class="HeaderSearch_inner__KCxXP">
              <div style="--group-gap:var(--mantine-spacing-md);--group-align:center;--group-justify:flex-start;--group-wrap:wrap" class="m_4081bf90 mantine-Group-root">
                VilleUi
              </div>
              <div style="--group-gap:var(--mantine-spacing-xs);--group-align:center;--group-justify:flex-start;--group-wrap:wrap" class="m_4081bf90 mantine-Group-root mantine-visible-from-sm">
                <a class="mantine-focus-auto m_18a11a80 m_87cf2631 mantine-UnstyledButton-root" aria-label="Source code" href="https://github.com/mantinedev/ui.mantine.dev">
                  <svg style="width:calc(1.375rem * var(--mantine-scale));height:calc(1.375rem * var(--mantine-scale))" class="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                  </svg>
                </a>
                <button class="mantine-focus-auto m_18a11a80 m_87cf2631 mantine-UnstyledButton-root" type="button" aria-label="Toggle color scheme">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-sun m_83c3d5d1 m_f4e3c6be">
                    <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
                    <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"></path>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-moon m_83c3d5d1 m_83c188ce">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </header>
        </div>
      </div>
    </div>
*/
      

    }
  }
});
