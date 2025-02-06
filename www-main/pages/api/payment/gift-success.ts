import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import contentfulClient from '../../../contentful/contentfulClient';
import { ContentfulCourseFields } from '../../../models/contentful';
import { enrollUserInCourse, getUserByEmail, createGift, createOrder } from '../../../fauna/functions';
import { sendEmail } from '../../../lib/nodemailer';
import buildExistingUserRecipientEmail from '../../../email-templates/gift-received-existing-user';
import buildNewUserRecipientEmail from '../../../email-templates/gift-received-new-user';
import buildSenderEmail from '../../../email-templates/gift-purchase';
import { FaunaDocument, FaunaGiftedCourseData, FaunaOrderCourse, FaunaOrderSource } from '../../../models/fauna';
import { parseCookie } from '../../../utils';
import { isFutureCourse } from '../../../utils/dates';
import { getSalePrice } from '../../../utils/sales';
import { SYSTEM_ORDER_IDS } from '../../../utils/enrollment';
import { stripe } from '../../../utils/payment';
import appConfig from '../../../appConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { session_id },
  } = req;

  if (!session_id) {
    res.redirect('/cart');
  }

  try {
    const authSession = await getSession(req, res);
    const stripeSessionResponse = await stripe.checkout.sessions.retrieve(String(session_id));

    const { items: giftedCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
      'sys.id[in]': stripeSessionResponse.metadata?.gift_courseId,
    });

    const givingUser = await getUserByEmail(
      authSession?.user.email ?? stripeSessionResponse.metadata?.gift_fromEmail ?? ''
    );

    if (!stripeSessionResponse.metadata?.gift_toEmail) {
      return res.status(500).send('No gift_toEmail found in stripe session metatdata');
    }
    const receivingUser = await getUserByEmail(stripeSessionResponse.metadata?.gift_toEmail);

    const source: FaunaOrderSource = req.cookies.s ? parseCookie(req.cookies.s) : null;

    const giverEmail = givingUser?.email ?? stripeSessionResponse.metadata.gift_fromEmail;

    if (!giverEmail) return res.status(500).send('There was a problem creating this gift');

    const items: FaunaOrderCourse[] = giftedCourses.map((gc) => ({
      id: gc.sys.id,
      price: getSalePrice(gc.fields.price ?? 0),
      creator: gc.fields.creator?.sys.id ?? '',
      isPreorder: isFutureCourse(gc),
    }));

    const order = await createOrder({
      email: giverEmail,
      items,
      total: stripeSessionResponse.amount_total ?? 0,
      paymentMethod: 'stripe',
      paymentId: String(stripeSessionResponse.payment_intent),
      type: 'gift',
      source,
      orderedAt: new Date().toISOString(),
    });

    if (!order) return res.status(500).send('There was a problem creating this gift');

    const sendGiverConfirmation = () => {
      if (giverEmail) {
        sendEmail({
          to: giverEmail,
          subject: 'Bright Trip Gift Confirmation 🎁',
          html: buildSenderEmail({
            toEmail: stripeSessionResponse.metadata?.gift_toEmail ?? '',
            toName: stripeSessionResponse.metadata?.gift_toName ?? '',
            fromEmail: stripeSessionResponse.metadata?.gift_fromEmail ?? '',
            fromName: stripeSessionResponse.metadata?.gift_fromName ?? '',
            giftNote: stripeSessionResponse.metadata?.gift_note ?? '',
            giftedCourse: giftedCourses,
          }),
        });
      }
    };

    if (receivingUser) {
      const gifts: FaunaDocument<FaunaGiftedCourseData>[] = [];

      for (const gc of giftedCourses) {
        const gift = await createGift({
          recipientEmail: receivingUser.email,
          giverEmail,
          courseId: gc.sys.id,
          claimed: true,
          orderId: order.ref.id,
        });
        if (gift) {
          gifts.push(gift);
        } else {
          return res.status(500).send('Unexpected error when creating gift for exisitng user recipient');
        }
      }

      if (gifts.length) {
        await enrollUserInCourse(
          receivingUser.email,
          SYSTEM_ORDER_IDS.GIFT,
          gifts.map((gift) => gift.data.courseId)
        );
        sendEmail({
          to: receivingUser.email,
          subject: 'Your Bright Trip Gift 🎁',
          html: buildExistingUserRecipientEmail({
            toEmail: receivingUser.email,
            toName: stripeSessionResponse.metadata.gift_toName,
            fromEmail: stripeSessionResponse.metadata.gift_fromEmail,
            fromName: stripeSessionResponse.metadata.gift_fromName,
            giftNote: stripeSessionResponse.metadata.gift_note,
            giftedCourse: giftedCourses,
          }),
        });
        sendGiverConfirmation();
      } else {
        return res.status(500).send('There was a problem creating this gift.');
      }
    } else {
      const gifts: FaunaDocument<FaunaGiftedCourseData>[] = [];

      for (const gc of giftedCourses) {
        const gift = await createGift({
          recipientEmail: stripeSessionResponse.metadata.gift_toEmail,
          giverEmail,
          courseId: gc.sys.id,
          claimed: false,
          orderId: order.ref.id,
        });
        if (gift) {
          gifts.push(gift);
        } else {
          return res.status(500).send('Unexpected error when creating gift for new user recipient');
        }
      }

      if (gifts.length) {
        sendEmail({
          to: stripeSessionResponse.metadata.gift_toEmail,
          subject: 'Your Bright Trip Gift 🎁',
          html: buildNewUserRecipientEmail({
            toEmail: stripeSessionResponse.metadata.gift_toEmail,
            toName: stripeSessionResponse.metadata.gift_toName,
            fromEmail: stripeSessionResponse.metadata.gift_fromEmail,
            fromName: stripeSessionResponse.metadata.gift_fromName,
            giftNote: stripeSessionResponse.metadata.gift_note,
            giftedCourse: giftedCourses,
          }),
        });
        sendGiverConfirmation();
      } else {
        return res.status(500).send('There was a problem creating this gift');
      }
    }

    if (appConfig.features.giveOneGetOneCampaignIsEnabled) {
      sendEmail({
        to: 'info+give-one-get-one@brighttrip.com',
        subject: '🔔 New "Give one, get one" purchased!',
        html: `<strong>New "Give one, get one" gift purchased!</strong>
                <p>${giverEmail} just purchased a gift of "${giftedCourses
          .map((c) => c.fields.title)
          .join(', ')}" for $${
          order.data.total / 100
        }. We need to reach out to them to redeem the "get one" portion of their purchase.</p>`,
      });
    }

    return res.redirect(`/checkout/gift-success?session_id=${session_id}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
}
