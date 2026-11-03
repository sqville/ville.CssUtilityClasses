qx.Class.define("carbonapp.pages.Develop", {
    extend: qx.ui.tabview.Page,

    construct() {
      super();

      const pagenameroot = "develop";
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
      var pghtml = `<p class="landing-page__p">Carbon provides styles and components in Vanilla, React, Next, Angular, and Vue for anyone building on the web.</p>`;
      pagegroupsubarea.setHtml(pghtml);

      // assemble the page
      pagegrouparea.add(pagegroupsubarea);
      this.add(pagegrouparea);
    }
  });
