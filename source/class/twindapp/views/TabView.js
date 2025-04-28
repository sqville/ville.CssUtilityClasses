/* ************************************************************************


************************************************************************ */

qx.Class.define("twindapp.views.TabView", {
  extend: qx.ui.tabview.TabView,

  construct(header) {
    super();

    this.setBarPosition("left");

    this.setContentPadding(0);

    this.init(header);
  },


  members: {

    init(header) {

      // Create pages
      var dashboard = new twindapp.pages.Dashboard();
      var detailspage = new twindapp.pages.DetailsPage();
      var semantictable = new twindapp.pages.Contacts(detailspage, this);
      var login = new twindapp.pages.Login(this, header, dashboard);
      
      // Add TabPages to the TabView
      this.add(dashboard);
      this.add(semantictable);
      this.add(detailspage);
      this.add(login);

      // Slidebar
      var slidebar = this.getChildControl("bar");
      slidebar.setExcludeBoundsFromDom(true);
      slidebar.setCssUtilityStyleClearAll(true);
      slidebar.setCssUtilityClass("hidden shrink-0 p-12 w-56 bg-indigo-800 overflow-y-auto md:block");
      var sbscrollpane = slidebar.getChildControl("scrollpane");
      sbscrollpane.setExcludeBoundsFromDom(true);
      sbscrollpane.setCssUtilityStyleClearAll(true);
      var sbcont = slidebar.getChildControl("content");
      sbcont.setExcludeBoundsFromDom(true);
      sbcont.setCssUtilityStyleClearAll(true);

      // Stack
      var stack = this.getChildControl("pane");
      stack.setExcludeBoundsFromDom(true);
      stack.setCssUtilityStyleClearAll(true);
      stack.setQxClassClear(["qx-main"]);
      stack.setBackgroundColor(null);
      stack.setCssUtilityClass("md:flex md:grow md:overflow-hidden");

      header.setLoginRefs(this, login);

      if (localStorage.userloggedin == "false") {
        this.getChildControl("bar").setVisibility("excluded");
        header.setVisibility("excluded");
        this.setSelection([login]);
      }
    }
  }
});
