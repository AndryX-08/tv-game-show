importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAs9kwrZnnBTOaBzkLn6ZhLN5mfWWmXcl4",
  authDomain: "tv-game-night.firebaseapp.com",
  databaseURL: "https://tv-game-night-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tv-game-night",
  storageBucket: "tv-game-night.firebasestorage.app",
  messagingSenderId: "570468387403",
  appId: "1:570468387403:web:1bcd29c85f8e8d00539bce",
  measurementId: "G-6LYXHB8VCJ"
};

try{
  firebase.initializeApp(firebaseConfig);
  const messaging=firebase.messaging();
  messaging.onBackgroundMessage(payload=>{
    const title=payload.notification?.title||payload.data?.title||'Nuovo invito';
    const body=payload.notification?.body||payload.data?.body||'Apri per partecipare.';
    self.registration.showNotification(title,{
      body,
      icon:'./Icone/icon-192.png',
      badge:'./Icone/favicon.svg',
      tag:payload.data?.inviteId?`game-invite-${payload.data.inviteId}`:'game-invite',
      renotify:true,
      data:{
        url:payload.data?.inviteId?`./?inviteId=${encodeURIComponent(payload.data.inviteId)}`:(payload.data?.url||'./'),
        inviteId:payload.data?.inviteId||''
      }
    });
  });
}catch(err){
  console.warn('Firebase Messaging non inizializzato nel service worker:',err);
}

const CACHE_NAME = 'tv-game-night-v35';
const APP_SHELL = [
  './',
  './index.html',
  './404.html',
  './script.js',
  './manifest.webmanifest',
  './Icone/favicon.svg',
  './Icone/logo.png',
  './Icone/icon-192.png',
  './Icone/apple-touch-icon.png',
  './Icone_syst/home.png',
  './Icone_syst/replay.png',
  './Icone_syst/terminal.png',
  './Icone_syst/wireless-symbol.png',
  './host.html',
  './play.html',
  './privacy-policy.html',
  './termini-condizioni.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url=event.notification.data?.url||'./';
  const inviteId=event.notification.data?.inviteId||'';
  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(clientList=>{
      const target=clientList.find(client=>client.url.includes(self.location.origin));
      if(target){
        target.postMessage({type:'gameInviteClick',inviteId});
        target.focus();
        return target.navigate?target.navigate(url):undefined;
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (!response || !response.ok) {
          return caches.match('./index.html').then(cached => cached || fetch('./index.html'));
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', responseToCache));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return undefined;
      });
    })
  );
});
