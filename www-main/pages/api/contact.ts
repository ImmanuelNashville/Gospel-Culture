// pages/api/contact.ts
import { NextApiHandler } from 'next';
import { sendEmail } from '../../lib/nodemailer';

const getRecaptchaUrl = (token: string) =>
  `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`;

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const { email, fullName, message, captchaToken } = req.body; // ✅ No JSON.parse

    console.log('📩 Contact API triggered');
    console.log('📧 email:', email);
    console.log('👤 fullName:', fullName);
    console.log('📝 message:', message);
    console.log('🔑 captchaToken:', captchaToken);

    if (!email || !fullName || !message) {
      console.error('🚫 Missing required fields');
      return res.status(400).send('Missing fields');
    }

    console.log('🔐 Verifying reCAPTCHA...');
    const captchaRes = await fetch(getRecaptchaUrl(captchaToken), { method: 'POST' });
    const captchaData = await captchaRes.json();
    console.log('✅ reCAPTCHA result:', captchaData);

    if (!captchaData.success) {
      console.error('❌ reCAPTCHA failed:', captchaData['error-codes']);
      return res.status(400).json({
        message: 'Captcha verification failed',
        error: captchaData['error-codes'],
      });
    }

    console.log('📨 Sending email...');
    const info = await sendEmail({
      to: 'matholemu@gmail.com',
      from: 'matholemu@gmail.com',
      replyTo: email,
      subject: 'New Contact Message',
      html: `
        <div>
          <h3>New Contact Submission</h3>
          <p><strong>From:</strong> ${fullName} (${email})</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 12px; border-left: 4px solid #0f766e;">
            ${message.replace(/\n/g, '<br />')}
          </div>
        </div>
      `,
    });

    console.log('✅ Email sent successfully:', info?.messageId || info);
    return res.status(200).send('Success');
  } catch (error: any) {
    console.error('❌ [Contact API Error]', error?.message || error);
    console.error('🪵 Full error object:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error?.message || error });
  }
};


export default handler;
