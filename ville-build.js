#!/usr/bin/env node
/**
 * ville-build.js — Path B Multi-Vendor CSS & Single-File JS Bundler
 * (`STRAT-BUILD-05`, `STRAT-BUILD-06`, `STRAT-BUILD-07`, `STRAT-CSS-01`, `STRAT-CSS-03`, `STRAT-CSS-06`)
 *
 * Orchestrates:
 *  1. 3-Layer CSS Bundling via programmatic `lightningcss.bundle()` (with zero child-process overhead):
 *     - Layer 1 (Ville Browser Mechanics): `source/resource/ville/css/mechanics/{properties,popover,dialog,pwa-shell}.css`
 *     - Layer 2 (Active Vendor Theme Slices — 3-Vendor Triad):
 *       * `mantine`: Pruned against included `ville.ui.*` classes via `source/resource/ville/mantine-map.json`
 *       * `obsidian`: Pruned/ordered via `source/resource/ville/obsidian-map.json` (`source/resource/ville/css/vendors/obsidian/*.css`)
 *       * `shadcn`: Pruned/ordered via `source/resource/ville/shadcn-map.json` (`source/resource/ville/css/vendors/shadcn/*.css`)
 *     - Layer 3 (Application Overrides): `source/resource/<appName>/css/app.css`
 *     Outputs to `source/resource/<appName>/css/bundle.min.css` AND
 *     `compiled/<target>/resource/<appName>/css/bundle.min.css`.
 *
 *  2. Path B Single-File JS Bundle (`compiled/<target>/<appName>/ville-bundle.js`):
 *     - Concatenates baked-in `qx.$$environment` + `qx.$$libraries` + `qx.$$resources`
 *       + `source/resource/ville/core/ville-kernel.js` (~15 KB ES2025 kernel)
 *       + all active transpiled `ville.*` and `<appName>.*` classes (0 `qx.*` files!)
 *       + direct `ville.core.Init.ready()` startup.
 *     - Automatically minifies with `esbuild` when installed, or writes a clean
 *       zero-dependency ES2025 single-file bundle.
 */

const fs = require("fs");
const path = require("path");

let lightningcss = null;
try {
  lightningcss = require("lightningcss");
} catch (_) {
  // Fallback if lightningcss is not resolvable
}

let esbuild = null;
try {
  esbuild = require("esbuild");
} catch (_) {
  // Optional esbuild accelerator
}

/**
 * Resolves the map file and CSS directory for a given vendor (`mantine`, `obsidian`, `shadcn`).
 *
 * @param {string} cwd Working directory.
 * @param {string} cssEngine Vendor identifier (`"mantine"`, `"obsidian"`, `"shadcn"`).
 * @param {Object} options Optional overrides (`mapPath`, `stylesDir`).
 * @returns {{ mapPath: string, stylesRoot: string }}
 */
function resolveVendorPaths(cwd, cssEngine, options = {}) {
  if (cssEngine === "obsidian") {
    return {
      mapPath: path.resolve(cwd, options.mapPath || "source/resource/ville/obsidian-map.json"),
      stylesRoot: path.resolve(
        cwd,
        options.stylesDir || "source/resource/ville/css/vendors/obsidian"
      )
    };
  }

  if (cssEngine === "shadcn") {
    return {
      mapPath: path.resolve(cwd, options.mapPath || "source/resource/ville/shadcn-map.json"),
      stylesRoot: path.resolve(
        cwd,
        options.stylesDir || "source/resource/ville/css/vendors/shadcn"
      )
    };
  }

  // Default: "mantine"
  const localMantineDir = path.resolve(cwd, "source/resource/mantine/core/styles");
  const nodeModulesMantineDir = path.resolve(cwd, "node_modules/@mantine/core/styles");
  return {
    mapPath: path.resolve(cwd, options.mapPath || "source/resource/ville/mantine-map.json"),
    stylesRoot: options.stylesDir
      ? path.resolve(cwd, options.stylesDir)
      : fs.existsSync(localMantineDir)
      ? localMantineDir
      : nodeModulesMantineDir
  };
}

