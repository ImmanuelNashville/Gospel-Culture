export const DurationBadge = ({ children }: { children?: React.ReactNode }) => (
  <span className="m-0.5 text-[12px] font-bold inline-flex items-center rounded-md bg-gray-900/80 leading-none p-1 text-gray-100">
    {children}
  </span>
);

export const IconBadge = ({ children, className = '' }: { className?: string; children?: React.ReactNode }) => (
  <div className={`rounded-full p-[6px] flex justify-center items-center text-white h-8 w-8 ${className}`}>
    {children}
  </div>
);
