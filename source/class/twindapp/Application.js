/* ************************************************************************

   Copyright: 2024 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

/**
 * This is the main application class of "testapp"
 *
 * @asset(testapp/*)
 * @external(css/twindapp.css)
 */
qx.Class.define("twindapp.Application",
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
     * 
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

      

      if (qx.core.Environment.get("ville.theme.css")) {
        //qx.Class.patch(qx.html.Label, twindapp.MLabel);
        //qx.Class.patch(qx.ui.core.Widget, twindapp.MWidget);
        //qx.Class.patch(qx.ui.form.AbstractField, twindapp.MAbstractField);
        qx.Class.include(qx.ui.core.Widget, ville.cssus.MCssUtilityClass);
        qx.Class.include(qx.ui.core.LayoutItem, ville.cssus.MControl);

        // clear out all styling of html and body tags
        document.documentElement.style = "";
        document.body.style = "";

        // update html and body tags classes
        document.documentElement.class = "h-full bg-gray-100";
        document.body.class = "font-sans leading-none text-gray-700 antialiased";
      }   

      // Document is the application root
      const doc = this.getRoot();
      // CssUtilityClasses
      doc.setCssUtilityClass("md:flex md:flex-col");
      doc.setExcludeBoundsFromDom(true);
      doc.setCssUtilityStyle(["position"]); //ExcludeInlineStyles
      doc.getContentElement().enableScrolling();

      // Header
      var header = new twindapp.views.Header();
      header.setCssUtilityClass("md:flex md:shrink-0");
      header.setExcludeBoundsFromDom(true);
      header.setCssUtilityStyleClearAll(true);

      // TabView
      var tabs = new twindapp.views.TabView(header);
      tabs.setCssUtilityClass("md:flex md:grow md:overflow-hidden");
      tabs.setExcludeBoundsFromDom(true);
      tabs.setCssUtilityStyleClearAll(true);

      // Setup the app layout and add the views
      var dockLayout = new qx.ui.layout.Dock().set({sort: "x"});
      var doccomp = new qx.ui.container.Composite(dockLayout);
      doccomp.setCssUtilityClass("md:flex md:flex-col md:h-screen");
      doccomp.setCssUtilityStyleClearAll(true);
      doccomp.setExcludeBoundsFromDom(true);
      doccomp.add(header, { edge: "north" });
      doccomp.add(tabs, { edge: "center" });
      
      doc.add(doccomp); 
    }

  }
});
