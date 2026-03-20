const CACHE_NAME = 'baylo-v7';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.png',
  '/BayloLogo.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing with cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache failed:', error);
      })
  );
  // Force immediate activation, bypassing waiting state
  self.skipWaiting();
});

// Listen for skip waiting message from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating, cache:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete ALL old caches (not just ones that don't match)
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      ).then(() => {
        // Recreate cache with new name
        return caches.open(CACHE_NAME);
      });
    })
  );
  // Immediately take control of all clients (pages)
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip caching for non-HTTP(S) requests (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip caching for chrome-extension and other non-standard schemes
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'safari-extension:') {
    return;
  }
  
  // For static assets (JS, CSS, images, videos), DON'T intercept - let browser handle directly
  // This prevents service worker from interfering with Firebase's static file serving
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp4|webm|mov)$/) ||
                        url.pathname.startsWith('/assets/') ||
                        url.pathname.startsWith('/logosAndIcons/');
  
  if (isStaticAsset) {
    // Don't intercept - let the request go directly to the network
    // This ensures Firebase serves the files correctly without service worker interference
    return;
  }
  
  // For HTML pages, use network-first strategy (better for iOS Safari)
  // This ensures fresh content is always loaded
  if (request.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If network request succeeds, cache it and return
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache).catch((error) => {
                console.log('Cache put failed (non-critical):', error);
              });
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            // If cache has it, return it
            if (cachedResponse) {
              return cachedResponse;
            }
            // Otherwise, return index.html as fallback
            return caches.match('/index.html');
          });
        })
    );
  } else {
    // For other requests, just fetch from network (no service worker interference)
    event.respondWith(fetch(request));
  }
});

