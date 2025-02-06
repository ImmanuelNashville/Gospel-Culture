import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';

import { GiftDetails } from '../../../components/StripeGiftButton';
import { getSalePrice } from '../../../utils/sales';
import { Course } from '../../../models/contentful';
import { stripe } from '../../../utils/payment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth0Session = await getSession(req, res);

  if (req.method === 'POST') {
    const { giftedCourse, toName, toEmail, fromName, fromEmail, giftNote } = JSON.parse(req.body) as GiftDetails;

    // We need all of these to do anything
    [giftedCourse, toName, toEmail, fromName, fromEmail].forEach((param) => {
      if (!param) {
        return res.status(400).send('Bad Request');
      }
    });

    const lineItems = Array.isArray(giftedCourse)
      ? giftedCourse.map(lineItemFromCourse)
      : [lineItemFromCourse(giftedCourse)];

    try {
      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        metadata: {
          isGiftPurchase: 'true',
          gift_toName: toName,
          gift_toEmail: toEmail,
          gift_fromName: fromName,
          gift_fromEmail: fromEmail,
          gift_courseId: Array.isArray(giftedCourse) ? giftedCourse.map((gc) => gc.sys.id).join() : giftedCourse.sys.id,
          gift_note: giftNote ?? '',
        },
        customer_email: auth0Session?.user.email ?? fromEmail ?? '',
        payment_method_types: ['card'],
        mode: 'payment',
        billing_address_collection: 'required',
        success_url: `${req.headers.origin}/api/payment/gift-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/gifting?canceled=true`,
        payment_intent_data: {
          description: `Gift purchase: ${
            Array.isArray(giftedCourse)
              ? giftedCourse.map((gc) => gc.fields.title).join(', ')
              : giftedCourse.fields.title
          }`,
        },
      });

      return res.json({ url: session.url });
    } catch (err) {
      let code = 500;
      if (typeof err === 'object') {
        const errorCode = (err as Record<string, unknown>).statusCode as number;
        if (errorCode) {
          code = errorCode;
        }
      }
      return res.status(code).json(err);
    }
  } else {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}

function lineItemFromCourse(course: Course) {
  const coursePrice = getSalePrice(course.fields.price ?? 0);

  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name: course.fields.title,
        description: course.fields.creator?.fields.name,
        images: [`https:${course.fields.hero?.fields.file.url}?w=400`],
        metadata: {
          courseTitle: course.fields.title,
          creatorName: course.fields.creator?.fields.name ?? '',
          priceInCentsUSD: coursePrice,
          courseId: course.sys.id,
          courseSlug: course.fields.slug,
        },
      },
      unit_amount_decimal: String(coursePrice),
    },
    quantity: 1,
  };
}
