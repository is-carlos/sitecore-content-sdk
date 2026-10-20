// Read-only content inventory for one Figma node.
// Run it with the Figma MCP `use_figma` tool (load the `figma-use` skill first).
// Replace __NODE_ID__ with the node id from the URL ("2812-11260" → "2812:11260").
// It never mutates the file: no setters, no create/remove calls.
//
// Returns:
//   root     — the node's name, type, size, page
//   items    — every visible node: text (+ text style, hyperlinks), instances
//              (+ component, variant, component properties), image fills,
//              prototype links, annotations, fills (variable names), auto-layout,
//              and a `hint` for the field type
//   repeats  — sibling groups that look like repeating content (cards, slides)
//   layouts  — copies of one component placed side by side on the root frame, with what
//              each copy overrides: layouts/variants to support, not repeating content

const NODE_ID = '__NODE_ID__';

const root = await figma.getNodeByIdAsync(NODE_ID);
if (!root) throw new Error(`Node ${NODE_ID} not found`);
let page = root;
while (page && page.type !== 'PAGE') page = page.parent;
if (page && page !== figma.currentPage) await figma.setCurrentPageAsync(page);

const categories = {};
try {
  for (const c of await figma.annotations.getAnnotationCategoriesAsync()) categories[c.id] = c.label;
} catch (e) {}

const styleNames = {};
async function styleName(id) {
  if (!id || typeof id !== 'string') return null;
  if (!(id in styleNames)) {
    const s = await figma.getStyleByIdAsync(id);
    styleNames[id] = s ? s.name : null;
  }
  return styleNames[id];
}

