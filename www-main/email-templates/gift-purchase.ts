import { GiftDetails } from '../components/StripeGiftButton';

export default function buildEmail(data: GiftDetails) {
  const courseTitles = Array.isArray(data.giftedCourse)
    ? data.giftedCourse.map((gc) => gc.fields.title).join(', ')
    : data.giftedCourse.fields.title;

  return `
        <html>
            <body>
                <h1>Your Gift Confirmation 🎁</h1>
                <div>
                <p>Hey ${data.fromName},</p>
                <p>Your gift of <strong>${courseTitles}</strong> has been delivered to ${data.toName} (${
    data.toEmail
  })${data.giftNote ? ' along with your gift note' : ''}. It's is now available on their "My Courses" page.</p>
                <p>Thanks for giving the gift of learning — we're sure they'll love it!</p>
                <p>Best,</p>
                <p>The Bright Trip Team</p>
                </div>
            </body>
        </html>
    `;
}
