/* ************************************************************************

   Copyright: 2025 

   License: MIT license

   Authors: sqville

************************************************************************ */

/**
 * This is the main application class of "villeui"
 *
 * @ignore(IntersectionObserver)
 * @external(villeui/css/villeui-priority.css)
 * @asset(villeui/images/villeui_logo.png)
 * @asset(villeui/images/villeui_logo.svg)
 * @asset(villeui/images/ville_logo.png)
 * @asset(villeui/images/QxCSS_example_01.png)
 * @require(ville.cssuc.MLayoutItem)
 * @require(ville.cssuc.MCssUtilityClassCombined)
 * @require(ville.cssuc.patch.MAbstractField)
 * @require(ville.cssuc.patch.MLabel)
 * 
 */
qx.Class.define("villeui.Application",
{
  extend : qx.application.Inline,

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

      if (qx.core.Environment.get("ville.cssuc")) {
        qx.Class.include(qx.ui.core.LayoutItem, ville.cssuc.MLayoutItem);
        qx.Class.include(qx.ui.core.Widget, ville.cssuc.MCssUtilityClassCombined);
        qx.Class.patch(qx.html.Label, ville.cssuc.patch.MLabel);
        qx.Class.patch(qx.ui.form.AbstractField, ville.cssuc.patch.MAbstractField);
      }

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

      var isleWidgetBrowser = new qx.ui.root.Inline(
        document.getElementById("isleWidgetBrowser"),
        true,
        false
      );
      isleWidgetBrowser.setLayout(new qx.ui.layout.Canvas());
      isleWidgetBrowser.add(new villeui.WidgetBrowserInline(), {
        edge: 0,
      });

      /*mainWidgetBrowserTitle.addListenerOnce("appear", () => {
        // Select the element you want to observe
        const targetElement = mainWidgetBrowserTitle.getContentElement().getDomElement();

        // Set options (optional)
        const options = {
          root: null, // use the viewport as the root
          rootMargin: '0px', // no margin around the root
          threshold: 0.5 // trigger when 50% of the element is visible
        };

        // Create the observer
        const observer = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            // entry.isIntersecting is true if the element is currently in the viewport
            if (entry.isIntersecting) {
              // Perform your action here (e.g., start animation, load data)
              qx.io.PartLoader.require(["WidgetBrowser"],() => {
                var mainWidgetBrowser = new villeui.WidgetBrowser();
                mainWidgetBrowserroot.add(mainWidgetBrowser);
                mainWidgetBrowser.addListenerOnce("appear", () => {
                  var elemDims = qx.bom.element.Dimension.getSize(appShell.getContentElement().getDomElement());
                  appShell.setUserBounds(appShell.getBounds().left, appShell.getBounds().top, appShell.getBounds().width, elemDims.height);
                });
              });
              // Optional: Stop observing the element after the action fires once
              observer.unobserve(entry.target);
            }
          });
        }, options);

        // Start observing the target element
        observer.observe(targetElement);
      });*/

      /* ::: End of Widget Browser ::: */


    }

    // overridden
    /*finalize () {
      // load the last css bundle to make it have highest priority
      qx.bom.Stylesheet.includeFile(qx.util.ResourceManager.getInstance().toUri("villeui/css/villeui-priority.css"));
      this.render();
    }*/

  }

});
