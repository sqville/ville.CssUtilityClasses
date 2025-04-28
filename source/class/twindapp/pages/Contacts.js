/**
 *
 *
 */
qx.Class.define("twindapp.pages.Contacts", {
    extend: qx.ui.tabview.Page,

    construct(detailspage, parenttbv) {
      super();

      this.setLayout(new qx.ui.layout.Canvas());

        // Page header
      const pagenameroot = "contacts";
      const pageurl = `/${pagenameroot}`;
      const pageName = qx.lang.String.firstUp(pagenameroot);
      const pageNameSingle = pageName.slice(0, -1);
      const createlinkurl = `${pageurl}/create`;

      // Set up the Page
      this.setAppearance("exp-tabview-page");
      this.setLabel(pageName);
      this.addListener("appear", () => {document.title = `${pageName} - Ping CRM Qooxdoo`});
      this.setUserData("pageurl", pageurl);
      this.setExcludeBoundsFromDom(true);
      this.setClearAllInlineStyles(true);
      this.setCssUtilityClass("px-4 py-8 md:flex-1 md:p-12 md:overflow-y-auto");

      // Page Button
      var pagebtnlink = this.getButton();
      pagebtnlink.getContentElement().setNodeName("a");
      pagebtnlink.getContentElement().setAttribute("href", pageurl);
      pagebtnlink.addListener("click", (e) => {e.preventDefault()});
      pagebtnlink.setNativeContextMenu(true);
      var pgbtnlnkicon = new qx.html.Element();
      var svgclass = "mr-2 w-4 h-4 group-hover:fill-white";
      var pgbtnlinkiconsvg = `<svg class= "${svgclass}" xmlns="http://www.w3.org/2000/svg" fill=currentcolor viewBox="0 0 20 20">
        <path d="M7 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 1c2.15 0 4.2.4 6.1 1.09L12 16h-1.25L10 20H4l-.75-4H2L.9 10.09A17.93 17.93 0 0 1 7 9zm8.31.17c1.32.18 2.59.48 3.8.92L18 16h-1.25L16 20h-3.96l.37-2h1.25l1.65-8.83zM13 0a4 4 0 1 1-1.33 7.76 5.96 5.96 0 0 0 0-7.52C12.1.1 12.53 0 13 0z"></path>
        </svg>`;
      pgbtnlnkicon.useMarkup(pgbtnlinkiconsvg);
      pagebtnlink.getContentElement().addAt(pgbtnlnkicon, 0);

      // Page Header
      var pageHtml = new qx.ui.embed.Html();
      pageHtml.setExcludeBoundsFromDom(true);
      pageHtml.setClearAllInlineStyles(true);
      var pghtml = `<h1 class="mb-8 text-3xl font-bold">${pageName}</h1>`;
      pageHtml.setHtml(pghtml);
    
      // table model
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns(["ID", "Name", "Organization", "City", "Phone", "NoShowLast"],["id", "name", "organization", "city", "phone","arrowright"]);
      tableModel.setDataAsMapArray(twindapp.data.CrmData.DATA.contacts);

      // table
      var custom = {
        tablePane(obj) {return new twindapp.table.pane.Pane(obj)},
        tablePaneScroller(obj) {return new twindapp.table.pane.Scroller(obj)}
      };
      var table = new qx.ui.table.Table(tableModel, custom);
      table.setHeaderCellsVisible(false);
      table.setStatusBarVisible(false);
      table.setColumnVisibilityButtonVisible(false);
      table.setShowCellFocusIndicator(false);
      table.setFocusCellOnPointerMove(false);
      table.setCssUtilityClass("w-full whitespace-nowrap");
      table.setExcludeBoundsFromDom(true);
      table.setClearAllInlineStyles(true);
      table.setDataRowRenderer(new twindapp.table.rowrenderer.Default());
      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.NO_SELECTION);

      table.addListener("cellTap", (e) => {
        if (e.getRow() >= 0) {
          var detailid = table.getTableModel().getRowDataAsMap(e.getRow()).id;
          const contact = twindapp.data.CrmData.DATA.contacts.find(contact => contact.id === detailid);
          if (contact) {
            detailspage.processFormModel(contact);
            detailspage.updateCallWidgets(this, parenttbv);
            parenttbv.setSelection([detailspage]);
          }
        }
      }, this);

      var tcm = table.getTableColumnModel();
      tcm.setDataCellRenderer(0, new twindapp.table.cellrenderer.Default());
      tcm.setDataCellRenderer(1, new twindapp.table.cellrenderer.Default());
      tcm.setDataCellRenderer(2, new twindapp.table.cellrenderer.Default());
      tcm.setDataCellRenderer(3, new twindapp.table.cellrenderer.Default());
      tcm.setDataCellRenderer(4, new twindapp.table.cellrenderer.Default());
      tcm.setDataCellRenderer(5, new twindapp.table.cellrenderer.Arrow());

      // hide the ID column
      tcm.setColumnVisible(0, false);
 
      var panescroller = table.getPaneScroller(0);
      panescroller.set({
        horizontalScrollBarVisible: false, 
        verticalScrollBarVisible: false,
        showCellFocusIndicator: false
      });
      panescroller.setExcludeBoundsFromDom(true);
      panescroller.setClearAllInlineStyles(true);

      var tblcontainer = panescroller.getLayoutParent();
      tblcontainer.setExcludeBoundsFromDom(true);
      tblcontainer.setClearAllInlineStyles(true);    

      //paneclipper (Clipper)
      var paneclipper = panescroller.getPaneClipper();
      paneclipper.setExcludeBoundsFromDom(true);
      paneclipper.setCssUtilityClass("h-full");
      //tablepane (Pane)
      var tblpane = panescroller.getTablePane();
      tblpane.setExcludeBoundsFromDom(true);
      tblpane.setClearAllInlineStyles(true);
      tblpane.setCssUtilityClass("h-full");
      //getScrollAreaContainer (Clipper)
      var scrollareacontainer = panescroller.getScrollAreaContainer();
      scrollareacontainer.setExcludeBoundsFromDom(true);
      scrollareacontainer.setClearAllInlineStyles(true);

      /** End of Table test */

      var tblAnchorElement = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      tblAnchorElement.setExcludeBoundsFromDom(true);
      tblAnchorElement.setClearAllInlineStyles(true);
      tblAnchorElement.setCssUtilityClass("bg-white rounded-md shadow overflow-x-auto");

      tblAnchorElement.add(table, { flex: 1 });

      // Table pagination
      var pagination = new twindapp.components.Pagination();
      pagination.setExcludeBoundsFromDom(true);
      pagination.setClearAllInlineStyles(true);
      pagination.setCssUtilityClass("flex flex-wrap -mb-1");
      pagination.updatePaginationModel(twindapp.data.CrmData.DATA["contactspageing"]);

      var pagingAnchorElement = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      pagingAnchorElement.setExcludeBoundsFromDom(true);
      pagingAnchorElement.setClearAllInlineStyles(true);
      pagingAnchorElement.setCssUtilityClass("mt-6");

      pagingAnchorElement.add(pagination, { flex: 1 });

      // add controls to the page
      this.add(pageHtml);
      this.add(tblAnchorElement);
      this.add(pagingAnchorElement);
    }
  });
