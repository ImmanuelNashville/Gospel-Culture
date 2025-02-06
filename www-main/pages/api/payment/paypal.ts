import { NextApiRequest, NextApiResponse } from 'next';
import { CartCourse } from '../../../context/cart';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { coursePrice } from '../../../utils/courses.server';

import paypal from 'paypal-rest-sdk';

paypal.configure({
  mode: process.env.PAYPAL_MODE as string,
  client_id: process.env.PAYPAL_CLIENT_ID as string,
  client_secret: process.env.PAYPAL_CLIENT_SECRET as string,
});

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<void>(async (resolve) => {
    const auth0Session = getSession(req, res);

    if (!auth0Session) {
      res.redirect(`/api/auth/login`);
    }

    if (req.method === 'POST') {
      const { body } = req;
      const { items: cartItems, promoCode } = JSON.parse(body);

      const items = await Promise.all(
        (cartItems as CartCourse[]).map(async (i: CartCourse) => {
          const price = ((await coursePrice(i.id, i.price, true, promoCode)) / 100).toString();

          return {
            name: i.title,
            // the sku is the contentful entry id for the course, it is used on /checkout/success to assign the course
            sku: i.id,
            price,
            currency: 'USD',
            quantity: 1,
          };
        })
      );
      const total = items.reduce((sum, { price }) => sum + parseInt(price), 0).toString();
      //the total has to match the sum of all prices or paypal will respond with VALIDATION_ERROR

      // We don't need any user id here b/c course is assigned on /checkout/success using the auth0 id in the session; it used to be in 'custom'
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: `${req.headers.origin}/api/payment/success`,
          cancel_url: `${req.headers.origin}/cart?canceled=true`,
        },
        transactions: [
          {
            item_list: {
              items,
            },
            amount: {
              currency: 'USD',
              total,
            },
            // TODO what is this for ?
            description: 'Bright Trip',
            custom: JSON.stringify({ promoCode }),
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          if (payment.links?.length) {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === 'approval_url') {
                res.json({ url: payment.links[i].href });
                resolve();
              }
            }
          }
        }
      });
    }
  });
});
