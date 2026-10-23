// Read-only dump of the file's local variables and styles, as markdown for the skill's caches:
//   variablesMarkdown → .claude/figma-to-sitecore/figma-variables.md
//   stylesMarkdown    → .claude/figma-to-sitecore/figma-styles.md
// Run it with the Figma MCP `use_figma` tool (load the `figma-use` skill first).
// It never mutates the file.
//
// PART: leave as is to dump everything. When the result is too large, set it to 'variables' or
// 'styles' and run it twice.
// COLLECTION: leave as is for every variable collection. When the variables are still too large,
// run once per collection with the collection's exact name (PART 'variables').
//
// Returns:
//   collections       — name, modes and variable count per dumped collection
//   remoteOnly        — true when the file has no local collections (variables live in a library file)
//   counts            — number of text, paint and effect styles
//   unlistedVariables — variables that aliases or styles reference but that no local collection
//                       lists: `deleted` (still resolvable by id, but removed from its collection),
//                       `library` (from a library file) or `missing` (can't be resolved). Each has
//                       `usedBy`, the variables and styles that reference it.
//   variablesMarkdown — one "## <collection>" table per collection, one column per mode. Colors are
//                       hex (RRGGBB, or RRGGBBAA with alpha), aliases are "→ Collection/Variable",
//                       followed by "(deleted)" / "(library)" when the target is unlisted.
//   stylesMarkdown    — "## Text Styles", "## Color Styles", "## Effect Styles" tables. Sizes in px,
//                       line height / letter spacing with their unit (px or %), colors in hex,
//                       bound variables as "→ Collection/Variable" (marked the same way), linear
//                       gradients with their CSS angle ("linear-gradient(141deg, …)").

const PART = '__PART__';
const COLLECTION = '__COLLECTION__';

const wantVariables = PART.startsWith('__') || PART === 'variables';
const wantStyles = PART.startsWith('__') || PART === 'styles';

