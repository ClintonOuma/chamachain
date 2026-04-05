const axios = require('axios')

const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'
const BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const res = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  )
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

const formatPhone = (phone) => {
  let p = phone.toString().replace(/\s/g, '').replace(/[^0-9+]/g, '')
  if (p.startsWith('+')) p = p.slice(1)
  if (p.startsWith('0')) p = '254' + p.slice(1)
  if (p.startsWith('7') || p.startsWith('1')) p = '254' + p
  return p
}

const stkPush = async ({ phone, amount, reference, description }) => {
  try {
    const token = await getAccessToken()
    const timestamp = getTimestamp()
    const password = getPassword(timestamp)
    const formattedPhone = formatPhone(phone)

    const res = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
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
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return { success: true, ...res.data }
  } catch (err) {
    console.error('[mpesa] STK Push error:', err.response?.data || err.message)
    throw new Error(err.response?.data?.errorMessage || 'STK Push failed')
  }
}

const b2cPayment = async ({ phone, amount, reference }) => {
  try {
    const token = await getAccessToken()
    const formattedPhone = formatPhone(phone)

    const res = await axios.post(
      `${BASE_URL}/mpesa/b2c/v1/paymentrequest`,
      {
        InitiatorName: process.env.MPESA_INITIATOR_NAME || 'testapi',
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || 'Safaricom999!',
        CommandID: 'BusinessPayment',
        Amount: Math.ceil(amount),
        PartyA: process.env.MPESA_SHORTCODE,
        PartyB: formattedPhone,
        Remarks: reference || 'Loan Disbursement',
        QueueTimeOutURL: process.env.MPESA_B2C_CALLBACK_URL,
        ResultURL: process.env.MPESA_B2C_CALLBACK_URL,
        Occasion: 'Loan'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return { success: true, ...res.data }
  } catch (err) {
    console.error('[mpesa] B2C error:', err.response?.data || err.message)
    throw new Error(err.response?.data?.errorMessage || 'B2C payment failed')
  }
}

module.exports = { stkPush, b2cPayment, getAccessToken, formatPhone }