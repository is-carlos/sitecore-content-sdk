import { CSSProperties, JSX, ReactNode, useEffect, useRef, useState } from 'react';
import styles from './DesignSystem.module.scss';

// Building blocks for the "Design System/*" stories, from the is-frontend-figma-to-sitecore skill.
// They read the --isds-* tokens from the page's stylesheets (src/styles/main.scss, loaded by
// .storybook/preview.tsx), so the stories follow the token layer without hand-kept lists.

const PREFIX = '--isds-';

type Declaration = {
  name: string;
  /** The declared value as written, e.g. `var(--isds-color-gray-900)` or `#1a1a1a` */
  value: string;
  selector: string;
};

type Scan = { declarations: Declaration[]; themes: string[]; classes: string[] };

/** Every --isds-* declaration, color theme and isds-* class in the page's stylesheets. */
function scanStylesheets(): Scan {
  const declarations: Declaration[] = [];
  const themes = new Set<string>();
  const classes = new Set<string>();

  const walk = (rules: CSSRuleList) => {
    Array.from(rules).forEach((rule) => {
      if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText;
        for (let i = 0; i < rule.style.length; i++) {
          const name = rule.style[i];
          if (name.startsWith(PREFIX)) {
            declarations.push({ name, value: rule.style.getPropertyValue(name).trim(), selector });
          }
        }
        const themeMatches: string[] = selector.match(/data-color-theme="?'?[\w-]+/g) || [];
        themeMatches.forEach((m) => themes.add(m.replace(/data-color-theme="?'?/, '')));
        const classMatches: string[] = selector.match(/\.isds-[\w-]+/g) || [];
        classMatches.forEach((m) => classes.add(m.slice(1)));
      } else if ('cssRules' in rule) {
        // @media, @supports, @layer…
        walk((rule as CSSGroupingRule).cssRules);
      }
    });
  };

  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      walk(sheet.cssRules);
    } catch {
      // Cross-origin stylesheet: not ours
    }
  });

  return { declarations, themes: Array.from(themes), classes: Array.from(classes) };
}

/** Reads the stylesheets once the story has mounted (they aren't there during render). */
function useScan(): Scan | null {
  const [scan, setScan] = useState<Scan | null>(null);
  useEffect(() => setScan(scanStylesheets()), []);
  return scan;
}

export type TokenMatch = {
  /** Token name prefix, e.g. `--isds-color-` */
  prefix: string;
  /** Prefixes to leave out, e.g. `['--isds-color-gradient-']` */
  exclude?: string[];
  /** `primitive`: declared with a raw value. `semantic`: declared as a `var(…)` alias. */
  tier?: 'primitive' | 'semantic';
};

function matches(d: Declaration, { prefix, exclude = [], tier }: TokenMatch): boolean {
  if (!d.name.startsWith(prefix) || exclude.some((e) => d.name.startsWith(e))) return false;
  if (tier === 'primitive') return !d.value.includes('var(');
  if (tier === 'semantic') return d.value.includes('var(');
  return true;
}

export type TokenKind =
  | 'color'
  | 'gradient'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'font-size'
  | 'font-family'
  | 'value';

const previewStyle = (kind: TokenKind, name: string, negative: boolean): CSSProperties => {
  const v = `var(${name})`;
  switch (kind) {
    case 'color':
    case 'gradient':
      return { background: v };
    case 'spacing':
      // A negative width is invalid, so negative tokens (e.g. -5rem) draw their absolute size.
      // (Not max(): an unitless 0 token is a number there, which invalidates the width.)
      return { width: negative ? `calc(-1 * ${v})` : v };
    case 'radius':
      return { borderRadius: v };
    case 'shadow':
      return { boxShadow: v };
    case 'font-size':
      return { fontSize: v };
    case 'font-family':
      return { fontFamily: v };
    default:
      return {};
  }
};

// What the token resolves to on the preview, in px, for kinds where that helps
const resolvedValue = (kind: TokenKind, cs: CSSStyleDeclaration): string => {
  if (kind === 'spacing') return cs.width;
  if (kind === 'radius') return cs.borderTopLeftRadius;
  if (kind === 'font-size') return cs.fontSize;
  return '';
};

/**
 * One token: a preview painted with it, its name, its value where it's shown (so inside a themed
 * block it shows that theme's value), and the resolved px value. Re-read on resize, so responsive
 * tokens update with the viewport.
 */
