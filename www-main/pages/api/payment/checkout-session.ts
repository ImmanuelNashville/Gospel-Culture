import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import type { Stripe } from 'stripe';
import appConfig from '../../../appConfig';
import contentfulClient from '../../../contentful/contentfulClient';
import { CartCourse } from '../../../context/cart';
import {
  createOrder,
  deleteCartData,
  enrollUserInCourse,
  getEnrolledCoursesByEmail,
  getUserByEmail,
  signUpUser,
} from '../../../fauna/functions';
import { PromoCode } from '../../../hooks/usePromoCodeInput';
import { ContentfulCourseFields } from '../../../models/contentful';
import { Auth0User } from '../../../models/fauna';
import { coursePrice } from '../../../utils/courses.server';
import { stripe } from '../../../utils/payment';
import { getAdjustedPrice } from '../../../utils/sales';
import { getBaseName } from '../../../utils/ui-helpers';

interface SubmittedStripeOrder {
  items: CartCourse[];
  total: number;
  promoCode?: PromoCode;
}

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth0Session = await getSession(req, res);

  if (!auth0Session) {
    res.redirect(`/api/auth/login`);
  }

  if (req.method === 'GET') {
    const courseId = String(req.query.cid);
    const promoCode = String(req.query.pc);

    if (!courseId) return res.status(400).send('Bad Request');

    const { items: contentfulResults } = await contentfulClient.getEntries<ContentfulCourseFields>({
      content_type: 'course',
      'sys.id': courseId,
    });

    const [courseToBuy] = contentfulResults;

    if (!courseToBuy) return res.status(404).send('Course not found');

    try {
      let user = await getUserByEmail(auth0Session?.user.email);
      if (!user) {
        const newUser = await signUpUser(auth0Session?.user as Auth0User);
        if (newUser && newUser.data) {
          user = newUser.data;
        } else {
          console.error(`Error creating new user in Buy Now flow — ${auth0Session?.user.email}`);
          return res.status(500).send('Error creating new user');
        }
      }

      const usersCourses = await getEnrolledCoursesByEmail(user.email);
      const userAlreadyEnrolled = usersCourses.some((course) => course.courseId === courseToBuy.sys.id);

      if (userAlreadyEnrolled) {
        res.redirect(`/my-courses/${courseToBuy.fields.slug}`);
        return;
      }

      let validatedPromoCode: PromoCode | undefined;

      if (promoCode) {
        const promoResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APPLICATION_ENV === 'development' ? 'http' : 'https'}://${
            req.headers.host
          }/api/promo`,
          {
            method: 'PUT',
            body: JSON.stringify({
              code: promoCode,
              courseIds: [courseToBuy.sys.id],
            }),
            headers: req.headers as HeadersInit,
          }
        );

        if (promoResponse.status === 200 && promoResponse.ok) {
          validatedPromoCode = await promoResponse.json();
        }
      }

      const adjustedCoursePrice = getAdjustedPrice(courseToBuy.fields.price ?? 0, courseToBuy.sys.id, {
        isActive: appConfig.sale.isActive,
        globalDiscount: appConfig.sale.percentageDiscount,
        promoCode: validatedPromoCode,
      });
      const stripeOrder: SubmittedStripeOrder = {
        items: [
          {
            id: courseToBuy.sys.id,
            title: courseToBuy.fields.title,
            creatorName: courseToBuy.fields.creator?.fields.name ?? 'Unknown Creator',
            price: adjustedCoursePrice,
            slug: `/${getBaseName(courseToBuy.sys.id)}/${courseToBuy.fields.slug}`,
            imgUrl: courseToBuy.fields.tileThumbnail?.fields.file.url ?? '',
          },
        ],
        total: adjustedCoursePrice,
        promoCode: validatedPromoCode,
      };

      const sessionData = await buildStripeCheckoutSession(req, stripeOrder, user?.email, user?.stripeCustomerId, {
        baseURL:
          process.env.NEXT_PUBLIC_APPLICATION_ENV === 'development'
            ? 'http://localhost:3000'
            : 'https://www.brighttrip.com',
        cancelPath: `/${getBaseName(courseId)}/${courseToBuy.fields.slug}`,
      });

      const session = await stripe.checkout.sessions.create(sessionData);

      if (session.url) {
        res.redirect(session.url);
        return;
      }
      return res.status(500).send('Internal Server Error');
    } catch (err) {
      console.error(err);
      let code = 500;
      if (typeof err === 'object') {
        const errorCode = (err as Record<string, unknown>).statusCode as number;
        if (errorCode) {
          code = errorCode;
        }
      }
      return res.status(code).json(err);
    }
  } else if (req.method === 'POST') {
    const { body } = req;
    const parsedBody: SubmittedStripeOrder = JSON.parse(body);

    if (
      !parsedBody.items ||
      parsedBody.items.length < 1 ||
      parsedBody.total === undefined ||
      parsedBody.total === null ||
      parsedBody.total < 0
    ) {
      return res.status(400).send('Bad Request');
    }

    // Handle redemption codes as promo codes so users can use them either way
    if (parsedBody.total === 0) {
      const hasPromoCode = parsedBody.promoCode?.code;
      const isSingleItem = parsedBody.items.length === 1;
      const promoCodeMakesCourseFree = parsedBody.promoCode?.percentageDiscount === 100;
      const promoIsAllowedForSpecifiedCourse = parsedBody.promoCode?.allowedCourses?.includes(parsedBody.items[0].id);

      if (hasPromoCode && isSingleItem && promoCodeMakesCourseFree && promoIsAllowedForSpecifiedCourse) {
        console.log('redemption flow');
        console.log(JSON.stringify(parsedBody, null, 2));
        const courseId = parsedBody.items[0].id;

        // grab the course
        const course = await contentfulClient.getEntry<ContentfulCourseFields>(courseId);

        // grab the user
        const user = await getUserByEmail(auth0Session?.user.email);

        if (!course || !user) {
          return res.status(404);
        }

        // enroll the user in the course for free
        const order = await createOrder({
          email: user.email,
          items: [
            {
              id: course.sys.id,
              price: 0,
              creator: course.fields.creator?.sys.id ?? 'Unknown Creator ID',
              isPreorder: false,
            },
          ],
          total: 0,
          paymentMethod: 'redemption-code',
          type: 'redemption-code',
          promoCode: {
            code: parsedBody.promoCode?.code ?? '',
            percentageDiscount: 100,
            allowedCourses: [course.sys.id],
          },
          orderedAt: new Date().toISOString(),
        });
        if (order) {
          const enrollment = await enrollUserInCourse(user.email, order.ref.id, [course.sys.id]);
          if (enrollment) {
            console.info(
              'Successfully enrolled user via redemption code through checkout flow',
              course.sys.id,
              parsedBody.promoCode?.code
            );
            await deleteCartData(user.email, [course.sys.id]);
            return res.json({
              url: `${req.headers.origin}/checkout/redemption-success?cid=${course.sys.id}&pc=${parsedBody.promoCode?.code}&o=${order.ref.id}`,
            });
          }

          console.error('Error creating enrollment from redemption order through checkout flow', order.ref.id, order);
          return res.status(500).json({ msg: 'Error creating enrollment from redemption order' });
        }
        console.error('Error creating redemption order through checkout flow', courseId, parsedBody.promoCode?.code);
        return res.status(500).json({ msg: 'Error creating redemption order' });
      }

      return res.status(400).send('Bad Request');
    }

    if (parsedBody.items.reduce((sum, item) => item.price + sum, 0) !== parsedBody.total) {
      return res.status(400).send('Bad Request');
    }

    try {
      const user = await getUserByEmail(auth0Session?.user.email);
      const sessionData = await buildStripeCheckoutSession(req, parsedBody, user?.email, user?.stripeCustomerId);

      const session = await stripe.checkout.sessions.create(sessionData);

      return res.json({ url: session.url });
    } catch (err) {
      console.error(err);
      let code = 500;
      if (typeof err === 'object') {
        const errorCode = (err as Record<string, unknown>).statusCode as number;
        if (errorCode) {
          code = errorCode;
        }
      }
      return res.status(code).send(err);
    }
  } else {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
});

export async function buildStripeCheckoutSession(
  req: NextApiRequest,
  orderData: SubmittedStripeOrder,
  email?: string,
  stripeId?: string,
  options?: {
    baseURL?: string;
    cancelPath?: string;
  }
): Promise<Stripe.Checkout.SessionCreateParams> {
  const courseIds = orderData.items.map((c: CartCourse) => c.id);
  const courseTitles = orderData.items.map((c: CartCourse) => c.title);

  const success_url = `${options?.baseURL ?? req.headers.origin}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancel_url = `${options?.baseURL ?? req.headers.origin}${
    options?.cancelPath ? options.cancelPath : '/cart?canceled=true'
  }`;

  const sessionData: Stripe.Checkout.SessionCreateParams = {
    line_items: await Promise.all(
      orderData.items.map(async (item: CartCourse) => {
        const price = await coursePrice(item.id, item.price, true, orderData.promoCode);

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.title,
              description: item.creatorName,
              images: [`https:${item.imgUrl}?w=400`],
              metadata: {
                courseTitle: item.title,
                creatorName: item.creatorName,
                priceInCentsUSD: item.price,
                courseId: item.id,
                courseSlug: item.slug,
              },
            },
            unit_amount_decimal: String(price),
          },
          quantity: 1,
        };
      })
    ),
    payment_method_types: ['card'],
    mode: 'payment',
    billing_address_collection: 'required',
    success_url,
    cancel_url,
    metadata: {
      courseIds: courseIds.join(),
      promoCode: orderData.promoCode ? JSON.stringify(orderData.promoCode) : null,
    },
    payment_intent_data: {
      description: `Course purchase: ${courseTitles.join(', ')}`,
    },
  };

  if (email) {
    // Either use the exisiting Stripe Customer for the user or pre-fill a new one with their email
    const [customerFieldName, customerFieldValue] = await getStripeCustomerFields(email, stripeId);
    sessionData[customerFieldName] = customerFieldValue;
  }

  return sessionData;
}

export async function validateStripeCustomerId(stripeId: string): Promise<boolean> {
  try {
    const customer = await stripe.customers.retrieve(stripeId);
    if (customer && !customer.deleted) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

export async function getStripeCustomerFields(
  email: string,
  stripeId?: string
): Promise<['customer', string] | ['customer_email', string]> {
  if (stripeId) {
    const isValidStripeCustomerId = await validateStripeCustomerId(stripeId);
    if (isValidStripeCustomerId) {
      return ['customer', stripeId];
    }
  }
  return ['customer_email', email];
}
