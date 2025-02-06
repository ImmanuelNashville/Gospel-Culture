const SectionWithMargin = ({ children, className = '' }: { className?: string; children?: React.ReactNode }) => (
  <section className={`isolate mx-auto my-10 max-w-screen-xl px-3 md:px-6 ${className}`}>{children}</section>
);

export default SectionWithMargin;
