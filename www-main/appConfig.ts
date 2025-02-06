import course from './courseNames';
import creator from './creatorNames';

export const appConfig = {
  features: {
    giveOneGetOneCampaignIsEnabled: false,
  },
  banner: {
    isActive: false,
    title: 'Spring Sale!',
    subtitle: '30% off everything through Saturday March 23!',
  },
  promoModal: {
    isActive: false,
    localStorageKey: 'bf2022',
    image: {
      src: '/images/black-friday-modal.png',
      alt: 'Bright Trip Black Friday Sale - 30% off everything',
      width: '640',
      height: '780',
    },
  },
  sale: {
    isActive: false,
    percentageDiscount: 30,
    courses: {
      [course['Short-Form Storytelling']]: {
        isActive: true,
        percentageDiscount: 30,
      },
    } as Record<string, { isActive: boolean; percentageDiscount: number }>,
  },
  library: {
    featuredGuide: '',
    heroCreators: [
      {
        creatorId: creator['Nathaniel Drew'],
        courseId: course['How It Became Paris'],
        subtitle: 'History of Paris',
      },
      {
        creatorId: creator['Jo Franco'],
        courseId: course['The Art of Mindful Journaling'],
        subtitle: 'Journal Your Travels',
      },
      {
        creatorId: creator['Johnny Harris'],
        courseId: course['Tokyo, Demystified'],
        subtitle: 'Explore Tokyo',
      },
      {
        creatorId: creator['Iz Harris'],
        courseId: course['Camera Fundamentals'],
        subtitle: 'Learn Camera Fundamentals',
      },
      {
        creatorId: creator['Elena Taber'],
        courseId: course['How to Vlog'],
        subtitle: 'How to Vlog',
      },
      {
        creatorId: creator['Lexie Alford'],
        courseId: course['Solo Travel, Explained'],
        subtitle: 'Traveling Solo',
      },
    ],
    featuredCourses: [
      course['Short-Form Storytelling'],
      course['Europe by Train'],
      course['How to Catch the Northern Lights'],
    ],
    comingSoonCourses: [],
    meetOurCreators: [creator['Johnny Harris'], creator['Nathaniel Drew'], creator['Jo Franco'], creator['Chris Hau']],
    themeSections: [
      {
        title: 'Premium Courses',
        subtitle: 'Our favorite creators share their expertise to teach you new skills',
        courses: [
          course['How to Appreciate Art'],
          course['The Ultimate Language Learning Guide'],
          course['How to Vlog'],
          course['Sailing Part 1: Getting Started'],
          course['Adventure Filmmaking'],
        ],
      },
    ],
    staffPicks: [
      course['How to Document Your Trip'],
      course['Tokyo, Demystified'],
      course['Southern Iceland Road Trip'],
    ],
    browseSections: [
      {
        title: 'Top Courses',
        courses: [
          course['Solo Travel, Explained'],
          course["London's Transportation, Explained"],
          course['How to Document Your Trip'],
          course['The Ultimate Language Learning Guide'],
          course['Cape Town, Demystified'],
        ],
      },
      {
        title: 'Travel Guides',
        courses: [
          course['Southern Iceland Road Trip'],
          course['Costa Rica, Demystified'],
          course['Cape Town, Demystified'],
          course['Tokyo, Demystified'],
          course["London's Transportation, Explained"],
        ],
      },
      {
        title: 'Skills',
        courses: [
          course['How to Plan Your Trip'],
          course['How to Document Your Trip'],
          course['Camera Fundamentals'],
          course['How to Vlog'],
          course['The Ultimate Language Learning Guide'],
          course['Camping 101'],
        ],
      },
      {
        title: 'Culture',
        courses: [
          course['Solo Travel, Explained'],
          course['Tokyo, Demystified'],
          course['Adventure Filmmaking'],
          course['Birding 101'],
          course['Traveling During a Pandemic'],
        ],
      },
    ],
  },
  subscriptionCourses: [
    course['How to Plan Your Trip'],
    course['The Ultimate Safari Guide'],
    course['French Cheese, Mapped'],
    course['How It Became Paris'],
    course['Southern Iceland Road Trip'],
    course['How it Became Manhattan'],
    course['Drones 101'],
    course['Wine & Vineyards'],
    course['How to Plan Your London Trip'],
    course['How to Travel with Kids'],
    course["London's Transportation, Explained"],
    course['Adventure Cats'],
    course['Solo Travel, Explained'],
    course['Traveling During a Pandemic'],
    course['The Ultimate Guide to Filipino Food'],
    course['How to Road Trip Morocco '],
    course['Berlin'],
    course['Cape Town, Demystified'],
    course['Costa Rica, Demystified'],
  ] as readonly string[],
  subscriptionFeatured: course['Berlin'],
  communitySpaces: {} as Record<string, string>,
  travelGuides: [
    course['Zion National Park'],
    course['Jordan'],
    course['Costa Rica, Demystified'],
    course['Cape Town, Demystified'],
    course['Qatar'],
    course['Berlin'],
  ] as readonly string[],
  unlockedLessons: {
    [course['Berlin']]: 3,
  } as Record<string, number>,
  archivedItems: [
    {
      id: course['Tokyo, Demystified'],
      upgradeTo: course['Experience Tokyo'],
    },
  ] as readonly { id: string; upgradeTo: string }[],
} as const;

export default appConfig;
