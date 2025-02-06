import Image from 'next/image';

export default function Banner({ title, subtitle }: { title: string; subtitle: string | React.ReactNode }) {
  return (
    <div className="relative isolate bg-bt-lightBlue text-white">
      <div className="absolute inset-0 filter mix-blend-luminosity opacity-70">
        <Image className="object-cover rotate-180" src="/images/teal-bg.png" alt="" fill sizes="100vw" />
      </div>
      <div className="relative mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-center">
          <span className="mr-3 font-bold font-bodycopy">{title}</span>
          <span className="font-bodycopy">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
