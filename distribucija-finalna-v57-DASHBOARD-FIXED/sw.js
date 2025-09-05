// Service Worker za Potrošni Materijal aplikaciju
const CACHE_NAME = 'potrosni-materijal-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Fajlovi koji se cache-uju odmah
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo.png'
];

// API endpoints koji se cache-uju
const API_ENDPOINTS = [
  '/api/materials',
  '/api/employees',
  '/api/stats/overview',
  '/api/health'
];

// Install event - cache-uje statičke fajlove
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker se instalira...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('✅ Cache-ujem statičke fajlove');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker instaliran');
        return self.skipWaiting();
      })
  );
});

// Activate event - čisti stare cache-ove
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker se aktivira...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Brišem stari cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker aktivan');
        return self.clients.claim();
      })
  );
});

// Fetch event - implementira cache strategije
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API zahtevi
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Statički fajlovi
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Ostali zahtevi - prosledi
  event.respondWith(fetch(request));
});

// Strategija za API zahteve
async function handleApiRequest(request) {
  try {
    // Prvo pokušaj network request
    const response = await fetch(request);
    
    // Ako je uspešan, cache-uj response
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('🌐 Network greška, koristim cache:', error);
    
    // Ako network ne radi, koristi cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Ako nema u cache-u, vrati offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline mode', 
        message: 'Nema internet konekcije. Koriste se cache-ovani podaci.' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Strategija za statičke fajlove
async function handleStaticRequest(request) {
  try {
    // Prvo proveri cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Koristim cache za:', request.url);
      return cachedResponse;
    }
    
    // Ako nema u cache-u, fetch i cache-uj
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('❌ Greška pri fetch-u:', error);
    
    // Ako fetch ne radi, vrati offline stranicu
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline mode', { status: 503 });
  }
}

// Background sync za offline operacije
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync pokrenut');
    event.waitUntil(processOfflineQueue());
  }
});

// Push notifikacije
self.addEventListener('push', (event) => {
  console.log('📱 Push notifikacija primljena');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notifikacija',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Otvori aplikaciju',
        icon: '/logo.png'
      },
      {
        action: 'close',
        title: 'Zatvori',
        icon: '/logo.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Potrošni Materijal', options)
  );
});

// Klik na notifikaciju
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notifikacija kliknuta:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Offline queue processing
async function processOfflineQueue() {
  try {
    const queue = await getOfflineQueue();
    
    for (const item of queue) {
      try {
        await processQueueItem(item);
        await removeFromOfflineQueue(item.id);
        console.log('✅ Offline item obrađen:', item.id);
      } catch (error) {
        console.error('❌ Greška pri obradi offline item-a:', error);
      }
    }
  } catch (error) {
    console.error('❌ Greška pri obradi offline queue-a:', error);
  }
}

// Pomoćne funkcije za offline queue
async function getOfflineQueue() {
  // Implementacija offline queue storage
  return [];
}

async function processQueueItem(item) {
  // Implementacija obrade offline item-a
  return fetch(item.url, item.options);
}

async function removeFromOfflineQueue(id) {
  // Implementacija uklanjanja iz offline queue-a
  return true;
}

console.log('🚀 Service Worker učitan');
