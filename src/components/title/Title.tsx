import { JSX } from 'react';
import { Field, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type TitleFields = {
  Title?: Field<string>;
};

type TitleProps = ComponentProps & {
  fields?: TitleFields;
};

/**
 * Renders a page heading from the datasource `Title` field.
 * Without a datasource value it falls back to the current page's `Title` field,
 * except in editing mode, where the datasource field stays editable.
 */
const Title = ({ fields, params }: TitleProps): JSX.Element => {
  const { page } = useSitecore();
  const routeTitle = page.layout.sitecore.route?.fields?.Title as Field<string> | undefined;
  const useDatasource = !!fields?.Title?.value || (page.mode.isEditing && !!fields?.Title);
  const field = useDatasource ? fields?.Title : routeTitle;

  return (
    <div className={`component title ${params?.styles || ''}`.trim()} id={params?.RenderingIdentifier}>
      <Text tag="h1" field={field} />
    </div>
  );
};

export default Title;
