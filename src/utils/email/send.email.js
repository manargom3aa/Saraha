 
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './src/config/.env.dev' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log(' Email sent:', info.response);
    return info;
  } catch (error) {
    console.error(' Error sending email:', error);
    throw error;
  }
};
