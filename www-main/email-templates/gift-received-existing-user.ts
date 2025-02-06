import { GiftDetails } from '../components/StripeGiftButton';

export default function buildEmail(data: GiftDetails) {
  const isMultiple = Array.isArray(data.giftedCourse) && data.giftedCourse.length > 1;
  const courseNames = Array.isArray(data.giftedCourse)
    ? data.giftedCourse.map((gc) => gc.fields.title)
    : data.giftedCourse.fields.title;

  return `
        <html>
            <body>
                <div>
                    <p>Hey ${data.toName},</p>
                    <p>You've received the Bright Trip course${
                      isMultiple ? 's' : ''
                    } <strong>${courseNames}</strong> as a gift from ${data.fromName}.</p>
                    <p>They sent you this note:</p>
                    <div style="padding: 16px; border-radius: 8px; background-color: #f4f4f6">
                        <p>${data.giftNote}</p>
                    </div>
                    <p>${
                      isMultiple ? 'These courses are' : 'This course is'
                    } now available on your "My Courses" page.</p>
                    <a href="https://www.brighttrip.com/my-courses" target="_blank">
                        <button>
                            View Your Courses
                        </button>
                    </a>
                    <p>Enjoy your new course${isMultiple ? 's' : ''}!</p>
                    <p>– The Bright Trip Team</p>
                </div>
            </body>
        </html>
    `;
}
