import Text from './Text';

interface CalloutSectionProps {
  title: string;
  subtitle: string;
  body: string;
  leftContent: React.ReactNode;
  cta: React.ReactNode;
  bgColor?: string;
}

export const CalloutSection: React.FC<CalloutSectionProps> = ({
  title,
  subtitle,
  body,
  leftContent,
  cta,
  bgColor = 'bg-gray-900',
}) => (
  <div className={`flex flex-col overflow-hidden rounded-md ${bgColor} sm:grid sm:grid-cols-2 mb-12`}>
    {leftContent}
    <div className="p-6 sm:p-8 md:p-10 lg:p-12">
      <Text As="p" variant="headline4" alwaysWhite>
        {title}
      </Text>
      <Text As="p" variant="subtitle1" alwaysWhite className="mt-2">
        {subtitle}
      </Text>
      <Text As="p" variant="body" alwaysWhite className="mt-6">
        {body}
      </Text>
      {cta}
    </div>
  </div>
);
