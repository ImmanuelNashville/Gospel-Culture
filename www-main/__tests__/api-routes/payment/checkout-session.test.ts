import { NextApiRequest } from 'next';
import { testApiHandler } from 'next-test-api-route-handler';
import checkoutSessionHandler, {
  buildStripeCheckoutSession,
  getStripeCustomerFields,
  validateStripeCustomerId,
} from '../../../pages/api/payment/checkout-session';
import type { Stripe } from 'stripe';
import * as faunaFunctions from '../../../fauna/functions';
import { FaunaUserData } from '../../../models/fauna';

jest.mock('contentful', () => ({
  createClient: jest.fn(),
}));
jest.mock('../../../contentful/contentfulClient', () => ({
  __esModule: true,
  default: {
    getEntries: (options: any) => {
      switch (options['sys.id']) {
        case 'someCourseId':
          return { items: [{ fields: { price: 4200 } }] };
        case 'anotherCourseId':
          return { items: [{ fields: { price: 5400 } }] };
        default:
          throw new Error(`received unknown mock course id: ${options['sys.id']}`);
      }
    },
  },
}));
jest.mock('../../../appConfig', () => ({
  __esModule: true,
  default: {
    sale: {},
  },
}));
jest.mock('@auth0/nextjs-auth0', () => ({
  withApiAuthRequired: (cb: any) => cb,
  getSession: () => ({
    user: {
      email: 'test@test.com',
    },
  }),
}));
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    customers: {
      retrieve: jest.fn().mockImplementation(
        (id: string) =>
          new Promise((res, rej) => {
            if (id === 'validCustomerId') {
              res({ id: 'validCustomerId' } as Stripe.Customer);
            }
            if (id === 'deletedCustomerId') {
              res({ id: 'deletedCustomerId', deleted: true } as Stripe.DeletedCustomer);
            }
            if (id === 'invalidCustomerId') {
              rej(new Error('nah'));
            }
          })
      ),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          url: 'someUrl',
        }),
      },
    },
  })),
}));
jest.spyOn(faunaFunctions, 'getUserByEmail').mockImplementation((email: string) =>
  Promise.resolve({
    email,
  } as FaunaUserData)
);

const mockCartSubmission = {
  items: [
    {
      id: 'someCourseId',
      title: 'A totally real course',
      slug: '/test/a-totally-real-course',
      creatorName: 'Zero Cool',
      price: 4200,
      imgUrl: '//test.com/some-real-image.jpg',
    },
    {
      id: 'anotherCourseId',
      title: 'Another totally real course',
      slug: '/test/another-totally-real-course',
      creatorName: 'Acid Burn',
      price: 5400,
      imgUrl: '//test.com/another-real-image.jpg',
    },
  ],
  total: 9600,
};

describe('/api/payment/checkout-session', () => {
  describe('POST flow', () => {
    it('returns 400 if called without items at all', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: checkoutSessionHandler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            body: JSON.stringify({ total: 1000 }),
          });

          expect(res.status).toBe(400);
          expect(await res.text()).toEqual('Bad Request');
        },
      });
    });

    it('returns 400 if called with 0 items', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: checkoutSessionHandler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            body: JSON.stringify({
              items: [],
              total: 1000,
            }),
          });

          expect(res.status).toBe(400);
          expect(await res.text()).toEqual('Bad Request');
        },
      });
    });

    it('returns 400 if called with no total', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: checkoutSessionHandler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            body: JSON.stringify({
              items: mockCartSubmission.items,
            }),
          });

          expect(res.status).toBe(400);
          expect(await res.text()).toEqual('Bad Request');
        },
      });
    });

    it('returns 400 if called with total of 0', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: checkoutSessionHandler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            body: JSON.stringify({
              items: mockCartSubmission.items,
              total: 0,
            }),
          });

          expect(res.status).toBe(400);
          expect(await res.text()).toEqual('Bad Request');
        },
      });
    });

    it('returns 400 if called with negative total', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: checkoutSessionHandler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            body: JSON.stringify({
              items: mockCartSubmission.items,
              total: -1200,
            }),
          });

          expect(res.status).toBe(400);
          expect(await res.text()).toEqual('Bad Request');
        },
      });
    });

    it("returns 400 if called with items that don't add up to the total", async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: checkoutSessionHandler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            body: JSON.stringify({
              items: mockCartSubmission.items,
              total: 1000,
            }),
          });

          expect(res.status).toBe(400);
          expect(await res.text()).toEqual('Bad Request');
        },
      });
    });

    it('returns 200 if called correctly', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: checkoutSessionHandler,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            body: JSON.stringify(mockCartSubmission),
          });

          expect(faunaFunctions.getUserByEmail).toHaveBeenCalledWith('test@test.com');
          expect(res.status).toBe(200);
          expect(await res.json()).toEqual({
            url: 'someUrl',
          });
        },
      });
    });
  });
});

