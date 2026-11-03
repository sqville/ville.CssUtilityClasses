/**
 * Dashboard page
 *
 */
qx.Class.define("villewebsite.pages.Home",
{
  extend : ville.ui.core.Box,

  construct() {
    super("main");

    document.title = "Ville Software";

    this.setCssUtilityClass("m_8983817 mantine-AppShell-main");
    //var mainShell = new ville.ui.core.Box();
    // mainShell.setCssUtilityClass("Shell_main__g9BIV");
    //this.add(mainShell);
    this.setAttribute("html", "Home Page Main");


  }

});