// A solid paint as its variable name (e.g. "Grey/50") when bound, else hex.
async function paintName(paint) {
  const alias = paint.boundVariables && paint.boundVariables.color;
  if (alias) {
    const v = await figma.variables.getVariableByIdAsync(alias.id);
    if (v) return v.name;
  }
  const hex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${hex(paint.color.r)}${hex(paint.color.g)}${hex(paint.color.b)}`;
}

const LINK_LIKE = /button|btn|cta|link/i;
// Placeholder text of a form field ("Enter your email address...", "Mobile number (optional)").
const INPUT_LIKE = /enter|e-?mail|phone|mobile|search|name|zip|\.\.\.$|…$|\(optional\)/i;
// Button-sized: a whole section named "CTA …" is not a link.
const MAX_BUTTON_HEIGHT = 80;
const items = [];
const MAX = 600;

async function walk(node, parentPath, depth, ancestors = []) {
  if (items.length >= MAX || node.visible === false) return;
  const path = parentPath ? `${parentPath} > ${node.name}` : node.name;
  const e = { id: node.id, type: node.type, name: node.name, parent: parentPath, ancestors, depth, w: Math.round(node.width || 0), h: Math.round(node.height || 0) };

  if ('annotations' in node && node.annotations && node.annotations.length) {
    e.annotations = node.annotations.map((a) => ({
      label: a.labelMarkdown || a.label || null,
      category: a.categoryId ? categories[a.categoryId] || a.categoryId : null,
    }));
  }

  if ('reactions' in node && node.reactions && node.reactions.length) {
    const links = [];
    for (const r of node.reactions) {
      for (const a of r.actions || (r.action ? [r.action] : [])) {
        if (a && a.type === 'URL') links.push({ url: a.url });
        else if (a && a.type === 'NODE' && a.destinationId) links.push({ toNode: a.destinationId });
      }
    }
    if (links.length) e.prototypeLinks = links;
  }

  if ('fills' in node && Array.isArray(node.fills)) {
    const img = node.fills.find((f) => f.type === 'IMAGE' && f.visible !== false);
    if (img) {
      e.image = { scaleMode: img.scaleMode };
      e.hint = 'image';
    }
    const solid = node.fills.find((f) => f.type === 'SOLID' && f.visible !== false);
    if (solid) e.fill = await paintName(solid);
    // Wireframes draw images as plain grey boxes: a sizeable filled shape is probably one.
    if (!img && solid && (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') && node.width >= 40 && node.height >= 40) {
      e.hint = 'image?';
    }
  }

  // Layout, for styling: auto-layout direction, padding, gap, alignment, radius.
  if ('layoutMode' in node && node.layoutMode && node.layoutMode !== 'NONE') {
    e.layout = {
      dir: node.layoutMode,
      pad: [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft],
      gap: node.itemSpacing,
      main: node.primaryAxisAlignItems,
      cross: node.counterAxisAlignItems,
    };
  }
  if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) e.radius = node.cornerRadius;

  // Borders and rules. Per-side weights as [top, right, bottom, left]; align INSIDE means
  // the stroke sits inside the padding (CSS: subtract its width from that side's padding).
  if ('strokes' in node && Array.isArray(node.strokes)) {
    const stroke = node.strokes.find((s) => s.type === 'SOLID' && s.visible !== false);
    if (stroke) {
      const weight =
        node.strokeWeight === figma.mixed
          ? [node.strokeTopWeight, node.strokeRightWeight, node.strokeBottomWeight, node.strokeLeftWeight]
          : node.strokeWeight;
      e.stroke = { color: await paintName(stroke), weight, align: node.strokeAlign };
    }
  }

  // Structural signature (child types + text styles), used to spot repeating content
  // whose layers have different names ("Frame 292", "Frame 293", …).
  if ('children' in node) {
    e.sig = node.children
      .filter((c) => c.visible !== false)
      .map((c) => {
        if (c.type !== 'TEXT') return c.type;
        // textStyleId / fontSize are figma.mixed (a Symbol) on mixed-style text.
        const style = typeof c.textStyleId === 'string' && c.textStyleId ? c.textStyleId : c.fontSize;
        return `TEXT:${typeof style === 'symbol' ? 'mixed' : style}`;
      })
      .join(',');
  }

  if (node.type === 'TEXT') {
    e.text = node.characters;
    e.textStyle = await styleName(node.textStyleId);
    if (!e.textStyle && typeof node.fontSize === 'number') {
      e.font = { family: node.fontName.family, style: node.fontName.style, size: node.fontSize };
    }
    // Units matter: PERCENT letter-spacing 4 → 0.04em; PERCENT line-height 130 → 1.3.
    const unit = (v) => (v && typeof v === 'object' && 'unit' in v ? (v.unit === 'AUTO' ? 'auto' : `${+v.value.toFixed(2)}${v.unit === 'PERCENT' ? '%' : 'px'}`) : null);
    e.spacing = { letter: unit(node.letterSpacing), line: unit(node.lineHeight) };
    if (node.textCase && node.textCase !== 'ORIGINAL') e.textCase = node.textCase;
    if (node.textAlignHorizontal !== 'LEFT') e.align = node.textAlignHorizontal;
    const segs = node.getStyledTextSegments(['hyperlink', 'listOptions', 'fontName']);
    const links = segs
      .filter((s) => s.hyperlink)
      .map((s) => ({ text: s.characters, href: s.hyperlink.type === 'URL' ? s.hyperlink.value : `node:${s.hyperlink.value}` }));
    if (links.length) e.hyperlinks = links;
    const hasList = segs.some((s) => s.listOptions && s.listOptions.type !== 'NONE');
    const mixedStyles = new Set(segs.map((s) => `${s.fontName.family}/${s.fontName.style}`)).size > 1;
    if (hasList) e.hasList = true;
    e.hint = hasList || mixedStyles || links.length || e.text.includes('\n') ? 'rich-text' : 'text';
  }

  if (node.type === 'INSTANCE') {
    const main = await node.getMainComponentAsync();
    if (main) {
      const inSet = main.parent && main.parent.type === 'COMPONENT_SET';
      e.component = inSet ? main.parent.name : main.name;
      if (inSet) e.variant = main.name;
    }
    const props = {};
    for (const [k, v] of Object.entries(node.componentProperties || {})) props[k.split('#')[0]] = { type: v.type, value: v.value };
    if (Object.keys(props).length) e.props = props;
    // Elements a boolean property shows or hides (e.g. an optional text button switched off
    // in this instance). An element that's off here can still be an optional field.
    if (main) {
      const optional = main
        .findAll((n) => n.componentPropertyReferences && n.componentPropertyReferences.visible)
        .map((n) => {
          const prop = n.componentPropertyReferences.visible.split('#')[0];
          return { name: n.name, type: n.type, prop, on: props[prop] ? props[prop].value : null };
        });
      if (optional.length) e.optional = optional;
      // Boolean properties that no layer uses: leftovers in the design system, not fields.
      const used = new Set(optional.map((o) => o.prop));
      const unused = Object.entries(props)
        .filter(([name, p]) => p.type === 'BOOLEAN' && !used.has(name))
        .map(([name]) => name);
      if (unused.length) e.unusedProps = unused;
    }
    // What this copy changes from its component (hidden layers, alignment, padding…).
    // Two copies of one component on the canvas usually show two layouts to support.
    if (depth === 1 && node.overrides && node.overrides.length) {
      e.overrides = [...new Set(node.overrides.flatMap((o) => o.overriddenFields))];
    }
    if (LINK_LIKE.test(e.component || node.name) && node.height <= MAX_BUTTON_HEIGHT) e.hint = 'link';
  }

  // A bordered box holding one line of placeholder-like text is a form input, whatever its
  // layer name (designers often name inputs after the button they were copied from).
  if (node.type !== 'INSTANCE' && e.stroke && 'children' in node && node.height <= MAX_BUTTON_HEIGHT) {
    const visible = node.children.filter((c) => c.visible !== false);
    if (visible.length === 1 && visible[0].type === 'TEXT' && INPUT_LIKE.test(visible[0].characters.trim())) {
      e.hint = 'input';
    }
  }

  items.push(e);
  if ('children' in node) for (const c of node.children) await walk(c, path, depth + 1, [...ancestors, node.id]);
}

await walk(root, '', 0);

// Text inside a link-like instance is the link's text; text inside an input is its placeholder.
// Matched by node id, so same-named layers ("Button_Primary" input next to a real button) can't mix.
const linkIds = new Set(items.filter((i) => i.hint === 'link').map((i) => i.id));
const inputIds = new Set(items.filter((i) => i.hint === 'input').map((i) => i.id));
for (const i of items) {
  if (i.type !== 'TEXT') continue;
  if (i.ancestors.some((id) => inputIds.has(id))) i.hint = 'input-placeholder';
  else if (i.ancestors.some((id) => linkIds.has(id))) i.hint = 'link-text';
}

// Siblings that are instances of the same component, or have the same structure, or share a
// name, look like repeating content.
const byParent = {};
for (const i of items) (byParent[i.parent] = byParent[i.parent] || []).push(i);
const repeats = [];
// Copies of one component placed directly on the root frame are layouts shown side by side
// (e.g. "with image" and "centered"), not repeating content.
const layouts = [];
for (const [parent, kids] of Object.entries(byParent)) {
  const groups = {};
  for (const k of kids) {
    const key = k.component || (k.sig ? `${k.type}[${k.sig}]` : `${k.type}:${k.name}`);
    (groups[key] = groups[key] || []).push(k);
  }
  for (const [key, group] of Object.entries(groups)) {
    if (group.length < 2) continue;
    const ids = group.map((k) => k.id);
    if (group.every((k) => k.depth === 1 && k.type === 'INSTANCE')) {
      layouts.push({ component: key, copies: group.map((k) => ({ id: k.id, variant: k.variant, overrides: k.overrides || [] })) });
    } else {
      repeats.push({ parent, key, count: ids.length, ids });
    }
  }
}

return {
  root: { id: root.id, name: root.name, type: root.type, w: Math.round(root.width), h: Math.round(root.height), page: page && page.name },
  nodeCount: items.length,
  truncated: items.length >= MAX,
  annotationCategories: Object.values(categories),
  repeats,
  layouts,
  items: items.map(({ parent, ancestors, sig, ...rest }) => rest),
};
