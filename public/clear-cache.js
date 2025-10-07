// Script agresivo para limpiar cache del service worker
console.log('🧹 Iniciando limpieza agresiva de cache...');

// 1. Desregistrar todos los service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('📱 Service workers encontrados:', registrations.length);
    for(let registration of registrations) {
      console.log('🗑️ Desregistrando service worker:', registration.scope);
      registration.unregister();
    }
  });
}

// 2. Limpiar todos los caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    console.log('💾 Caches encontrados:', cacheNames);
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('🗑️ Eliminando cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('✅ Todos los caches eliminados');
  });
}

// 3. Limpiar localStorage y sessionStorage
try {
  localStorage.clear();
  sessionStorage.clear();
  console.log('🗑️ LocalStorage y SessionStorage limpiados');
} catch (e) {
  console.log('⚠️ Error limpiando storage:', e);
}

// 4. Forzar recarga sin cache
setTimeout(() => {
  console.log('🔄 Recargando página sin cache...');
  window.location.reload(true);
}, 1000);
