const fs = require("fs");
const path = require("path");
const { bundleVilleApp } = require("./ville-build");

qx.Class.define("ville.compiler.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    afterCommandLoaded(command) {
      if (command instanceof qx.tool.cli.commands.Compile) {
        command.addListener("writingApplication", this._onWritingApplication, this);
        command.addListener("writtenApplication", this._onWrittenApplication, this);
      }
    },

    /**
     * Checks whether the current application is a standalone Path B (`ville.ui.*`)
     * application (has `ville.cssLayout: true` and does not include Mode 1/2 `ville.cssuc.patch.*`).
     */
    _isPathBApplication(app, appMeta) {
      if (!app || !appMeta) {
        return false;
      }
      const isCssLayout = Boolean(appMeta.getEnvironmentValue("ville.cssLayout"));
      if (!isCssLayout) {
        return false;
      }
      const includes = app.getInclude ? app.getInclude() || [] : [];
      const hasHybridPatch = includes.some((inc) => inc.startsWith("ville.cssuc.patch."));
      return !hasHybridPatch;
    },

    _onWritingApplication(evt) {
      const { appMeta } = evt.getData();
      if (!appMeta) {
        return;
      }

      const app = appMeta.getApplication();
      const target = appMeta.getTarget();
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
      const packages = appMeta.getPackages();
      const bootPkg = packages[0];
      if (!bootPkg) {
        return;
      }

      const isPathB = this._isPathBApplication(app, appMeta);

      // 1. Strip PolyfillJs, empty Browserify, and (for Path B apps) all @qooxdoo/framework qx.* files
      //    across ALL packages (boot package-0 AND lazy-loaded Part packages package-1..N)
      let removedQxCount = 0;
      for (const pkg of packages) {
        const jsMetas = pkg.getJavascriptMetas().slice();
        for (const meta of jsMetas) {
          if (skipBrowserify && meta instanceof qx.tool.compiler.targets.meta.Browserify) {
            pkg.removeJavascriptMeta(meta);
          } else if (meta instanceof qx.tool.compiler.targets.meta.PolyfillJs) {
            pkg.removeJavascriptMeta(meta);
          } else if (isPathB && meta instanceof qx.tool.compiler.targets.meta.Javascript) {
            const fileNorm = String(meta.getFilename() || "").replace(/\\/g, "/");
            if (fileNorm.includes("/transpiled/qx/") || fileNorm.startsWith("transpiled/qx/")) {
              pkg.removeJavascriptMeta(meta);
              removedQxCount++;
            }
          }
        }

        if (isPathB) {
          const pkgClassnames = pkg.getClassnames();
          if (Array.isArray(pkgClassnames)) {
            for (let i = pkgClassnames.length - 1; i >= 0; i--) {
              if (pkgClassnames[i].startsWith("qx.")) {
                pkgClassnames.splice(i, 1);
              }
            }
          }
        }
      }

      if (!isPathB) {
        return;
      }

      // 2. Inject `ville-kernel.js` (~15 KB Vanilla ES2025 Kernel) at index 0 of bootPkg
      const kernelSourcePath = path.resolve(
        process.cwd(),
        "source/resource/ville/core/ville-kernel.js"
      );
      const kernelTranspiledPath = path.join(
        target.getOutputDir(),
        "transpiled/ville/core/Kernel.js"
      );

      if (fs.existsSync(kernelSourcePath)) {
        fs.mkdirSync(path.dirname(kernelTranspiledPath), { recursive: true });
        fs.copyFileSync(kernelSourcePath, kernelTranspiledPath);

        const kernelMeta = new qx.tool.compiler.targets.meta.Javascript(
          appMeta,
          kernelTranspiledPath,
          kernelSourcePath
        );
        bootPkg.getJavascriptMetas().unshift(kernelMeta);

        const bootClassnames = bootPkg.getClassnames();
        if (Array.isArray(bootClassnames)) {
          bootClassnames.unshift("ville.core.Kernel");
        }
      }

      // 3. Strip 18 KB CLDR locale data across all packages when qx.dynlocale is false (native Intl used instead)
      if (appMeta.getEnvironmentValue("qx.dynlocale") === false) {
        for (const pkg of packages) {
          const locales = pkg.getLocales();
          if (locales && typeof locales === "object") {
            for (const k of Object.keys(locales)) {
              delete locales[k];
            }
          }
          const translations = pkg.getTranslations();
          if (translations && typeof translations === "object") {
            for (const k of Object.keys(translations)) {
              delete translations[k];
            }
          }
        }
      }

      // 4. Deduplicate `ville-menu.css` from cssBefore (bundled into Layer 1 of bundle.min.css)
      const preloads = appMeta.getPreloads && appMeta.getPreloads();
      if (preloads && Array.isArray(preloads.cssBefore)) {
        preloads.cssBefore = preloads.cssBefore.filter(
          (uri) => !String(uri).endsWith("ville/ville-menu.css")
        );
      }

      qx.tool.compiler.Console.info(
        `[${app.getName()}] Path B Kernel active: replaced ${removedQxCount} @qooxdoo/framework qx.* files across ${packages.length} package(s) with ville/core/Kernel.js (0 qx.* files in bundle).`
      );
    },

    _onWrittenApplication(evt) {
      const { appMeta } = evt.getData();
      if (!appMeta) {
        return;
      }
      const app = appMeta.getApplication();
      const target = appMeta.getTarget();
      if (!this._isPathBApplication(app, appMeta)) {
        return;
      }

      const appName = app.getName();
      const targetType = target.getType ? target.getType() : "source";
      const outputDir = target.getOutputDir();
      const cssEngine = appMeta.getEnvironmentValue("ville.cssEngine") || "mantine";
      const packages = appMeta.getPackages();

      // Collect active classes and asset resources across all packages (boot + lazy parts)
      const activeClasses = [];
      const seenClasses = new Set();
      const resMap = {};

      for (const pkg of packages) {
        const pkgClasses = pkg.getClassnames ? pkg.getClassnames() : [];
        for (const c of pkgClasses) {
          if (c !== "ville.core.Kernel" && !c.startsWith("qx.") && !seenClasses.has(c)) {
            seenClasses.add(c);
            activeClasses.push(c);
          }
        }

        if (typeof pkg.getAssets === "function") {
          for (const asset of pkg.getAssets()) {
            const info =
              (typeof asset.getFileInfo === "function" && asset.getFileInfo()) || {};
            const ext = path.extname(asset.getFilename()).replace(/^\./, "") || null;
            const libNs =
              typeof asset.getLibrary === "function" && asset.getLibrary()
                ? asset.getLibrary().getNamespace()
                : null;
            resMap[asset.getFilename()] = [
              info.width !== undefined ? info.width : null,
              info.height !== undefined ? info.height : null,
              info.format || ext,
              libNs
            ];
          }
        }
      }

      const env = appMeta.getEnvironment();
      const result = bundleVilleApp({
        appName,
        target: targetType,
        outputDir,
        cssEngine,
        activeClasses,
        environment: env,
        resources: resMap
      });

      qx.tool.compiler.Console.info(
        `[${appName}] Bundled 3-Layer CSS (${result.includedCssSlices.length} slices, prune=${result.pruneCss}, allThemes=${result.bundleAllThemes} -> ${result.emittedThemeBundles.join(
          ", "
        )}) & single-file JS bundle (${result.activeClassCount} classes).`
      );
    }
  }
});

module.exports = {
  CompilerApi: ville.compiler.CompilerApi
};
