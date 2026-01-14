/**
 * This is the application class of a ville ui standalone app
 *
 * @external(mantine/core/styles/baseline.css)
 * @external(mantine/core/styles/default-css-variables.css)
 * @external(mantine/core/styles/global.css)
 * @require(ville.ui.root.Application)
 * @require(ville.cssuc.patch.MLayoutItem)
 * @require(ville.cssuc.patch.MWidget)
 * @require(ville.cssuc.patch.MLabel)
 * 
 */

qx.Class.define("ville.ui.application.Standalone", {
  extend: qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {

    main () {
        // Call super class
        super.main();

        qx.Class.patch(qx.ui.core.LayoutItem, ville.cssuc.patch.MLayoutItem);
        qx.Class.patch(qx.ui.core.Widget, ville.cssuc.patch.MWidget);
        qx.Class.patch(qx.html.Label, ville.cssuc.patch.MLabel);

    },

    // overridden
    _createRootWidget() {
      return new ville.ui.root.Application(document);
    }
  }
});