describe('buildStripeCheckoutSession', () => {
  const mockRequest = {
    headers: {
      origin: 'test.com',
    },
  } as NextApiRequest;

  const baseExpectedResponse = {
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'A totally real course',
            description: 'Zero Cool',
            images: [`https://test.com/some-real-image.jpg?w=400`],
            metadata: {
              courseTitle: 'A totally real course',
              creatorName: 'Zero Cool',
              priceInCentsUSD: 4200,
              courseId: 'someCourseId',
              courseSlug: '/test/a-totally-real-course',
            },
          },
          unit_amount_decimal: '4200',
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Another totally real course',
            description: 'Acid Burn',
            images: [`https://test.com/another-real-image.jpg?w=400`],
            metadata: {
              courseTitle: 'Another totally real course',
              creatorName: 'Acid Burn',
              priceInCentsUSD: 5400,
              courseId: 'anotherCourseId',
              courseSlug: '/test/another-totally-real-course',
            },
          },
          unit_amount_decimal: '5400',
        },
        quantity: 1,
      },
    ],
    payment_method_types: ['card'],
    mode: 'payment',
    billing_address_collection: 'required',
    success_url: 'test.com/api/payment/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'test.com/cart?canceled=true',
    // Used to enroll the user in the course
    metadata: { courseIds: 'someCourseId,anotherCourseId', promoCode: null },
    payment_intent_data: {
      description: 'Course purchase: A totally real course, Another totally real course',
    },
  };

  it('returns the correct format, with user email but no stripe ID (new user, first stripe checkout)', async () => {
    const sessionData = await buildStripeCheckoutSession(mockRequest, mockCartSubmission, 'test@test.com');
    expect(sessionData).toEqual({ ...baseExpectedResponse, customer_email: 'test@test.com' });
  });

  it('returns the correct format, with user email and stripe ID (returning customer)', async () => {
    const sessionData = await buildStripeCheckoutSession(
      mockRequest,
      mockCartSubmission,
      'test@test.com',
      'validCustomerId'
    );
    expect(sessionData).toEqual({ ...baseExpectedResponse, customer: 'validCustomerId' });
  });

  it('returns the correct format, no user email or stripe ID (unlikely state since email is required on a user)', async () => {
    const sessionData = await buildStripeCheckoutSession(mockRequest, mockCartSubmission);
    expect(sessionData).toEqual(baseExpectedResponse);
  });
});

describe('validateStripeCustomerId', () => {
  it('returns true if the customer exists', async () => {
    const result = await validateStripeCustomerId('validCustomerId');
    expect(result).toEqual(true);
  });

  it('returns false if the customer is deleted', async () => {
    const result = await validateStripeCustomerId('deletedCustomerId');
    expect(result).toEqual(false);
  });

  it('returns false if the customer Id is invalid', async () => {
    const result = await validateStripeCustomerId('invalidCustomerId');
    expect(result).toEqual(false);
  });
});

describe('getStripeCustomerFields', () => {
  it('returns the customer id field and value when the customer is valid', async () => {
    const result = await getStripeCustomerFields('test@test.com', 'validCustomerId');
    expect(result).toEqual(['customer', 'validCustomerId']);
  });

  it('returns the customer email field and value when the customer is deleted', async () => {
    const result = await getStripeCustomerFields('test@test.com', 'deletedCustomerId');
    expect(result).toEqual(['customer_email', 'test@test.com']);
  });

  it('returns the customer email field and value when the customer id is invalid', async () => {
    const result = await getStripeCustomerFields('test@test.com', 'invalidCustomerId');
    expect(result).toEqual(['customer_email', 'test@test.com']);
  });

  it('returns the customer email field and value when there is no customer id', async () => {
    const result = await getStripeCustomerFields('test@test.com', undefined);
    expect(result).toEqual(['customer_email', 'test@test.com']);
  });
});
