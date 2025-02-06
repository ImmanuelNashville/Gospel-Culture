import { NextApiRequest, NextApiResponse } from 'next';
import { validatePromoCodeFormat } from '../../utils/promo-codes';
import { PromoCode } from '../../hooks/usePromoCodeInput';
import cn from '../../courseNames';
import { REDEMPTION_CODES } from './redeem';

const NATHANIEL_DREW_COURSE_IDS = [
  cn['The Ultimate Language Learning Guide'],
  cn['Visual Storytelling'],
  cn['How It Became Paris'],
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const promoCodes = [
    {
      code: 'WELCOME',
      percentageDiscount: 10,
    },
    {
      code: 'JOURNEY15',
      percentageDiscount: 15,
    },
    {
      code: 'REVIEW50',
      percentageDiscount: 50,
    },
    {
      code: 'BETA50',
      percentageDiscount: 50,
    },
    {
      code: 'SUPPORT50',
      percentageDiscount: 50,
    },
    {
      code: 'SUPPORT30',
      percentageDiscount: 30,
    },
    {
      code: 'MERCI30',
      percentageDiscount: 30,
    },
    //mark wolters
    {
      code: 'SUPERHEROES',
      percentageDiscount: 15,
      allowedCourses: [cn['How to Plan Your Trip']],
    },
    //nathaniel drew
    {
      code: 'NDNEWSLETTER',
      percentageDiscount: 25,
      allowedCourses: NATHANIEL_DREW_COURSE_IDS,
    },
    {
      code: 'NATHANIEL30',
      percentageDiscount: 30,
      allowedCourses: NATHANIEL_DREW_COURSE_IDS,
    },
    {
      code: 'NDPATREON',
      percentageDiscount: 35,
      allowedCourses: NATHANIEL_DREW_COURSE_IDS,
    },
    {
      code: 'NDFANS',
      percentageDiscount: 65,
      allowedCourses: NATHANIEL_DREW_COURSE_IDS,
    },
    {
      code: 'JOCLUB20',
      percentageDiscount: 20,
      allowedCourses: [cn['The Art of Mindful Journaling']],
    },
    {
      code: 'LETSGOSAFARI',
      percentageDiscount: 15,
      allowedCourses: [cn['The Ultimate Safari Guide']],
    },
    //chris hau
    {
      code: 'HAU10',
      percentageDiscount: 10,
      allowedCourses: [cn['How to Get Paid To Travel']],
    },
    {
      code: 'HAU20',
      percentageDiscount: 20,
      allowedCourses: [cn['How to Get Paid To Travel']],
    },
    {
      code: 'HAU30',
      percentageDiscount: 30,
      allowedCourses: [cn['How to Get Paid To Travel']],
    },
    //nicole eddy
    {
      code: 'EDDY15',
      percentageDiscount: 15,
      allowedCourses: [cn['The Ultimate Safari Guide']],
    },
    //sacred thomas
    {
      code: 'SACRED10',
      percentageDiscount: 10,
    },
    //rya & louis
    {
      code: 'EARLYBUS',
      percentageDiscount: 20,
      allowedCourses: [cn['Van Life: A Practical Guide ']],
    },
    //jo franco
    {
      code: 'WRITING20',
      percentageDiscount: 20,
      allowedCourses: [cn['The Art of Mindful Journaling']],
    },
    {
      code: 'JOURNALING35',
      percentageDiscount: 35,
      allowedCourses: [cn['The Art of Mindful Journaling']],
    },
    {
      code: 'MINDFULNESS50',
      percentageDiscount: 50,
      allowedCourses: [cn['The Art of Mindful Journaling']],
    },
    {
      code: 'SELFDISCOVERY75',
      percentageDiscount: 75,
      allowedCourses: [cn['The Art of Mindful Journaling']],
    },
    // abandoned cart codes
    {
      code: 'LEARN30',
      percentageDiscount: 30,
      allowedCourses: [cn['The Ultimate Language Learning Guide']],
    },
    {
      code: 'VISUAL30',
      percentageDiscount: 30,
      allowedCourses: [cn['Visual Storytelling']],
    },
    {
      code: 'CLOSE20',
      percentageDiscount: 20,
      allowedCourses: [cn['Visual Storytelling']],
    },
    // language learning creative fund
    {
      code: 'GRAMMAR20',
      percentageDiscount: 20,
      allowedCourses: [cn['The Ultimate Language Learning Guide']],
    },
    {
      code: 'CONVERSATIONS35',
      percentageDiscount: 35,
      allowedCourses: [cn['The Ultimate Language Learning Guide']],
    },
    {
      code: 'DICTIONARY50',
      percentageDiscount: 50,
      allowedCourses: [cn['The Ultimate Language Learning Guide']],
    },
    {
      code: 'FLUENT75',
      percentageDiscount: 75,
      allowedCourses: [cn['The Ultimate Language Learning Guide']],
    },
    // Appreciate Art
    {
      code: 'ART15',
      percentageDiscount: 15,
      allowedCourses: [cn['How to Appreciate Art']],
    },
    {
      code: 'ART20',
      percentageDiscount: 20,
      allowedCourses: [cn['How to Appreciate Art']],
    },
    // Collaborative Trip Planning
    {
      code: 'BTS15',
      percentageDiscount: 15,
      allowedCourses: [cn['Collaborative Trip Planning']],
    },
    // Sailing the World
    {
      code: 'PATREONSAIL',
      percentageDiscount: 50,
      allowedCourses: [cn['Sailing Part 1: Getting Started']],
    },
    // Travel Journalism
    {
      code: 'ASH10',
      percentageDiscount: 10,
      allowedCourses: [cn['Travel Journalism']],
    },
    {
      code: 'ASH20',
      percentageDiscount: 20,
      allowedCourses: [cn['Travel Journalism']],
    },
    // Zion
    {
      code: 'ADG20',
      percentageDiscount: 20,
      allowedCourses: [cn['Zion National Park']],
    },
    {
      code: 'ZP1',
      percentageDiscount: 79,
      allowedCourses: [cn['Zion National Park']],
    },
    {
      code: 'ZP2',
      percentageDiscount: 60,
      allowedCourses: [cn['Zion National Park']],
    },
    {
      code: 'ZP3',
      percentageDiscount: 40,
      allowedCourses: [cn['Zion National Park']],
    },
    {
      code: 'ZP4',
      percentageDiscount: 20,
      allowedCourses: [cn['Zion National Park']],
    },
    // @hotel
    {
      code: 'AH20',
      percentageDiscount: 20,
      allowedCourses: [cn['Experience Tokyo']],
    },
    // Europe by Train
    {
      code: 'TRAINS20',
      percentageDiscount: 20,
      allowedCourses: [cn['Europe by Train']],
    },
    // Holidays 2023
    {
      code: 'GIFT20',
      percentageDiscount: 20,
    },
    // redemption codes from /redeem route
    ...Object.entries(REDEMPTION_CODES).map(([code, courseId]) => ({
      code,
      percentageDiscount: 100,
      allowedCourses: [courseId],
    })),
  ] as PromoCode[];

  switch (req.method) {
    case 'PUT': {
      const { code, courseIds } = JSON.parse(req.body) as { code: string; courseIds: string[] };

      if (!code || !validatePromoCodeFormat(code) || !courseIds) return res.status(400).send('Bad Request');

      const normalizedCode = code.trim().toUpperCase();
      const matchedCode = promoCodes.find((promoCode) => promoCode.code === normalizedCode);

      let isValid = false;

      if (matchedCode) {
        if (matchedCode.allowedCourses) {
          if (courseIds.some((cId) => (matchedCode.allowedCourses as string[]).includes(cId))) {
            isValid = true;
          } else {
            isValid = false;
          }
        } else {
          isValid = true;
        }
      }

      if (matchedCode) {
        if (isValid) {
          return res.status(200).json(matchedCode);
        }
        return res.status(400).send("That code can't be used on any of the courses in your cart");
      }
      return res.status(404).send("That isn't a valid promo code");
    }
    default:
      return res.status(405).send(`${req.method} Not Allowed`);
  }
}
