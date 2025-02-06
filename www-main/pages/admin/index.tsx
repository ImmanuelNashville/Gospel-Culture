import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { ClipboardCopyIcon } from '@heroicons/react/outline';
import { Entry } from 'contentful';
import { formatDistanceToNow } from 'date-fns';
import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
import Button from '../../components/Button';
import HeaderProfile from '../../components/HeaderProfile';
import { SectionDivider } from '../../components/SectionDivider';
import Spinner from '../../components/Spinner';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import contentfulClient from '../../contentful/contentfulClient';
import courseNamesMap from '../../courseNames';
import { useBrightTripUser } from '../../hooks/useBrightTripUser';
import useCourseSelect from '../../hooks/useCourseSelect';
import { Course } from '../../models/contentful';
import { FaunaDocument, FaunaOrderData, FaunaUserCourseData, FaunaUserData } from '../../models/fauna';
import btLogoImage from '../../public/images/logo.png';
import { capitalize, normalizeString, toUsd } from '../../utils';
import { contentfulImageLoader } from '../../utils/contentfulImageLoader';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export type CourseTitleWithId = Entry<Pick<Course['fields'], 'title' | 'price'>>;

const tabs = [
  { name: 'Courses', id: 'courses' },
  { name: 'Orders', id: 'orders' },
] as const;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context.req, context.res);

    if (!session?.user['https://brighttrip.com/isAdmin']) {
      return {
        redirect: {
          destination: `/`,
          permanent: false,
        },
      };
    }

    const { items: allCourses } = await contentfulClient.getEntries<Pick<Course['fields'], 'title' | 'price'>>({
      content_type: 'course',
      select: 'sys.id,fields.title,fields.price',
    });

    const aLaCarteCourses = allCourses.filter((course) => (course.fields.price ?? 0) > 0);

    return {
      props: {
        user: session.user,
        allCourses,
        aLaCarteCourses,
      },
    };
  },
});

const AdminPage = ({
  allCourses,
  aLaCarteCourses,
}: {
  allCourses: CourseTitleWithId[];
  aLaCarteCourses: CourseTitleWithId[];
}) => {
  const { user: btUser } = useBrightTripUser();

  return (
    <>
      <nav className="sticky top-0 isolate z-10 bg-bt-teal py-4">
        <div className="b mx-auto flex max-w-screen-xl items-center justify-between px-12">
          <div className="flex items-center gap-2">
            <Link href="/" legacyBehavior>
              <Image
                className="cursor-pointer invert filter"
                src={btLogoImage}
                alt=""
                height="40"
                width="164"
                priority
              />
            </Link>
            <h1 className="text-headline6 text-white">Admin Portal</h1>
          </div>
          {btUser && <HeaderProfile user={btUser} />}
        </div>
      </nav>
      <main className="mx-auto grid max-w-screen-xl grid-cols-5 items-start gap-4 p-8">
        <Section title="Quick Links" className="row-span-3">
          <div className="flex flex-col gap-1">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bt-teal font-bodycopy hover:text-bt-teal-dark hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </Section>
        <Section title="User Search" className="col-span-4">
          <UserSearch allCourses={allCourses} />
        </Section>
        <Section title="One-Click Course Purchase Links" className="col-span-4 space-y-2">
          <p className="font-bodycopy text-black/60">
            Only a la carte courses are displayed here since they&apos;re the only ones that support one-click
            purchases.
          </p>
          <p className="font-bodycopy text-black/60">
            To auto-apply a promo code on this one-click link, just add the code to the end of the link you copy.
          </p>
          <p className="font-bodycopy text-black/60">
            Example: &quot;brighttrip.com/someOneClickLink&quot; should become
            &quot;brighttrip.com/someOneClickLinkWELCOME10&quot; to apply the WELCOME10 code.
          </p>
          <SectionDivider />
          <div className="divide-y mt-6">
            {aLaCarteCourses.map((course) => (
              <OneClickPurchaseLink key={course.sys.id} course={course} />
            ))}
          </div>
        </Section>
      </main>
    </>
  );
};

