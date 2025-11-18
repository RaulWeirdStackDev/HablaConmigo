const CACHE_NAME = 'hablaconmigo-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  // Comida
  '/comida/index.html',
  '/comida/assets/img/fideos.jpeg',
  '/comida/assets/img/galletas.png',
  '/comida/assets/img/jugo.png',
  '/comida/assets/img/manzana.png',
  '/comida/assets/img/naranja.png',
  '/comida/assets/img/pan.png',
  '/comida/assets/img/platano.png',
  '/comida/assets/img/yogurt.png',
  // Recursos públicos
  '/public/emociones.png',
  '/public/auto.png',
  '/public/logo.png',  
  '/public/comida.png',
  '/public/ayuda.png',
  '/public/volver.png',
  // Emociones
  '/emociones/index.html',
  '/emociones/assets/img/calor.png',
  '/emociones/assets/img/contento.png',
  '/emociones/assets/img/dolor_cabeza.png',
  '/emociones/assets/img/dolor_diente.png',
  '/emociones/assets/img/dolor_estomago.png',
  '/emociones/assets/img/dolor_pie.png',
  '/emociones/assets/img/frio.png',
  '/emociones/assets/img/triste.png',
  // Viajes
  '/viajes/index.html',
  '/viajes/assets/img/auto.jpeg',
  '/viajes/assets/img/caminar.png',
  '/viajes/assets/img/parque.png',
  '/viajes/assets/img/perro.png',
  '/viajes/assets/img/escuela.png',
  '/viajes/assets/img/trabajar.png',
  // Ayuda
  '/ayuda/index.html',
  '/ayuda/assets/img/calcetines.png',
  '/ayuda/assets/img/hacer_Cama.png',
  '/ayuda/assets/img/ducha.png',
  '/ayuda/assets/img/polera.png',
  '/ayuda/assets/img/pantalon.png',
];

// Instalación: cachear todos los recursos
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Todos los archivos cacheados');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('Service Worker: Error al cachear:', error);
      })
  );
});

// Activación: limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activado y reclamando clientes');
      return self.clients.claim(); // Tomar control inmediato
    })
  );
});

// Fetch: estrategia Cache First con Network Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Si está en caché, devolverlo
        if (cachedResponse) {
          console.log('Service Worker: Sirviendo desde caché:', event.request.url);
          return cachedResponse;
        }
        
        // Si no está en caché, intentar obtenerlo de la red
        console.log('Service Worker: Obteniendo de la red:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Opcionalmente, cachear la respuesta de red
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Error de red:', error);
            // Aquí podrías devolver una página offline personalizada
            // return caches.match('/offline.html');
          });
      })
  );
});