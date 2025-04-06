import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  from = `"CGC Contact" <${process.env.SMTP_USER!}>`, // this format is correct for Gmail
  subject,
  html,
  replyTo,
}: EmailOptions) {
  try {
    console.log('📤 Creating transporter...');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });

    console.log('✉️ Attempting to send email to:', to);

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      replyTo,
    });

    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (err: any) {
    console.error('❌ Email sending failed:', err.message || err);
    console.error('🪵 Full error:', err);
    throw err; // force logs in your API
  }
}
