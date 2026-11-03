/* ************************************************************************

   Copyright: 2025 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

/**
 * This is the main application class of "carbonapp"
 *
 * @asset(carbonapp/images/*)
 * @external(carbonapp/css/carbonapp.css)
 */
qx.Class.define("carbonapp.Application",
{
  extend : ville.ui.application.Standalone,

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

      // Document is the application root
      const doc = this.getRoot();
      doc.getContentElement().enableScrolling();

      // Header
      var headeranchor = new ville.ui.container.Composite();
      headeranchor.setCssUtilityClass("cds--g100 cds--layer-one");
      var header = new carbonapp.Header();
      headeranchor.add(header);

      // Main
      var main = new carbonapp.Main();

      header.refMain(main);

      doc.add(headeranchor);
      doc.add(main);
    }
  }
});