const TokenRow = ({ name, kind }: { name: string; kind: TokenKind }): JSX.Element => {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('');
  const [resolved, setResolved] = useState('');
  const negative = kind === 'spacing' && value.startsWith('-');

  useEffect(() => {
    const read = () => {
      if (!ref.current) return;
      const cs = getComputedStyle(ref.current);
      setValue(cs.getPropertyValue(name).trim());
      setResolved(resolvedValue(kind, cs));
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
    // Re-read once a negative value switches the preview to its absolute size
  }, [name, kind, negative]);

  const sample = kind === 'font-size' ? 'Aa' : kind === 'font-family' ? 'The quick brown fox' : null;

  return (
    <div className={styles.row} data-kind={kind}>
      <span ref={ref} className={styles.preview} style={previewStyle(kind, name, negative)}>
        {sample}
      </span>
      <code className={styles.name}>{name}</code>
      <span className={styles.value}>
        {value}
        {resolved && resolved !== value ? ` → ${negative ? `-${resolved} (negative)` : resolved}` : ''}
      </span>
    </div>
  );
};

/**
 * Every token matching `match`, in source order, previewed as `kind`. Shows `empty` when none
 * exist yet (e.g. "Run /is-frontend-figma-to-sitecore spacing").
 */
export const TokenList = ({
  kind,
  match,
  empty = 'No tokens yet.',
}: {
  kind: TokenKind;
  match: TokenMatch;
  empty?: string;
}): JSX.Element | null => {
  const scan = useScan();
  if (!scan) return null;
  const names = Array.from(
    new Set(scan.declarations.filter((d) => matches(d, match)).map((d) => d.name))
  );
  if (!names.length) return <p className={styles.empty}>{empty}</p>;
  return (
    <div className={styles.list} data-kind={kind}>
      {names.map((name) => (
        <TokenRow key={name} name={name} kind={kind} />
      ))}
    </div>
  );
};

/** A titled block of a story. */
export const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}): JSX.Element => (
  <section className={styles.section}>
    <h2 className={styles.title}>{title}</h2>
    {description && <p className={styles.description}>{description}</p>}
    {children}
  </section>
);

/** Renders `children` once per color theme in the stylesheets, side by side. */
export const ThemeColumns = ({
  children,
}: {
  children: (theme: string) => ReactNode;
}): JSX.Element | null => {
  const scan = useScan();
  if (!scan) return null;
  const themes = scan.themes.length ? scan.themes : ['default'];
  return (
    <div className={styles.themes}>
      {themes.map((theme) => (
        <div key={theme} data-color-theme={theme} className={styles.theme}>
          <h3 className={styles.themeName}>{theme}</h3>
          {children(theme)}
        </div>
      ))}
    </div>
  );
};

/**
 * One sample per text style. `className` comes from the story's CSS module, where each class
 * includes the style's mixin. Shows the computed size, line height, weight and letter spacing.
 */
export const TextStyleList = ({
  items,
  sample = 'The quick brown fox jumps over the lazy dog',
}: {
  items: { label: string; className: string }[];
  sample?: string;
}): JSX.Element => (
  <div className={styles.textStyles}>
    {items.map((item) => (
      <TextStyleRow key={item.label} {...item} sample={sample} />
    ))}
  </div>
);

const TextStyleRow = ({
  label,
  className,
  sample,
}: {
  label: string;
  className: string;
  sample: string;
}): JSX.Element => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [metrics, setMetrics] = useState('');

  useEffect(() => {
    const read = () => {
      if (!ref.current) return;
      const cs = getComputedStyle(ref.current);
      const family = cs.fontFamily.split(',')[0].replace(/["']/g, '');
      setMetrics(
        `${family} · ${cs.fontWeight} · ${cs.fontSize} / ${cs.lineHeight} · ${cs.letterSpacing}`
      );
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  return (
    <div className={styles.textStyle}>
      <code className={styles.name}>{label}</code>
      <span className={styles.value}>{metrics}</span>
      <p ref={ref} className={className}>
        {sample}
      </p>
    </div>
  );
};

/**
 * Every global class starting with `prefix` (e.g. `isds-button-`) in the stylesheets, rendered
 * with `render`. Classes are found without their pseudo-classes, once each.
 */
export const ClassGallery = ({
  prefix,
  render,
  empty = 'No classes yet.',
}: {
  prefix: string;
  render: (className: string) => ReactNode;
  empty?: string;
}): JSX.Element | null => {
  const scan = useScan();
  if (!scan) return null;
  const classes = scan.classes.filter((c) => c.startsWith(prefix));
  if (!classes.length) return <p className={styles.empty}>{empty}</p>;
  return (
    <div className={styles.gallery}>
      {classes.map((c) => (
        <div key={c} className={styles.galleryItem}>
          <code className={styles.name}>.{c}</code>
          <div className={styles.galleryRender}>{render(c)}</div>
        </div>
      ))}
    </div>
  );
};
