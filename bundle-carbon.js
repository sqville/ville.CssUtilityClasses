const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  appName: process.argv[2] || 'carbonapp',
  mode: process.argv[3] || 'source',
  mapPath: 'source/resource/ville/carbon-map.json',
  carbonRoot: path.join('node_modules', '@carbon', 'styles')
};

CONFIG.transpiledPath = CONFIG.mode === 'build' 
  ? 'compiled/build/transpiled' 
  : 'compiled/source/transpiled';

if (!fs.existsSync(CONFIG.mapPath)) {
  console.error(`❌ Error: Map file not found at ${CONFIG.mapPath}`);
  process.exit(1);
}
const carbonMap = JSON.parse(fs.readFileSync(CONFIG.mapPath, 'utf8'));

// 1. Identify compiled ville.ui classes
const includedClasses = [];
Object.keys(carbonMap.map).forEach(className => {
  const classFilePath = className.replace(/\./g, '/') + '.js';
  const fullPath = path.join(CONFIG.transpiledPath, classFilePath);
  if (fs.existsSync(fullPath)) {
    includedClasses.push(className);
  }
});

if (includedClasses.length === 0) {
  console.log('⚠️ No ville.ui classes found in transpiled output. Skipping bundle.');
  process.exit(0);
}

// 2. Deduplicate SCSS modules
const requiredModules = new Set();
// Always include Carbon core foundations
requiredModules.add('scss/reset');
requiredModules.add('scss/theme');

includedClasses.forEach(cls => {
  const modules = carbonMap.map[cls];
  if (Array.isArray(modules)) {
    modules.forEach(m => requiredModules.add(m));
  } else {
    requiredModules.add(modules);
  }
});

// 3. Sort according to cascade order
const sortedModules = Array.from(requiredModules).sort((a, b) => {
  const idxA = carbonMap.order.indexOf(a);
  const idxB = carbonMap.order.indexOf(b);
  const finalA = idxA === -1 ? 999 : idxA;
  const finalB = idxB === -1 ? 999 : idxB;
  return finalA - finalB;
});

// 4. Generate Sass @use statements
const useLines = sortedModules.map(mod => `@use "@carbon/styles/${mod}";`);

// 5. Read optional app.scss or app.css
const appCssDir = path.join('source', 'resource', CONFIG.appName, 'css');
const appScssFile = path.join(appCssDir, 'app.scss');
const appCssContent = fs.existsSync(appScssFile) ? fs.readFileSync(appScssFile, 'utf8') : '';

// 6. Write temporary SCSS entry
const tempScssEntry = path.join(process.cwd(), '.temp-carbon-entry.scss');
const tempCompiledCss = path.join(process.cwd(), '.temp-carbon-compiled.css');
const outputBundle = path.join(appCssDir, 'bundle.min.css');

fs.writeFileSync(tempScssEntry, `${useLines.join('\n')}\n\n${appCssContent}`);

try {
  // Step A: Compile SCSS with Dart Sass (resolving node_modules load-paths)
  execSync(`npx sass --load-path=node_modules "${tempScssEntry}" "${tempCompiledCss}" --no-source-map`, {
    stdio: 'inherit'
  });

  // Step B: Minify & finalize with LightningCSS
  execSync(`npx lightningcss --bundle --minify --targets ">= 0.25%" "${tempCompiledCss}" -o "${outputBundle}"`, {
    stdio: 'inherit'
  });

  // Step C: Build Target Sync (for production builds)
  if (CONFIG.mode === 'build') {
    const targetDir = path.join('compiled', 'build', 'resource', CONFIG.appName, 'css');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(outputBundle, path.join(targetDir, 'bundle.min.css'));
  }

  console.log(`✅ Success! Carbon bundle saved to: ${outputBundle}`);
} finally {
  if (fs.existsSync(tempScssEntry)) fs.unlinkSync(tempScssEntry);
  if (fs.existsSync(tempCompiledCss)) fs.unlinkSync(tempCompiledCss);
}
