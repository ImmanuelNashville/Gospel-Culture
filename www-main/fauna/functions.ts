import {
  FaunaDocument,
  FaunaUserCourseData,
  FaunaUserData,
  Auth0User,
  FaunaGiftedCourseData,
  FaunaCourseProgressData,
  FaunaCourseMigrationData,
  FaunaOrderData,
  FaunaProductNotification,
} from '../models/fauna';
import { SYSTEM_ORDER_IDS } from '../utils/enrollment';
import { createFaunaClientWithQ } from './setup';

async function getAllUserCoursesByEmail(email: string) {
  const { faunaClient, q } = createFaunaClientWithQ();
  type ResponseType = FaunaDocument<FaunaDocument<FaunaUserCourseData>[]>;

  const response = await faunaClient.query<ResponseType>(
    q.Map(q.Paginate(q.Match(q.Index('courses_by_user_email'), email)), (ref) => q.Get(ref))
  );

  return response.data;
}

export async function getEnrolledCoursesByEmail(email: string) {
  const allUserCourses = await getAllUserCoursesByEmail(email);
  return allUserCourses.map((userCourseItem) => userCourseItem.data).filter((course) => course.enrolled);
}

export async function getUnenrolledCoursesByEmail(email: string) {
  const allUserCourses = await getAllUserCoursesByEmail(email);
  return allUserCourses.filter((course) => !course.data.enrolled);
}

export async function getUserProgressForCourse(courseId: string, userEmail: string) {
  const { faunaClient, q } = createFaunaClientWithQ();
  try {
    const progressResponse = await faunaClient.query<FaunaDocument<FaunaCourseProgressData>>(
      q.Get(q.Match(q.Index('user_course_progress_by_email'), [courseId, userEmail]))
    );
    return progressResponse.data;
  } catch (error: any) {
    if (error.requestResult.statusCode === 404) {
      const emptyProgress: FaunaCourseProgressData = {
        userEmail,
        courseId,
        completedLessons: [],
        bookmarkedLessons: [],
        videoProgress: {},
      };

      const newProgress = await faunaClient.query<FaunaDocument<FaunaCourseProgressData>>(
        q.Create(q.Collection('user_course_progress'), { data: emptyProgress })
      );
      return newProgress.data;
    } else {
      console.error(error);
      throw error;
    }
  }
}

export async function updateUserProgressForCourse(
  courseId: string,
  userEmail: string,
  data: Partial<FaunaCourseProgressData>
) {
  const { faunaClient, q } = createFaunaClientWithQ();

  const currentProgress = await faunaClient.query<FaunaDocument<FaunaCourseProgressData>>(
    q.Get(q.Match(q.Index('user_course_progress_by_email'), [courseId, userEmail]))
  );
  const updatedProgress = await faunaClient.query<FaunaDocument<FaunaCourseProgressData>>(
    q.Update(currentProgress.ref, { data })
  );

  return updatedProgress;
}

export async function enrollUserInCourse(email: string, orderId: string, courseIds: string[]) {
  const { faunaClient, q } = createFaunaClientWithQ();

  const enrollmentData = courseIds.map((courseId): FaunaUserCourseData => {
    return {
      email,
      enrolled: true,
      courseId,
      orderId,
      enrolledAt: new Date().toISOString(),
    };
  });

  const response = await Promise.all(
    enrollmentData.map(async (data) => {
      try {
        await faunaClient.query(
          q.Create(q.Collection('user_courses'), {
            data,
          })
        );
        return {
          enrolled: true,
          courseId: data.courseId,
          email: data.email,
          orderId: data.orderId,
        };
      } catch (e) {
        console.error(e);
        return null;
      }
    })
  );

  return response;
}

export async function createUser(auth0user: Auth0User) {
  const { faunaClient, q } = createFaunaClientWithQ();

  const auth0Subs = [];
  auth0Subs.push(auth0user.sub);

  const userData: Partial<FaunaUserData> = {
    email: auth0user.email,
    firstName: auth0user.given_name,
    lastName: auth0user.family_name,
    imageUrl: auth0user.picture,
    nickname: auth0user.nickname,
    auth0Subs,
    role: 'user',
    emailVerified: auth0user.email_verified,
  };

  const user = await faunaClient.query<FaunaDocument<FaunaUserData>>(
    q.Create(q.Collection('users'), { data: userData })
  );
  return user;
}

export async function signUpUser(auth0user: Auth0User) {
  const user = await createUser(auth0user);
  if (user) {
    const giftsReceived = await getReceivedGiftsForEmail(user.data.email);
    if ((giftsReceived?.data.length ?? 0) > 0) {
      const unclaimedGiftedCourseIds =
        giftsReceived?.data.filter((gift) => !gift.data.claimed).map((gift) => gift.data.courseId) ?? [];

      try {
        await enrollUserInCourse(user.data.email, SYSTEM_ORDER_IDS.GIFT, unclaimedGiftedCourseIds);
        await claimAllGiftsForUser(user.data.email);
      } catch (error) {
        console.error(error);
        return user;
      }
    }
    return user;
  }
  throw new Error('failed to create user');
}

export async function updateUser(id: string, data: Partial<FaunaUserData>) {
  const { faunaClient, q } = createFaunaClientWithQ();

  const userResponse = await faunaClient.query<FaunaDocument<FaunaUserData>>(
    q.Get(q.Match(q.Index('user_by_email'), id))
  );

  if (userResponse.ref) {
    const response = await faunaClient.query<FaunaDocument<FaunaUserData>>(q.Update(userResponse.ref, { data }));
    return response.data;
  }
  throw new Error('User not found');
}

