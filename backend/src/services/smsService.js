const africastalking = require('africastalking');

const credentials = {
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME || 'sandbox'
};

let sms;

if (credentials.apiKey) {
  const at = africastalking(credentials);
  sms = at.SMS;
}

const sendSMS = async (to, message) => {
  if (!sms) {
    console.warn('Africa\'s Talking API key not configured. Skipping SMS.');
    return null;
  }

  try {
    const options = {
      to: [to],
      message: message
    };
    const response = await sms.send(options);
    console.log('SMS sent successfully:', response);
    return response;
  } catch (err) {
    console.error('Failed to send SMS:', err.message);
    throw err;
  }
};

module.exports = { sendSMS };
