const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Parse Named Arguments
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith('--')) {
    const [key, value] = arg.split('=');
    if (value !== undefined) {
      args[key] = value;
    } else if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith('--')) {
      args[key] = process.argv[++i];
    } else {
      args[key] = true;
    }
  }
}

// 2. Process Configuration Configuration
const CONFIG = {
  appName: args['--app-name'] || 'myapp',
  mode: args['--target'] || 'source',
  mantineRoot: args['--styles-dir']
    ? path.resolve(args['--styles-dir'])
    : path.join('node_modules', '@mantine', 'core', 'styles')
};

// Handle map-path (can be a direct file or a directory containing mantine-map.json)
let rawMapPath = args['--map-path'] || path.join('source', 'resource', 'ville');
rawMapPath = path.resolve(rawMapPath);
if (fs.existsSync(rawMapPath) && fs.statSync(rawMapPath).isDirectory()) {
  CONFIG.mapPath = path.join(rawMapPath, 'mantine-map.json');
} else if (!rawMapPath.endsWith('.json')) {
  CONFIG.mapPath = path.join(rawMapPath, 'mantine-map.json');
} else {
  CONFIG.mapPath = rawMapPath;
}

CONFIG.transpiledPath = CONFIG.mode === 'build' 
  ? 'compiled/build/transpiled' 
  : 'compiled/source/transpiled';

if (!fs.existsSync(CONFIG.mapPath)) {
  console.error(`❌ Error: Map file not found at ${CONFIG.mapPath}`);
  process.exit(1);
}

const mantineMap = JSON.parse(fs.readFileSync(CONFIG.mapPath, 'utf8'));

// 3. Identify compiled ville.ui classes
const includedClasses = [];
Object.keys(mantineMap.map).forEach(className => {
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

// 4. Deduplicate and collect CSS files
const requiredFiles = new Set();

includedClasses.forEach(cls => {
  const files = mantineMap.map[cls];
  if (Array.isArray(files)) {
    files.forEach(f => requiredFiles.add(f));
  } else {
    requiredFiles.add(files);
  }
});

// 5. Sort according to cascade order
const sortedFiles = Array.from(requiredFiles).sort((a, b) => {
  const idxA = mantineMap.order.indexOf(a);
  const idxB = mantineMap.order.indexOf(b);
  const finalA = idxA === -1 ? 999 : idxA;
  const finalB = idxB === -1 ? 999 : idxB;
  return finalA - finalB;
});

// 6. Generate @import statements pointing to the resolved mantineRoot
const importLines = sortedFiles.map(file => {
  const filePath = path.join(CONFIG.mantineRoot, file);
  // LightningCSS expects forward slashes for imports
  return `@import "${filePath.replace(/\\/g, '/')}";`;
});

// 7. Read optional app.css
const appCssDir = path.join('source', 'resource', CONFIG.appName, 'css');
const appCssFile = path.join(appCssDir, 'app.css');
const appCssContent = fs.existsSync(appCssFile) ? fs.readFileSync(appCssFile, 'utf8') : '';

// 8. Write temporary CSS entry
const tempCssEntry = path.join(process.cwd(), '.temp-mantine-entry.css');
const outputBundle = path.join(appCssDir, 'bundle.min.css');

fs.writeFileSync(tempCssEntry, `${importLines.join('\n')}\n\n${appCssContent}`);

try {
  // 9. Bundle & Minify with LightningCSS
  execSync(`npx lightningcss --bundle --minify --targets ">= 0.25%" "${tempCssEntry}" -o "${outputBundle}"`, {
    stdio: 'inherit'
  });

  // 10. Build Target Sync (for production builds)
  if (CONFIG.mode === 'build') {
    const targetDir = path.join('compiled', 'build', 'resource', CONFIG.appName, 'css');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(outputBundle, path.join(targetDir, 'bundle.min.css'));
  }

  console.log(`✅ Success! Mantine bundle saved to: ${outputBundle}`);
  console.log(`📂 Sourced Mantine styles from: ${CONFIG.mantineRoot}`);
  console.log(`🗺️  Used map file from: ${CONFIG.mapPath}`);
} catch (err) {
  console.error('❌ CSS Bundling failed:', err.message);
  process.exit(1);
} finally {
  if (fs.existsSync(tempCssEntry)) fs.unlinkSync(tempCssEntry);
}
