import { JSX } from 'react';
import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { StatsFields } from './Stats.fields';
import styles from './Stats.styles.module.scss';

type StatsProps = ComponentProps & {
  fields: StatsFields;
};

/**
 * A heading and a row of key figures (value + label), three per row.
 * Stats come from a Treelist of StatItem items; authors add, remove and reorder them.
 */
const Stats = ({ fields, params }: StatsProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const stats = (fields?.Stats ?? []).filter((item) => item?.fields);

  return (
    <section
      className={`component stats ${styles.stats} ${params?.styles || ''}`.trim()}
      id={params?.RenderingIdentifier}
    >
      {(fields?.Title?.value || isEditing) && (
        <Text tag="h2" field={fields.Title} className={styles.title} />
      )}

      {stats.length > 0 && (
        <ul className={styles.list}>
          {stats.map((item, index) => (
            <li key={`${index}-${item.id ?? item.name}`} className={styles.item}>
              <Text tag="p" field={item.fields.Value} className={styles.value} />
              <Text tag="p" field={item.fields.Label} className={styles.label} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default withDatasourceCheck()<StatsProps>(Stats);
