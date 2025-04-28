qx.Class.define("twindapp.pages.Dashboard", {
    extend: qx.ui.tabview.Page,

    construct() {
      super();

      this.setLayout(new qx.ui.layout.Canvas());

      const pagenameroot = "dashboard";
      const pageurl = "/";
      const pageName = qx.lang.String.firstUp(pagenameroot);

      // Set up the Page
      this.setAppearance("exp-tabview-page");
      this.setLabel(pageName);
      this.addListener("appear", () => {document.title = `${pageName} - Ping CRM Qooxdoo`});
      this.setUserData("pageurl", pageurl);
      this.setExcludeBoundsFromDom(true);
      this.setCssUtilityClass("px-4 py-8 md:flex-1 md:p-12 md:overflow-y-auto");
      this.setClearAllInlineStyles(true);

      // Page Button
      var pagebtnlink = this.getButton();
      pagebtnlink.getContentElement().setNodeName("a");
      pagebtnlink.getContentElement().setAttribute("href", pageurl);
      pagebtnlink.addListener("click", (e) => {e.preventDefault()});
      pagebtnlink.setNativeContextMenu(true);
      var pgbtnlnkicon = new qx.html.Element();
      var svgclass = "mr-2 w-4 h-4 group-hover:fill-white";
      var pgbtnlinkiconsvg = `<svg class= "${svgclass}" xmlns="http://www.w3.org/2000/svg" fill=currentcolor viewBox="0 0 20 20">
        <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm-5.6-4.29a9.95 9.95 0 0 1 11.2 0 8 8 0 1 0-11.2 0zm6.12-7.64l3.02-3.02 1.41 1.41-3.02 3.02a2 2 0 1 1-1.41-1.41z"></path>
        </svg>`;
      pgbtnlnkicon.useMarkup(pgbtnlinkiconsvg);
      pagebtnlink.getContentElement().addAt(pgbtnlnkicon, 0);

      // Page Content
      var pageHtml = new qx.ui.embed.Html();
      pageHtml.setExcludeBoundsFromDom(true);
      pageHtml.setClearAllInlineStyles(true);
      var pghtml = `<h1 class="mb-8 text-3xl font-bold">${pageName}</h1>
      <p class="mb-8 leading-normal">Hey there! Welcome to Ping CRM, 
      a demo app designed to help illustrate how 
      <a class="text-indigo-500 hover:text-orange-600 underline" 
      href="https://inertiajs.com">Inertia.js</a> works.</p>`;
      
      pageHtml.setHtml(pghtml);
      
      this.add(pageHtml);

      // Add page scrolling content 
      /*
      this.getChildrenContainer().setLayout(new qx.ui.layout.Canvas());
      var pageContent = new qx.ui.container.Composite();
      pageContent.setLayout(new qx.ui.layout.VBox(10));
      var dashlabel = new qx.ui.basic.Label("Welcome to the Dashboard");
      pageContent.add(dashlabel);
      this.getChildrenContainer().add(pageContent, { edge: 10 });
      */
    }
  });
