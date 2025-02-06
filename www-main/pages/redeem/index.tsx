import { getSession } from '@auth0/nextjs-auth0';
import { useMutation } from '@tanstack/react-query';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Button from '../../components/Button';
import Layout from '../../components/Layout';
import FullWidthSection from '../../components/PageSections/FullWidthSection';
import TextInput from '../../components/TextInput';
import { getUserByEmail } from '../../fauna/functions';
import { FaunaUserData } from '../../models/fauna';
import { redeemCourseWithCode } from '../../utils/mutations';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  let user: FaunaUserData | null = null;
  const session = await getSession(ctx.req, ctx.res);
  if (session?.user.email) {
    user = await getUserByEmail(session.user.email);
  }

  return {
    props: {
      user,
    },
  };
};

function RedemptionPage({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [code, setCode] = useState('');
  const router = useRouter();

  const { error, isLoading, mutate } = useMutation({
    mutationFn: redeemCourseWithCode,
    onSuccess: (data) => {
      if (data.redirectUrl) {
        router.replace(data.redirectUrl);
      }
    },
    onError: (data: { msg: string }) => {
      console.error(data.msg);
    },
  });

  const handleSubmit = () => {
    mutate(code.trim().toUpperCase());
  };

  return (
    <Layout fullBleed title="Redeem Code" description="">
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <FullWidthSection>
        <div className="bg-bt-background-light dark:bg-gray-800 mx-auto p-12 max-w-md flex flex-col items-center shadow-md rounded-2xl">
          <h1 className="text-2xl font-bold mb-2 dark:text-gray-200">Redeem a Code</h1>
          <p className="text-bodySmall font-bodycopy text-gray-600 dark:text-gray-300">
            Have a redemption code for a Bright Trip course?
          </p>
          <p className="text-bodySmall font-bodycopy text-gray-600 dark:text-gray-300 pb-7 mb-8 border-b border-gray-300 dark:border-gray-600">
            Add it below and click &quot;Redeem&quot; to claim it.
          </p>
          {user ? (
            <>
              <TextInput
                id="redemption-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                label="Redemption Code"
              />
              <Button disable={isLoading} className="mt-3 px-5" variant="secondary" onClick={handleSubmit}>
                {isLoading ? 'Submittting...' : 'Redeem'}
              </Button>
              {/* @ts-expect-error message exists typescript is just weird */}
              <p className="mt-2 text-red-600">{error ? error.message : ''}</p>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <p className="font-bodycopy dark:text-gray-300">You must be signed in to redeem a code</p>
              <Link href="/api/auth/login?returnTo=/redeem" className="block">
                <Button variant="secondary" className="mt-3 px-5">
                  Create Account or Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </FullWidthSection>
    </Layout>
  );
}

export default RedemptionPage;
