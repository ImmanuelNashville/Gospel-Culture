function StatBox({ title, stat }: { title: string; stat: string | React.ReactNode }) {
  return (
    <div className="my-1 p-6 rounded-2xl bg-bt-teal-ultraLight/5">
      <dt className="font-bodycopy text-subtitle1 mb-1 text-bt-teal-dark dark:text-bt-teal-light">{title}</dt>
      <dd className={`${typeof stat === 'string' ? 'text-headline5' : ''} text-bt-teal-dark/60 dark:text-gray-300`}>
        {stat}
      </dd>
    </div>
  );
}

export default StatBox;
