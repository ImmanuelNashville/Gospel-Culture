import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import Button from '../../components/Button';
import CheckoutSuccessSkeleton from '../../components/CheckoutSuccessSkeleton';
import Layout from '../../components/Layout';
import contentfulClient from '../../contentful/contentfulClient';
import { ContentfulCourseFields } from '../../models/contentful';
import { stripe } from '../../utils/payment';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const {
    query: { session_id },
  } = context;

  if (!session_id) {
    return {
      redirect: {
        destination: '/gifting',
        permanent: false,
      },
    };
  }

  const stripeSessionResponse = await stripe.checkout.sessions.retrieve(String(session_id));

  const { items: giftedCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
    'sys.id[in]': stripeSessionResponse.metadata?.gift_courseId,
  });

  return {
    props: {
      giftData: stripeSessionResponse.metadata,
      paymentData: stripeSessionResponse,
      giftedCourses,
    },
  };
};

export default function GiftSuccess(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout title="Your Gift Confirmation" description="Bright Trip" transparentHeader>
      <CheckoutSuccessSkeleton>
        <h1 className="mt-2 text-4xl font-bold dark:text-gray-100">Gifted!</h1>
        <div className="max-w-sm text-body font-bodycopy text-black/70 dark:text-white/80 space-y-4">
          <p>
            Your gift purchase is confirmed! We&apos;ve sent you a confirmation email to{' '}
            <strong className="dark:text-white">{props.giftData?.gift_fromEmail}</strong> and sent your gift via email
            to <strong className="dark:text-white">{props.giftData?.gift_toName}</strong> at{' '}
            <strong className="dark:text-white">{props.giftData?.gift_toEmail}</strong> along with your message.
          </p>
          <p>Thanks so much for your support and giving the gift of knowledge!</p>
          <p>— The Bright Trip Team</p>
        </div>
        <Link href="/my-courses">
          <Button variant="primary" className="px-7 mt-2">
            Back to Home
          </Button>
        </Link>
      </CheckoutSuccessSkeleton>
    </Layout>
  );
}
