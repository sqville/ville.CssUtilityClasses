#!/usr/bin/env node
/**
 * check-ville-leaks.js
 *
 * Queries a compiled Qooxdoo db.json (and cross-checks compiled/<target>/<app>/index.js)
 * to detect and trace:
 *  1. Direct leaks: ville.* or app classes referencing qx.ui.* directly
 *  2. Transitive bridge leaks: non-qx.ui.* classes (like qx.html.* or qx.event.*)
 *     that bridge into qx.ui.*, with shortest-path traces and blast-radius counts
 *  3. Breakdown of leaked qx.ui.* classes by namespace (and whether they are
 *     actively emitted in index.js)
 *  4. Legacy subsystem leaks: qx.theme.manager.* (Decoration/Font/Color/Meta),
 *     qx.event.handler.* (DragDrop/Gesture/Touch/Pointer/Keyboard/Focus), & Bluebird
 *  5. CommonJS / Browserify triggers (db.classInfo[*].commonjsModules)
 *
 * Usage:
 *   node check-ville-leaks.js
 *   node check-ville-leaks.js --db compiled/source/db.json --entry villeuiapp.Application
 *   node check-ville-leaks.js --trace qx.ui.core.Widget
 */

const fs = require("fs");
const path = require("path");

// --- CLI Argument Parsing ---
const args = process.argv.slice(2);
function getArg(flag, fallback) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const dbPath = path.resolve(getArg("--db", "compiled/source/db.json"));
const entryClass = getArg("--entry", "villeuiapp.Application");
const themeClass = getArg("--theme", "ville.cssuc.theme.mantine.Theme");
const appName = getArg("--app", entryClass.split(".")[0]);
const indexPath = path.resolve(
  getArg("--index", path.join(path.dirname(dbPath), appName, "index.js"))
);
const traceTarget = getArg("--trace", null);

