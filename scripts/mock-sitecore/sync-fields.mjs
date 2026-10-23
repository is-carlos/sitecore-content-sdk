/**
 * Keeps the mock-data/ fixtures in step with the components' TypeScript field types.
 *
 * For every component under src/components that declares a `<Name>Fields` type (in
 * `<Name>.fields.ts` or `<Name>.tsx`), it reads the type with the TypeScript compiler and
 * compares it with every `<Name>` rendering in the fixtures (route files and
 * partial-design.json, nested placeholders included):
 *   + a field the type has and the fixture lacks      → added, from `<name>SampleFields` when the
 *                                                       fields file exports it, else a placeholder
 *   ~ one field missing and one unknown, same shape   → treated as a rename, the value is kept
 *   - a field the fixture has and the type lacks      → reported (removed with --prune)
 *   ! a value whose shape doesn't match its type      → reported (replaced with --prune)
 * Existing values are never overwritten unless --prune is given and their shape is wrong.
 *
 * Usage:
 *   npm run mock:sync                       report only; exits 1 when fixtures drifted (for CI)
 *   npm run mock:sync -- --write            apply additions and renames
 *   npm run mock:sync -- --write --prune    also drop unknown fields and fix wrong shapes
 *   npm run mock:sync -- --write --scaffold also give each component no fixture uses its own
 *                                           page at /components/<kebab-name>
 *   npm run mock:sync -- --watch            re-run on component changes (implies --write)
 */
import crypto from 'node:crypto';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { MOCK_DATA_DIR, readJson, writeJson } from './fixtures.mjs';

const ROOT = process.cwd();
const COMPONENT_ROOT = path.resolve(ROOT, process.env.SITECORE_COMPONENT_ROOT || 'src/components');
// Same exclusions as componentMap in sitecore.cli.config.ts
const IGNORED = /(^|\/)content-sdk\/|\.stories\.|\.test\./;

const args = new Set(process.argv.slice(2));
if (args.has('-h') || args.has('--help')) {
  console.log(
    'Usage: node scripts/mock-sitecore/sync-fields.mjs [--write] [--prune] [--scaffold] [--watch]'
  );
  process.exit(0);
}
const options = {
  watch: args.has('--watch'),
  write: args.has('--write') || args.has('--watch'),
  prune: args.has('--prune'),
  scaffold: args.has('--scaffold'),
};

const log = (message) => console.log(`[mock:sync] ${message}`);
const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const clone = (value) => structuredClone(value);

// ---------------------------------------------------------------------------
// Components and their field types
// ---------------------------------------------------------------------------

/**
 * Lists the component source files under the component root
 * @returns {Promise<string[]>} absolute paths of .ts/.tsx files
 */
const listComponentFiles = async () => {
  const entries = await fs.readdir(COMPONENT_ROOT, { recursive: true });
  return entries
    .map((entry) => entry.split(path.sep).join('/'))
    .filter((entry) => /\.tsx?$/.test(entry) && !IGNORED.test(entry))
    .map((entry) => path.join(COMPONENT_ROOT, entry));
};

/**
 * Builds a TypeScript program over the component files, with the project's compiler options
 * @param {string[]} files root files
 * @param {ts.Program} [oldProgram] previous program, reused in watch mode
 * @returns {ts.Program} the program
 */
const createProgram = (files, oldProgram) => {
  const configFile = ts.readConfigFile(path.join(ROOT, 'tsconfig.json'), ts.sys.readFile);
  const { options: compilerOptions } = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    ROOT
  );
  return ts.createProgram(
    files,
    { ...compilerOptions, noEmit: true, incremental: false },
    undefined,
    oldProgram
  );
};

/**
 * Reads a field type into a schema the fixtures can be checked against
 * @param {ts.TypeChecker} checker type checker
 * @param {ts.Type} type the `<Name>Fields` type (or a list item's `fields` type)
 * @param {number} depth recursion depth, to stop on self-referencing types
 * @returns {Record<string, object>} field name → { kind, optional, fields? }
 */
