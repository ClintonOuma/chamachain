/**
 * Bootstrap script: promote an existing user to Super Admin by email.
 * Usage: node src/scripts/makeSuperAdmin.js user@example.com
 */
const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const User = require('../models/User')

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node src/scripts/makeSuperAdmin.js <email>')
    process.exit(1)
  }

  const mongoUri = process.env.MONGODB_URI?.trim()
  if (!mongoUri) {
    console.error('MONGODB_URI is not set in environment')
    process.exit(1)
  }

  await mongoose.connect(mongoUri)

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    console.error(`No user found with email: ${email}`)
    await mongoose.disconnect()
    process.exit(1)
  }

  if (user.isSuperAdmin) {
    console.log(`${user.fullName} (${user.email}) is already a Super Admin.`)
    await mongoose.disconnect()
    return
  }

  user.isSuperAdmin = true
  await user.save()

  console.log(`✅ Success! ${user.fullName} (${user.email}) is now a Super Admin.`)
  console.log('They can log in and access the Super Admin dashboard at /admin.')

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})
