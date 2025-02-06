export const TopRight = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex h-full w-full items-start justify-end">{children}</div>
);

export const BottomRight = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex h-full w-full items-end justify-end">{children}</div>
);
