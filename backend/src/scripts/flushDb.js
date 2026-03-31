const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config()

const User = require('../models/User')
const Membership = require('../models/Membership')
const Contribution = require('../models/Contribution')
const Loan = require('../models/Loan')
const Notification = require('../models/Notification')
const Chama = require('../models/Chama')

async function main() {
  const mongoUri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim()
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set')
  }

  await mongoose.connect(mongoUri)

  await Promise.all([
    Membership.deleteMany({}),
    Contribution.deleteMany({}),
    Loan.deleteMany({}),
    Notification.deleteMany({}),
    Chama.deleteMany({}),
    User.deleteMany({})
  ])

  console.log('Database flushed: users/chamas/memberships/contributions/loans/notifications cleared.')

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  try {
    await mongoose.disconnect()
  } catch {}
  process.exit(1)
})

