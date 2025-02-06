import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import paypal from 'paypal-rest-sdk';
import { useEffect } from 'react';
import Button from '../../components/Button';
import CheckoutSuccessSkeleton from '../../components/CheckoutSuccessSkeleton';
import Layout from '../../components/Layout';
import contentfulClient from '../../contentful/contentfulClient';
import { useCartContext } from '../../hooks/useCartContext';
import { PromoCode } from '../../hooks/usePromoCodeInput';
import * as fbpixel from '../../lib/fbpixel';
import * as gtag from '../../lib/gtag';
import * as mpClient from '../../mixpanel/client';
import { ContentfulCourseFields, Course } from '../../models/contentful';
import { contentfulImageLoader } from '../../utils/contentfulImageLoader';
import { isFutureCourse } from '../../utils/dates';
import { stripe } from '../../utils/payment';
import { getAdjustedPrice } from '../../utils/sales';
import { createCourseThumbnailURL } from '../../utils/ui-helpers';

export default function CheckoutSuccessPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { cart, clearCart } = useCartContext();

  const promoCode = props.promoCodeUsed ?? undefined;
  const paymentProvider = props.session_id ? 'stripe' : 'paypal';

  useEffect(() => {
    try {
      mpClient.track(mpClient.Event.Order, {
        cart: props.purchasedCourses.map((i) => ({
          id: i.sys.id,
          title: i.fields.title,
          creatorName: i.fields.creator?.fields.name ?? 'Unknown Creator',
          price: getAdjustedPrice(i.fields.price ?? 0, i.sys.id, { promoCode }),
          imgUrl: i.fields.tileThumbnail?.fields.file.url ?? '',
          slug: i.fields.slug,
        })),
        paymentProvider,
        promoCode,
      });

      fbpixel.event(fbpixel.Action.track, fbpixel.StandardEvent.Purchase, {
        content_ids: props.purchasedCourses.map((c) => c.sys.id),
        content_name: 'course',
        content_type: 'course',
        contents: props.purchasedCourses.map((c) => ({ id: c.sys.id, quantity: 1 })),
        currency: 'USD',
        num_items: props.purchasedCourses.length,
        value:
          props.purchasedCourses.reduce(
            (sum, course) => sum + getAdjustedPrice(course.fields.price ?? 0, course.sys.id, { promoCode }),
            0
          ) / 100,
      });

      props.purchasedCourses.forEach((c) => {
        mpClient.track(mpClient.Event.CoursePurchase, {
          courseId: c.sys.id,
          courseTitle: c.fields.title,
          creatorId: c.fields.creator?.sys.id ?? 'Unknown Creator ID',
          creatorName: c.fields.creator?.fields.name ?? 'Unknown Creator Name',
          courseCategory: c.fields.category.map((c) => c.fields.name),
          price: getAdjustedPrice(c.fields.price ?? 0, c.sys.id, { promoCode }),
          paymentProvider,
          isPreorder: isFutureCourse(c),
        });

        mpClient.track(mpClient.Event.Enrollment, {
          courseId: c.sys.id,
          courseTitle: c.fields.title,
          creatorId: c.fields.creator?.sys.id ?? 'Unknown Creator ID',
          creatorName: c.fields.creator?.fields.name ?? 'Unknown Creator Name',
          courseCategory: c.fields.category.map((c) => c.fields.name),
          type: 'purchase',
        });
      });

      gtag.event(gtag.Action.Purchase, {
        currency: 'USD',
        transaction_id: props.paymentId || props.session_id,
        value:
          props.purchasedCourses.reduce(
            (sum, course) => sum + getAdjustedPrice(course.fields.price ?? 0, course.sys.id, { promoCode }),
            0
          ) / 100,
        items: props.purchasedCourses.map((i) => ({
          item_id: i.sys.id,
          item_name: i.fields.title,
          currency: 'USD',
          price: getAdjustedPrice(i.fields.price ?? 0, i.sys.id, { promoCode }) / 100,
          quantity: 1,
        })),
      });

      window.gtag('event', 'conversion', {
        send_to: 'AW-734177645/vxpACOeE5a0DEO3Sit4C',
        value:
          props.purchasedCourses.reduce(
            (sum, course) => sum + getAdjustedPrice(course.fields.price ?? 0, course.sys.id, { promoCode }),
            0
          ) / 100,
        currency: 'USD',
        transaction_id: props.paymentId || props.session_id,
      });
    } catch (e) {
      console.error(e);
    }

    if ((props.paymentId && props.PayerID) || props.session_id) {
      if (cart.length) {
        clearCart();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMultiple = props.purchasedCourses.length > 1;

  return (
    <Layout title="Success!" description="Bright Trip" fullBleed transparentHeader>
      <CheckoutSuccessSkeleton>
        <h1 className="mt-2 text-4xl font-bold dark:text-gray-100">Got {isMultiple ? "'em" : 'it'}!</h1>
        <div className="max-w-md text-body font-bodycopy text-black/70 dark:text-white/80 space-y-4">
          <p>
            You&apos;ve got {isMultiple ? 'some' : 'a'} brand new course{isMultiple ? 's' : ''}! You&apos;ll receive a
            receipt of this purchase in your email inbox shortly.
          </p>

          <p>
            Thank you so much for supporting us and our creators—we couldn&apos;t do it without you. We can&apos;t wait
            to hear what you think of your new course
            {props.purchasedCourses.length > 1 ? 's' : ''}!
          </p>
          <p>— The Bright Trip Team</p>
        </div>
        <div className="space-y-6 border-t border-b dark:border-white/20 py-8">
          {props.purchasedCourses?.map((course) => (
            <div key={course.sys.id} className="flex items-center space-x-6">
              <Image
                src={createCourseThumbnailURL(course)}
                className="rounded-md"
                alt={course.fields.title}
                width="160"
                height="90"
                loader={contentfulImageLoader}
              />
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold leading-none dark:text-gray-200">{course.fields.title}</h2>
                <p className="text-bt-teal dark:text-bt-teal-light text-lg font-bodycopy">
                  with {course.fields.creator?.fields.name}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/my-courses">
          <Button variant="primary" className="px-7 mt-2">
            See All Your Courses
          </Button>
        </Link>
      </CheckoutSuccessSkeleton>
    </Layout>
  );
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context: GetServerSidePropsContext) {
    const {
      query: { session_id, PayerID, paymentId },
    } = context;

    if (PayerID && paymentId) {
      const getOrderDetails = (paymentId: string) => {
        paypal.configure({
          mode: process.env.PAYPAL_MODE as string,
          client_id: process.env.PAYPAL_CLIENT_ID as string,
          client_secret: process.env.PAYPAL_CLIENT_SECRET as string,
        });

        return new Promise<{ courseIds: string[]; promoCode: PromoCode | null }>((resolve, reject) => {
          paypal.payment.get(paymentId as string, function (error, payment) {
            if (error) {
              return reject(error);
            }

            const ids = payment.transactions[0].item_list?.items.map((i) => i.sku);
            const paypalCustom = JSON.parse(payment.transactions[0].custom ?? 'null');
            return resolve({
              courseIds: ids as string[],
              promoCode: paypalCustom?.promoCode ? paypalCustom.promoCode : null,
            });
          });
        });
      };

      let purchasedCourses: Course[] = [];
      let promoCodeUsed: PromoCode | null = null;

      try {
        const { courseIds, promoCode } = await getOrderDetails(paymentId as string);
        const purchasedCoursesResponse = await contentfulClient.getEntries<ContentfulCourseFields>({
          content_type: 'course',
          'sys.id[in]': courseIds.join(','),
          include: 10,
        });
        purchasedCourses = purchasedCoursesResponse.items;
        promoCodeUsed = promoCode;
      } catch (error) {
        console.error(error);
      }

      return {
        props: {
          PayerID: String(PayerID),
          paymentId: String(paymentId),
          session_id: '',
          purchasedCourses,
          promoCodeUsed,
        },
      };
    } else if (session_id) {
      // STRIPE
      const stripeSessionResponse = await stripe.checkout.sessions.retrieve(String(session_id));
      const promoCodeUsed = stripeSessionResponse.metadata?.promoCode
        ? JSON.parse(stripeSessionResponse.metadata.promoCode)
        : null;

      let purchasedCourses: Course[] = [];

      try {
        const purchasedCoursesResponse = await contentfulClient.getEntries<ContentfulCourseFields>({
          content_type: 'course',
          'sys.id[in]': stripeSessionResponse.metadata?.courseIds,
          include: 10,
        });
        purchasedCourses = purchasedCoursesResponse.items;
      } catch (error) {
        console.error(error);
      }

      return {
        props: {
          PayerID: '',
          paymentId: '',
          session_id: String(session_id),
          purchasedCourses,
          promoCodeUsed,
        },
      };
    } else {
      return {
        redirect: { destination: '/cart', permanent: false },
        props: {},
      };
    }
  },
});
