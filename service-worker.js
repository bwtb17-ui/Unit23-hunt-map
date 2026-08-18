const CACHE_NAME = 'unit23-map-v1';

const FILES_TO_CACHE = [

  './',

  './index.html',

  './blm_unit23.geojson',

  './AntelopeHuntAreas_-6737330874868979965.geojson',

  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',

  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

];

self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => cache.addAll(FILES_TO_CACHE))

  );

});

self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys

          .filter(key => key !== CACHE_NAME)

          .map(key => caches.delete(key))

      )

    )

  );

});

self.addEventListener('fetch', event => {

  event.respondWith(

    caches.match(event.request)

      .then(response => response || fetch(event.request))

  );

});
