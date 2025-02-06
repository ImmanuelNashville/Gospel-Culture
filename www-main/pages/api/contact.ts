import { NextApiHandler } from 'next';
import { sendEmail } from '../../lib/nodemailer';

const getRecaptchaUrl = (token: string) =>
  `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`;

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST': {
      try {
        const { body } = req;
        if (!body) return res.status(400).send('Bad request');
        const { email, fullName, message, captchaToken } = JSON.parse(body);
        if (!email || !fullName || !message) return res.status(400).send('Bad request');

        const captchaResponse = await fetch(getRecaptchaUrl(captchaToken), { method: 'POST' });
        const captchaData = await captchaResponse.json();

        if (captchaData?.success) {
          sendEmail({
            to: 'support@brighttrip.com',
            from: 'support@brighttrip.com',
            replyTo: email,
            subject: 'New message from the contact form',
            html: `
                            <div>
                                <h2>New message from the contact form</h2>
                                <div style="background-color: #f3f3f5; border-radius: 16px; padding: 16px;">
                                    <h4>From: <strong>${fullName} (${email})</strong></h4>
                                    <h4>Message:</h4>
                                    <p>${message}</p>
                                </div>
                            </div>
                        `,
          });
          return res.status(200).send('Success');
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
