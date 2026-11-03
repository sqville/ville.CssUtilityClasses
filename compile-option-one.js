const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

qx.Class.define("ville.compiler.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    async load() {
      // 1. Use this.base(arguments) in un-transpiled Node scripts
      let data = await this.base(arguments);

      // 2. Use instanceof so this triggers on BOTH `qx compile` and `qx serve`
      let command = this.getCommand();
      if (command instanceof qx.tool.cli.commands.Compile) {
        // 3. Listen to "writingApplications" (or "made") instead of "afterCompile"
        command.addListener("writingApplications", this._onBuildMantineCss, this);
      }

      return data;
    },

    async _onBuildMantineCss() {
      const command = this.getCommand();
      const maker = command.getMaker();
      // 4. British spelling: getAnalyser() with an 's'
      const analyser = maker.getAnalyser();
      const target = maker.getTarget();
      const apps = maker.getApplications();

      for (const app of apps) {
        // 5. Merge root, target, and app environments
        const appEnv = Object.assign(
          {},
          maker.getEnvironment ? maker.getEnvironment() : {},
          target && target.getEnvironment ? target.getEnvironment() : {},
          app.getEnvironment ? app.getEnvironment() : {}
        );

        if (appEnv["ville.cssEngine"] !== "mantine") {
          continue;
        }

        const appName = app.getName();
        qx.tool.compiler.Console.info(`ville.CssUtilityClasses: Processing Mantine bundle for '${appName}'...`);

        // 6. Retrieve compiled class names for this app
        const compiledClasses =
          (typeof app.getRequiredClasses === "function" && app.getRequiredClasses()) ||
          Object.keys(analyser.getDatabase().classInfo || {});

        // Load mantine-map.json
        const mapPath = path.join(process.cwd(), "source", "resource", "ville", "mantine-map.json");
        if (!fs.existsSync(mapPath)) {
          qx.tool.compiler.Console.warn(`[${appName}] mantine-map.json missing at ${mapPath}`);
          continue;
        }
        const staticMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));

        // Collect all required CSS files (unique set)
        const requiredStyleFiles = new Set();
        compiledClasses.forEach(className => {
          if (staticMap.map && staticMap.map[className]) {
            staticMap.map[className].forEach(cssFile => {
              requiredStyleFiles.add(cssFile);
            });
          }
        });

        // Sort the collected files based on the "order" array in mantine-map.json
        const orderList = Array.isArray(staticMap.order) ? staticMap.order : [];
        const sortedStyleFiles = Array.from(requiredStyleFiles).sort((a, b) => {
          const indexA = orderList.indexOf(a);
          const indexB = orderList.indexOf(b);

          const finalIndexA = indexA === -1 ? 999 : indexA;
          const finalIndexB = indexB === -1 ? 999 : indexB;

          return finalIndexA - finalIndexB;
        });

        // Build @import list using node_modules path
        const mantineStylesPath = path.join(process.cwd(), "node_modules", "@mantine", "core", "styles");
        const importLines = sortedStyleFiles.map(cssFile => {
          const fullPath = path.join(mantineStylesPath, cssFile);
          if (fs.existsSync(fullPath)) {
            return `@import "${fullPath}";`;
          }
          qx.tool.compiler.Console.warn(`[${appName}] Style file not found: ${fullPath}`);
          return null;
        }).filter(line => line !== null);

        // Read the application's base app.css
        const appCssDir = path.join(process.cwd(), "source", "resource", appName, "css");
        fs.mkdirSync(appCssDir, { recursive: true });

        const appCssPath = path.join(appCssDir, "app.css");
        let appCssContent = "";
        if (fs.existsSync(appCssPath)) {
          appCssContent = fs.readFileSync(appCssPath, "utf8");
        }

        // Combine and Bundle
        const combinedContent = importLines.join("\n") + "\n\n" + appCssContent;
        const tempEntry = path.join(process.cwd(), `temp-${appName}-entry.css`);
        const outputFile = path.join(appCssDir, "bundle.min.css");

        fs.writeFileSync(tempEntry, combinedContent);

        try {
          // 7. Use Node's native execFileSync to run lightningcss reliably
          execFileSync(
            "npx",
            [
              "lightningcss",
              "--bundle",
              "--minify",
              "--targets", ">= 0.25%",
              tempEntry,
              "-o", outputFile
            ],
            { cwd: process.cwd(), stdio: "pipe" }
          );
          qx.tool.compiler.Console.info(`[${appName}] Bundle created with ${importLines.length} imports.`);
        } catch (err) {
          const stderr = err.stderr ? err.stderr.toString() : err.message;
          qx.tool.compiler.Console.error(`[${appName}] lightningcss failed: ${stderr}`);
        } finally {
          if (fs.existsSync(tempEntry)) {
            fs.unlinkSync(tempEntry);
          }
        }
      }
    }
  }
});

module.exports = {
  CompilerApi: ville.compiler.CompilerApi
};