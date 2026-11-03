qx.Class.define("carbonapp.pages.Design", {
    extend: qx.ui.tabview.Page,

    construct() {
      super();

      const pagenameroot = "design";
      const pageurl = "/";
      const pageName = qx.lang.String.firstUp(pagenameroot);

      this.setLabel(pageName);
      this.setCssUtilityClass("cds--tab-content");

      // Page Button
      var pagebtn = this.getButton();
      var pagebtnlink = pagebtn.getContentElement();
      pagebtnlink.setNodeName("button");
      pagebtnlink.setAttribute("role", "tab");
      pagebtnlink.setAttribute("type", "button");

      // Page Group Area
      var pagegrouparea = new ville.ui.container.Composite();
      pagegrouparea.setCssUtilityClass("tabs-group-content cds--subgrid cds--subgrid--wide");

      // Page Group Landing and Content
      var pagegroupsubarea = new qx.ui.embed.Html();
      pagegroupsubarea.setCssUtilityClass("landing-page__tab-content cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16 cds--css-grid-column");
      var pghtml = `<p class="landing-page__p">Rapidly build beautiful and accessible experiences. 
        The Carbon kit contains all resources you need to get started.</p>`;
      pagegroupsubarea.setHtml(pghtml);

      // assemble the page
      pagegrouparea.add(pagegroupsubarea);
      this.add(pagegrouparea);
    }
  });
