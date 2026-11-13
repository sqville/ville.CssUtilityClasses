/**
 * 
 * @asset(villeuiapp/images/*)
 *
 * @external(villeuiapp/css/bundle.min.css)
 */
qx.Class.define("villeuiapp.Application",
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

      const icon = new ville.ui.icon.fluent.Airplane();

      const btn = new ville.ui.form.Button("Execute Me", icon);

      // Application listening directly to framework custom event
      btn.addListener("execute", () => {
        btn.setLabel("Executed!");
        btn.setEnabled(false);
      });

      // Application listening directly to native pointer event on the widget
      btn.addListener("pointerover", () => {
        console.log("Hovering button directly via widget API");
      });

      this.getRoot().add(btn);


      // 3. Wrap and inject
      //const adapterBridge = new ville.ui.core.Adapter(btn);
      //legacyContainer.add(adapterBridge);

    }

  }
});
