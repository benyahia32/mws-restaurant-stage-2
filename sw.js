const cacheName = "mws-restaurant-project";
const offlineUrl = "index.html";

self.addEventListener("install", event => {
 const urlsToCache = [
           offlineUrl,
           "./",
           "./index.html",
           "./restaurant.html",
           "./css/styles.css",
           "./data/restaurants.json",
           "./js/dbhelper.js",
           "./js/main.js",
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
           'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
           'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
 ];

 event.waitUntil(
   caches.open(cacheName).then(cache => cache.addAll(urlsToCache))
 );
});

self.addEventListener("fetch", event => {
 event.respondWith(
   // check to see whether the request exists in the cache or not
   caches.match(event.request).then(response => {
     if (response) {
       return response;
     }

   // if it doesn't exist, add response into the cache
   // in the case of failed fetch, fall back to cached offline source
     const fetchRequest = event.request.clone();

     return fetch(fetchRequest)
       .then(response => {
         if (!response || response.status !== 200) {
           return response;
         }

         const responseToCache = response.clone();

         caches.open(cacheName).then(cache => {
           cache.put(event.request, responseToCache);
         });

         return response;
       })
       .catch(error => {
         if (
           event.request.method === "GET" &&
           event.request.headers.get("accept").includes("text/html")
         ) {
           return caches.match(offlineUrl);
         }
       });
   })
 );
});
