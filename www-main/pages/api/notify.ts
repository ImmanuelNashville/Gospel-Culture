import { NextApiRequest, NextApiResponse } from 'next';
import { createProductNotification } from '../../fauna/functions';
import { createOrUpdateSubscriber } from '../../lib/mailchimp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      if (!req.body) return res.status(400);
      const parsedBody = JSON.parse(req.body);
      if (!parsedBody.userEmail || typeof parsedBody.userEmail !== 'string') return res.status(400);
      if (!parsedBody.productName || typeof parsedBody.productName !== 'string') return res.status(400);

      try {
        const newNotification = await createProductNotification({
          userEmail: parsedBody.userEmail,
          productName: parsedBody.productName,
          signedUpAt: new Date().toISOString(),
        });
        if (newNotification) {
          const tags = ['Get Updates: ' + parsedBody.productName];
          if (parsedBody.newsletterOptedIn) {
            tags.push('newsletter');
          }
          const newsletterSignupSuccess = await createOrUpdateSubscriber(
            parsedBody.userEmail,
            parsedBody.firstName,
            '',
            tags
          );
          if (newsletterSignupSuccess) {
            console.info('Product notification succeeded with mailchimp update');
            return res.status(200).json(newNotification);
          } else {
            console.warn('Product notification succeeded but mailchimp update failed');
          }
          return res.status(200).json(newNotification);
        }
      } catch (error) {
        // @ts-expect-error fauna types are annoying and this is safe when there's an error
        if (error.requestResult.responseContent.errors.find((e) => e.code === 'instance not unique')) {
          return res.status(409).send("You're already signed up for notifications");
        }
      }
      return res.status(500);
    default:
      return res.status(405);
  }
}
