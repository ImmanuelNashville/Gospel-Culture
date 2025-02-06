import { Course } from '../models/contentful';

export const mockCourse = {
  fields: {
    trailer: {
      fields: {
        video: {
          signedPlaybackId: 'trailer',
        },
      },
    },
    samples: [
      {
        fields: {
          video: {
            signedPlaybackId: 'sample1',
          },
        },
      },
      {
        fields: {
          video: {
            signedPlaybackId: 'sample2',
          },
        },
      },
    ],
    chapters: [
      {
        fields: {
          lessons: [
            {
              fields: {
                video: {
                  fields: { video: { signedPlaybackId: 'chapter1_lesson1', assetId: 'video1' } },
                },
              },
            },
            {
              fields: {
                video: {
                  fields: { video: { signedPlaybackId: 'chapter1_lesson2', assetId: 'video3' } },
                },
              },
            },
          ],
        },
      },
      {
        fields: {
          lessons: [
            {
              fields: {
                video: {
                  fields: { video: { signedPlaybackId: 'chapter2_lesson1', assetId: 'video5' } },
                },
              },
            },
            {
              fields: {
                video: {
                  fields: { video: { signedPlaybackId: 'chapter2_lesson2', assetId: 'video7' } },
                },
              },
            },
          ],
        },
      },
    ],
  },
} as unknown as Course;
