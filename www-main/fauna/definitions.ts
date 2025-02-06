export const FAUNA_COLLECTIONS = [
  'cart',
  'gifted_courses',
  'orders',
  'product_notifications',
  'user_course_progress',
  'user_courses',
  'users',
  'wp_users_courses',
];

export const FAUNA_INDEXES: IndexFQL[] = [
  {
    name: 'cart_courseId_by_email',
    unique: true,
    serialized: true,
    source: 'cart',
    terms: [
      {
        field: ['data', 'email'],
      },
      {
        field: ['data', 'courseId'],
      },
    ],
  },
  {
    name: 'course_by_user_email',
    unique: false,
    serialized: true,
    source: 'user_courses',
    terms: [
      {
        field: ['data', 'email'],
      },
      {
        field: ['data', 'courseId'],
      },
    ],
  },
  {
    name: 'course_by_user_id',
    unique: false,
    serialized: true,
    source: 'user_courses',
    terms: [
      {
        field: ['data', 'userId'],
      },
      {
        field: ['data', 'courseId'],
      },
    ],
  },

  {
    name: 'courses_by_user_email',
    unique: false,
    serialized: true,
    source: 'user_courses',
    terms: [
      {
        field: ['data', 'email'],
      },
    ],
  },
  {
    name: 'courses_by_user_id',
    unique: false,
    serialized: true,
    source: 'user_courses',
    terms: [
      {
        field: ['data', 'userId'],
      },
    ],
  },
  {
    name: 'gifted_courses_by_recipient_email',
    unique: false,
    serialized: true,
    source: 'gifted_courses',
    terms: [
      {
        field: ['data', 'recipientEmail'],
      },
    ],
  },
  {
    name: 'orders_by_creator_id',
    serialized: true,
    source: 'orders',
    terms: [
      {
        binding: 'creatorIds',
      },
    ],
  },
  {
    name: 'orders_by_user_email',
    unique: false,
    serialized: true,
    source: 'orders',
    terms: [
      {
        field: ['data', 'email'],
      },
    ],
  },
  {
    name: 'product_notifications_by_product_name',
    unique: false,
    serialized: true,
    source: 'product_notifications',
    terms: [
      {
        field: ['data', 'productName'],
      },
    ],
  },
  {
    name: 'product_notifications_by_user_email',
    unique: false,
    serialized: true,
    source: 'product_notifications',
    terms: [
      {
        field: ['data', 'userEmail'],
      },
    ],
  },
  {
    name: 'product_notifications_by_userEmail_and_productName',
    unique: true,
    serialized: true,
    source: 'product_notifications',
    terms: [
      {
        field: ['data', 'userEmail'],
      },
      {
        field: ['data', 'productName'],
      },
    ],
  },
  {
    name: 'user_by_email',
    unique: false,
    serialized: true,
    source: 'users',
    terms: [
      {
        field: ['data', 'email'],
      },
    ],
  },
  {
    name: 'user_by_id',
    unique: false,
    serialized: true,
    source: 'users',
    terms: [
      {
        field: ['data', 'id'],
      },
    ],
  },
  {
    name: 'user_by_stripeCustomerId',
    unique: false,
    serialized: true,
    source: 'users',
    terms: [
      {
        field: ['data', 'stripeCustomerId'],
      },
    ],
  },
  {
    name: 'user_course_progress_by_course_id',
    unique: false,
    serialized: true,
    source: 'user_course_progress',
    terms: [
      {
        field: ['data', 'courseId'],
      },
    ],
  },
  {
    name: 'user_courses_by_course_id',
    unique: false,
    serialized: true,
    source: 'user_courses',
    terms: [
      {
        field: ['data', 'courseId'],
      },
    ],
  },
  {
    name: 'user_course_progress_by_email',
    unique: true,
    serialized: true,
    source: 'user_course_progress',
    terms: [
      {
        field: ['data', 'courseId'],
      },
      {
        field: ['data', 'userEmail'],
      },
    ],
  },
  {
    name: 'wp_users_courses_by_email',
    unique: false,
    serialized: true,
    source: 'wp_users_courses',
    terms: [
      {
        field: ['data', 'email'],
      },
    ],
  },
];

export interface IndexFQL {
  name: string;
  unique?: boolean;
  serialized: boolean;
  source: string;
  terms: { field?: string[]; binding?: string }[];
}
