const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFileSync } = require("child_process");

qx.Class.define("ville.compiler.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    async load() {
      // During load(), the CLI is still reading configuration and has not 
      // instantiated the Compile/Serve command yet.
      let data = await this.base(arguments);
      return data;
    },

    async afterCompile() {
      await this.base(arguments);

      // Now that compilation is running, the CLI has set the command property
      const command = this.getCommand();
      console.log(command);
      if (!command) {
        return;
      }

      const maker = command.getMaker();
      const analyser =
        typeof maker.getAnalyser === "function"
          ? maker.getAnalyser()
          : maker.getAnalyzer();
      const target = typeof maker.getTarget === "function" ? maker.getTarget() : null;
      const apps = maker.getApplications();

      for (const app of apps) {
        // Merge root, target, and app-specific environment settings
        const appEnv = Object.assign(
          {},
          typeof maker.getEnvironment === "function" ? maker.getEnvironment() : {},
          target && typeof target.getEnvironment === "function" ? target.getEnvironment() : {},
          typeof app.getEnvironment === "function" ? app.getEnvironment() : {}
        );

        if (appEnv["ville.cssEngine"] !== "mantine") {
          continue;
        }

        const appName = app.getName();
        qx.tool.compiler.Console.info(`ville.CssUtilityClasses: Processing Mantine bundle for '${appName}'...`);

        // 1. Identify compiled classes safely across Qooxdoo compiler versions
        let compiledClasses = [];
        if (typeof app.getRequiredClasses === "function" && app.getRequiredClasses()) {
          compiledClasses = app.getRequiredClasses();
        } else if (analyser && typeof analyser.getClasses === "function") {
          compiledClasses = analyser.getClasses().map(cls =>
            typeof cls === "string" ? cls : cls.getName()
          );
        } else if (analyser && typeof analyser.getDatabase === "function") {
          compiledClasses = Object.keys(analyser.getDatabase().classInfo || {});
        }

        // 2. Load mantine-map.json
        const mapPath = path.join(process.cwd(), "source", "resource", "ville", "mantine-map.json");
        if (!fs.existsSync(mapPath)) {
          qx.tool.compiler.Console.warn(`[${appName}] mantine-map.json missing at ${mapPath}`);
          continue;
        }
        const staticMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));

        // 3. Collect all required CSS files (unique set)
        const requiredStyleFiles = new Set();
        compiledClasses.forEach(className => {
          if (staticMap.map && staticMap.map[className]) {
            staticMap.map[className].forEach(cssFile => {
              requiredStyleFiles.add(cssFile);
            });
          }
        });

        // 4. Sort the collected files based on the "order" array in mantine-map.json
        const orderList = Array.isArray(staticMap.order) ? staticMap.order : [];
        const sortedStyleFiles = Array.from(requiredStyleFiles).sort((a, b) => {
          const indexA = orderList.indexOf(a);
          const indexB = orderList.indexOf(b);

          const finalIndexA = indexA === -1 ? 999 : indexA;
          const finalIndexB = indexB === -1 ? 999 : indexB;

          return finalIndexA - finalIndexB;
        });

        // 5. Build @import list using node_modules path
        const mantineStylesPath = path.join(process.cwd(), "node_modules", "@mantine", "core", "styles");
        const importLines = sortedStyleFiles.map(cssFile => {
          const fullPath = path.join(mantineStylesPath, cssFile);
          if (fs.existsSync(fullPath)) {
            return `@import "${fullPath}";`;
          }
          qx.tool.compiler.Console.warn(`[${appName}] Style file not found: ${fullPath}`);
          return null;
        }).filter(line => line !== null);

        // 6. Read the application's base app.css
        const appCssDir = path.join(process.cwd(), "source", "resource", appName, "css");
        fs.mkdirSync(appCssDir, { recursive: true });

        const appCssPath = path.join(appCssDir, "app.css");
        let appCssContent = "";
        if (fs.existsSync(appCssPath)) {
          appCssContent = fs.readFileSync(appCssPath, "utf8");
        }

        // 7. Combine and Bundle (Watch-Safe)
        const combinedContent = importLines.join("\n") + "\n\n" + appCssContent;
        const tempEntry = path.join(os.tmpdir(), `temp-${appName}-entry.css`);
        const tempOut = path.join(os.tmpdir(), `temp-${appName}-bundle.min.css`);
        const outputFile = path.join(appCssDir, "bundle.min.css");

        fs.writeFileSync(tempEntry, combinedContent);

        try {
          execFileSync(
            "npx",
            [
              "lightningcss",
              "--bundle",
              "--minify",
              "--targets", ">= 0.25%",
              tempEntry,
              "-o", tempOut
            ],
            { cwd: process.cwd(), stdio: "pipe" }
          );

          const newBundle = fs.readFileSync(tempOut);
          const existingBundle = fs.existsSync(outputFile) ? fs.readFileSync(outputFile) : null;

          // Only write to source/resource if the bundle content changed to avoid re-triggering `qx serve` watcher
          if (!existingBundle || !newBundle.equals(existingBundle)) {
            fs.writeFileSync(outputFile, newBundle);
            qx.tool.compiler.Console.info(`[${appName}] Bundle updated with ${importLines.length} imports.`);
          } else {
            qx.tool.compiler.Console.info(`[${appName}] Bundle unchanged (${importLines.length} imports).`);
          }

          // Copy directly into the compiled target resource folder so it's immediately available
          if (target && typeof target.getOutputDir === "function") {
            const targetCssDir = path.join(target.getOutputDir(), "resource", appName, "css");
            fs.mkdirSync(targetCssDir, { recursive: true });
            fs.writeFileSync(path.join(targetCssDir, "bundle.min.css"), newBundle);
          }
        } catch (err) {
          const stderr = err.stderr ? err.stderr.toString() : err.message;
          qx.tool.compiler.Console.error(`[${appName}] lightningcss failed: ${stderr}`);
        } finally {
          if (fs.existsSync(tempEntry)) fs.unlinkSync(tempEntry);
          if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
        }
      }
    }
  }
});

module.exports = {
  CompilerApi: ville.compiler.CompilerApi
};