/**
 * Bundles the 3-Layer CSS and Path B single-file JS bundle for a Ville UI application.
 *
 * @param {Object} options Build options.
 * @param {string} [options.appName="villeuiapp"] Application name/namespace.
 * @param {"source"|"build"} [options.target="source"] Compilation target (`"source"` or `"build"`).
 * @param {string} [options.outputDir] Target output directory (defaults to `compiled/<target>`).
 * @param {string} [options.cssEngine="mantine"] Active CSS vendor (`"mantine"`, `"obsidian"`, `"shadcn"`).
 * @param {string} [options.stylesDir] Path to vendor CSS slice directory.
 * @param {string[]} [options.activeClasses] Optional explicit list of active class names.
 * @param {Object} [options.environment] Optional baked environment map.
 * @param {Object} [options.resources] Optional baked resources map.
 * @returns {{ cssBundlePath: string, jsBundlePath: string, includedCssSlices: string[], activeClassCount: number, cssEngine: string }}
 */
function bundleVilleApp(options = {}) {
  const cwd = process.cwd();
  const appName = options.appName || "villeuiapp";
  const target = options.target || "source";
  const outputDir = path.resolve(cwd, options.outputDir || path.join("compiled", target));
  const transpiledDir = path.join(outputDir, "transpiled");
  const appOutDir = path.join(outputDir, appName);
  const cssEngine = options.cssEngine || "mantine";

  // ---------------------------------------------------------------------------
  // 1. Discover Active `ville.*` and `<appName>.*` Classes
  // ---------------------------------------------------------------------------
  let activeClasses = Array.isArray(options.activeClasses) ? options.activeClasses.slice() : null;
  const indexJsPath = path.join(appOutDir, "index.js");

  if (!activeClasses && fs.existsSync(indexJsPath)) {
    const indexContent = fs.readFileSync(indexJsPath, "utf8");
    const found = [];
    const uriRegex = /"\.\.\/transpiled\/([^"?]+)\.js(?:\?[^"]*)?"/g;
    let match;
    while ((match = uriRegex.exec(indexContent)) !== null) {
      const clsName = match[1].replace(/\//g, ".");
      if (clsName !== "ville.core.Kernel" && !clsName.startsWith("qx.")) {
        found.push(clsName);
      }
    }
    if (found.length > 0) {
      activeClasses = found;
    }
  }

  if (!activeClasses) {
    activeClasses = [];
  }

  // ---------------------------------------------------------------------------
  // 2. 3-Layer CSS Bundling (`STRAT-CSS-01`, `STRAT-BUILD-05`, `STRAT-CSS-06`)
  // ---------------------------------------------------------------------------
  const importPaths = [];
  const includedCssSlices = [];

  // Layer 1: Ville UI Browser Mechanics (`source/resource/ville/css/mechanics/*.css`)
  const mechanicsDir = path.resolve(cwd, "source/resource/ville/css/mechanics");
  const mechanicsOrder = [
    "properties.css",
    "popover.css",
    "dialog.css",
    "pwa-shell.css"
  ];
  let loadedMechanics = false;
  if (fs.existsSync(mechanicsDir)) {
    for (const mechFile of mechanicsOrder) {
      const fullMechPath = path.join(mechanicsDir, mechFile);
      if (fs.existsSync(fullMechPath)) {
        importPaths.push(fullMechPath);
        includedCssSlices.push(`ville/css/mechanics/${mechFile}`);
        loadedMechanics = true;
      }
    }
  }
  if (!loadedMechanics) {
    const layer1MenuCss = path.resolve(cwd, "source/resource/ville/ville-menu.css");
    if (fs.existsSync(layer1MenuCss)) {
      importPaths.push(layer1MenuCss);
      includedCssSlices.push("ville/ville-menu.css");
    }
  }

  // Layer 2: Vendor Theme CSS Slices (`mantine`, `obsidian`, `shadcn`)
  const { mapPath, stylesRoot } = resolveVendorPaths(cwd, cssEngine, options);
  if (fs.existsSync(mapPath) && fs.existsSync(stylesRoot)) {
    const vendorMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    const activeSet = new Set(activeClasses);
    const requiredFiles = new Set();

    for (const [className, files] of Object.entries(vendorMap.map || {})) {
      const classFile = path.join(transpiledDir, className.replace(/\./g, "/") + ".js");
      const isIncluded =
        activeSet.size > 0 ? activeSet.has(className) : fs.existsSync(classFile);
      if (isIncluded) {
        if (Array.isArray(files)) {
          files.forEach((f) => requiredFiles.add(f));
        } else if (files) {
          requiredFiles.add(files);
        }
      }
    }

    const orderList = vendorMap.order || [];
    const sortedFiles = Array.from(requiredFiles).sort((a, b) => {
      const idxA = orderList.indexOf(a);
      const idxB = orderList.indexOf(b);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

    for (const file of sortedFiles) {
      const fullSlicePath = path.join(stylesRoot, file);
      if (fs.existsSync(fullSlicePath)) {
        importPaths.push(fullSlicePath);
        includedCssSlices.push(`${cssEngine}/${file}`);
      }
    }
  }

  // Layer 3: Application CSS Overrides (`source/resource/<appName>/css/app.css`)
  const appCssDir = path.resolve(cwd, "source/resource", appName, "css");
  const appCssFile = path.join(appCssDir, "app.css");
  if (fs.existsSync(appCssFile)) {
    importPaths.push(appCssFile);
    includedCssSlices.push(`${appName}/css/app.css`);
  }

  fs.mkdirSync(appCssDir, { recursive: true });
  const sourceCssBundlePath = path.join(appCssDir, "bundle.min.css");
  const tempCssEntry = path.join(cwd, `.temp-${appName}-entry.css`);
  const importStatements = importPaths
    .map((p) => `@import "${p.replace(/\\/g, "/")}";`)
    .join("\n");

  fs.writeFileSync(tempCssEntry, `${importStatements}\n`, "utf8");

  try {
    if (lightningcss && typeof lightningcss.bundle === "function") {
      const { code } = lightningcss.bundle({
        filename: tempCssEntry,
        minify: true
      });
      fs.writeFileSync(sourceCssBundlePath, code);
    } else {
      const rawCss = importPaths
        .map((p) => `/* ${path.basename(p)} */\n` + fs.readFileSync(p, "utf8"))
        .join("\n\n");
      fs.writeFileSync(sourceCssBundlePath, rawCss, "utf8");
    }
  } finally {
    if (fs.existsSync(tempCssEntry)) {
      fs.unlinkSync(tempCssEntry);
    }
  }

  // Sync bundle.min.css to `compiled/<target>/resource/<appName>/css/bundle.min.css`
  // and (for build target) `compiled/<target>/<appName>/resource/<appName>/css/bundle.min.css`
  const compiledCssDir = path.join(outputDir, "resource", appName, "css");
  fs.mkdirSync(compiledCssDir, { recursive: true });
  const compiledCssBundlePath = path.join(compiledCssDir, "bundle.min.css");
  fs.copyFileSync(sourceCssBundlePath, compiledCssBundlePath);

  if (target === "build") {
    const buildAppCssDir = path.join(appOutDir, "resource", appName, "css");
    fs.mkdirSync(buildAppCssDir, { recursive: true });
    fs.copyFileSync(
      sourceCssBundlePath,
      path.join(buildAppCssDir, "bundle.min.css")
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Path B Self-Contained Single-File JS Bundle (`ville-bundle.js`)
  // ---------------------------------------------------------------------------
  const kernelPath = path.resolve(cwd, "source/resource/ville/core/ville-kernel.js");
  let jsBundlePath = null;

  if (fs.existsSync(kernelPath) && activeClasses.length > 0 && fs.existsSync(appOutDir)) {
    const envMap = Object.assign(
      {
        "qx.application": `${appName}.Application`,
        "qx.theme": `${appName}.theme.Theme`,
        "qx.dynlocale": false,
        "qx.dyntheme": false,
        "ville.cssLayout": true,
        "ville.cssEngine": cssEngine,
        "ville.appType": "web",
        "ville.ssg": false
      },
      options.environment || {}
    );

    const resMap = options.resources || {};
    const chunks = [];

    chunks.push(
      `/* @villeui/core Path B Bundle — ${appName} [theme: ${cssEngine}] (${activeClasses.length} classes, 0 qx.* files) */`
    );
    chunks.push(`(function () {`);
    chunks.push(`  var g = typeof globalThis !== "undefined" ? globalThis : window;`);
    chunks.push(`  g.qx = g.qx || {};`);
    chunks.push(`  g.ville = g.ville || {};`);
    chunks.push(`  g.qx.$$environment = Object.assign(g.qx.$$environment || {}, ${JSON.stringify(envMap)});`);
    chunks.push(`  g.qx.$$resources = Object.assign(g.qx.$$resources || {}, ${JSON.stringify(resMap)});`);
    chunks.push(`})();`);

    // 1. Ville UI ES2025 Kernel (~15 KB)
    chunks.push(fs.readFileSync(kernelPath, "utf8"));

    // 2. Topologically ordered `ville.*` and `<appName>.*` transpiled classes
    for (const clsName of activeClasses) {
      const clsFile = path.join(transpiledDir, clsName.replace(/\./g, "/") + ".js");
      if (fs.existsSync(clsFile)) {
        const src = fs
          .readFileSync(clsFile, "utf8")
          .replace(/\/\/# sourceMappingURL=.*$/gm, "");
        chunks.push(`/* === ${clsName} === */\n${src}`);
      }
    }

    // 3. Direct BaseInit-style Startup (`ville.core.Init.ready()`)
    chunks.push(`(function () {
  var boot = function () {
    if (typeof ville !== "undefined" && ville.core && ville.core.Init) {
      ville.core.Init.ready();
    }
  };
  if (typeof document !== "undefined" && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();`);

    let bundleCode = chunks.join("\n\n");
    if (esbuild && (target === "build" || options.minify)) {
      const transformed = esbuild.transformSync(bundleCode, {
        minify: true,
        target: "es2022"
      });
      bundleCode = transformed.code;
    }

    jsBundlePath = path.join(appOutDir, "ville-bundle.js");
    fs.writeFileSync(jsBundlePath, bundleCode, "utf8");
  }

  return {
    cssBundlePath: sourceCssBundlePath,
    compiledCssBundlePath,
    jsBundlePath,
    includedCssSlices,
    activeClassCount: activeClasses.length,
    cssEngine
  };
}

// CLI Execution (`node ville-build.js --app-name=villeuiapp --target=source --css-engine=mantine|obsidian|shadcn`)
if (require.main === module) {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith("--")) {
      const [key, value] = arg.split("=");
      if (value !== undefined) {
        args[key] = value;
      } else if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith("--")) {
        args[key] = process.argv[++i];
      } else {
        args[key] = true;
      }
    }
  }

  const appName = args["--app-name"] || "villeuiapp";
  const target = args["--target"] || "source";
  const cssEngine = args["--css-engine"] || "mantine";
  const stylesDir = args["--styles-dir"];

  const result = bundleVilleApp({
    appName,
    target,
    cssEngine,
    stylesDir,
    minify: Boolean(args["--minify"] || target === "build")
  });

  console.log(
    `✅ [ville-build] 3-Layer CSS [${result.cssEngine}] bundled (${result.includedCssSlices.length} slices) -> ${path.relative(
      process.cwd(),
      result.cssBundlePath
    )}`
  );
  if (result.jsBundlePath) {
    console.log(
      `✅ [ville-build] Path B Single-File JS Bundle (${result.activeClassCount} classes, 0 qx.* files) -> ${path.relative(
        process.cwd(),
        result.jsBundlePath
      )}`
    );
  }
}

module.exports = {
  bundleVilleApp
};
