const CACHE_NAME = 'flexicoach-v1';

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Stockage des rappels synchronisés depuis l'app
let cachedReminders = [];
let reminderTimerId = null;

// Écouter les messages de l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_REMINDERS') {
    cachedReminders = event.data.reminders || [];
    console.log('[SW] Reminders synchronisés :', cachedReminders.length);
    scheduleNextReminder();
  }
});

function scheduleNextReminder() {
  if (reminderTimerId) clearTimeout(reminderTimerId);
  reminderTimerId = setTimeout(() => checkAndNotify(), 30000);
}

function checkAndNotify() {
  const now = new Date();
  const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const dayIndex = (now.getDay() + 6) % 7;

  for (const reminder of cachedReminders) {
    if (!reminder.enabled) continue;
    if (reminder.time !== hhmm) continue;
    if (!reminder.days.includes(dayIndex)) continue;

    const tag = 'reminder-' + reminder.time;
    self.registration.showNotification('FlexiCoach 💪', {
      body: reminder.time + " — C'est l'heure de ta séance !",
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: tag,
    });
  }

  scheduleNextReminder();
}

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
  // Cache API only supports GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) {
            return cached;
          }
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
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
