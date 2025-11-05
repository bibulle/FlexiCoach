// Coach Dos - Service Worker

const CACHE_NAME = "coach-dos-v1";
const STATIC_CACHE = "coach-dos-static-v1";

// Files to cache
const CACHE_FILES = ["/", "/index.html", "/manifest.json", "/assets/common.css", "/assets/common.js", "/data/progress.js", "/app.js", "/routines/douce-10min.html", "/routines/bureau-5min.html"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching App Shell");
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log("Service Worker: Cached all files");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Error caching files", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            // Add to cache if it's a valid response
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return fetchResponse;
          })
        );
      })
      .catch(() => {
        // Fallback for offline - could return a custom offline page
        if (event.request.destination === "document") {
          return caches.match("/index.html");
        }
      })
  );
});

// Background sync for session data
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-sessions") {
    console.log("Service Worker: Background sync sessions");
    event.waitUntil(syncSessionData());
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received");

  const options = {
    body: event.data ? event.data.text() : "C'est l'heure de votre séance Coach Dos !",
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/icons/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "start-routine",
        title: "Commencer",
        icon: "/assets/icons/icon-192.png",
      },
      {
        action: "dismiss",
        title: "Plus tard",
        icon: "/assets/icons/icon-192.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Coach Dos", options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked");
  event.notification.close();

  if (event.action === "start-routine") {
    event.waitUntil(clients.openWindow("/?start-routine=true"));
  } else if (event.action === "dismiss") {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"));
  }
});

// Helper function to sync session data (placeholder)
async function syncSessionData() {
  try {
    // This would sync with a backend API when available
    console.log("Service Worker: Syncing session data...");

    // For now, just resolve immediately since we're using localStorage
    return Promise.resolve();
  } catch (error) {
    console.error("Service Worker: Error syncing data", error);
    throw error;
  }
}
