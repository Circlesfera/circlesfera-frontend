// Script temporal para limpiar tokens del localStorage
// Ejecutar en la consola del navegador

console.log('🧹 Limpiando tokens inválidos...');

// Limpiar tokens
localStorage.removeItem('token');
localStorage.removeItem('user');

console.log('✅ Tokens limpiados exitosamente');
console.log('🔄 Recarga la página para continuar');

// Opcional: recargar la página automáticamente
// window.location.reload(); 