import { NextApiRequest, NextApiResponse } from 'next';
import contentfulClient from '../../../contentful/contentfulClient';
import { getUserByEmail } from '../../../fauna/functions';
import { sendEmail } from '../../../lib/nodemailer';
import { ContentfulCourseFields } from '../../../models/contentful';
import { stripe } from '../../../utils/payment';
import buildExistingUserRecipientEmail from '../../../email-templates/gift-received-existing-user';
import buildNewUserRecipientEmail from '../../../email-templates/gift-received-new-user';
import buildSenderEmail from '../../../email-templates/gift-purchase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send(req.method + ' is not an allowed method');
  }

  const { paymentIntentId, accessToken, updatedToEmail } = req.body;

  if (!accessToken || accessToken !== process.env.MAILER_PASSWORD) return res.status(401).send('Not authorized');

  if (!paymentIntentId) return res.status(400).send('Payment Intent ID is required');
  if (typeof paymentIntentId !== 'string') return res.status(400).send('Payment Intent ID must be a string');

  const session = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
  });

  if (session.data.length > 1) return res.status(500).send('Multiple checkout sessions found for payment intent');

  const giftData = session.data[0].metadata;

  if (!giftData) return res.status(500).send('No gift metadata found for checkout session');

  const { items: giftedCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
    'sys.id[in]': giftData.gift_courseId,
  });

  if (!giftedCourses || giftedCourses.length === 0)
    return res.status(500).send('No courses found for gifted course IDs');

  if (!giftData.gift_fromEmail) return res.status(500).send('No giver email');
  if (!giftData.gift_toEmail && !updatedToEmail) return res.status(500).send('No recipient email');
  if (!giftData.gift_fromName) return res.status(500).send('No giver name');
  if (!giftData.gift_toEmail) return res.status(500).send('No recipient name');

  const receiverUserAccount = await getUserByEmail(giftData.gift_toEmail);

  const emailData = {
    toEmail: updatedToEmail ?? giftData.gift_toEmail,
    toName: giftData.gift_toName,
    fromEmail: giftData.gift_fromEmail,
    fromName: giftData.gift_fromName,
    giftNote: giftData.gift_note,
    giftedCourse: giftedCourses,
  };

  sendEmail({
    to: emailData.toEmail,
    subject: 'Your Bright Trip Gift 🎁',
    html: receiverUserAccount ? buildExistingUserRecipientEmail(emailData) : buildNewUserRecipientEmail(emailData),
  });
  console.log('GIFT RESENT — Successfully resent email to gift recipient', { paymentIntentId });

  sendEmail({
    to: emailData.fromEmail,
    subject: 'Bright Trip Gift Confirmation 🎁',
    html: buildSenderEmail(emailData),
  });
  console.log('GIFT RESENT — Successfully resent email to gift giver', { paymentIntentId });

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
