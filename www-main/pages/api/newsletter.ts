// pages/api/newsletter.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { firstName, email } = req.body;

  if (!email || !firstName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const DATACENTER = API_KEY?.split('-')[1]; // Mailchimp API keys look like: abc123-us6

  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

  const data = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      FNAME: firstName,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `apikey ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status >= 400) {
    const text = await response.text();
    return res.status(400).json({ message: `Error: ${text}` });
  }

  return res.status(201).json({ message: 'Successfully subscribed!' });
}