const Section = ({ title, className = '', children }: { title: string; className?: string; children?: ReactNode }) => (
  <section className={`rounded-lg bg-bt-background-light border p-4 ${className}`}>
    <Text As="h2" variant="headline6" className="mb-4">
      {title}
    </Text>
    {children}
  </section>
);

interface UserSearchResponse {
  user: FaunaUserData;
  enrollments: FaunaDocument<FaunaDocument<FaunaUserCourseData>[]>;
  courses: {
    items: {
      sys: Pick<Course['sys'], 'id'>;
      fields: Pick<Course['fields'], 'title' | 'tileThumbnail'>;
    }[];
    total: number;
  };
  orders: FaunaDocument<FaunaOrderData>[];
}

const UserSearch = ({ allCourses }: { allCourses: CourseTitleWithId[] }) => {
  const [currentUserTab, setCurrentUserTab] = useState<'courses' | 'orders'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserSearchResponse>();
  const [searchStatus, setSearchStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const { CourseSelect, selectedCourse, resetSelectedCourse } = useCourseSelect(allCourses);

  const isDev = process.env.NEXT_PUBLIC_APPLICATION_ENV === 'development';
  const stripeBaseURL = `https://dashboard.stripe.com/${isDev ? 'test/' : ''}customers/`;

  const handleSearch = async (email?: string) => {
    if (!email && searchQuery.trim().length < 2) return;
    try {
      setSearchStatus('fetching');
      const response = await fetch(
        `/api/admin/search-users?email=${encodeURIComponent(normalizeString(email ?? searchQuery))}`
      );
      if (response.ok && response.status === 200) {
        const data: UserSearchResponse = await response.json();
        setResults(data);
        setSearchStatus('success');
      } else {
        console.error('Something went wrong');
        setSearchStatus('error');
      }
    } catch (error) {
      console.error(error);
      setSearchStatus('error');
    }
  };

  const toggleEnrollment = async (enrollment: FaunaDocument<FaunaUserCourseData>) => {
    try {
      const response = await fetch(
        `/api/admin/update-enrollment?refId=${enrollment.ref['@ref'].id}&newEnrollmentValue=${!enrollment.data
          .enrolled}`
      );
      if (response.ok && response.status === 200) {
        const updateData: { updatedEnrollment: FaunaDocument<FaunaUserCourseData> } = await response.json();
        if (updateData.updatedEnrollment.data.enrolled === !enrollment.data.enrolled) {
          handleSearch(enrollment.data.email);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewEnrollment = async () => {
    try {
      const response = await fetch('/api/admin/add-enrollment', {
        method: 'POST',
        body: JSON.stringify({
          email: results?.user.email,
          courseIds: [selectedCourse.id],
        }),
      });
      if (response.ok && response.status === 200) {
        handleSearch(results?.user.email);
        resetSelectedCourse();
      } else {
        throw new Error('There was a problem enrolling the user in the course');
      }
    } catch (error) {
      console.error();
    }
  };

  const parseAuthMethods = (subs: string[]) => {
    const parsed = subs.map((sub) => {
      if (sub.startsWith('google')) {
        return 'Sign in with Google';
      } else if (sub.startsWith('facebook')) {
        return 'Sign in with Facebook';
      } else {
        return 'Username & Password';
      }
    });
    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'disjunction' });
    return formatter.format(parsed);
  };

  const courseNameLookup = useMemo(
    () =>
      Object.entries(courseNamesMap).reduce((map, cn) => {
        map.set(cn[1], cn[0]);
        return map;
      }, new Map()),
    []
  );

  return (
    <div>
      <div className="flex items-end gap-4">
        <TextInput
          id="search-users"
          label="Email Address"
          placeholder="Enter email address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="secondary" disable={searchQuery.trim().length < 2} onClick={() => handleSearch()}>
          Search
        </Button>
      </div>
      {results && results.user && results.courses && results.enrollments && searchStatus === 'success' ? (
        <div className="my-6 rounded-lg border p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <Text As="h3" variant="headline6" className="mb-2">
                {results.user.firstName} {results.user.lastName}
              </Text>
              <div className="grid grid-cols-2 my-2 mb-4 gap-y-1">
                <Text variant="bodyBold" className="font-bodycopy">
                  Email
                </Text>
                <Text variant="body" className="font-bodycopy">
                  <a className="underline text-bt-teal" href={`mailto:${results.user.email}`}>
                    {results.user.email}
                  </a>
                </Text>
                <Text variant="bodyBold" className="font-bodycopy">
                  Login Method{results.user.auth0Subs.length !== 1 ? 's' : ''}
                </Text>
                <Text variant="body" className="font-bodycopy">
                  {parseAuthMethods(results.user.auth0Subs)}
                </Text>
                <Text variant="bodyBold" className="font-bodycopy">
                  Stripe Profile
                </Text>
                <Text variant="body" className="font-bodycopy">
                  {results.user.stripeCustomerId ? (
                    <a
                      href={`${stripeBaseURL}${results.user.stripeCustomerId}`}
                      className="underline text-bt-teal"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {results.user.stripeCustomerId}
                    </a>
                  ) : (
                    'None'
                  )}
                </Text>
                <Text variant="bodyBold" className="font-bodycopy">
                  Subscribed
                </Text>
                <Text variant="body" className="font-bodycopy">
                  {results.user.subscribed ? 'Yes' : 'No'}
                </Text>
                <Text variant="bodyBold" className="font-bodycopy">
                  Was Beta Subscriber
                </Text>
                <Text variant="body" className="font-bodycopy">
                  {results.user.subBetaEnroll ? 'Yes' : 'No'}
                </Text>
              </div>
            </div>
            <Image
              src={results.user.imageUrl ?? ''}
              width="60"
              height="60"
              className="mb-4 rounded-full"
              alt=""
              unoptimized
            />
          </div>
          <div>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <a
                    key={tab.name}
                    onClick={() => setCurrentUserTab(tab.id)}
                    className={classNames(
                      currentUserTab === tab.id
                        ? 'border-bt-teal text-bt-teal'
                        : 'border-transparent text-bt-teal-light hover:border-bt-teal-light',
                      'text-subtitle1 font-bold whitespace-nowrap py-4 px-1 border-b-2 cursor-default'
                    )}
                    aria-current={currentUserTab === tab.id ? 'page' : undefined}
                  >
                    {tab.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>
          {currentUserTab === 'courses' ? (
            <div className="mt-4 divide-y">
              {results.courses.items.map((course) => {
                const enrollmentForCourse = results?.enrollments.data.find((e) => e.data.courseId === course.sys.id);
                if (!enrollmentForCourse) return <></>;
                return (
                  <div key={course.sys.id} className="grid grid-cols-4 items-center py-4">
                    <div
                      className={`col-span-2 flex items-center gap-3 ${
                        enrollmentForCourse.data.enrolled ? '' : 'line-through opacity-30'
                      }`}
                    >
                      <Image
                        src={course.fields.tileThumbnail?.fields.file.url ?? ''}
                        alt={course.fields.title}
                        width="64"
                        height="64"
                        className="rounded w-16 h-16 object-cover"
                        loader={contentfulImageLoader}
                      />
                      <div>
                        <Text As="h4" variant="bodyBold">
                          {course.fields.title}
                        </Text>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Text
                        variant="bodyBold"
                        className={`font-bodycopy ${enrollmentForCourse.data.enrolled ? '' : 'text-red-600'}`}
                      >
                        {enrollmentForCourse.data.enrolled ? 'Enrolled' : 'No Longer Enrolled'}
                      </Text>
                      <Text variant="body" className="font-bodycopy">
                        Order: {enrollmentForCourse.data.orderId ?? 'unknown'}
                      </Text>
                    </div>
                    {enrollmentForCourse.data.enrolled ? (
                      <div className="justify-self-end">
                        <Button
                          variant="background"
                          size="extraSmall"
                          onClick={() => toggleEnrollment(enrollmentForCourse)}
                        >
                          <span className="text-red-700">Remove from Course</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="justify-self-end">
                        <Button
                          variant="secondary"
                          size="extraSmall"
                          onClick={() => toggleEnrollment(enrollmentForCourse)}
                        >
                          Re-enroll in Course
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="pt-6 pb-2">
                <Text As="h3" variant="subtitle1" className="mb-3">
                  Add Enrollment
                </Text>
                <div className="flex items-end gap-4">
                  <div className="w-full">
                    <CourseSelect />
                  </div>
                  <Button variant="secondary" onClick={handleNewEnrollment}>
                    Enroll
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {currentUserTab === 'orders' ? (
            <div className="mt-4 divide-y">
              <div className="grid grid-cols-5 py-2 font-bold uppercase">
                <p>When</p>
                <p>Total</p>
                <p className="col-span-2">Items</p>
                <p>Paid Via</p>
              </div>
              {results.orders
                ?.sort((a, b) => b.ts - a.ts)
                .map((order) => (
                  <div key={order.ts} className="grid grid-cols-5 py-2">
                    <time
                      dateTime={new Date(order.ts / 1000).toISOString()}
                      title={new Date(order.ts / 1000).toString()}
                    >
                      {formatDistanceToNow(new Date(order.ts / 1000), { addSuffix: true })}
                    </time>
                    <p>{toUsd(order.data.total, true)}</p>
                    <ul className="col-span-2 list-disc ml-4">
                      {order.data.items?.map((item) => <li key={item.id}>{courseNameLookup.get(item.id)}</li>) ?? (
                        <li>
                          {capitalize(order.data.type)}
                          {order.data.type === 'subscription' ? ` (${order.data.billingInterval}ly)` : ''}
                        </li>
                      )}
                    </ul>
                    <p>{capitalize(order.data.paymentMethod)}</p>
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      ) : (
        <Text As="span" variant="body" className="text-gray-400">
          {searchStatus === 'success' && 'No user found for that email address'}
          {searchStatus === 'error' && 'Something went wrong fetching the user'}
          {searchStatus === 'fetching' && <Loading />}
        </Text>
      )}
    </div>
  );
};

const Loading = () => (
  <div className="mx-auto my-4 h-8 w-8 text-gray-500">
    <Spinner />
  </div>
);

const OneClickPurchaseLink = ({ course }: { course: CourseTitleWithId }) => {
  const [status, setStatus] = useState<'Copy Link' | 'Copying...' | 'Copied!' | 'Copying Failed :('>('Copy Link');

  const handleCopy = async () => {
    setStatus('Copying...');
    try {
      await navigator.clipboard.writeText(
        `${window.location.protocol}://${window.location.host}/api/auth/login?returnTo=${encodeURIComponent(
          `/api/payment/checkout-session?cid=${course.sys.id}&pc=`
        )}`
      );
      setStatus('Copied!');
    } catch (error) {
      setStatus('Copying Failed :(');
      console.error(error);
    }
    setTimeout(() => {
      setStatus('Copy Link');
    }, 1500);
  };

  return (
    <div className="flex justify-between items-center py-2">
      <Text variant="subtitle1">{course.fields.title}</Text>
      <button
        onClick={handleCopy}
        disabled={status !== 'Copy Link'}
        className="flex gap-1 items-center text-bt-teal cursor-pointer hover:bg-gray-100 hover:text-bt-teal-dark px-2 py-1 rounded-md"
      >
        <ClipboardCopyIcon className="h-5 w-5" />
        {status}
      </button>
    </div>
  );
};

export default AdminPage;

const QUICK_LINKS = [
  {
    href: '/admin/dashboard',
    label: 'Watch Time Dashboard',
  },
  {
    href: 'https://mixpanel.com/project/2327487',
    label: 'Mixpanel',
  },
  {
    href: 'https://analytics.google.com/analytics/web/#/p287265308/reports/reportinghub',
    label: 'Google Analytics',
  },
  {
    href: 'https://app.datadoghq.com/rum/explorer?tab=session',
    label: 'DataDog',
  },
  {
    href: 'https://dashboard.mux.com/organizations/jcc8r3/environments/t3dnak/metrics',
    label: 'Mux',
  },
  {
    href: 'https://app.contentful.com/spaces/bhsr3r63z25m/entries',
    label: 'Contentful',
  },
  {
    href: 'https://dashboard.fauna.com/',
    label: 'Fauna',
  },
  {
    href: 'https://github.com/logiccadence/brighttrip-new',
    label: 'Github',
  },
  {
    href: 'https://vercel.com/brighttrip/brighttrip-new',
    label: 'Vercel',
  },
];
