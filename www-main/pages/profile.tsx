import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { InferGetServerSidePropsType } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import AvatarPlaceholder from '../components/AvatarPlaceholder';
import Button from '../components/Button';
import Layout from '../components/Layout';
import SubscriptionDetails from '../components/Pages/Profile/SubscriptionDetails';
import Text from '../components/Text';
import { useBrightTripUser } from '../hooks/useBrightTripUser';

function Profile({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user: brightTripUser } = useBrightTripUser();

  // Set in AUTH0
  const enrolledInAllCourses = user['https://brighttrip.com/enrolledInAllCourses'];

  return (
    <Layout title="Profile" description="">
      {enrolledInAllCourses && (
        <div className="bg-bt-orange p-3 text-center text-white rounded-md">Account enrolled in all courses</div>
      )}

      <h1 className="text-headline4 font-bold text-black/80 text-center mt-10 dark:text-gray-200">Account Settings</h1>

      <section className="bg-bt-background-light mx-auto text-center mt-6 max-w-md rounded-2xl border dark:border-gray-700 p-6 pb-8 shadow-sm dark:bg-gray-800">
        <Text As="h2" variant="headline6" className="mb-8">
          Your Profile
        </Text>
        {brightTripUser?.imageUrl ? (
          <Image
            src={brightTripUser?.imageUrl}
            className="mb-4 rounded-full mx-auto"
            alt=""
            width="80"
            height="80"
            unoptimized
          />
        ) : (
          <AvatarPlaceholder widthHeight="w-20 h20" />
        )}
        <p className="text-xl font-bold dark:text-gray-300">
          {brightTripUser?.firstName} {brightTripUser?.lastName}
        </p>
        <p className="text-body text-gray-500 dark:text-gray-400 font-bodycopy">{brightTripUser?.email}</p>

        <Link href="/api/auth/logout">
          <Button variant="secondary" className="mt-6">
            Sign Out
          </Button>
        </Link>

        {brightTripUser && brightTripUser.subscribed ? (
          <>
            <hr className="mt-8 dark:border-gray-600" />
            <Text As="h2" variant="headline6" className="mt-6 mb-2">
              Subscription Details
            </Text>
            <SubscriptionDetails user={brightTripUser} />
          </>
        ) : null}
      </section>
    </Layout>
  );
}

export default Profile;

export const getServerSideProps = withPageAuthRequired();
