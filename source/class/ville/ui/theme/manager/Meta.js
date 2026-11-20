/**
 * Manager for ville.ui meta themes
 */
qx.Class.define("ville.ui.theme.manager.Meta", {
  type: "singleton",
  extend: qx.core.Object,

  properties: {
    /**
     * Meta theme. Applies the defined themes to
     * the corresponding managers.
     */
    theme: {
      check: "Theme",
      nullable: false,
      apply: "_applyTheme"
    }
  },

  members: {

    // property apply
    _applyTheme(value, old) {

      const appearanceMgr = qx.theme.manager.Appearance.getInstance();
      appearanceMgr.setTheme(value.meta.appearance);

    },

    /**
     * Initialize the themes which were selected using the settings. Should only
     * be called from qooxdoo based application.
     */
    initialize() {
      var env = qx.core.Environment;
      var theme, obj;

      theme = env.get("qx.theme");
      if (theme) {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The appearance theme to use is not available: " + theme);
        }

        this.setTheme(obj);
      }

    }

  }

});
