import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../utils/payment';
import { buffer } from 'micro';
import {
  getUserByEmail,
  getUserByStripeCustomerId,
  setSubCoursesEnrollment,
  updateUser,
} from '../../../fauna/functions';
import type { Stripe } from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret as string);
    } catch (err: unknown) {
      if (typeof err === 'object') {
        const { message } = err as Record<string, unknown>;
        console.warn(`Stripe Webhook: Error: ${message}`);
      }
      res.status(400).send('Error');
      return;
    }

    switch (event.type) {
      case 'customer.subscription.deleted': {
        let customerId = '';
        if (event.data.object) {
          const id = (event.data.object as Stripe.Subscription).customer;
          if (typeof id === 'string') {
            customerId = id;
          }
        }
        if (!customerId) {
          return res.status(422).json({
            message: `Could not process customer.subscription.deleted event without customer ID: ${customerId}`,
          });
        }

        const user = await getUserByStripeCustomerId(customerId);
        if (!user || !user.email) {
          return res.status(404).json({ message: `Could not find user for stripe customer ID: ${customerId}` });
        }

        const activeSubList = await stripe.subscriptions.list({
          customer: user?.stripeCustomerId,
          status: 'active',
        });
        const trailSubList = await stripe.subscriptions.list({
          customer: user?.stripeCustomerId,
          status: 'trialing',
        });
        const subList = {
          data: [...activeSubList.data, ...trailSubList.data],
        };

        if (subList.data.length < 1) {
          const dataMutations = await Promise.allSettled([
            await updateUser(user.email, { subscribed: false }),
            await setSubCoursesEnrollment(user.email, false),
          ]);

          if (dataMutations.every((mutation) => mutation.status === 'fulfilled')) {
            return res.status(200).json({
              message: `User ${user.email} successfully marked as "subscribed: false" & all subscription courses marked as "enrolled: false"`,
            });
          }
          if (dataMutations.every((mutation) => mutation.status === 'rejected')) {
            return res.status(500).json({
              message: `Failed to mark user ${user.email} as "subscribed: false" & failed to mark subscription courses as "enrolled: false"`,
            });
          }
          if (dataMutations[0].status === 'fulfilled' && dataMutations[1].status === 'rejected') {
            return res.status(500).json({
              message: `User ${user.email} successfully marked as "subscribed: false", but failed to mark subscription courses as "enrolled: false"`,
            });
          }
          if (dataMutations[0].status === 'rejected' && dataMutations[1].status === 'fulfilled') {
            return res.status(500).json({
              message: `Failed to mark user ${user.email} as "subscribed: false", but all subscription courses marked as "enrolled: false"`,
            });
          }
        }
      }
      case 'customer.subscription.created': {
        let customerId = '';
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription) {
          const id = subscription.customer;
          if (typeof id === 'string') {
            customerId = id;
          }
        }
        if (!customerId) {
          return res.status(422).json({
            message: `Could not process customer.subscription.created event wihtout customer ID: ${customerId}`,
          });
        }
        if (typeof subscription.discount?.promotion_code === 'string') {
          const code = await stripe.promotionCodes.retrieve(subscription.discount.promotion_code);
          stripe.subscriptions.update(subscription.id, {
            metadata: {
              'Promo Code': code.code ?? '',
            },
          });
        }
        const user = await getUserByStripeCustomerId(customerId);
        if (!user || !user.email) {
          return res.status(404).json({ message: `Could not find user for stripe customer ID: ${customerId}` });
        }

        const dataMutations = await Promise.allSettled([
          await updateUser(user.email, { subscribed: true }),
          await setSubCoursesEnrollment(user.email, true),
        ]);

        if (dataMutations.every((mutation) => mutation.status === 'fulfilled')) {
          return res.status(200).json({
            message: `User ${user.email} successfully marked as "subscribed: true" & all subscription courses marked as "enrolled: true"`,
          });
        }
        if (dataMutations.every((mutation) => mutation.status === 'rejected')) {
          return res.status(500).json({
            message: `Failed to mark user ${user.email} as "subscribed: true" & failed to mark subscription courses as "enrolled: true"`,
          });
        }
        if (dataMutations[0].status === 'fulfilled' && dataMutations[1].status === 'rejected') {
          return res.status(500).json({
            message: `User ${user.email} successfully marked as "subscribed: true", but failed to mark subscription courses as "enrolled: true"`,
          });
        }
        if (dataMutations[0].status === 'rejected' && dataMutations[1].status === 'fulfilled') {
          return res.status(500).json({
            message: `Failed to mark user ${user.email} as "subscribed: true", but all subscription courses marked as "enrolled: true"`,
          });
        }
      }
      case 'customer.created': {
        let customerEmail = '';
        const customer = event.data.object as Stripe.Customer;
        if (customer) {
          const { email } = customer;
          if (typeof email === 'string') {
            customerEmail = email;
          }
        }
        if (customerEmail) {
          const user = await getUserByEmail(customerEmail);
          if (user) {
            const updatedUser = await updateUser(customerEmail, { stripeCustomerId: customer.id });
            if (updatedUser) {
              return res.status(200).json({
                message: `Updated user ${updatedUser.email} to have stripeCustomerId: ${updatedUser.stripeCustomerId}`,
              });
            } else {
              return res.status(500).json({
                message: `There was a problem adding stripe customer Id (${customer.id}) for stripe-provided email: ${customerEmail}`,
              });
            }
          } else {
            return res.status(404).json({
              message: `No user was found in Fauna for email: ${customerEmail}`,
            });
          }
        }
      }
      default:
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