if (!fs.existsSync(dbPath)) {
  console.error(`Error: Cannot find db.json at ${dbPath}`);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
const classInfo = db.classInfo || {};

// --- Optional: Parse Emitted Classes from compiled/<target>/<app>/index.js ---
let bundledClasses = null;
let bundledPreBoot = [];
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, "utf8");
  bundledClasses = new Set();
  const uriRegex = /"\.\.\/transpiled\/([^"]+)\.js"/g;
  let match;
  while ((match = uriRegex.exec(indexContent)) !== null) {
    bundledClasses.add(match[1].replace(/\//g, "."));
  }
  if (indexContent.includes('"polyfill.js"')) bundledPreBoot.push("polyfill.js");
  if (indexContent.includes('"commonjs-browserify.js"')) {
    bundledPreBoot.push("commonjs-browserify.js");
  }
}

function isActiveInBundle(clsName) {
  if (!bundledClasses) return Boolean(classInfo[clsName]);
  return bundledClasses.has(clsName);
}

// --- Build Forward & Shortest-Path BFS Graph from Entry Roots ---
const seeds = [entryClass, themeClass].filter((c) => classInfo[c]);
const reachable = new Set(seeds);
const parentMap = new Map();
const depthMap = new Map();
const queue = [];

for (const seed of seeds) {
  depthMap.set(seed, 0);
  queue.push(seed);
}

function getOutgoingDeps(clsName, restrictToBundle = true) {
  const info = classInfo[clsName];
  if (!info) return [];
  const deps = new Set(Object.keys(info.dependsOn || {}));
  if (info.extends && classInfo[info.extends]) deps.add(info.extends);
  for (const inc of info.include || []) if (classInfo[inc]) deps.add(inc);
  for (const imp of info.implement || []) if (classInfo[imp]) deps.add(imp);
  return Array.from(deps).filter(
    (d) => classInfo[d] && (!restrictToBundle || isActiveInBundle(d))
  );
}

while (queue.length > 0) {
  const current = queue.shift();
  const currentDepth = depthMap.get(current);
  for (const dep of getOutgoingDeps(current, true)) {
    if (!reachable.has(dep)) {
      reachable.add(dep);
      parentMap.set(dep, current);
      depthMap.set(dep, currentDepth + 1);
      queue.push(dep);
    }
  }
}

function getShortestPath(target) {
  if (!reachable.has(target)) return null;
  const chain = [];
  let curr = target;
  while (curr) {
    chain.unshift(curr);
    curr = parentMap.get(curr);
  }
  return chain;
}

function formatRelation(fromCls, toCls) {
  const info = classInfo[fromCls] || {};
  const tags = [];
  if (info.extends === toCls) tags.push("extends");
  if ((info.include || []).includes(toCls)) tags.push("include");
  if ((info.implement || []).includes(toCls)) tags.push("implement");
  const depMeta = (info.dependsOn || {})[toCls];
  if (depMeta) {
    if (depMeta.load) tags.push("load");
    if (depMeta.construct) tags.push("construct");
    if (depMeta.require) tags.push("require");
    if (depMeta.defer) tags.push(`defer:${depMeta.defer}`);
  }
  return tags.length ? `[${tags.join(",")}]` : "[ref]";
}

function formatChain(chain) {
  if (!chain || chain.length === 0) return "(unreachable)";
  return chain
    .map((cls, i) => {
      if (i === 0) return cls;
      return `${formatRelation(chain[i - 1], cls)} -> ${cls}`;
    })
    .join(" ");
}

function countTransitiveQxUi(startQxUiClass) {
  const visited = new Set([startQxUiClass]);
  const q = [startQxUiClass];
  while (q.length > 0) {
    const curr = q.shift();
    for (const dep of getOutgoingDeps(curr, true)) {
      if (dep.startsWith("qx.ui.") && !visited.has(dep)) {
        visited.add(dep);
        q.push(dep);
      }
    }
  }
  return visited.size;
}

const allReachable = Array.from(reachable);
const appPrefix = entryClass.split(".")[0] + ".";
const villeClasses = allReachable.filter(
  (c) => c.startsWith("ville.") || c === entryClass || c.startsWith(appPrefix)
);
const leakedQxUi = allReachable.filter((c) => c.startsWith("qx.ui.")).sort();

console.log("======================================================================");
console.log(` Ville UI Mode 3 Dependency & Leak Audit`);
console.log(
  ` DB:    ${path.relative(process.cwd(), dbPath)} (Qx ${db.libraries?.qx || "?"}, Compiler ${db.compilerVersion || "?"})`
);
if (bundledClasses) {
  console.log(
    ` Index: ${path.relative(process.cwd(), indexPath)} (${bundledClasses.size} transpiled classes, pre-boot: ${
      bundledPreBoot.length ? bundledPreBoot.join(", ") : "none"
    })`
  );
}
console.log(` Seeds: ${seeds.join(", ")}`);
console.log(
  ` Reachable Active Classes: ${allReachable.length} (ville.*: ${villeClasses.length}, qx.ui.*: ${leakedQxUi.length})`
);
console.log("======================================================================\n");

// --- Optional Single-Class Deep Trace ---
if (traceTarget) {
  console.log(`>>> Deep Trace for "${traceTarget}":`);
  const chain = getShortestPath(traceTarget);
  console.log(`  Shortest Path: ${formatChain(chain)}`);
  const incoming = allReachable.filter((c) =>
    getOutgoingDeps(c, true).includes(traceTarget)
  );
  console.log(`  All Reachable Referrers (${incoming.length}):`);
  for (const ref of incoming) {
    console.log(`    - ${ref} ${formatRelation(ref, traceTarget)}`);
  }
  console.log("");
}

// --- 1. Direct ville.* -> qx.ui.* References ---
const directLeaks = [];
for (const vCls of villeClasses) {
  for (const dep of getOutgoingDeps(vCls, true)) {
    if (dep.startsWith("qx.ui.")) {
      directLeaks.push({
        from: vCls,
        to: dep,
        rel: formatRelation(vCls, dep),
        blastRadius: countTransitiveQxUi(dep)
      });
    }
  }
}

console.log(`1. DIRECT ville.* -> qx.ui.* REFERENCES (${directLeaks.length})`);
if (directLeaks.length === 0) {
  console.log("   None! No ville.* class directly references qx.ui.*\n");
} else {
  for (const leak of directLeaks) {
    console.log(
      `   - ${leak.from} ${leak.rel} -> ${leak.to} (pulls in ${leak.blastRadius} qx.ui.* class(es))`
    );
  }
  console.log("");
}

// --- 2. Transitive Bridge Leaks (non-qx.ui.* -> qx.ui.*) ---
const bridgeLeaks = [];
for (const cls of allReachable) {
  if (cls.startsWith("qx.ui.") || villeClasses.includes(cls)) continue;
  for (const dep of getOutgoingDeps(cls, true)) {
    if (dep.startsWith("qx.ui.")) {
      bridgeLeaks.push({
        bridgeFrom: cls,
        qxUiEntry: dep,
        rel: formatRelation(cls, dep),
        blastRadius: countTransitiveQxUi(dep),
        chain: getShortestPath(cls)
      });
    }
  }
}

console.log(`2. TRANSITIVE qx.* -> qx.ui.* BRIDGE LEAKS (${bridgeLeaks.length})`);
if (bridgeLeaks.length === 0) {
  console.log("   None! Zero transitive bridges into qx.ui.*\n");
} else {
  for (const b of bridgeLeaks) {
    console.log(
      `   - Bridge: ${b.bridgeFrom} ${b.rel} -> ${b.qxUiEntry} (pulls in ${b.blastRadius} qx.ui.* classes!)`
    );
    console.log(`     Path:   ${formatChain([...b.chain, b.qxUiEntry])}`);
  }
  console.log("");
}

// --- 3. Breakdown of Leaked qx.ui.* Namespaces ---
if (leakedQxUi.length > 0) {
  const byNamespace = {};
  for (const cls of leakedQxUi) {
    const ns = cls.split(".").slice(0, 3).join(".") + ".*";
    byNamespace[ns] = byNamespace[ns] || [];
    byNamespace[ns].push(cls);
  }
  console.log(`3. LEAKED qx.ui.* CLASSES BY NAMESPACE (${leakedQxUi.length} total)`);
  for (const [ns, list] of Object.entries(byNamespace).sort(
    (a, b) => b[1].length - a[1].length
  )) {
    console.log(
      `   - ${ns.padEnd(24)} (${String(list.length).padStart(2)}): ${list.join(", ")}`
    );
  }
  console.log("");
}

// --- 4. Legacy Theme Managers, Event Handlers & Bluebird Promise ---
const watchedSubsystems = [
  "qx.theme.manager.Meta",
  "qx.theme.manager.Decoration",
  "qx.theme.manager.Color",
  "qx.theme.manager.Font",
  "qx.theme.manager.Icon",
  "qx.event.handler.DragDrop",
  "qx.event.handler.Gesture",
  "qx.event.handler.Touch",
  "qx.event.handler.Pointer",
  "qx.event.handler.Keyboard",
  "qx.event.handler.Focus",
  "qx.promise.BluebirdImpl"
];

const activeWatched = watchedSubsystems.filter((c) => reachable.has(c));
console.log(`4. LEGACY SUBSYSTEMS & POLYFILL TRIGGERS (${activeWatched.length})`);
for (const sub of activeWatched) {
  console.log(`   - ${sub}`);
  console.log(`     Path: ${formatChain(getShortestPath(sub))}`);
}
console.log("");

// --- 5. CommonJS / Browserify Triggers in db.json ---
const commonjsClasses = Object.entries(classInfo).filter(
  ([, info]) => info.commonjsModules && Object.keys(info.commonjsModules).length > 0
);
console.log(`5. COMMONJS / BROWSERIFY TRIGGERS IN db.json (${commonjsClasses.length})`);
if (commonjsClasses.length === 0) {
  console.log("   None! Browserify will not bundle any CommonJS modules.\n");
} else {
  for (const [cls, info] of commonjsClasses) {
    const isReach = reachable.has(cls);
    console.log(
      `   - ${cls} (active in bundle: ${isReach}, present in db.classInfo: true) -> requires: ${JSON.stringify(
        info.commonjsModules
      )}`
    );
    if (isReach) {
      console.log(`     Path: ${formatChain(getShortestPath(cls))}`);
    }
  }
  console.log("");
}
