import { JSX } from 'react';
import {
  Image,
  Link,
  LinkField,
  Placeholder,
  Text,
  useSitecore,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { FooterFields, FooterLinkItem } from './Footer.fields';
import styles from './Footer.styles.module.scss';

type FooterProps = ComponentProps & {
  fields: FooterFields;
};

/** Holds the CTA card shown on top of the footer (e.g. SingleCta) */
const CTA_PLACEHOLDER = 'footer-cta';

// Social glyphs from Figma (Footer-Base); drawn in code, not authored
const socialLinks: { field: keyof FooterFields; label: string; icon: JSX.Element }[] = [
  {
    field: 'FacebookLink',
    label: 'Facebook',
    icon: (
      <svg width="10" height="17" viewBox="0 0 10 17" aria-hidden="true">
        <path d="M8.44555 9.49029L8.91394 6.43689H5.9839V4.45549C5.9839 3.62013 6.39328 2.80583 7.70561 2.80583H9.03775V0.206311C9.03775 0.206311 7.82879 0 6.67287 0C4.25971 0 2.68244 1.46233 2.68244 4.10971V6.43689H0V9.49029H2.68244V16.8717C3.22037 16.9561 3.7715 17 4.33317 17C4.89483 17 5.44596 16.9561 5.9839 16.8717V9.49029H8.44555Z" />
      </svg>
    ),
  },
  {
    field: 'XLink',
    label: 'X',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <path d="M8.73532 6.35152L14.1989 0H12.9036L8.15925 5.51492L4.37011 0H0L5.73019 8.33904L0 15H1.29525L6.30504 9.17564L10.307 15H14.6771L8.7341 6.35152H8.73532ZM6.96184 8.41243L6.38087 7.58195L1.76125 0.974804H3.75L7.47798 6.30749L8.05895 7.13797L12.9048 14.0692H10.9161L6.96184 8.41365V8.41243Z" />
      </svg>
    ),
  },
  {
    field: 'LinkedInLink',
    label: 'LinkedIn',
    icon: (
      <svg width="16" height="15" viewBox="0 0 16 15" aria-hidden="true">
        <path d="M15.1482 14.9968H12.0114V10.1264C12.0114 8.9663 11.9918 7.46921 10.3809 7.46921C8.77004 7.46921 8.49557 8.73623 8.49557 10.0421V14.9968H5.35874V4.98056H8.3714V6.34802H8.41388C9.02817 5.30784 10.1685 4.68568 11.3841 4.73104C14.5634 4.73104 15.1482 6.80492 15.1482 9.50421V15V14.9968ZM1.82001 3.60985C0.816881 3.60985 0 2.80298 0 1.80493C0 0.80687 0.813614 0 1.82001 0C2.82641 0 3.64002 0.80687 3.64002 1.80493C3.64002 2.80298 2.82641 3.60985 1.82001 3.60985ZM3.38842 14.9968H0.248332V4.98056H3.38842V15V14.9968Z" />
      </svg>
    ),
  },
  {
    field: 'InstagramLink',
    label: 'Instagram',
    icon: (
      <svg width="17" height="18" viewBox="0 0 17 18" aria-hidden="true">
        <path d="M12.0098 0C14.7616 0.000114581 17.0003 2.21648 17 4.94043V12.3555C17 15.0795 14.7616 17.2958 12.0098 17.2959H4.99023C2.23874 17.2958 0 15.0798 0 12.3555V4.94043C6.1887e-05 2.21648 2.23878 0.000114311 4.99023 0H12.0098ZM4.99023 1.2666C2.9442 1.26672 1.27936 2.91484 1.2793 4.94043V12.3555C1.2793 14.3811 2.94416 16.0292 4.99023 16.0293H12.0098C14.0558 16.0292 15.7207 14.3811 15.7207 12.3555V4.94043C15.7206 2.91484 14.0558 1.26672 12.0098 1.2666H4.99023ZM8.52246 4.0293C9.96759 4.07084 11.1676 4.55314 11.9912 5.42383C12.7721 6.24891 13.1696 7.36115 13.1416 8.64062C13.1146 9.86537 12.626 11.013 11.7666 11.8711C10.8959 12.7405 9.7355 13.2188 8.5 13.2188C5.94083 13.2186 3.8584 11.1576 3.8584 8.62402C3.85841 7.37484 4.37712 6.15962 5.28125 5.29004C6.16283 4.44256 7.31394 3.99436 8.52246 4.0293ZM8.39258 5.57617C7.64136 5.57626 6.92605 5.86692 6.37109 6.40039C5.76787 6.97988 5.42286 7.79055 5.42285 8.62402C5.42285 10.304 6.81182 11.6709 8.5 11.6709C10.188 11.6708 11.54 10.3251 11.5781 8.60742C11.5971 7.74107 11.3448 7.00592 10.8496 6.48242C10.3172 5.9196 9.49701 5.60647 8.47754 5.57715C8.44944 5.57643 8.42068 5.57617 8.39258 5.57617ZM13.2539 2.82812C13.8516 2.82819 14.3359 3.30765 14.3359 3.89941C14.3358 4.49108 13.8516 4.97063 13.2539 4.9707C12.6562 4.9707 12.172 4.49113 12.1719 3.89941C12.1719 3.30761 12.6561 2.82812 13.2539 2.82812Z" />
      </svg>
    ),
  },
  {
    field: 'YouTubeLink',
    label: 'YouTube',
    icon: (
      <svg width="19" height="14" viewBox="0 0 19 14" aria-hidden="true">
        <path d="M18.6044 2.05593C18.3858 1.24788 17.7403 0.608595 16.923 0.393797C15.4395 0 9.5 0 9.5 0C9.5 0 3.56055 0 2.07699 0.393797C1.25973 0.608595 0.614247 1.24788 0.395616 2.05593C0 3.5186 0 6.57692 0 6.57692C0 6.57692 0 9.63524 0.395616 11.0979C0.614247 11.906 1.25973 12.5452 2.07699 12.76C3.56055 13.1538 9.5 13.1538 9.5 13.1538C9.5 13.1538 15.4395 13.1538 16.923 12.76C17.7403 12.5452 18.3858 11.906 18.6044 11.0979C19 9.63524 19 6.57692 19 6.57692C19 6.57692 19 3.5186 18.6044 2.05593ZM7.55836 9.35396V3.79989L12.5244 6.57692L7.55836 9.35396Z" />
      </svg>
    ),
  },
];

