/**
 * This is the application class of a ville ui standalone app
 *
 * 
 */

qx.Class.define("ville.ui.application.Adapted", {
  extend: qx.application.Standalone,

  environment: {
    "ville.cssLayout" : true
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {

    main () {
        
        qx.Class.patch(qx.ui.core.LayoutItem, ville.cssuc.patch.MLayoutItem);
        qx.Class.patch(qx.ui.core.queue.Layout, ville.cssuc.patch.MLayoutQueue);
        qx.Class.patch(qx.ui.core.Widget, ville.cssuc.patch.MWidget);
        qx.Class.patch(qx.ui.basic.Atom, ville.cssuc.patch.basic.MAtom);
        qx.Class.patch(qx.html.Label, ville.cssuc.patch.MLabel);
        qx.Class.patch(qx.ui.form.Button, ville.cssuc.patch.form.MButton);
        qx.Class.patch(qx.ui.form.ToggleButton, ville.cssuc.patch.form.MToggleButton);

        if (qx.core.Environment.get("ville.cssEngine") == "mantine")
        {
          /**  
           * include/patch base classes with cssEngine specific attributes
           * */

          // qx.Class.include(ville.ui.form.Button, ville.cssuc.MButton);
          qx.Class.include(ville.ui.form.MenuButton, ville.cssuc.MButton);
          /*qx.Class.include(ville.ui.form.ToggleActionIcon, ville.cssuc.theme.mantine.include.MToggleActionIcon);
          qx.Class.include(ville.ui.form.Button, ville.cssuc.theme.mantine.include.MButton);
          qx.Class.include(ville.ui.form.MenuButton, ville.cssuc.theme.mantine.include.MButton);
          qx.Class.include(ville.ui.menu.Menu, ville.cssuc.theme.mantine.include.MMenu);
          qx.Class.include(ville.ui.overlay.Affix, ville.cssuc.theme.mantine.include.MAffix);*/
        }

        // CSS Rule for all Popupover API
        var rules = [
          "margin: 0;",
          "inset: auto;",
          "position-area: var(--ville-popover-position-area, bottom center);",
          "position-try-fallbacks: var(--ville-popover-position-try-fallbacks, flip-block);",
          "position-try-order: var(--ville-popover-position-try-order, most-height);"
        ];
        var cssstr = rules.join(' ');
        qx.ui.style.Stylesheet.getInstance().addRule(".ville-popover", cssstr);

        // Call super class
        super.main();

    },

    // overridden
    _createRootWidget() {
      var rootwidget = new ville.ui.root.Application(document);
      return rootwidget;
    }

  }
});