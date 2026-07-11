/**
 * Service Worker for Ekobanque PWA
 * Handles caching and offline access gracefully
 */

const CACHE_NAME = 'ekobanque-cache-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache immediately during installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.json'
];

// Install Event - Pre-cache critical files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline pages and core assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // Force active service worker to take control immediately
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Claim clients to immediately control all open tabs
      return self.clients.claim();
    })
  );
});

// Fetch Event - Handle requests with offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests (don't intercept POST/PUT/etc.)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // If requesting a document page (HTML/navigation)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      // Network-First: Always try to get the newest page from the network
      fetch(event.request)
        .then((networkResponse) => {
          // If valid, clone and update the cache for offline fallback
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If page is not in cache, return the custom offline fallback page
            return caches.match(OFFLINE_URL);
          });
        })
    );
  } else {
    // For static resources (JS, CSS, Images, Fonts)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return from cache, but fetch a fresh version in the background (Stale-While-Revalidate)
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {
            // Silently ignore background update network failures
          });
          return cachedResponse;
        }

        // If not in cache, fetch from network and cache for next time
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
