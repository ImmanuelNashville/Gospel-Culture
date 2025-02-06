import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import contentfulClient from '../../../contentful/contentfulClient';
import { ContentfulCourseFields } from '../../../models/contentful';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      try {
        //todo: only get courses with subscrition flag
        const { items: courses } = await contentfulClient.getEntries<ContentfulCourseFields>({
          content_type: 'course',
          include: 2,
        });

        res.setHeader('Cache-Control', 'private, max-age=43200'); // 12 hours
        return res.status(200).json(courses);
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
