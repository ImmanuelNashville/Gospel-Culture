import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { getUserByEmail, signUpUser } from '../../fauna/functions';
import { Auth0User } from '../../models/fauna';
import {
  getMigrationDatasByEmail,
  enrollUserInCourse,
  setUserAsMigrated,
  addAuth0SubToUser,
  updateUser,
} from '../../fauna/functions';
import { preventSessionAuthToAuth0Subs, wpIdToContentfulId } from '../../utils';
import { SYSTEM_ORDER_IDS } from '../../utils/enrollment';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  switch (req.method) {
    case 'GET':
      try {
        const user = await getUserByEmail(session?.user.email);
        if (!user) {
          const newUser = await signUpUser(session?.user as Auth0User);
          const newUserEmail = newUser?.data.email.toLowerCase();
          const migrationData = await getMigrationDatasByEmail(newUserEmail);

          if (migrationData) {
            if (migrationData.profileImageUrl) {
              await updateUser(newUserEmail, { imageUrl: migrationData.profileImageUrl });
            }

            if (migrationData.courseIds) {
              const contentfulCourseIds = Array.from(
                new Set(migrationData.courseIds.map((c) => wpIdToContentfulId(c)))
              ) as string[];

              enrollUserInCourse(newUserEmail, SYSTEM_ORDER_IDS.MIGRATION, contentfulCourseIds);
            }

            setUserAsMigrated(newUserEmail);
          }

          res.json(newUser);
        } else {
          const restricted = preventSessionAuthToAuth0Subs(session?.user.sub, user.auth0Subs);

          if (!restricted && !user.auth0Subs.includes(session?.user.sub)) {
            await addAuth0SubToUser(session?.user.email, [...user.auth0Subs, session?.user.sub]);
          }

          res.json({ ...user, ...(restricted && { restricted: true }) });
        }
      } catch (err) {
        let message = 'An unknown error occurred';
        if (typeof err === 'object') {
          const errorMessage = (err as Record<string, unknown>).message as string;
          if (errorMessage) {
            message = errorMessage;
          }
        }
        console.error({ error: message });
      }
      break;
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).end('Method Not Allowed');
  }
});
