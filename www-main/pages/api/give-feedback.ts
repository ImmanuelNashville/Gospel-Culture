import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../lib/nodemailer';

export default withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  const email = session?.user.email;

  switch (req.method) {
    case 'POST': {
      try {
        const { body } = req;
        if (!body) return res.status(400).send('Bad request');
        const { metadata, message } = JSON.parse(body);
        if (!email || !message) return res.status(400).send('Bad request');

        sendEmail({
          to: 'feedback@brighttrip.com',
          from: 'feedback@brighttrip.com',
          replyTo: email,
          subject: 'New Course Feedback',
          html: `
            <div>
                <h1>New Course Feedback</h1>
                <div style="backgound:gray;padding:16px;border-radius:16px">
                    ${JSON.stringify(metadata, null, 2)}
                </div>
                <div>
                    <h4>From: ${email}</h4>
                    <h4>Message:</h4>
                    <p>${message}</p>
                </div>
            </div>
        `,
        });
        return res.status(200).send('Success');
      } catch (error) {
        console.error(error);
        return res.status(500).send(error);
      }
    }
    default: {
      return res.status(405).send(`${req.method} Not Allowed`);
    }
  }
});
