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
  from = 'Bright Trip <support@brighttrip.com>',
  subject,
  html,
  replyTo,
}: EmailOptions) {
  const transporter = nodemailer.createTransport({
    pool: true,
    host: 'smtp.mandrillapp.com',
    port: 587,
    auth: {
      user: 'Bright Trip',
      pass: process.env.MAILER_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    replyTo,
  });

  return info;
}
