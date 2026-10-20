import { JSX } from 'react';
import {
  Link,
  RichText,
  Text,
  useSitecore,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { SingleCtaFields } from './SingleCta.fields';
import styles from './SingleCta.styles.module.scss';

type SingleCtaProps = ComponentProps & {
  fields: SingleCtaFields;
};

/**
 * Centered call-to-action panel: eyebrow, heading, body copy and one button.
 * Empty fields are hidden on the live site and stay editable in editing mode.
 */
const SingleCta = ({ fields, params }: SingleCtaProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const showEyebrow = !!fields?.Eyebrow?.value || isEditing;
  const showTitle = !!fields?.Title?.value || isEditing;
  const showText = !!fields?.Text?.value || isEditing;
  const showCta = !!fields?.PrimaryCTA?.value?.href || isEditing;

  return (
    <section
      className={`component single-cta ${styles.singleCta} ${params?.styles || ''}`.trim()}
      id={params?.RenderingIdentifier}
    >
      <div className={styles.panel}>
        {(showEyebrow || showTitle) && (
          <div className={styles.headingGroup}>
            {showEyebrow && <Text tag="p" field={fields.Eyebrow} className={styles.eyebrow} />}
            {showTitle && <Text tag="h2" field={fields.Title} className={styles.title} />}
          </div>
        )}
        {showText && <RichText field={fields.Text} className={styles.text} />}
        {showCta && <Link field={fields.PrimaryCTA} className={styles.cta} />}
      </div>
    </section>
  );
};

export default withDatasourceCheck()<SingleCtaProps>(SingleCta);