export async function getUserByEmail(email: string) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const response = await faunaClient.query<FaunaDocument<FaunaUserData>>(
      q.Get(q.Match(q.Index('user_by_email'), email))
    );
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function isUserEnrolledInCourse(email: string, courseId: string): Promise<[boolean, string]> {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const response = await faunaClient.query<FaunaDocument<FaunaUserCourseData>>(
      q.Get(q.Match(q.Index('course_by_user_email'), email, courseId))
    );
    return [response.data.enrolled, response.data.orderId];
  } catch (error) {
    return [false, ''];
  }
}

export async function createGift(data: FaunaGiftedCourseData) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const giftedCourse = await faunaClient.query<FaunaDocument<FaunaGiftedCourseData>>(
      q.Create(q.Collection('gifted_courses'), { data })
    );
    return giftedCourse;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getReceivedGiftsForEmail(userEmail: string) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const claimedGifts = await faunaClient.query<FaunaDocument<FaunaDocument<FaunaGiftedCourseData>[]>>(
      q.Map(
        q.Paginate(q.Match(q.Index('gifted_courses_by_recipient_email'), userEmail)),
        q.Lambda('giftRef', q.Get(q.Var('giftRef')))
      )
    );
    return claimedGifts;
  } catch (error) {
    return null;
  }
}

export async function claimAllGiftsForUser(userEmail: string) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const claimedGifts = await faunaClient.query(
      q.Foreach(
        q.Paginate(q.Match(q.Index('gifted_courses_by_recipient_email'), userEmail)),
        q.Lambda('giftRef', q.Update(q.Var('giftRef'), { data: { claimed: true } }))
      )
    );
    return claimedGifts;
  } catch (error) {
    return null;
  }
}

export async function getMigrationDatasByEmail(email: string) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const response = await faunaClient.query<FaunaDocument<FaunaCourseMigrationData>>(
      q.Get(q.Match(q.Index('wp_users_courses_by_email'), email))
    );
    return response.data;
  } catch (e) {
    return null;
  }
}

export async function setUserAsMigrated(email: string) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    await faunaClient.query(
      q.Foreach(
        q.Paginate(q.Match(q.Index('wp_users_courses_by_email'), email)),
        q.Lambda('ref', q.Update(q.Var('ref'), { data: { migrated: true } }))
      )
    );
    return;
  } catch (error) {
    return null;
  }
}

export async function addAuth0SubToUser(email: string, auth0Sub: object) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    await faunaClient.query(
      q.Foreach(
        q.Paginate(q.Match(q.Index('user_by_email'), email)),
        q.Lambda('ref', q.Update(q.Var('ref'), { data: { auth0Subs: auth0Sub } }))
      )
    );
    return;
  } catch (error) {
    return null;
  }
}

export async function createOrder(data: FaunaOrderData) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const order = await faunaClient.query<FaunaDocument<FaunaOrderData>>(q.Create(q.Collection('orders'), { data }));
    return order;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCoursesProgressByUser(email: string) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const response = await faunaClient.query<FaunaDocument<FaunaDocument<FaunaCourseProgressData>[]>>(
      q.Map(q.Paginate(q.Match(q.Index('user_courses_progress_by_email'), email)), (ref) => q.Get(ref))
    );
    return response.data;
  } catch (e) {
    return null;
  }
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const response = await faunaClient.query<FaunaDocument<FaunaUserData>>(
      q.Get(q.Match(q.Index('user_by_stripeCustomerId'), stripeCustomerId))
    );
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function setSubCoursesEnrollment(email: string, status: boolean) {
  const { faunaClient, q } = createFaunaClientWithQ();

  try {
    const response = await faunaClient.query<FaunaDocument<FaunaDocument<FaunaUserCourseData>[]>>(
      q.Foreach(
        q.Paginate(
          q.Filter(
            q.Match(q.Index('courses_by_user_email'), email),
            q.Lambda('orderId', q.Equals(q.Select(['data', 'orderId'], q.Get(q.Var('orderId')), ''), 'subscription'))
          )
        ),
        q.Lambda(
          'course',
          q.Update(q.Var('course'), {
            data: {
              enrolled: status,
            },
          })
        )
      )
    );
    return response.data;
  } catch (e) {
    console.error('error');
  }
}

export async function addCartData(email: string, courseIds: string[]) {
  const { faunaClient, q } = createFaunaClientWithQ();

  const cartData = courseIds.map((courseId) => {
    return {
      email,
      courseId,
    };
  });

  await Promise.all(
    cartData.map(async (data) => {
      try {
        await faunaClient.query(
          q.Create(q.Collection('cart'), {
            data,
          })
        );
        return null;
      } catch (e) {
        return null;
      }
    })
  );
}

export async function deleteCartData(email: string, courseIds: string[]) {
  const { faunaClient, q } = createFaunaClientWithQ();

  const cartData = courseIds.map((courseId) => {
    return {
      email,
      courseId,
    };
  });

  await Promise.all(
    cartData.map(async (data) => {
      try {
        await faunaClient.query(
          q.Map(q.Paginate(q.Match(q.Index('cart_courseId_by_email'), data.email, data.courseId)), (ref) =>
            q.Delete(ref)
          )
        );
        return null;
      } catch (e) {
        return null;
      }
    })
  );
}

export async function createProductNotification(data: FaunaProductNotification) {
  const { faunaClient, q } = createFaunaClientWithQ();
  return await faunaClient.query(q.Create(q.Collection('product_notifications'), { data }));
}
