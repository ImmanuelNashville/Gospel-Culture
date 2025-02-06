import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { enrollUserInCourse, getMigrationDatasByEmail, setUserAsMigrated } from '../../../fauna/functions';
import { wpIdToContentfulId } from '../../../utils';
import { SYSTEM_ORDER_IDS } from '../../../utils/enrollment';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const email = session?.user.email;

  try {
    const migrationData = await getMigrationDatasByEmail(email);

    if (migrationData && !migrationData?.migrated && migrationData?.courseIds) {
      const contentfulCourseIds = Array.from(
        new Set(migrationData.courseIds.map((c) => wpIdToContentfulId(c)))
      ) as string[];

      await enrollUserInCourse(email, SYSTEM_ORDER_IDS.MIGRATION, contentfulCourseIds);
      await setUserAsMigrated(email);
      console.info('/my-courses: User migration: ', email);
      return res.send(true);
    } else {
      return res.send(false);
    }
  } catch (error) {
    console.error('/my-courses: Error in user migration: ', email);
    return res.status(500).send('Error');
  }
});
