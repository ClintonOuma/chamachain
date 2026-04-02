const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortCode = process.env.MPESA_SHORTCODE;
const passKey = process.env.MPESA_PASSKEY;
const callbackUrl = process.env.MPESA_CALLBACK_URL;

const getAccessToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );
  return response.data.access_token;
};

const stkPush = async (phoneNumber, amount, accountReference) => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: 'ChamaChain Contribution',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const b2cPayment = async (phoneNumber, amount, remarks) => {
  const token = await getAccessToken();
  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
    {
      InitiatorName: process.env.MPESA_B2C_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL,
      CommandID: 'SalaryPayment',
      Amount: amount,
      PartyA: process.env.MPESA_B2C_SHORTCODE,
      PartyB: phoneNumber,
      Remarks: remarks,
      QueueTimeOutURL: process.env.MPESA_B2C_CALLBACK_URL,
      ResultURL: process.env.MPESA_B2C_CALLBACK_URL,
      Occasion: 'ChamaChain Loan Disbursement',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const processStkCallback = (body) => {
  const result = body.Body.stkCallback;
  if (result.ResultCode === 0) {
    const mpesaRef = result.CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber').Value;
    const amount = result.CallbackMetadata.Item.find(i => i.Name === 'Amount').Value;
    const phone = result.CallbackMetadata.Item.find(i => i.Name === 'PhoneNumber').Value;
    return { success: true, mpesaRef, amount, phone };
  }
  return { success: false, message: result.ResultDesc };
};

module.exports = {
  getAccessToken,
  stkPush,
  b2cPayment,
  processStkCallback,
};
