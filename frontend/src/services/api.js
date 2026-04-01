import axios from 'axios'
import { getApiBaseURL } from '../config/apiBase'

const baseURL = getApiBaseURL()

if (import.meta.env.PROD && !baseURL.startsWith('http')) {
  console.warn(
    '[ChamaChain] API calls use relative /api/v1. Set VITE_API_URL on your frontend host at build time unless you proxy /api to the backend.'
  )
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function isPublicAuthRequest(config) {
  const rel = config?.url || ''
  const base = (config?.baseURL || '').replace(/\/$/, '')
  const joined = /^https?:\/\//i.test(rel)
    ? rel.split('?')[0]
    : `${base}/${rel.replace(/^\//, '')}`.replace(/([^:]\/)\/+/g, '$1')
  return /\/auth\/(login|register|verify-otp|resend-otp)(\?|$)/.test(joined)
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isPublicAuthRequest(error.config)) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
