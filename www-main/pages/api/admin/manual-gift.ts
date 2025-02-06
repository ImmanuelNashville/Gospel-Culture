import { NextApiRequest, NextApiResponse } from 'next';
import contentfulClient from '../../../contentful/contentfulClient';
import { createGift, createOrder, getUserByEmail } from '../../../fauna/functions';
import { sendEmail } from '../../../lib/nodemailer';
import { ContentfulCourseFields } from '../../../models/contentful';
import buildExistingUserRecipientEmail from '../../../email-templates/gift-received-existing-user';
import buildNewUserRecipientEmail from '../../../email-templates/gift-received-new-user';
import buildSenderEmail from '../../../email-templates/gift-purchase';
import { isFutureCourse } from '../../../utils/dates';
import { FaunaDocument, FaunaGiftedCourseData } from '../../../models/fauna';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send(req.method + ' is not an allowed method');
  }

  const { giftData, accessToken } = req.body;

  if (!accessToken || accessToken !== process.env.MAILER_PASSWORD) return res.status(401).send('Not authorized');

  if (!giftData) return res.status(400).send('giftData is a required property');

  const { items: giftedCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
    'sys.id[in]': giftData.gift_courseId,
  });

  if (!giftedCourses || giftedCourses.length === 0)
    return res.status(500).send('No courses found for gifted course IDs');

  if (!giftData.gift_fromEmail) return res.status(500).send('No giver email');
  if (!giftData.gift_toEmail) return res.status(500).send('No recipient email');
  if (!giftData.gift_fromName) return res.status(500).send('No giver name');
  if (!giftData.gift_toEmail) return res.status(500).send('No recipient name');

  const receiverUserAccount = await getUserByEmail(giftData.gift_toEmail);

  const order = await createOrder({
    email: giftData.gift_fromEmail,
    items: giftedCourses.map((course) => ({
      id: course.sys.id,
      price: 0,
      creator: course.fields.creator?.sys.id ?? 'Unknown Creator',
      isPreorder: isFutureCourse(course),
    })),
    total: 0,
    paymentMethod: 'manual-gift',
    type: 'gift',
    orderedAt: new Date().toISOString(),
  });

  if (!order) {
    return res.status(500).send('There was a problem creating the order for this manual gift');
  }

  const gifts: FaunaDocument<FaunaGiftedCourseData>[] = [];

  for (const giftedCourse of giftedCourses) {
    const gift = await createGift({
      recipientEmail: giftData.gift_toEmail,
      giverEmail: giftData.gift_fromEmail,
      courseId: giftedCourse.sys.id,
      claimed: false,
      orderId: order.ref.id,
    });

    if (gift) {
      gifts.push(gift);
    } else {
      return res.status(500).send('Unexpected error when creating manual gift. Course Id: ' + giftedCourse.sys.id);
    }
  }

  if (gifts.length === 0) {
    return res.status(500).send('No gifts were created for manual gift request');
  }

  const emailData = {
    toEmail: giftData.gift_toEmail,
    toName: giftData.gift_toName,
    fromEmail: giftData.gift_fromEmail,
    fromName: giftData.gift_fromName,
    giftNote: giftData.gift_note,
    giftedCourse: giftedCourses,
  };

  sendEmail({
    to: giftData.gift_toEmail,
    subject: 'Your Bright Trip Gift 🎁',
    html: receiverUserAccount ? buildExistingUserRecipientEmail(emailData) : buildNewUserRecipientEmail(emailData),
  });
  console.log('GIFT RESENT — Successfully resent email to gift recipient');

  sendEmail({
    to: giftData.gift_fromEmail,
    subject: 'Bright Trip Gift Confirmation 🎁',
    html: buildSenderEmail(emailData),
  });
  console.log('GIFT RESENT — Successfully resent email to gift giver');

  // FOR LOGGING PURPOSES
  sendEmail({
    to: 'evan+gift-resent@brighttrip.com',
    subject: '[AUTOMATED] Bright Trip Gift Emails Resent',
    html: `
            <div>
                <h1>EMAIL RESENT TO RECIPIENT:</h1>
                <p>${emailData.toName} (${emailData.toEmail})</p>
                <div style="padding: 20px; border: 2px solid green;">${
                  receiverUserAccount
                    ? buildExistingUserRecipientEmail(emailData)
                    : buildNewUserRecipientEmail(emailData)
                }</div>
                <h1>EMAIL RESENT TO GIVER:</h1>
                <p>${emailData.fromName} (${emailData.fromEmail})</p>
                <div style="padding: 20px; border: 2px solid green;">${buildSenderEmail(emailData)}</div>
            </div>
        `,
  });

  return res.status(200).send('Emails successfully resent');
}
