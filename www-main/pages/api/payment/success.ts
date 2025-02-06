import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import paypal from 'paypal-rest-sdk';
import { enrollUserInCourse, updateUser, createOrder, deleteCartData } from '../../../fauna/functions';
import { courseData } from '../../../contentful/functions';
import { FaunaOrderData } from '../../../models/fauna';
import { FaunaOrderSource } from '../../../models/fauna';
import { parseCookie } from '../../../utils';
import { getAdjustedPrice } from '../../../utils/sales';
import { PromoCode } from '../../../hooks/usePromoCodeInput';
import * as mpServer from '../../../mixpanel/server';
import { isFutureCourse } from '../../../utils/dates';
import { ContentfulCourseFields } from '../../../models/contentful';
import { Entry } from 'contentful';
import { stripe } from '../../../utils/payment';

interface CourseItem {
  id: string;
  creator: string;
  price: number;
  courseTitle: string;
  creatorName: string;
  isPreorder: boolean;
}

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const email = session?.user.email;

  const {
    query: { session_id, PayerID, paymentId },
  } = req;

  const mpServerTrackCoursePurchse = (soldItems: CourseItem[], promoCode: PromoCode | null) => {
    try {
      soldItems.forEach((i) => {
        // Promo either doesn't have course restrictions, or if it does, this course is allowed.
        // In the case where someone buys multiple courses, but uses a course-specific promo code that
        // only applies to one of the courses in their cart, this prevents us from logging that promo code
        // on the *other* courses that were part of the order that *weren't* affected by the promo code.
        // We only log the code on the course purchase that the code actually applied to.
        const includePromo =
          (promoCode && !promoCode.allowedCourses) || (promoCode && promoCode.allowedCourses?.includes(i.id));

        mpServer.track(mpServer.Event.ServerCoursePurchase, {
          courseId: i.id,
          creatorId: i.creator,
          price: i.price,
          courseTitle: i.courseTitle,
          creatorName: i.creatorName,
          isPreorder: i.isPreorder,
          ...(includePromo && { promoCode: JSON.stringify(promoCode) }),
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  const courseDataForOrder = (soldItems: CourseItem[]) => {
    return soldItems.map((i) => ({ id: i.id, creator: i.creator, price: i.price, isPreorder: i.isPreorder }));
  };

  const removeCartDataFromFauna = async (courseIds: string[]) => {
    try {
      await deleteCartData(email, courseIds);
    } catch (e) {
      console.error('Error removing cart data');
    }
  };

  //// PAYPAL

  if (PayerID && paymentId) {
    paypal.configure({
      mode: process.env.PAYPAL_MODE as string,
      client_id: process.env.PAYPAL_CLIENT_ID as string,
      client_secret: process.env.PAYPAL_CLIENT_SECRET as string,
    });

    const execute_payment_json = {
      payer_id: String(PayerID),
    };

    const paypalExecute = () => {
      return new Promise((resolve, reject) => {
        paypal.payment.execute(String(paymentId), execute_payment_json, async function (error, payment) {
          if (error) {
            console.error(error.response);
            reject(error);
          } else {
            resolve(payment);
          }
        });
      });
    };

    type PayPalPaymentResponse = {
      transactions: { item_list?: { items: { sku: string }[] }; custom: string; amount: { total: number } }[];
      id: string;
    };
    const payment = (await paypalExecute()) as PayPalPaymentResponse;
    const courseIds: string[] = (payment.transactions[0].item_list?.items ?? []).map((i) => i?.sku);
    const paypalCustom = JSON.parse(payment.transactions[0].custom ?? 'null');
    const promoCode = paypalCustom?.promoCode ? paypalCustom.promoCode : null;

    const courseItems = courseIds.map(async (courseId): Promise<CourseItem> => {
      const course = await courseData(courseId);
      return {
        id: courseId,
        creator: course?.creator?.sys.id ?? 'Unknown Creator ID',
        price: getAdjustedPrice(course?.price ?? 0, courseId, { promoCode }),
        courseTitle: course?.title ?? 'Unknown Course Title',
        creatorName: course?.creator?.fields.name ?? 'Unknown Creator Name',
        isPreorder: course ? isFutureCourse({ fields: { ...course } } as Entry<ContentfulCourseFields>) : false,
      };
    });

    const soldItems = await Promise.all(courseItems);
    const source: FaunaOrderSource = req.cookies.s ? parseCookie(req.cookies.s) : null;
    const orderData: FaunaOrderData = {
      email: email,
      items: courseDataForOrder(soldItems),
      total: Number(payment.transactions[0].amount.total) * 100,
      paymentMethod: 'paypal',
      paymentId: payment.id,
      ...(source && { source }),
      ...(promoCode && { promoCode }),
      type: 'purchase',
      orderedAt: new Date().toISOString(),
    };
    const order = await createOrder(orderData);

    if (!order?.ref.id) {
      return res.status(500).send(`Failed to create order for PayPal transaction. PayPal Payment ID: ${payment.id}`);
    }
    await enrollUserInCourse(email, order?.ref.id, courseIds);

    mpServerTrackCoursePurchse(soldItems, promoCode);

    removeCartDataFromFauna(courseIds);

    res.redirect(`/checkout/success?paymentId=${paymentId}&PayerID=${PayerID}`);
    return;
  } else if (session_id) {
    // STRIPE
    const checkoutSession = await stripe.checkout.sessions.retrieve(String(session_id));
    const courseIds: string[] = checkoutSession.metadata?.courseIds.split(',') ?? [];

    const promoCode: PromoCode | null = checkoutSession.metadata?.promoCode
      ? JSON.parse(checkoutSession.metadata.promoCode)
      : null;

    const courseItems = courseIds.map(async (courseId): Promise<CourseItem> => {
      const course = await courseData(courseId);
      return {
        id: courseId,
        creator: course?.creator?.sys.id ?? 'Unknown Creator ID',
        price: getAdjustedPrice(course?.price ?? 0, courseId, { promoCode: promoCode ? promoCode : undefined }),
        courseTitle: course?.title ?? 'Unknown Course Title',
        creatorName: course?.creator?.fields.name ?? 'Unknown Creator Name',
        isPreorder: course ? isFutureCourse({ fields: { ...course } } as Entry<ContentfulCourseFields>) : false,
      };
    });

    await updateUser(email, { stripeCustomerId: String(checkoutSession.customer) });

    const soldItems = await Promise.all(courseItems);
    const source: FaunaOrderSource = req.cookies.s ? parseCookie(req.cookies.s) : null;
    const orderData: FaunaOrderData = {
      email: email,
      items: courseDataForOrder(soldItems),
      total: checkoutSession.amount_total ?? 0,
      paymentMethod: 'stripe',
      paymentId: String(checkoutSession.payment_intent),
      ...(source && { source }),
      ...(promoCode && { promoCode }),
      type: 'purchase',
      orderedAt: new Date().toISOString(),
    };
    const order = await createOrder(orderData);

    if (!order?.ref.id) {
      return res
        .status(500)
        .send(
          `Failed to create order for Stripe transaction. Stripe Payment Intent: ${checkoutSession.payment_intent}`
        );
    }
    await enrollUserInCourse(email, order?.ref.id, courseIds);

    mpServerTrackCoursePurchse(soldItems, promoCode);

    removeCartDataFromFauna(courseIds);

    res.redirect(`/checkout/success?session_id=${session_id}`);
    return;
  } else {
    res.redirect(`/cart`);
    return;
  }
});
