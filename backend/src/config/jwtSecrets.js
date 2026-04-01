/**
 * JWT secrets must be set via environment only — never hardcode or commit defaults.
 */
function requireSecret(name) {
  const v = process.env[name]
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(
      `${name} must be set in the environment (e.g. in backend/.env, not in Git)`
    )
  }
  return v.trim()
}

function getJwtAccessSecret() {
  return requireSecret('JWT_ACCESS_SECRET')
}

function getJwtRefreshSecret() {
  return requireSecret('JWT_REFRESH_SECRET')
}

module.exports = { getJwtAccessSecret, getJwtRefreshSecret }
