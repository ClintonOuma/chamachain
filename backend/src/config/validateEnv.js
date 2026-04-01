/**
 * Fail fast with a clear message when auth/data features cannot run.
 */
function validateEnv() {
  const missing = []
  if (!process.env.JWT_ACCESS_SECRET?.trim()) missing.push('JWT_ACCESS_SECRET')
  if (!process.env.JWT_REFRESH_SECRET?.trim()) missing.push('JWT_REFRESH_SECRET')
  if (!process.env.MONGODB_URI?.trim()) missing.push('MONGODB_URI')
  if (missing.length) {
    console.error(
      '[chamachain] Missing required env: ' + missing.join(', '),
      '\nCreate backend/.env from backend/.env.example and set values (never commit .env).'
    )
    process.exit(1)
  }
}

module.exports = { validateEnv }
