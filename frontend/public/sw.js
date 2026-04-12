const CACHE_NAME = 'chamachain-v2'
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
  
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached
      }
      return fetch(event.request).catch(() => {
        // If fetch fails, try to return cached index.html for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
        throw new Error('Network request failed')
      })
    })
  )
})