/**
 * Renders a Treelist of FooterLink items as a list of links
 * @param {object} props - Component props
 * @param {FooterLinkItem[]} props.items - Treelist items
 * @param {string} props.className - Class for the list
 * @param {string} props.label - Accessible name for the list's navigation landmark
 * @returns {JSX.Element | null} the list, or nothing when empty
 */
const LinkList = ({
  items,
  className,
  label,
}: {
  items?: FooterLinkItem[];
  className: string;
  label: string;
}): JSX.Element | null => {
  const links = (items ?? []).filter((item) => item?.fields?.Link);
  if (!links.length) return null;

  return (
    <nav aria-label={label}>
      <ul className={className}>
        {links.map((item, index) => (
          <li key={`${index}-${item.id ?? item.name}`}>
            <Link field={item.fields.Link} />
          </li>
        ))}
      </ul>
    </nav>
  );
};

/**
 * Site footer: link columns, logo, contact details, social links and legal row.
 * The `footer-cta` placeholder holds a CTA card that overlaps the top of the footer.
 */
const Footer = ({ fields, params, rendering }: FooterProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const hasCta = !!rendering?.placeholders?.[CTA_PLACEHOLDER]?.length;
  const showCtaSlot = hasCta || isEditing;

  const show = (value: unknown) => !!value || isEditing;
  const visibleSocial = socialLinks.filter(({ field }) =>
    show((fields?.[field] as LinkField | undefined)?.value?.href)
  );

  return (
    <footer
      className={`component footer ${styles.footer} ${params?.styles || ''}`.trim()}
      id={params?.RenderingIdentifier}
    >
      {showCtaSlot && (
        <div className={styles.ctaSlot}>
          <Placeholder name={CTA_PLACEHOLDER} rendering={rendering} />
        </div>
      )}

      <div className={`${styles.base} ${showCtaSlot ? styles.withCta : ''}`.trim()}>
        <div className={styles.inner}>
          <div className={styles.top}>
            <LinkList items={fields?.PrimaryLinks} className={styles.linksPrimary} label="Footer" />

            <div className={styles.center}>
              <div className={styles.brand}>
                {show(fields?.Logo?.value?.src) && (
                  <Image field={fields.Logo} className={styles.logo} />
                )}
                <div className={styles.contact}>
                  {show(fields?.Address?.value) && (
                    <Text tag="p" field={fields.Address} className={styles.address} />
                  )}
                  {show(fields?.Phone?.value?.href) && (
                    <Link field={fields.Phone} className={styles.phone} />
                  )}
                </div>
              </div>

              {visibleSocial.length > 0 && (
                <ul className={styles.social}>
                  {visibleSocial.map(({ field, label, icon }) => {
                    const linkField = fields[field] as LinkField;
                    return (
                      <li key={field}>
                        {linkField?.value?.href ? (
                          <Link field={linkField} className={styles.socialLink} aria-label={label}>
                            {icon}
                          </Link>
                        ) : (
                          // Editing only: name the network so authors know which link to set
                          <span className={styles.socialEmpty}>
                            {label}: <Link field={linkField} />
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <LinkList
              items={fields?.SecondaryLinks}
              className={styles.linksSecondary}
              label="Footer secondary"
            />
          </div>

          <div className={styles.bottom}>
            {show(fields?.Copyright?.value) && (
              <Text tag="p" field={fields.Copyright} className={styles.copyright} />
            )}
            {show(fields?.Disclaimer?.value) && (
              <Text tag="p" field={fields.Disclaimer} className={styles.disclaimer} />
            )}
            <LinkList items={fields?.LegalLinks} className={styles.legal} label="Legal" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default withDatasourceCheck()<FooterProps>(Footer);
