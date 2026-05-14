const CACHE_NAME = 'flexicoach-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/main.js',
  '/polyfills.js',
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  // Ne pas activer automatiquement, attendre le message SKIP_WAITING
});

// Écouter les messages de l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING reçu, activation immédiate');
    self.skipWaiting();
  }
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Ouvre l'app au clic sur une notification de rappel
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow('/');
    })
  );
});

// Gestion des push notifications (Android PWA)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'FlexiCoach 💪';
  const options = {
    body: data.body || "C'est l'heure de ta séance !",
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'push-notification',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Stratégie de cache: Network First, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la requête réussit, on met à jour le cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si le réseau est indisponible, on utilise le cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Si la ressource n'est pas en cache, on retourne une réponse par défaut pour les requêtes API
          if (event.request.url.includes('/api/')) {
            return new Response(
              JSON.stringify({ error: 'Offline - No cached data available' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'application/json',
                }),
              }
            );
          }
        });
      })
  );
});
