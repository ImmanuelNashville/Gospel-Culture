type HeroDataItemProps = {
  value: string | React.ReactNode;
  label: string;
};

export default function HeroDataItem({ value, label }: HeroDataItemProps) {
  return (
    <div className="flex flex-col px-3">
      {typeof value === 'string' ? (
        <dd className="text-headline6 leading-none font-bold text-white">{value}</dd>
      ) : (
        value
      )}
      <dt className="text-bodySmall uppercase font-bodycopy">{label}</dt>
    </div>
  );
}
