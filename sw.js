const cacheName = "restaurant-v1";
const offlineUrl = "index.html";

self.addEventListener("install", event => {
 const urlsToCache = [
           offlineUrl,
           "./",
           "./index.html",
           "./restaurant.html",
           "./css/styles.css",
           "./data/restaurants.json",
           './js/idb.js',
           "./js/dbhelper.js",
           "./js/main.js",
           "./manifest.json",
           "./favicon.ico",
           "./js/restaurant_info.js",
           "./images/1-1600_large.jpg",
           "./images/1-400_small.jpg",
           "./images/1-800_medium.jpg",
           "./images/10-1600_large.jpg",
           "./images/10-400_small.jpg",
           "./images/10-800_medium.jpg",
           "./images/2-1600_large.jpg",
           "./images/2-400_small.jpg",
           "./images/2-800_medium.jpg",
           "./images/3-1600_large.jpg",
           "./images/3-400_small.jpg",
           "./images/3-800_medium.jpg",
           "./images/4-1600_large.jpg",
           "./images/4-400_small.jpg",
           "./images/4-800_medium.jpg",
           "./images/5-1600_large.jpg",
           "./images/5-400_small.jpg",
           "./images/5-800_medium.jpg",
           "./images/6-1600_large.jpg",
           "./images/6-400_small.jpg",
           "./images/6-800_medium.jpg",
           "./images/7-1600_large.jpg",
           "./images/7-400_small.jpg",
           "./images/7-800_medium.jpg",
           "./images/8-1600_large.jpg",
           "./images/8-400_small.jpg",
           "./images/8-800_medium.jpg",
           "./images/9-1600_large.jpg",
           "./images/9-400_small.jpg",
           "./images/9-800_medium.jpg",
           './img/marker-icon-2x-red.png',
           "./restaurant.html?id=1",
           "./restaurant.html?id=2",
           "./restaurant.html?id=3",
           "./restaurant.html?id=4",
           "./restaurant.html?id=5",
           "./restaurant.html?id=6",
           "./restaurant.html?id=7",
           "./restaurant.html?id=8",
           "./restaurant.html?id=9",
           "./restaurant.html?id=10",
           'http://localhost:1337/restaurants/',
           'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
           'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
 ];

 event.waitUntil(
   caches.open(cacheName).then(cache => cache.addAll(urlsToCache))
                         .catch(error => console.error('Cache Open failed in service worker', error))
 );
});


 self.addEventListener("activate", event => {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.filter(cacheName => {
                        return cacheName.startsWith("restaurant-") &&
                            cacheName != staticCacheName
                    }).map(cacheName => {
                        return caches.delete(cacheName);
                    })
                )
            })
        );
    });


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response.
            var responseToCache = response.clone();

            caches.open(cacheName)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});


