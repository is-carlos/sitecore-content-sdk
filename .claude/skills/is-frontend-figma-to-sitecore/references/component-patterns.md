# Component patterns

Native Content SDK only: import field components, field types, `useSitecore`, `withDatasourceCheck`, `Placeholder`/`AppPlaceholder` from `@sitecore-content-sdk/nextjs`; the props type from `lib/component-props`. Never from `@sitecore-jss/*`, and no project-specific wrapper components. The project's conventions files win over this file. Router differences: [stack-and-routers.md](stack-and-routers.md).

## Fields file (`<Name>.fields.ts`)

```ts
import { Field, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

export type SingleCtaFields = {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Text: RichTextField;
  PrimaryCTA: LinkField;
};

// Sample content from Figma: <file name>, "<frame name>" (node 2812:11260)
export const singleCtaSampleFields: SingleCtaFields = { … };

export const singleCtaEmptyFields: SingleCtaFields = { … };
```

- Fields are read as `props.fields.<Name>` (the plain layout shape), not the integrated-GraphQL `fields.data.datasource.<Name>.jsonValue` shape.
- Sample values are the Figma text, verbatim ([content-model.md](content-model.md) → "Sample values"). The component imports the type; stories and showcase pages import the values.

## Component (`<Name>.tsx`)

```tsx
import { JSX } from 'react';
import { Link, RichText, Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { SingleCtaFields } from './SingleCta.fields';
import styles from './SingleCta.module.scss';

type SingleCtaProps = ComponentProps & { fields: SingleCtaFields };

/**
 * One sentence on what the component is.
 */
const SingleCta = ({ fields, params }: SingleCtaProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  return (
    <section
      className={`component single-cta ${styles.root} ${params?.styles || ''}`.trim()}
      id={params?.RenderingIdentifier}
      data-class-change
    >
      {(fields?.Title?.value || isEditing) && (
        <Text tag="h2" field={fields.Title} className={styles.title} />
      )}
      …
    </section>
  );
};

export default withDatasourceCheck()<SingleCtaProps>(SingleCta);
```

### Root element
- `className` = `component <kebab-name> ${styles.root} ${params.styles}`. The `component` class is what Page Builder and the layout's spacing rules look for; `params.styles` carries the classes authors pick (Styles rendering parameter), unhashed, so theme classes from the token layer apply directly.
- `id={params.RenderingIdentifier}` and `data-class-change` (Page Builder only updates a style change live when it's there).

### Fields
- Render every field with the SDK components: `Text`, `RichText`, `Link`, `Image`/`NextImage`, `DateField`, `File`. Never print `field.value` into the DOM — that breaks inline editing. `Text` with `encode={false}` isn't editable either.
- Heading level is code: `<Text tag="h2" field={fields.Title} />`.
- A CTA is `<Link field={fields.PrimaryCTA} className={styles.cta} />`; its text comes from the link field.
- Rich text gets the global rich-text class: `<RichText field={fields.Text} className={`isds-rich-text ${styles.text}`} />`.
- **Value-or-editing**: wrap optional fields as `{(field?.value || isEditing) && …}` so empty fields stay selectable in the editor and vanish on the live site. Links test `field?.value?.href`; images `field?.value?.src`.
- Lists: `(fields.Items ?? []).map((item, index) => …)` keyed `` `${index}-${item.id ?? item.name}` `` (sample data often reuses ids).
- SVG images (logos, icons) use `Image`, not `NextImage` (Next's optimizer rejects SVG by default).
- Variants: extra named exports (`export const Centered = …`) sharing the same fields; the default export (or a `Default` named export, following the project's existing components) is the base layout. Each variant export name must match a Headless Variant item in Sitecore. Wrap each export in `withDatasourceCheck` the same way.

### Rendering parameters
- Read from `props.params` — strings, always with a default: `const align = params?.Alignment || 'left';`.
- Apply a parameter as a data attribute on the root (`data-align={align}`) and style it in the module (`.root[data-align='center']`). No conditional class soup.

### Placeholders
- `<Placeholder name="<key>" rendering={rendering} />` (Pages) / `<AppPlaceholder … />` (App). List the key in the template spec.
- Empty-slot layout changes check `rendering.placeholders?.['<key>']?.length`; keep the slot visible while editing.

### Editing safety
- Decorative overlays, gradients and `::before`/`::after` layers above fields get `pointer-events: none`.
- No browser globals (`window`, `document`) during render.
- Interactivity: the smallest client part possible (App Router `'use client'`); keyboard support and `prefers-reduced-motion` included.

## CSS module (`<Name>.module.scss`)

```scss
// Figma: <file name>, "<frame name>" (node 2812:11260)
@use '../../styles/abstracts' as *;

.root {
  padding-block: var(--isds-spacing-section-padding);
  background: var(--isds-color-surface-muted);
  color: var(--isds-color-text-primary);

  &[data-align='center'] { text-align: center; }

  @include mq(laptop) { /* desktop layout */ }
}

.title {
  @include heading-h2;
}

.text {
  // Spacing only — the rich-text styles come from .isds-rich-text
  margin-top: var(--isds-spacing-stack-md);
}

.cta {
  @include button-primary;
}
```

- The module only references tokens, mixins and `rem()`/`fluid()` ([token-layer.md](token-layer.md)). No hex, `rgb()`, or bare `px` except hairline borders.
- camelCase class names (`styles.headingGroup`). Every class the TSX uses must exist in the module; a missing key renders `undefined` silently.
- Mobile-first: base styles are the mobile design, `@include mq(...)` adds the rest.
- Layout values that only make sense inside this component (a grid template, an aspect ratio) can be literal; colors, type and spacing never.
- Components don't set their own outer margin; the layout spaces sections.
- Style authored HTML only through `.isds-rich-text` (global) or `:global(...)` under a module class, never bare element selectors at the module root.

## Accessibility (minimum)
- One clear heading per component, at the level the page structure needs (ask when unclear).
- Images: alt from the image field; decorative images `alt=""`.
- Interactive parts are real `<a>`/`<button>` elements with a visible focus style.
