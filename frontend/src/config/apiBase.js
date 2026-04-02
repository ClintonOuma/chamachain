/**
 * Resolves the deployed backend origin (no path, no trailing slash).
 * Order: Vite env at build time → window.__RUNTIME_CONFIG__ (optional) → dev default.
 */
function normalizeOrigin(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let u = raw.trim().replace(/\/$/, '')
  if (/\/api\/v1$/i.test(u)) u = u.replace(/\/api\/v1$/i, '').replace(/\/$/, '')
  return u
}

export function getApiOrigin() {
  const fromVite = normalizeOrigin(import.meta.env.VITE_API_URL)
  if (fromVite) return fromVite
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.VITE_API_URL) {
    const r = normalizeOrigin(window.__RUNTIME_CONFIG__.VITE_API_URL)
    if (r) return r
  }
  if (import.meta.env.DEV) {
    const devOverride = normalizeOrigin(import.meta.env.VITE_DEV_API_URL)
    if (devOverride) return devOverride
    return ''
  }
  return ''
}

export function getApiBaseURL() {
  const o = getApiOrigin()
  return o ? `${o}/api/v1` : '/api/v1'
}

export function getAiServiceUrl() {
  const fromVite = normalizeOrigin(import.meta.env.VITE_AI_URL || import.meta.env.VITE_AI_SERVICE_URL)
  if (fromVite) return fromVite
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.VITE_AI_URL) {
    const r = normalizeOrigin(window.__RUNTIME_CONFIG__.VITE_AI_URL)
    if (r) return r
  }
  return import.meta.env.DEV ? 'http://127.0.0.1:8000' : ''
}

/** Socket.IO listens on the API origin (same server as Express), not under /api/v1 */
export function getSocketUrl() {
  const o = getApiOrigin()
  if (o) return o
  if (import.meta.env.DEV) {
    return (
      normalizeOrigin(import.meta.env.VITE_DEV_API_URL) || 'http://localhost:4000'
    )
  }
  return typeof window !== 'undefined' ? window.location.origin : ''
}
