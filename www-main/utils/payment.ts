import StripeLibrary from 'stripe';

export const stripe = new StripeLibrary(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2020-08-27', // cmd+click on `apiVersion` to see LatestApiVersion in the types
  typescript: true,
});

/* TODO: (evanfreeze) We should actually use this in a few places on the backend */
export async function validateStripeCustomerId(stripe: StripeLibrary, stripeId: string): Promise<boolean> {
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
  stripe: StripeLibrary,
  email: string,
  stripeId?: string
): Promise<['customer', string] | ['customer_email', string]> {
  if (stripeId) {
    const isValidStripeCustomerId = await validateStripeCustomerId(stripe, stripeId);
    if (isValidStripeCustomerId) {
      return ['customer', stripeId];
    }
  }
  return ['customer_email', email];
}
