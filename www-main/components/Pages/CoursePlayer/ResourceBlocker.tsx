import Link from 'next/link';
import Button from '../../Button';
import { BlockerMap } from './VideoBlocker';

export const ResourceBlocker = ({ blockers }: { blockers: BlockerMap['resources'] }) => {
  return (
    <div className="px-4 py-6 text-center">
      <p className="text-body leading-tight font-bodycopy dark:text-gray-200">{blockers?.message}</p>
      {blockers?.type === 'user' && typeof window !== 'undefined' && (
        <>
          <Link href={`/api/auth/login?returnTo=${window.location.href}`} className="mt-4 block">
            <Button variant="secondary" className="leading-tight">
              Create Free Account
            </Button>
          </Link>
          <p className="mt-4 text-gray-500 dark:text-gray-300 text-caption font-bodycopy">
            Already have an account?{' '}
            <Link
              href={`/api/auth/login?returnTo=${window.location.href}`}
              className="text-bt-teal dark:text-bt-teal-ultraLight underline"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
};