const hex = (n) => Math.round(n * 255).toString(16).padStart(2, '0').toUpperCase();
const color = (c, opacity = 1) => {
  const a = (c.a === undefined ? 1 : c.a) * opacity;
  return `${hex(c.r)}${hex(c.g)}${hex(c.b)}${a < 1 ? hex(a) : ''}`;
};
const cell = (s) => String(s === undefined || s === null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

const all = await figma.variables.getLocalVariableCollectionsAsync();
const collectionNames = new Map(all.map((c) => [c.id, c.name]));
const listedIds = new Set(all.flatMap((c) => c.variableIds));
const variables = new Map();
// name → { reason, usedBy } for referenced variables no local collection lists
const unlisted = new Map();

async function getVariable(id) {
  if (!variables.has(id)) variables.set(id, await figma.variables.getVariableByIdAsync(id));
  return variables.get(id);
}

async function collectionName(id) {
  if (!collectionNames.has(id)) {
    let name = 'remote';
    try {
      const c = await figma.variables.getVariableCollectionByIdAsync(id);
      if (c) name = c.name;
    } catch (e) {}
    collectionNames.set(id, name);
  }
  return collectionNames.get(id);
}

function noteUnlisted(name, reason, usedBy) {
  if (!unlisted.has(name)) unlisted.set(name, { reason, usedBy: new Set() });
  unlisted.get(name).usedBy.add(usedBy);
}

// "→ Collection/Variable" for an alias, or null. `usedBy` names the variable or style that
// references it, for the unlisted-variables report.
async function aliasName(alias, usedBy) {
  if (!alias || !alias.id) return null;
  let target = null;
  try {
    target = await getVariable(alias.id);
  } catch (e) {}
  if (!target) {
    noteUnlisted(`(missing ${alias.id})`, 'missing', usedBy);
    return `→ (missing ${alias.id})`;
  }
  const name = `${await collectionName(target.variableCollectionId)}/${target.name}`;
  if (listedIds.has(target.id)) return `→ ${name}`;
  const reason = target.remote ? 'library' : 'deleted';
  noteUnlisted(name, reason, usedBy);
  return `→ ${name} (${reason})`;
}

// CSS angle of a linear gradient paint (0deg = to top, 90deg = to right). gradientTransform maps
// the paint's box to gradient space; inverting it gives the gradient axis in box space. On
// non-square elements the visual angle can differ slightly from this box-space angle.
function gradientAngle(transform) {
  const [[a, b, tx], [c, d, ty]] = transform;
  const det = a * d - b * c;
  if (!det) return null;
  const toBox = (x, y) => [(d * (x - tx) - b * (y - ty)) / det, (-c * (x - tx) + a * (y - ty)) / det];
  const [x0, y0] = toBox(0, 0.5);
  const [x1, y1] = toBox(1, 0.5);
  return Math.round(((Math.atan2(x1 - x0, -(y1 - y0)) * 180) / Math.PI + 360) % 360);
}

// Variables

let picked = [];
let variablesMarkdown = '';

if (wantVariables) {
  picked = COLLECTION.startsWith('__') ? all : all.filter((c) => c.name === COLLECTION);
  if (!COLLECTION.startsWith('__') && !picked.length) {
    throw new Error(`No collection named "${COLLECTION}". Collections: ${all.map((c) => c.name).join(', ')}`);
  }

  // Batch the first round of lookups: one await per variable gets slow past ~50 variables.
  await Promise.all(picked.flatMap((c) => c.variableIds).map(getVariable));

  const format = async (value, type, usedBy) => {
    if (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS') return aliasName(value, usedBy);
    if (type === 'COLOR' && value && typeof value === 'object') return color(value);
    if (typeof value === 'number') return String(+value.toFixed(4));
    return cell(value);
  };

  for (const c of picked) {
    variablesMarkdown += `## ${c.name}\n\n`;
    variablesMarkdown += `| Variable Name | Type | ${c.modes.map((m) => m.name).join(' | ')} |\n`;
    variablesMarkdown += `|---|---|${c.modes.map(() => '---|').join('')}\n`;
    for (const id of c.variableIds) {
      const v = variables.get(id);
      if (!v) continue;
      const cells = [];
      for (const m of c.modes) cells.push(await format(v.valuesByMode[m.modeId], v.resolvedType, `${c.name}/${v.name}`));
      variablesMarkdown += `| ${v.name} | ${v.resolvedType} | ${cells.join(' | ')} |\n`;
    }
    variablesMarkdown += '\n';
  }
}

// Styles

let counts = null;
let stylesMarkdown = '';

if (wantStyles) {
  const unit = (v) => {
    if (!v || typeof v !== 'object') return '';
    if (v.unit === 'AUTO') return 'auto';
    return `${+v.value.toFixed(2)}${v.unit === 'PERCENT' ? '%' : 'px'}`;
  };

  // Bound variables of a style, as "property → Collection/Variable" pairs.
  const bindings = async (bound, usedBy) => {
    const out = [];
    for (const [prop, alias] of Object.entries(bound || {})) {
      for (const a of Array.isArray(alias) ? alias : [alias]) {
        const name = await aliasName(a, usedBy);
        if (name) out.push(`${prop} ${name}`);
      }
    }
    return out.join('<br>');
  };

  const paint = async (p, usedBy) => {
    if (p.type === 'SOLID') {
      const bound = p.boundVariables && p.boundVariables.color ? ` ${await aliasName(p.boundVariables.color, usedBy)}` : '';
      return `${color(p.color, p.opacity === undefined ? 1 : p.opacity)}${bound}`;
    }
    if (p.type && p.type.startsWith('GRADIENT_')) {
      const stops = [];
      for (const s of p.gradientStops) {
        const bound = s.boundVariables && s.boundVariables.color ? ` ${await aliasName(s.boundVariables.color, usedBy)}` : '';
        stops.push(`${color(s.color)}${bound} @${Math.round(s.position * 100)}%`);
      }
      const angle = p.type === 'GRADIENT_LINEAR' ? gradientAngle(p.gradientTransform) : null;
      const kind = p.type.replace('GRADIENT_', '').toLowerCase();
      return `${kind}-gradient(${angle === null ? '' : `${angle}deg, `}${stops.join(', ')})`;
    }
    return p.type.toLowerCase();
  };

  const textStyles = await figma.getLocalTextStylesAsync();
  const paintStyles = await figma.getLocalPaintStylesAsync();
  const effectStyles = await figma.getLocalEffectStylesAsync();
  counts = { text: textStyles.length, color: paintStyles.length, effect: effectStyles.length };

  stylesMarkdown += '## Text Styles\n\n';
  stylesMarkdown += '| Style | Family | Font style | Size | Line height | Letter spacing | Paragraph spacing | Case | Decoration | Bound variables |\n';
  stylesMarkdown += '|---|---|---|---|---|---|---|---|---|---|\n';
  for (const s of textStyles) {
    stylesMarkdown += `| ${cell(s.name)} | ${cell(s.fontName.family)} | ${cell(s.fontName.style)} | ${s.fontSize} | ${unit(s.lineHeight)} | ${unit(s.letterSpacing)} | ${s.paragraphSpacing || 0} | ${s.textCase === 'ORIGINAL' ? '' : cell(s.textCase)} | ${s.textDecoration === 'NONE' ? '' : cell(s.textDecoration)} | ${await bindings(s.boundVariables, s.name)} |\n`;
  }

  stylesMarkdown += '\n## Color Styles\n\n| Style | Paints |\n|---|---|\n';
  for (const s of paintStyles) {
    const paints = [];
    for (const p of s.paints) if (p.visible !== false) paints.push(await paint(p, s.name));
    stylesMarkdown += `| ${cell(s.name)} | ${cell(paints.join(' + '))} |\n`;
  }

  stylesMarkdown += '\n## Effect Styles\n\n| Style | Effects |\n|---|---|\n';
  for (const s of effectStyles) {
    const effects = s.effects
      .filter((e) => e.visible !== false)
      .map((e) =>
        e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW'
          ? `${e.type === 'INNER_SHADOW' ? 'inset ' : ''}${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread || 0}px ${color(e.color)}`
          : `${e.type.toLowerCase()} ${e.radius}px`,
      );
    stylesMarkdown += `| ${cell(s.name)} | ${cell(effects.join(', '))} |\n`;
  }
}

return {
  collections: picked.map((c) => ({ name: c.name, modes: c.modes.map((m) => m.name), count: c.variableIds.length })),
  remoteOnly: all.length === 0,
  counts,
  unlistedVariables: [...unlisted].map(([name, u]) => ({ name, reason: u.reason, usedBy: [...u.usedBy] })),
  variablesMarkdown,
  stylesMarkdown,
};
