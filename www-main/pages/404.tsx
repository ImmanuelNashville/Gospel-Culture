import Link from 'next/link';
import { FC } from 'react';
import Layout from '../components/Layout';

const Custom404: FC = () => {
  return (
    <Layout title="Page not found" description="">
      <div className="flex flex-col items-center gap-4 my-12">
        <h1 className="text-4xl font-bold dark:text-gray-200">Hmm.</h1>
        <p className="font-bodycopy text-black/70 dark:text-white/70">This doesn&apos;t look like anything to me.</p>
        <p className="font-bodycopy text-black/50 dark:text-white/50 text-sm text-center mt-4">
          There&apos;s no page at this path.
          <br />
          Head on back to{' '}
          <Link href="/" className="text-bt-teal dark:text-bt-teal-light underline">
            our homepage
          </Link>
          .
        </p>
      </div>
    </Layout>
  );
};

export default Custom404;
