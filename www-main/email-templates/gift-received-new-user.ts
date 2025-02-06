import { GiftDetails } from '../components/StripeGiftButton';

export default function buildEmail(data: GiftDetails) {
  const isMultiple = Array.isArray(data.giftedCourse) && data.giftedCourse.length > 1;
  const courseNames = Array.isArray(data.giftedCourse)
    ? data.giftedCourse.map((gc) => gc.fields.title).join(', ')
    : data.giftedCourse.fields.title;

  return `
        <html>
            <body>
                <div>
                    <p>Hello ${data.toName},</p>
                    <p>You've received a gift from ${data.fromName}. The Bright Trip course${
    isMultiple ? 's' : ''
  } <strong>${courseNames}</strong> ${isMultiple ? 'are' : 'is'} now yours. Score!</p>
                    ${
                      data.giftNote
                        ? `<p>They sent you this note:</p>
                    <div style="padding: 16px; border-radius: 8px; background-color: #f4f4f6">
                        <p>${data.giftNote}</p>
                    </div>`
                        : ''
                    }
                    <p>To redeem your gift and take the course${
                      isMultiple ? 's' : ''
                    }, just create your Bright Trip account by following the link below</p>
                    <a href="https://www.brighttrip.com/api/auth/login" target="_blank">
                        <button>
                            Create Your Bright Trip Account
                        </button>
                    </a>
                    <p>Be sure to use the email address this email was sent to so we can match up your gift with your account</p>
                    <p>Enjoy your new course${isMultiple ? 's' : ''}!</p>
                    <p>– The Bright Trip Team</p>
                    </div>
            </body>
        </html>
    `;
}
