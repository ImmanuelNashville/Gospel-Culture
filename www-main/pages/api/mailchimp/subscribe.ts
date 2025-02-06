import { NextApiHandler } from 'next';
import { createOrUpdateSubscriber } from '../../../lib/mailchimp';

const getRecaptchaUrl = (token: string) =>
  `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`;

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST': {
      try {
        const { body } = req;
        if (!body) return res.status(400).send('Bad request');

        const { email, firstName, lastName, captchaToken } = JSON.parse(body);

        const captchaResponse = await fetch(getRecaptchaUrl(captchaToken), { method: 'POST' });
        const captchaData = await captchaResponse.json();

        if (captchaData?.success) {
          const mailchimpSuccess = await createOrUpdateSubscriber(email, firstName, lastName, ['newsletter']);

          if (mailchimpSuccess) {
            return res.status(200).send('You are now subscribed');
          } else {
            throw new Error('There was a problem subscribing you to the mailing list');
          }
        } else {
          throw new Error('captcha check failed');
        }
      } catch (error) {
        console.error(error);
        return res.status(500).send(error);
      }
    }
    default: {
      return res.status(405).send(`${req.method} Not Allowed`);
    }
  }
};

export default handler;
