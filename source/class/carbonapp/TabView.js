/* ************************************************************************


************************************************************************ */

qx.Class.define("carbonapp.TabView", {
  extend: qx.ui.tabview.TabView,

  construct() {
    super();

    // TabView
    this.setBarPosition("top");
    this.setCssUtilityClass("landing-page__r2 cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16 cds--css-grid-column");

    // TabView > Slidebar
    var slidebar = this.getChildControl("bar");
    slidebar.setCssUtilityClass("cds--tabs tabs-group");
    var sbscrollpane = slidebar.getChildControl("scrollpane");
    sbscrollpane.setCssUtilityClass("cds--tab--list");
    sbscrollpane.getContentElement().setAttribute("role", "tablist");
    var sbcont = slidebar.getChildControl("content");
    sbcont.setCssUtilityClass("tabs-group-subcompsite");

    // TabView > Stack
    //var stack = this.getChildControl("pane");
    
    // Create pages
    var aboutpage = new carbonapp.pages.About();
    var designspage = new carbonapp.pages.Design();
    var developpage = new carbonapp.pages.Develop();
    
    // Add TabPages to the TabView
    this.add(aboutpage);
    this.add(designspage);
    this.add(developpage);
  }
});
