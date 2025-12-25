// Increment cache version on each deployment to force cache refresh
const STATIC_CACHE = 'magiwork-static-v7';
const CACHE_VERSION = 'v7';

self.addEventListener('install', (event) => {
  // Force activation of new service worker immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([
      // Only static assets – do NOT cache the HTML shell ('/')
      '/manifest.webmanifest',
      '/icons/icon-192.png',
      '/icons/icon-512.png',
    ]))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Delete all old caches
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        }))
      ),
      // Take control of all clients immediately
      self.clients.claim(),
      // Notify all clients about the update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Only handle GET requests from http/https (skip chrome-extension, etc.)
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  const accept = request.headers.get('accept') || '';

  // Network-first for navigation/HTML requests to avoid serving stale pages
  // Always bypass cache for HTML to ensure latest content
  if (request.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      fetch(request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }).catch(() => caches.match('/'))
    );
    return;
  }
  
  const requestUrl = new URL(request.url);
  
  // Never cache the service worker file itself
  if (requestUrl.pathname === '/sw.js' || requestUrl.pathname.endsWith('/sw.js')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
    );
    return;
  }

  // Network-first for JavaScript and CSS to ensure latest code is loaded
  // Only cache images and fonts with cache-first strategy
  const isJS = requestUrl.pathname.endsWith('.js') || requestUrl.pathname.includes('/assets/') && requestUrl.pathname.endsWith('.js');
  const isCSS = requestUrl.pathname.endsWith('.css') || requestUrl.pathname.includes('/assets/') && requestUrl.pathname.endsWith('.css');
  
  if (isJS || isCSS) {
    // Network-first for JS/CSS - always try network first with cache busting
    event.respondWith(
      fetch(request, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }).then((response) => {
        // Only cache if network succeeds and response is fresh
        if (response.ok) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            try {
              cache.put(request, copy);
            } catch (err) {
              // Ignore cache errors (network errors, etc.)
              console.warn('[SW] Cache.put failed:', err);
            }
          });
        }
        return response;
      }).catch(() => {
        // Fallback to cache only if network fails
        return caches.match(request);
      })
    );
    return;
  }
  
  // Skip caching for video files (they use range requests/206 responses which can't be cached)
  const isVideo = requestUrl.pathname.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) || 
                  requestUrl.pathname.includes('/videos/') ||
                  accept.includes('video/');
  
  if (isVideo) {
    // For video files, always fetch from network and never cache
    event.respondWith(
      fetch(request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    );
    return;
  }

  // Cache-first for other static assets (images, fonts, etc.)
  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((response) => {
        // Don't cache 206 (Partial Content) responses - these are used for video range requests
        if (response.status === 206) {
          return response;
        }
        const copy = response.clone();
        caches.open(STATIC_CACHE).then((cache) => {
          try {
            cache.put(request, copy);
          } catch (err) {
            // Ignore cache errors (network errors, etc.)
            console.warn('[SW] Cache.put failed:', err);
          }
        });
        return response;
      })
    )
  );
});


