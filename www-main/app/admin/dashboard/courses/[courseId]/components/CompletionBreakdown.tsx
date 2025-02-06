type PercentageWithNumber = {
  percentage: number;
  rawNumber: number;
};

export type Breakdown = {
  title: string;
  id: string;
  started: PercentageWithNumber;
  finished: PercentageWithNumber;
};

function CompletionBreakdown({ data }: { data: Breakdown[] }) {
  return (
    <>
      {data.map(({ id, title, finished, started }) => (
        <div key={id} className="mb-2 grid grid-cols-12 items-center gap-2 border-t dark:border-gray-700 pt-2">
          <p className="col-span-4 font-bodycopy">{title}</p>
          <div className="relative col-span-5 h-8 overflow-hidden rounded-full bg-bt-teal-ultraLight/20">
            <div className="absolute h-full bg-bt-teal-ultraLight" style={{ width: `${started.percentage}%` }} />
            <div className="absolute h-full bg-bt-teal" style={{ width: `${finished.percentage}%` }} />
          </div>
          <div className="col-span-3">
            <div className="grid grid-cols-2 text-bodySmall">
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-bt-teal-ultraLight" />
                <span className="font-bodycopy">Started</span>
              </div>
              <span className="font-bodycopy">
                {Math.round(started.percentage)}% ({started.rawNumber} user
                {started.rawNumber === 1 ? '' : 's'})
              </span>
            </div>
            <div className="grid grid-cols-2 text-bodySmall">
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-bt-teal" />
                <span className="font-bodycopy">Completed</span>
              </div>
              <span className="font-bodycopy">
                {Math.round(finished.percentage)}% ({finished.rawNumber} user
                {finished.rawNumber === 1 ? '' : 's'})
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default CompletionBreakdown;