const readFieldsSchema = (checker, type, depth = 0) => {
  const schema = {};
  for (const property of checker.getPropertiesOfType(type)) {
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    if (!declaration) continue;
    const propertyType = checker.getNonNullableType(
      checker.getTypeOfSymbolAtLocation(property, declaration)
    );
    schema[property.name] = {
      ...describeField(checker, propertyType, depth),
      optional: (property.flags & ts.SymbolFlags.Optional) !== 0,
    };
  }
  return schema;
};

/**
 * Classifies one field type by the Content SDK type it uses
 * @param {ts.TypeChecker} checker type checker
 * @param {ts.Type} type the field's type
 * @param {number} depth recursion depth
 * @returns {{ kind: string, fields?: object, type?: string }} the field description
 */
const describeField = (checker, type, depth) => {
  const typeOf = (symbol) => checker.getNonNullableType(checker.getTypeOfSymbol(symbol));
  const itemFields = (itemType) => {
    const fields = checker.getPropertyOfType(itemType, 'fields');
    return fields && depth < 5 ? readFieldsSchema(checker, typeOf(fields), depth + 1) : null;
  };

  // Multilist / Treelist: an array of items, each with its own `fields`
  if (checker.isArrayType(type)) {
    const [element] = checker.getTypeArguments(type);
    const fields = element && itemFields(element);
    return fields
      ? { kind: 'list', fields }
      : { kind: 'unknown', type: checker.typeToString(type) };
  }

  const name = (type.aliasSymbol ?? type.getSymbol())?.name;
  switch (name) {
    case 'LinkField':
      return { kind: 'link' };
    case 'ImageField':
      return { kind: 'image' };
    case 'RichTextField':
      return { kind: 'richtext' };
    case 'FileField':
      return { kind: 'file' };
    case 'Field':
    case 'TextField': {
      const value = checker.getPropertyOfType(type, 'value');
      const valueType = value && typeOf(value);
      if (valueType && valueType.flags & ts.TypeFlags.BooleanLike) return { kind: 'boolean' };
      if (valueType && valueType.flags & ts.TypeFlags.NumberLike) return { kind: 'number' };
      return { kind: 'text' };
    }
  }

  // Droplink / Droptree: a single item
  const fields = itemFields(type);
  if (fields) return { kind: 'item', fields };
  return { kind: 'unknown', type: checker.typeToString(type) };
};

/**
 * Loads the sample fields a `.fields.ts` file exports (`<name>SampleFields`), so fixtures get the
 * same content as Storybook. Type-only imports are dropped by the transpile; files that import
 * other modules at runtime can't be loaded this way and fall back to placeholders.
 * @param {string} file absolute path of the fields file
 * @returns {Promise<object | null>} the sample fields, or null
 */
