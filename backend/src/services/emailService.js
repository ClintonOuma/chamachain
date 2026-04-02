const sgMail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_FROM || 'no-reply@chamachain.com';

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const sendEmail = async (to, subject, text, html) => {
  if (!apiKey) {
    console.warn('SendGrid API key not configured. Skipping email.');
    return null;
  }

  try {
    const msg = {
      to,
      from: fromEmail,
      subject,
      text,
      html: html || text
    };
    const response = await sgMail.send(msg);
    console.log('Email sent successfully');
    return response;
  } catch (err) {
    console.error('Failed to send email:', err.message);
    if (err.response) {
      console.error(err.response.body);
    }
    throw err;
  }
};

module.exports = { sendEmail };
