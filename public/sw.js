/* Service worker panelu admina: TYLKO Web Push. Nie cache'uje żadnych stron ani
 * API - panel ma zawsze pokazywać świeże dane. Rejestrowany z /admin (sekcja
 * „Powiadomienia”). Zakres: cała domena (plik leży w katalogu głównym). */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Fizyka Statkiem', body: event.data ? event.data.text() : '' };
  }
  const title = payload.title || 'Fizyka Statkiem';
  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: payload.tag || undefined,
    renotify: !!payload.tag,
    data: { url: payload.url || '/admin/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(
    (event.notification.data && event.notification.data.url) || '/admin/',
    self.location.origin
  ).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const open = clients.find((c) => c.url.startsWith(self.location.origin));
      if (open) {
        return open.navigate ? open.navigate(url).then((c) => c && c.focus()) : open.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
