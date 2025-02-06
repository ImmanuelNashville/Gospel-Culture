import fetch from 'node-fetch';
import { normalizeAndHash } from '../utils';

const MAILCHIMP_BASE_URL = `https://us20.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`;
const MAILCHIMP_HEADERS = {
  'content-type': 'application/json',
  Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
};
const MAILCHIMP_SUBSCRIBED_STATUS = 'subscribed';

const getMailchimpUserUrlForEmail = (email: string) => `${MAILCHIMP_BASE_URL}/${normalizeAndHash(email)}`;

export const createOrUpdateSubscriber = async (email: string, firstName: string, lastName: string, tags?: string[]) => {
  try {
    const mailchimpUserResponse = await fetch(getMailchimpUserUrlForEmail(email), {
      headers: MAILCHIMP_HEADERS,
    });

    const userAlreadyInMailchimp = mailchimpUserResponse.status === 200; // would 404 if they don't exist
    const url = userAlreadyInMailchimp ? getMailchimpUserUrlForEmail(email) : MAILCHIMP_BASE_URL;

    const mailchimpResponse = await fetch(url, {
      method: userAlreadyInMailchimp ? 'PATCH' : 'POST',
      headers: MAILCHIMP_HEADERS,
      body: JSON.stringify({
        email_address: email,
        status: MAILCHIMP_SUBSCRIBED_STATUS,
        merge_fields: {
          FNAME: firstName,
          ...(lastName && { LNAME: lastName }),
        },
        ...(tags && { tags }),
      }),
    });

    const data = (await mailchimpResponse.json()) as { status: string };
    return data.status === MAILCHIMP_SUBSCRIBED_STATUS;
  } catch (error) {
    console.error(error);
    return false;
  }
};
