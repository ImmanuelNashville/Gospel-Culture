import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserProgressForCourse, updateUserProgressForCourse } from '../../fauna/functions';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  switch (req.method) {
    case 'PUT': {
      if (!req.body) return res.status(400).send('Bad request');
      const { courseId, data } = JSON.parse(req.body);

      try {
        const progressResponse = await updateUserProgressForCourse(courseId, session?.user.email, data);
        return res.status(200).json(progressResponse.data);
      } catch (error) {
        // @ts-expect-error error types are weird but I've verified this is the shape of this type of error
        if (error.requestResult?.statusCode === 404) {
          const existingProgress = await getUserProgressForCourse(courseId, session?.user.email);
          if (existingProgress.courseId) {
            const progressResponse = await updateUserProgressForCourse(courseId, session?.user.email, data);
            return res.status(200).json(progressResponse.data);
          }
        }
        console.error(error);
        return res.status(500).send(error);
      }
    }
    default: {
      return res.status(405).send(`${req.method} Not Allowed`);
    }
  }
});
