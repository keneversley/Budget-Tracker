// const APP_PREFIX = 'BudgetTracker-';
// const VERSION = 'version_01';
// const CACHE_NAME = APP_PREFIX + VERSION;


const FILES_TO_CACHE = [
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/db.js',
    './manifest.json',
    './icons/icon-512x512.png',
    './icons/icon-384x384.png',
    './icons/icon-192x192.png',
    './icons/icon-152x152.png',
    './icons/icon-144x144.png',
    './icons/icon-128x128.png',
    './icons/icon-96x96.png',
    './icons/icon-72x72.png'
];

const CACHE_NAME = `static-cache-v1`;
const DATA_CACHE_NAME = `data-cache-v1`;


// self.addEventListener('install', function (e) {
//     e.waitUntil(
//         caches.open(CACHE_NAME).then(function (cache) {
//             console.log('installing cache : ' + CACHE_NAME);
//             return cache.addAll(FILES_TO_CACHE)
//         })
//     )
// });

// self.addEventListener('activate', function (e) {
//     e.waitUntil(
//         caches.keys().then(function (keyList) {
//             let cacheKeeplist = keyList.filter(function (key) {
//                 return key.indexOf(APP_PREFIX);
//             });
//             cacheKeeplist.push(CACHE_NAME);

//             return Promise.all(keyList.map(function (key, i) {
//                 if (cacheKeeplist.indexOf(key) === -1) {
//                     console.log('deleting cache : ' + keyList[i] );
//                     return caches.delete(keyList[i]);
//                 }
//             }));
//         })
//     )
// });

// self.addEventListener('fetch', function (e) {
//     console.log('fetch request : ' + e.request.url);
//     e.respondWith(
//         caches.match(e.request).then(function (request) {
//             if (request) { // if cache is available, respond with cache
//                 console.log('responding with cache : ' + e.request.url);
//                 return request
//             } else {       // if there are no cache, try fetching request
//                 console.log('file is not cached, fetching : ' + e.request.url);
//                 return fetch(e.request)
//             }

//         })
//     )
// });


self.addEventListener("install", (evt) => {
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (evt) => {
    // remove old caches
    evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  self.addEventListener("fetch", (evt) => {
    // cache successful GET requests to the API
    if (evt.request.url.includes("/api/") && evt.request.method === "GET") {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request, response.clone());
                }
  
                return response;
              })
              .catch(() => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      // stop execution of the fetch event callback
      return;
    }
  
    // if the request is not for the API, serve static assets using
    // "offline-first" approach.
    evt.respondWith(
      caches.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      })
    );
  });