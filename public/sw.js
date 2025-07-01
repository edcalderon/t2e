// XQuests Service Worker
const CACHE_NAME = 'xquests-v1.0.2'; // Increment version to force update
const STATIC_CACHE_NAME = 'xquests-static-v1.0.2';
const DYNAMIC_CACHE_NAME = 'xquests-dynamic-v1.0.2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/assets/images/logo.png',
  '/assets/images/favicon.ico',
  '/assets/images/adaptive-icon.png',
  '/assets/images/splash-icon.png',
  '/assets/images/xquests-logo.png',
  '/assets/images/small_logo.svg',
  '/assets/images/small_logo_black.svg',
  '/assets/images/small_logo_white.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated and took control');
      
      // Notify all clients about the update
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATE_AVAILABLE',
            version: CACHE_NAME
          });
        });
      });
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request.url)) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request.url)) {
    // Network first for API requests
    event.respondWith(networkFirst(request));
  } else if (isImageRequest(request.url)) {
    // Cache first for images with fallback
    event.respondWith(cacheFirstWithFallback(request));
  } else {
    // Network first with cache fallback for everything else
    event.respondWith(networkFirst(request));
  }
});

// Cache first strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy - for API requests and dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { 
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Cache first with fallback for images
async function cacheFirstWithFallback(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return a fallback image or placeholder
    return new Response('', { 
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

// Helper functions
function isStaticAsset(url) {
  return url.includes('/assets/') || 
         url.includes('/static/') ||
         url.includes('manifest.json') ||
         url.endsWith('.js') ||
         url.endsWith('.css') ||
         url.endsWith('.svg') ||
         url.endsWith('.png') ||
         url.endsWith('.jpg') ||
         url.endsWith('.jpeg');
}

function isAPIRequest(url) {
  return url.includes('/api/') ||
         url.includes('supabase.co');
}

function isImageRequest(url) {
  return url.includes('images.pexels.com') ||
         url.includes('api.dicebear.com') ||
         url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('📡 Performing background sync...');
    // Handle any queued offline actions
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from XQuests',
    icon: '/assets/images/icon.png',
    badge: '/assets/images/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Challenges',
        icon: '/assets/images/icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('XQuests', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/(tabs)/challenges')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with the main app
self.addEventListener('message', (event) => {
  console.log('💬 Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Skipping waiting...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🎯 XQuests Service Worker loaded successfully');