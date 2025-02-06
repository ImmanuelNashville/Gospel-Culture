import Link from 'next/link';
import { FC } from 'react';
import Layout from '../components/Layout';

const Custom500: FC = () => {
  return (
    <Layout title="Error" description="">
      <div className="flex flex-col items-center gap-4 my-12">
        <h1 className="text-4xl font-bold dark:text-gray-200">Uh oh.</h1>
        <p className="font-bodycopy text-black/70 dark:text-white/70">
          Something went wrong. We&apos;re looking into it!
        </p>
        <p className="font-bodycopy text-black/50 dark:text-white/50 text-sm text-center mt-4">
          Seeing this message multiple times?
          <br />
          Let us know via{' '}
          <Link href="/contact" className="text-bt-teal dark:text-bt-teal-light underline">
            our contact form
          </Link>
          .
        </p>
      </div>
    </Layout>
  );
};

export default Custom500;
