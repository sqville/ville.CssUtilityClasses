qx.Class.define("ville.compiler.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    afterCommandLoaded(command) {
      if (command instanceof qx.tool.cli.commands.Compile) {
        command.addListener("writingApplication", this._onWritingApplication, this);
      }
    },

    _onWritingApplication(evt) {
      const { appMeta } = evt.getData();
      if (!appMeta) {
        return;
      }

      const app = appMeta.getApplication();
      const analyser = appMeta.getAnalyser();
      const db = analyser ? analyser.getDatabase() : null;
      const classInfo = (db && db.classInfo) || {};
      const localModules = (app && app.getLocalModules()) || {};
      const hasLocalModules = Object.keys(localModules).length > 0;

      // Collect CommonJS modules, ignoring qx.util.Uuid's Node-only require("crypto") fallback
      const realCommonjsModules = new Set();
      for (const className of Object.keys(classInfo)) {
        const mods = classInfo[className] && classInfo[className].commonjsModules;
        if (!mods) {
          continue;
        }
        for (const modName of Object.keys(mods)) {
          if (modName === "crypto" && className === "qx.util.Uuid") {
            continue;
          }
          if (!(modName in localModules)) {
            realCommonjsModules.add(modName);
          }
        }
      }

      const skipBrowserify = realCommonjsModules.size === 0 && !hasLocalModules;
      const bootPkg = appMeta.getPackages()[0];
      if (!bootPkg) {
        return;
      }

      const jsMetas = bootPkg.getJavascriptMetas().slice();
      for (const meta of jsMetas) {
        if (skipBrowserify && meta instanceof qx.tool.compiler.targets.meta.Browserify) {
          bootPkg.removeJavascriptMeta(meta);
          qx.tool.compiler.Console.info(
            `[${app.getName()}] Skipped empty Browserify bundle (only qx.util.Uuid crypto fallback detected).`
          );
        } else if (meta instanceof qx.tool.compiler.targets.meta.PolyfillJs) {
          bootPkg.removeJavascriptMeta(meta);
          qx.tool.compiler.Console.info(
            `[${app.getName()}] Skipped legacy PolyfillJs bundle (evergreen browser target).`
          );
        }
      }
    }
  }
});

module.exports = {
  CompilerApi: ville.compiler.CompilerApi
};
