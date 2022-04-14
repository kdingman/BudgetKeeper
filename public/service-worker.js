const APP_PREFIX = 'BudgetKeeper-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/js/idb.js',
    '/js/index.js',
    '/css/styles.css',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/manifest.json'
];

// Install the Service Worker
self.addEventListener('install', function (e) {
    // Tells the browser to wait until the work is complete before terminating the service worker
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    );
    self.skipWaiting();
});

// Activate the Service Worker and Remove old data from the cache
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeeplist.indexOf(key) === -1 ) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Retrieve Info from Cache
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url )
    e.respondWith(
        // determines if the resource already exists in caches
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + e.request.url)
                return request
            }
            // if there are no caches, try fetching request
            else {
                console.log('file is not cached, fecthing : ' + e.request.url)
                return fetch(e.request)
            }
        })
    );
});