const loadSampleFields = async (file) => {
  try {
    const { outputText } = ts.transpileModule(await fs.readFile(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    const url = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
    const exports = await import(url);
    const key = Object.keys(exports).find((name) => /SampleFields$/.test(name));
    return key ? exports[key] : null;
  } catch (error) {
    log(`couldn't load sample fields from ${path.relative(ROOT, file)} (${error.message})`);
    return null;
  }
};

/**
 * Finds every component with a `<Name>Fields` type and reads its schema and sample fields
 * @param {ts.Program} [oldProgram] previous program, reused in watch mode
 * @returns {Promise<{ components: Map<string, object>, program: ts.Program }>} components by name
 */
const loadComponents = async (oldProgram) => {
  const files = await listComponentFiles();
  const program = createProgram(files, oldProgram);
  const checker = program.getTypeChecker();
  const components = new Map();

  for (const file of files.filter((f) => f.endsWith('.tsx'))) {
    const name = path.basename(file, '.tsx');
    const fieldsFile = path.join(path.dirname(file), `${name}.fields.ts`);
    const candidates = [fieldsFile, file].filter((f) => fsSync.existsSync(f));

    for (const candidate of candidates) {
      const source = program.getSourceFile(candidate);
      const declaration = source?.statements.find(
        (statement) =>
          (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) &&
          statement.name.text === `${name}Fields`
      );
      if (!declaration) continue;

      components.set(name, {
        name,
        kebabName: path.basename(path.dirname(file)),
        typeFile: path.relative(ROOT, candidate),
        schema: readFieldsSchema(checker, checker.getTypeAtLocation(declaration.name)),
        sample: candidate === fieldsFile ? await loadSampleFields(fieldsFile) : null,
      });
      break;
    }
  }
  return { components, program };
};

// ---------------------------------------------------------------------------
// Values
// ---------------------------------------------------------------------------

const placeholderImage = (label) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#d9d9d9"/><text x="400" y="225" font-family="sans-serif" font-size="32" fill="#595959" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  )}`;

/**
 * A placeholder value for a field the sample fields don't cover
 * @param {string} name field name
 * @param {object} field the field's schema entry
 * @returns {unknown} a value in the shape the Content SDK expects
 */
const placeholderValue = (name, field) => {
  switch (field.kind) {
    case 'text':
      return { value: `Sample ${name}` };
    case 'richtext':
      return {
        value: `<p>Sample ${name}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>`,
      };
    case 'link':
      return { value: { href: '#', text: `Sample ${name}`, linktype: 'external' } };
    case 'image':
      return {
        value: { src: placeholderImage(name), alt: `Sample ${name}`, width: '800', height: '450' },
      };
    case 'file':
      return { value: { src: '#', title: `Sample ${name}` } };
    case 'number':
      return { value: 0 };
    case 'boolean':
      return { value: false };
    case 'list':
      return [1, 2, 3].map((n) => placeholderItem(`${name} ${n}`, field.fields));
    case 'item':
      return placeholderItem(name, field.fields);
    default:
      return { value: '' };
  }
};

const placeholderItem = (label, schema) => ({
  id: `sample-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: label,
  fields: Object.fromEntries(
    Object.entries(schema).map(([name, field]) => [name, placeholderValue(name, field)])
  ),
});

/**
 * Whether a fixture value has the shape its field type needs
 * @param {unknown} value the fixture value
 * @param {object} field the field's schema entry
 * @returns {boolean} true when the shape matches
 */
const matchesShape = (value, field) => {
  switch (field.kind) {
    case 'text':
      return isObject(value) && ['string', 'number'].includes(typeof value.value);
    case 'richtext':
      return isObject(value) && typeof value.value === 'string';
    case 'link':
    case 'file':
      return isObject(value) && isObject(value.value);
    case 'image':
      return isObject(value) && (value.value === undefined || isObject(value.value));
    case 'number':
      return isObject(value) && typeof value.value === 'number';
    case 'boolean':
      return isObject(value) && typeof value.value === 'boolean';
    case 'list':
      return Array.isArray(value) && value.every((item) => isObject(item) && isObject(item.fields));
    case 'item':
      return isObject(value) && isObject(value.fields);
    default:
      return true;
  }
};

const describeValue = (value) => {
  const json = JSON.stringify(value) ?? 'undefined';
  return json.length > 40 ? `${json.slice(0, 37)}...` : json;
};

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

/**
 * Compares one `fields` object with its schema, recording (and, per options, applying) changes
 * @param {object} fields the fixture's fields, changed in place when writing
 * @param {object} schema the type's schema
 * @param {object | null} sample matching sample fields, used for added values
 * @param {string} prefix field path prefix for messages (e.g. "Stats[0].")
 * @param {string} typeName the fields type, for messages
 * @param {object[]} changes collected changes
 */
const syncFields = (fields, schema, sample, prefix, typeName, changes) => {
  const changeCount = changes.length;
  const missing = Object.keys(schema).filter((name) => !(name in fields) && !schema[name].optional);
  const unknown = Object.keys(fields).filter((name) => !(name in schema));

  // One field gone and one new field of the same shape: most likely a rename, so keep the content
  if (
    missing.length === 1 &&
    unknown.length === 1 &&
    matchesShape(fields[unknown[0]], schema[missing[0]])
  ) {
    const [from, to] = [unknown.pop(), missing.pop()];
    changes.push({
      mark: '~',
      field: `${prefix}${from} → ${to}`,
      note: 'renamed, value kept',
      apply: options.write,
    });
    if (options.write) {
      fields[to] = fields[from];
      delete fields[from];
    }
  }

  for (const name of missing) {
    const fromSample = sample?.[name] !== undefined;
    changes.push({
      mark: '+',
      field: `${prefix}${name}`,
      note: `missing, ${fromSample ? 'from sample fields' : `${schema[name].kind} placeholder`}`,
      apply: options.write,
    });
    if (options.write) {
      fields[name] = fromSample ? clone(sample[name]) : placeholderValue(name, schema[name]);
    }
  }

  for (const name of unknown) {
    changes.push({
      mark: '-',
      field: `${prefix}${name}`,
      note: `not in ${typeName}`,
      apply: options.prune,
    });
    if (options.prune) delete fields[name];
  }

  for (const [name, field] of Object.entries(schema)) {
    if (!(name in fields)) continue;
    const value = fields[name];
    if (!matchesShape(value, field)) {
      changes.push({
        mark: '!',
        field: `${prefix}${name}`,
        note: `expected ${field.kind}, found ${describeValue(value)}`,
        apply: options.prune,
      });
      if (options.prune)
        fields[name] =
          sample?.[name] !== undefined ? clone(sample[name]) : placeholderValue(name, field);
      continue;
    }
    // List items: compare against the sample item at the same position (or the first one)
    if (field.kind === 'list') {
      value.forEach((item, index) => {
        const sampleItem = sample?.[name]?.[index] ?? sample?.[name]?.[0];
        syncFields(
          item.fields,
          field.fields,
          sampleItem?.fields,
          `${prefix}${name}[${index}].`,
          typeName,
          changes
        );
      });
    } else if (field.kind === 'item') {
      syncFields(
        value.fields,
        field.fields,
        sample?.[name]?.fields,
        `${prefix}${name}.`,
        typeName,
        changes
      );
    }
  }

  // Keep the type's field order, so added and renamed fields don't land at the end of the diff
  if (options.write && changes.length > changeCount) {
    const ordered = [
      ...Object.keys(schema).filter((name) => name in fields),
      ...Object.keys(fields).filter((name) => !(name in schema)),
    ];
    for (const name of ordered) {
      const value = fields[name];
      delete fields[name];
      fields[name] = value;
    }
  }
};

/**
 * Yields every rendering in a placeholders object, nested placeholders included
 * @param {object} placeholders placeholder key → renderings
 * @param {string} [prefix] location prefix for messages
 * @yields {{ rendering: object, at: string }} each rendering and where it is
 */
function* walkRenderings(placeholders, prefix = '') {
  for (const [key, renderings] of Object.entries(placeholders ?? {})) {
    if (!Array.isArray(renderings)) continue;
    for (const [index, rendering] of renderings.entries()) {
      const at = `${prefix}${key}[${index}]`;
      yield { rendering, at };
      yield* walkRenderings(rendering.placeholders, `${at} › `);
    }
  }
}

/**
 * Lists the layout fixtures: route files and partial designs
 * @returns {Promise<{ file: string, placeholders: (data: object) => object }[]>} fixtures
 */
const listFixtures = async () => {
  let entries;
  try {
    entries = await fs.readdir(MOCK_DATA_DIR, { recursive: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries
    .map((entry) => entry.split(path.sep).join('/'))
    .filter((entry) => /\/routes\/.+\.json$/.test(entry) || entry.endsWith('/partial-design.json'))
    .sort()
    .map((entry) => ({
      file: path.join(MOCK_DATA_DIR, entry),
      placeholders: entry.endsWith('/partial-design.json')
        ? (data) => data?.placeholders
        : (data) => data?.sitecore?.route?.placeholders,
    }));
};

/**
 * The `<site>/<language>` folders that hold fixtures, for scaffolding
 * @returns {Promise<{ site: string, language: string }[]>} site and language pairs
 */
const listSiteLanguages = async () => {
  const sites = (await readJson(path.join(MOCK_DATA_DIR, 'sites.json'))) || [];
  const pairs = [];
  for (const { name, language = 'en' } of sites) {
    if (fsSync.existsSync(path.join(MOCK_DATA_DIR, name, language)))
      pairs.push({ site: name, language });
  }
  return pairs;
};

const sitecoreId = () => `{${crypto.randomUUID().toUpperCase()}}`;

/**
 * Builds a one-rendering page for a component no fixture uses yet
 * @param {object} component the component
 * @param {string} site site name
 * @param {string} language language code
 * @returns {object} layout JSON
 */
const scaffoldPage = (component, site, language) => {
  const itemPath = `/components/${component.kebabName}`;
  const fields = Object.fromEntries(
    Object.entries(component.schema).map(([name, field]) => [
      name,
      component.sample?.[name] !== undefined
        ? clone(component.sample[name])
        : placeholderValue(name, field),
    ])
  );
  return {
    sitecore: {
      context: {
        pageEditing: false,
        site: { name: site },
        pageState: 'normal',
        language,
        itemPath,
      },
      route: {
        name: component.kebabName,
        displayName: component.name,
        itemId: crypto.randomUUID(),
        itemLanguage: language,
        itemVersion: 1,
        templateName: 'Page',
        fields: { Title: { value: component.name } },
        placeholders: {
          'headless-header': [],
          'headless-main': [
            {
              uid: crypto.randomUUID(),
              componentName: component.name,
              dataSource: sitecoreId(),
              params: {},
              fields,
            },
          ],
          'headless-footer': [],
        },
      },
    },
  };
};

/**
 * One full pass: load the types, check every fixture, report, and write what changed
 * @param {ts.Program} [oldProgram] previous program, reused in watch mode
 * @returns {Promise<{ drift: number, program: ts.Program }>} unapplied changes and the program
 */
const run = async (oldProgram) => {
  const { components, program } = await loadComponents(oldProgram);
  const fixtures = await listFixtures();
  const used = new Set();
  let drift = 0;
  let renderingCount = 0;

  for (const fixture of fixtures) {
    const data = await readJson(fixture.file);
    let changed = false;

    for (const { rendering, at } of walkRenderings(fixture.placeholders(data))) {
      const component = components.get(rendering?.componentName);
      if (!component) continue;
      used.add(component.name);
      // No datasource means no datasource fields (e.g. Title falling back to the page title)
      if (!rendering.dataSource) continue;
      renderingCount++;

      const changes = [];
      if (!isObject(rendering.fields)) {
        if (options.write) rendering.fields = {};
      }
      syncFields(
        rendering.fields ?? {},
        component.schema,
        component.sample,
        '',
        `${component.name}Fields`,
        changes
      );
      if (!changes.length) continue;

      console.log(`\n${path.relative(MOCK_DATA_DIR, fixture.file)} › ${at} ${component.name}`);
      for (const change of changes) {
        const status = change.apply
          ? 'applied'
          : change.mark === '+' || change.mark === '~'
            ? 'run with --write'
            : 'run with --prune';
        console.log(`  ${change.mark} ${change.field.padEnd(28)} ${change.note} (${status})`);
        if (change.apply) changed = true;
        else drift++;
      }
    }

    if (changed) await writeJson(fixture.file, data);
  }

  const unused = [...components.values()].filter((component) => !used.has(component.name));
  for (const component of unused) {
    const pairs = options.scaffold && options.write ? await listSiteLanguages() : [];
    for (const { site, language } of pairs) {
      const file = path.join(
        MOCK_DATA_DIR,
        site,
        language,
        'routes',
        'components',
        `${component.kebabName}.json`
      );
      if (fsSync.existsSync(file)) continue;
      await writeJson(file, scaffoldPage(component, site, language));
      console.log(
        `\n+ ${path.relative(MOCK_DATA_DIR, file)}: new page /components/${component.kebabName} for ${component.name}`
      );
    }
    if (!pairs.length)
      console.log(`\n? ${component.name}: no fixture uses it (--write --scaffold adds a page)`);
  }

  log(
    `${components.size} component types · ${renderingCount} renderings in ${fixtures.length} fixtures · ` +
      (drift ? `${drift} change(s) not applied` : 'in sync')
  );
  return { drift, program };
};

if (options.watch) {
  let { program } = await run();
  let timer;
  log(`watching ${path.relative(ROOT, COMPONENT_ROOT)} for field type changes`);
  fsSync.watch(COMPONENT_ROOT, { recursive: true }, (_event, file) => {
    if (!file || !/\.tsx?$/.test(file) || IGNORED.test(file.split(path.sep).join('/'))) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        ({ program } = await run(program));
      } catch (error) {
        log(`failed: ${error.message}`);
      }
    }, 300);
  });
} else {
  const { drift } = await run();
  process.exitCode = drift ? 1 : 0;
}
