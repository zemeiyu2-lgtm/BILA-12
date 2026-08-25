// BILA V1.8 trial build: Service Worker intentionally disabled.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.registration.unregister()));
