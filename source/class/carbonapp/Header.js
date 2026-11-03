/* ************************************************************************



************************************************************************ */
/**
 * The Application's header
 */

qx.Class.define("carbonapp.Header", {
  extend: ville.ui.container.Composite,

  construct() {
    super();

    this.setCursor(null);
    this.setCssUtilityClass("cds--header");

    // Logged in users Organization
    var orglabel = new carbonapp.components.Link("Qooxdoo + IBM Carbon Styles");
    orglabel.addListener("click", () => {
      this.__main.setSelection([this.__main.getChildren()[0]]);
    });
    orglabel.setCssUtilityClass("cds--header__name");

    var headnav = new ville.ui.container.Composite();
    headnav.getContentElement().setNodeName("nav");
    headnav.setCssUtilityClass("cds--header__nav");
    var headnavcontentsbox = new ville.ui.container.Composite();
    headnavcontentsbox.getContentElement().useMarkup(`<ul class="cds--header__menu-bar"></ul>`);
    headnav.add(headnavcontentsbox);
    var headnavcontentsitem = new ville.ui.container.Composite();
    headnavcontentsitem.getContentElement().useMarkup(`<li></li>`);
    headnavcontentsbox.add(headnavcontentsitem);

    var tablepagelink = new carbonapp.components.Link("Table Page");
    tablepagelink.setCssUtilityClass("cds--header__menu-item");
    tablepagelink.addListener("click", () => {
      this.__main.setSelection([this.__main.getChildren()[1]]);
    });
    headnavcontentsitem.add(tablepagelink);

    // assemble the header  
    this.add(orglabel);
    this.add(headnav);
  },

  members : {
    
    __main : null,
    
    // overridden
    _createContentElement() {
      return new qx.html.Element("header");
    },

    refMain(main) {
      this.__main = main;
    }
  }
});
