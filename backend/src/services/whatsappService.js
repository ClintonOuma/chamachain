const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Sandbox number

let client;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

const sendWhatsApp = async (to, message) => {
  if (!client) {
    console.warn('Twilio credentials not configured. Skipping WhatsApp message.');
    return null;
  }

  try {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const response = await client.messages.create({
      body: message,
      from: from,
      to: formattedTo
    });
    console.log('WhatsApp message sent:', response.sid);
    return response;
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err.message);
    throw err;
  }
};

module.exports = { sendWhatsApp };
