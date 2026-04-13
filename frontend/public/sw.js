const CACHE_NAME = 'chamachain-v3'
const STATIC_ASSETS = [
  '/',
  '/index.html'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('SW: Failed to cache some assets', err)
        // Continue even if some assets fail to cache
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Skip API requests and non-GET requests
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return
  }

  // For navigation requests (page loads), use network-first strategy
  // This ensures the landing page and all routes always get fresh content
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response for offline fallback
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => {
          // Only fall back to cache if network fails (offline)
          return caches.match('/index.html')
        })
    )
    return
  }

  // For other assets (JS, CSS, images), use cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached
      }
      return fetch(event.request).catch(() => {
        throw new Error('Network request failed')
      })
    })
  )
})
