import Button from 'components/Button';
import Link from 'next/link';

export function EndScreenCompleted({
  itemTitle,
  ctaText,
  ctaButtonText,
  ctaHref,
}: {
  itemTitle: string;
  ctaText: string;
  ctaButtonText: string;
  ctaHref: string;
}) {
  return (
    <div className="w-full h-1/2 flex flex-col justify-evenly text-center items-center p-12 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-3xl backdrop-saturate-150 shadow-xl text-white leading-normal">
      <h3 className="text-3xl font-bold text-white mb-4">You Did It!</h3>
      <p className="mb-2 font-bodycopy">
        You&apos;ve completed <i>{itemTitle}</i>. Nicely done!
      </p>
      <p className="mb-6 font-bodycopy max-w-sm">{ctaText}</p>
      <Link href={ctaHref}>
        <Button variant="glassPrimary" className="font-bold">
          {ctaButtonText}
        </Button>
      </Link>
    </div>
  );
}
