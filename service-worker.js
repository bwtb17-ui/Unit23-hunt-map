const APP_CACHE = 'unit23-app-v4';

const TILE_CACHE = 'unit23-osm-tiles-v1';

const APP_FILES = [

  './',

  './index.html',

  './blm_unit23.geojson',

  './county_roads.geojson',

  './blm-unit23.geojson',

  './AntelopeHuntAreas_-6737330874868979965.geojson',

  './A7AE50AA-8385-446C-90DC-64621EFCC41F.png',

  './apple-touch-icon.png',

  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',

  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

];

self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(APP_CACHE).then(async cache => {

      await Promise.allSettled(

        APP_FILES.map(url => cache.add(url))

      );

    }).then(() => self.skipWaiting())

  );

});

self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys

          .filter(key =>

            key !== APP_CACHE &&

            key !== TILE_CACHE &&

            key.startsWith('unit23-')

          )

          .map(key => caches.delete(key))

      )

    ).then(() => self.clients.claim())

  );

});

self.addEventListener('fetch', event => {

  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.hostname === 'tile.openstreetmap.org') {

    event.respondWith(

      caches.open(TILE_CACHE).then(async cache => {

        const cached = await cache.match(request);

        if (cached) {

          return cached;

        }

        try {

          const response = await fetch(request);

          if (response && (response.ok || response.type === 'opaque')) {

            await cache.put(request, response.clone());

          }

          return response;

        } catch (error) {

          return new Response('', {

            status: 504,

            statusText: 'Offline tile unavailable'

          });

        }

      })

    );

    return;

  }

  const isSameOrigin = url.origin === self.location.origin;

  const isLeaflet = url.hostname === 'unpkg.com';

  if (isSameOrigin || isLeaflet) {

    event.respondWith(

      caches.match(request).then(async cached => {

        if (cached) return cached;

        try {

          const response = await fetch(request);

          if (response && (response.ok || response.type === 'opaque')) {

            const cache = await caches.open(APP_CACHE);

            await cache.put(request, response.clone());

          }

          return response;

        } catch (error) {

          if (request.mode === 'navigate') {

            const fallback = await caches.match('./index.html');

            if (fallback) return fallback;

          }

          return new Response('', {

            status: 504,

            statusText: 'Offline resource unavailable'

          });

        }

      })

    );

  }

});
