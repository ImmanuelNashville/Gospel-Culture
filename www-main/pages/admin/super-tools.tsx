import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useMutation } from '@tanstack/react-query';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { FormEventHandler, useState } from 'react';
import FullWidthSection from '../../components/PageSections/FullWidthSection';
import SectionWithMargin from '../../components/PageSections/SectionWithMargin';
import Spinner from '../../components/Spinner';
import TextInput from '../../components/TextInput';
import contentfulClient from '../../contentful/contentfulClient';
import { ContentfulCourseFields } from '../../models/contentful';
import { SYSTEM_ORDER_IDS } from '../../utils/enrollment';

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context.req, context.res);
    if (!session?.user['https://brighttrip.com/isSuperAdmin']) {
      return {
        redirect: {
          destination: `/`,
          permanent: false,
        },
        props: {
          courseIds: [],
        },
      };
    }
    const { items } = await contentfulClient.getEntries<ContentfulCourseFields>({
      content_type: 'course',
    });
    const courseIds = items.map((c) => c.sys.id);
    return {
      props: {
        courseIds,
      },
    };
  },
});

export default function SuperAdminToolsPage({ courseIds }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const enrollAllMutation = useMutation({
    mutationFn: enrollInAllCourses,
  });
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState<string>(SYSTEM_ORDER_IDS.REPUBLIC_CAMPAIGN_PERK);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    enrollAllMutation.mutate({
      email,
      courseIds,
      orderId,
    });
  };

  return (
    <main className="font-bodycopy">
      <FullWidthSection bgColor="bg-bt-teal-ultraLight">
        <h1 className="text-bt-teal-dark text-headline6 font-bold">Super Admin Tools</h1>
        <p className="text-bt-teal text-body">
          If you&apos;re not sure if you should be here, you probably shouldn&apos;t be
        </p>
      </FullWidthSection>
      <SectionWithMargin className="bg-bt-background-light p-8 rounded-2xl max-w-max shadow-xl">
        <h2 className="text-headline6 font-bold mb-3">Enroll in everything</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 min-w-[360px]">
          <TextInput
            id="user-email-input"
            label="User email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
          />
          <TextInput
            id="order-id-input"
            label="Order ID"
            placeholder="admin-enroll, etc."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.trim())}
          />
          <button
            disabled={enrollAllMutation.isLoading}
            className="bg-bt-teal text-white px-3 py-1.5 rounded-full mt-3"
            type="submit"
          >
            {enrollAllMutation.isLoading ? (
              <div className="w-6 h-6 mx-auto">
                <Spinner />
              </div>
            ) : (
              'Enroll in all courses'
            )}
          </button>
          {enrollAllMutation.error && <p className="text-red-600 text-center">{String(enrollAllMutation.error)}</p>}
          {enrollAllMutation.isSuccess && <p className="text-green-600 text-center">Success!</p>}
        </form>
      </SectionWithMargin>
    </main>
  );
}

async function enrollInAllCourses({
  email,
  courseIds,
  orderId,
}: {
  email: string;
  courseIds: string[];
  orderId: string;
}) {
  const response = await fetch('/api/admin/add-enrollment', {
    method: 'POST',
    body: JSON.stringify({
      email,
      courseIds,
      orderId,
    }),
  });
  if (response.ok && response.status === 200) {
    return await response.json();
  } else {
    throw new Error(await response.text());
  }
}
