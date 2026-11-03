const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * CONFIGURATION
 * Edit these if your folder structure differs
 */
const CONFIG = {
  appName: 'qx_app', // Default app name, can be overridden via CLI
  transpiledPath: 'compiled/source/transpiled', // Default to source target
  mapPath: 'source/resource/ville/mantine-map.json',
  mantineStylesDir: path.join('node_modules', '@mantine', 'core', 'styles')
};

// --- CLI Argument Handling ---
const args = process.argv.slice(2);
if (args[0]) CONFIG.appName = args[0];
if (args[1] === 'build') CONFIG.transpiledPath = 'compiled/build/transpiled';

console.log(`🚀 Starting Mantine Bundler for [${CONFIG.appName}] (${args[1] || 'source'} mode)...`);

// --- 1. Load mantine-map.json ---
if (!fs.existsSync(CONFIG.mapPath)) {
  console.error(`❌ Error: Map file not found at ${CONFIG.mapPath}`);
  process.exit(1);
}
const mantineMap = JSON.parse(fs.readFileSync(CONFIG.mapPath, 'utf8'));

// --- 2. Determine which ville.ui classes were compiled ---
const includedClasses = [];
Object.keys(mantineMap.map).forEach(className => {
  // Convert "ville.ui.form.Button" to "ville/ui/form/Button.js"
  const classFilePath = className.replace(/\./g, '/') + '.js';
  const fullPath = path.join(CONFIG.transpiledPath, classFilePath);
  
  if (fs.existsSync(fullPath)) {
    includedClasses.push(className);
  }
});

if (includedClasses.length === 0) {
  console.log('⚠️ No ville.ui classes found in the transpiled output. Skipping bundle.');
  process.exit(0);
}

// --- 3. Deduplication: Collect unique CSS files ---
const requiredStyles = new Set();
includedClasses.forEach(cls => {
  const styles = mantineMap.map[cls];
  if (Array.isArray(styles)) {
    styles.forEach(s => requiredStyles.add(s));
  } else {
    requiredStyles.add(styles);
  }
});

// --- 4. Explicit Cascade Control: Sort styles ---
const sortedStyles = Array.from(requiredStyles).sort((a, b) => {
  const indexA = mantineMap.order.indexOf(a);
  const indexB = mantineMap.order.indexOf(b);
  
  const finalA = indexA === -1 ? 999 : indexA;
  const finalB = indexB === -1 ? 999 : indexB;
  
  return finalA - finalB;
});

// --- 5. Generate @import statements ---
const importLines = sortedStyles.map(cssFile => {
  const absoluteMantinePath = path.resolve(CONFIG.mantineStylesDir, cssFile);
  if (!fs.existsSync(absoluteMantinePath)) {
    console.warn(`🚨 Warning: Mantine style not found in node_modules: ${cssFile}`);
    return null;
  }
  // We use absolute paths to ensure lightningcss finds them regardless of entry file location
  return `@import "${absoluteMantinePath}";`;
}).filter(Boolean);

// --- 6. Read existing app.css ---
const appCssDir = path.join('source', 'resource', CONFIG.appName, 'css');
const appCssFile = path.join(appCssDir, 'app.css');
let appCssContent = '';

if (fs.existsSync(appCssFile)) {
  appCssContent = fs.readFileSync(appCssFile, 'utf8');
} else {
  console.warn(`🚨 Warning: app.css not found at ${appCssFile}. Creating bundle from scratch.`);
}

// --- 7. Create Temporary Entry and Bundle ---
const tempEntry = path.join(process.cwd(), '.temp-bundle-entry.css');
const outputBundle = path.join(appCssDir, 'bundle.min.css');

const finalContent = `${importLines.join('\n')}\n\n/* Application Styles */\n${appCssContent}`;
fs.writeFileSync(tempEntry, finalContent);

try {
  console.log(`📦 Bundling ${importLines.length} Mantine styles + app.css...`);
  
  // Execute lightningcss
  // Note: ensure lightningcss is installed (npm install -g lightningcss or in project)
  execSync(`npx lightningcss --bundle --minify --targets ">= 0.25%" "${tempEntry}" -o "${outputBundle}"`, {
    stdio: 'inherit'
  });

  console.log(`✅ Success! Minified bundle saved to: ${outputBundle}`);
} catch (err) {
  console.error('❌ Error executing lightningcss:', err.message);
} finally {
  if (fs.existsSync(tempEntry)) fs.unlinkSync(tempEntry);
}