const axios = require('axios')

const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const url = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

  const res = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` }
  })
  return res.data.access_token
}

const getTimestamp = () => {
  const now = new Date()
  return now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')
}

const getPassword = (timestamp) => {
  const str = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  return Buffer.from(str).toString('base64')
}

// STK Push — prompt user phone to pay
const stkPush = async ({ phone, amount, reference, description }) => {
  const token = await getAccessToken()
  const timestamp = getTimestamp()
  const password = getPassword(timestamp)

  // Format phone: remove leading 0 or +254, ensure 254XXXXXXXXX
  let formattedPhone = phone.toString().replace(/\s/g, '')
  if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1)
  if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1)

  const url = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

  const res = await axios.post(url, {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount),
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: reference || 'ChamaChain',
    TransactionDesc: description || 'Chama Contribution'
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })

  return res.data
}

// B2C — send money to phone
const b2cPayment = async ({ phone, amount, reference }) => {
  const token = await getAccessToken()

  let formattedPhone = phone.toString().replace(/\s/g, '')
  if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1)
  if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1)

  const url = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest'
    : 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest'

  const res = await axios.post(url, {
    InitiatorName: 'testapi',
    SecurityCredential: 'Safaricom999!',
    CommandID: 'BusinessPayment',
    Amount: Math.ceil(amount),
    PartyA: process.env.MPESA_SHORTCODE,
    PartyB: formattedPhone,
    Remarks: reference || 'Loan Disbursement',
    QueueTimeOutURL: process.env.MPESA_B2C_CALLBACK_URL,
    ResultURL: process.env.MPESA_B2C_CALLBACK_URL,
    Occasion: 'Loan'
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })

  return res.data
}

module.exports = { stkPush, b2cPayment, getAccessToken }