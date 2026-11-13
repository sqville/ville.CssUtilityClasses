const fs = require('fs');
const path = require('path');
const { getIconData, iconToSVG } = require('@iconify/utils');
const { locate } = require('@iconify/json');

// 1. Parse Named CLI Arguments
// Example: node generate-icons.js --icons fluent:airplane-20,tabler:check --out-dir source/class/ville/ui/icon
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

const outDir = path.resolve(args['--out-dir'] || 'source/class/ville/ui/icon');
const namespacePrefix = args['--namespace'] || 'ville.ui.icon';
const iconListArg = args['--icons'] || '';

if (!iconListArg) {
  console.error('❌ Usage: node generate-icons.js --icons fluent:airplane-20,tabler:check [--out-dir source/class/ville/ui/icon] [--namespace ville.ui.icon]');
  process.exit(1);
}

const requestedIcons = iconListArg.split(',').map(s => s.trim()).filter(Boolean);
const iconSetCache = {};

function loadIconSet(prefix) {
  if (!iconSetCache[prefix]) {
    const jsonPath = locate(prefix);
    if (!jsonPath || !fs.existsSync(jsonPath)) {
      throw new Error(`Iconify set "${prefix}" not found. Did you install @iconify/json?`);
    }
    iconSetCache[prefix] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
  return iconSetCache[prefix];
}

/**
 * Converts SVG primitives (<circle>, <rect>, <line>, <polygon>, <polyline>) to path `d` commands
 * and merges all <path d="..."> segments into a single compound `d` string for clip-path compatibility.
 */
function extractCompoundPathD(svgBody, prefix) {
  const dSegments = [];

  // 1. Extract <path d="...">
  const pathRegex = /<path\b[^>]*?\bd=["']([^"']+)["'][^>]*?>/gi;
  let match;
  while ((match = pathRegex.exec(svgBody)) !== null) {
    const d = match[1].trim();
    // Skip Tabler's invisible 24x24 bounding box reset path
    if (prefix === 'tabler' && d === 'M0 0h24v24H0z') continue;
    dSegments.push(d);
  }

  // 2. Convert <circle cx="..." cy="..." r="..."/>
  const circleRegex = /<circle\b([^>]*?)>/gi;
  while ((match = circleRegex.exec(svgBody)) !== null) {
    const attrs = match[1];
    const cx = parseFloat((attrs.match(/\bcx=["']([^"']+)["']/) || [])[1] || 0);
    const cy = parseFloat((attrs.match(/\bcy=["']([^"']+)["']/) || [])[1] || 0);
    const r = parseFloat((attrs.match(/\br=["']([^"']+)["']/) || [])[1] || 0);
    if (r > 0) {
      dSegments.push(`M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0 Z`);
    }
  }

  // 3. Convert <rect x="..." y="..." width="..." height="..."/>
  const rectRegex = /<rect\b([^>]*?)>/gi;
  while ((match = rectRegex.exec(svgBody)) !== null) {
    const attrs = match[1];
    const x = parseFloat((attrs.match(/\bx=["']([^"']+)["']/) || [])[1] || 0);
    const y = parseFloat((attrs.match(/\by=["']([^"']+)["']/) || [])[1] || 0);
    const w = parseFloat((attrs.match(/\bwidth=["']([^"']+)["']/) || [])[1] || 0);
    const h = parseFloat((attrs.match(/\bheight=["']([^"']+)["']/) || [])[1] || 0);
    if (w > 0 && h > 0) {
      dSegments.push(`M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`);
    }
  }

  // 4. Convert <line x1="..." y1="..." x2="..." y2="..."/>
  const lineRegex = /<line\b([^>]*?)>/gi;
  while ((match = lineRegex.exec(svgBody)) !== null) {
    const attrs = match[1];
    const x1 = parseFloat((attrs.match(/\bx1=["']([^"']+)["']/) || [])[1] || 0);
    const y1 = parseFloat((attrs.match(/\by1=["']([^"']+)["']/) || [])[1] || 0);
    const x2 = parseFloat((attrs.match(/\bx2=["']([^"']+)["']/) || [])[1] || 0);
    const y2 = parseFloat((attrs.match(/\by2=["']([^"']+)["']/) || [])[1] || 0);
    dSegments.push(`M ${x1} ${y1} L ${x2} ${y2}`);
  }

  return dSegments.join(' ');
}

function toPascalCase(str) {
  return str
    .replace(/-(?:\d+)-(regular|filled)$/i, '') // Strip fluent size/style suffix (e.g. -20-regular)
    .replace(/-(?:\d+)$/i, '')                  // Strip fluent size suffix (e.g. -20)
    .replace(/-(regular|filled)$/i, '')         // Strip generic style suffix
    .split(/[-_:]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Resolves regular and filled icon names in the Iconify set.
 */
function resolveVariantPair(prefix, rawName, iconSet) {
  if (prefix === 'fluent') {
    // e.g. "airplane-20" or "airplane-20-regular" -> pairs "airplane-20-regular" & "airplane-20-filled"
    const base = rawName.replace(/-(regular|filled)$/, '');
    const hasSize = /-\d+$/.test(base);
    const sizedBase = hasSize ? base : `${base}-20`;
    return {
      regularName: `${sizedBase}-regular`,
      filledName: `${sizedBase}-filled`
    };
  }

  // Tabler and general sets: e.g. "check" & "check-filled"
  const base = rawName.replace(/-(regular|filled)$/, '');
  return {
    regularName: getIconData(iconSet, base) ? base : `${base}-regular`,
    filledName: `${base}-filled`
  };
}

for (const item of requestedIcons) {
  const [prefix, rawName] = item.split(':');
  if (!prefix || !rawName) {
    console.warn(`⚠️ Skipping invalid icon identifier "${item}". Use format "prefix:name".`);
    continue;
  }

  const iconSet = loadIconSet(prefix);
  const { regularName, filledName } = resolveVariantPair(prefix, rawName, iconSet);

  const regIconData = getIconData(iconSet, regularName);
  const filIconData = getIconData(iconSet, filledName);

  if (!regIconData && !filIconData) {
    console.warn(`⚠️ Icon "${item}" not found in set "${prefix}".`);
    continue;
  }

  const primaryData = regIconData || filIconData;
  const primarySvg = iconToSVG(primaryData);
  const viewBox = primarySvg.attributes.viewBox || '0 0 24 24';

  const regPathD = regIconData ? extractCompoundPathD(iconToSVG(regIconData).body, prefix) : '';
  const filPathD = filIconData ? extractCompoundPathD(iconToSVG(filIconData).body, prefix) : regPathD;
  const finalRegD = regPathD || filPathD;

  // Determine stroke/fill defaults for stroked icon sets (like Tabler regular)
  const isStrokedSet = prefix === 'tabler' || prefix === 'lucide';
  const strokeStatic = isStrokedSet
    ? `\n    FILL: "none",\n    STROKE: "currentColor",\n    STROKE_WIDTH: "2",\n    STROKE_LINECAP: "round",\n    STROKE_LINEJOIN: "round",`
    : '';

  const className = toPascalCase(rawName);
  const fullClassName = `${namespacePrefix}.${prefix}.${className}`;
  const vendorDir = path.join(outDir, prefix);
  fs.mkdirSync(vendorDir, { recursive: true });

  const filePath = path.join(vendorDir, `${className}.js`);

  const classContent = `/* ************************************************************************
   AUTO-GENERATED BY generate-icons.js
   Source: @iconify/json (${prefix}:${regularName}${filIconData ? ` / ${prefix}:${filledName}` : ''})
************************************************************************ */
qx.Class.define("${fullClassName}",
{
  extend : ${namespacePrefix}.Abstract,

  statics :
  {
    VIEWBOX : "${viewBox}",${strokeStatic}
    REGULAR : "${finalRegD}",
    FILLED : "${filPathD}",
    CLIP_REGULAR : "path('${finalRegD}')",
    CLIP_FILLED : "path('${filPathD}')"
  }
});
`;

  fs.writeFileSync(filePath, classContent, 'utf8');
  console.log(`✅ Generated ${fullClassName} -> ${filePath}`);
}
