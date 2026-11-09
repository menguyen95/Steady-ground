/* Steady Ground service worker: caches the app so it opens offline.
   Bump CACHE when you change any file, so installed phones pick up the update. */
var CACHE = 'steady-ground-v13';
var FILES = [
  './', './index.html', './styles.css', './app.js', './learn.js', './jspdf.umd.min.js',
  './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png', './icons/apple-touch-icon.png'
];
self.addEventListener('install', function(e){
  /* Each file is asked for with cache:'reload', which goes past the browser's own HTTP
     cache to the network. Without it addAll is served the previous copies the host told
     the browser to keep, and a new version installs with the old files inside it. */
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(FILES.map(function(f){
      return fetch(new Request(f, {cache:'reload'})).then(function(r){
        if (r && (r.ok || r.type === 'opaque')) return c.put(f, r);
      }).catch(function(){});
    }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) {
    /* fonts: network first, fall back to cache; the app has system-font fallbacks anyway */
    e.respondWith(fetch(e.request).then(function(r){
      var copy = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); }); return r;
    }).catch(function(){ return caches.match(e.request); }));
    return;
  }
  /* The cached copy is served at once so the app still opens instantly and offline, and
     a fresh copy is fetched in the background for next time. A cache that has gone stale
     for any reason then repairs itself on the following open, without a version bump. */
  e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(function(hit){
    var fresh = fetch(e.request).then(function(r){
      if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); }); }
      return r;
    }).catch(function(){ return hit; });
    return hit || fresh;
  }));
});
