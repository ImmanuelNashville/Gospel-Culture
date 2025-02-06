import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { createFaunaClientWithQ } from '../../../fauna/setup';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send(`${req.method} Not Allowed`);
  }

  if (process.env.NEXT_PUBLIC_APPLICATION_ENV !== 'production') {
    return res.status(200).json({ migratedUsers: 1, totalMigrations: 2 });
  }

  const session = await getSession(req, res);

  if (!session?.user['https://brighttrip.com/isAdmin']) {
    return res.status(403).send('Forbidden');
  }

  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const totalMigrations = await faunaClient.query(q.Count(q.Documents(q.Collection('wp_users_courses'))));
    const migratedUsers = await faunaClient.query(
      q.Count(
        q.Filter(
          q.Documents(q.Collection('wp_users_courses')),
          q.Lambda('migration', q.Equals(q.Select(['data', 'migrated'], q.Get(q.Var('migration'))), true))
        )
      )
    );
    return res.status(200).json({
      migratedUsers,
      totalMigrations,
    });
  } catch (error) {
    return res.status(500).send('Internal Error');
  }
});
