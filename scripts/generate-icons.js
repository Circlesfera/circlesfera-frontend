const fs = require('fs');
const path = require('path');

// SVG template para el icono de CircleSfera
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#gradient)"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white">C</text>
</svg>`;

// Tamaños de iconos requeridos
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Crear directorio de iconos si no existe
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generar iconos SVG
iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Generado: ${filename}`);
});

// Crear iconos de atajo
const createShortcutIcon = (name, size = 96) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size/8}" fill="url(#gradient)"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white">${name}</text>
</svg>`;

// Generar iconos de atajo
const shortcuts = [
  { name: 'create', text: '+' },
  { name: 'reel', text: 'R' },
  { name: 'messages', text: 'M' }
];

shortcuts.forEach(shortcut => {
  const svgContent = createShortcutIcon(shortcut.text);
  const filename = `shortcut-${shortcut.name}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Generado: ${filename}`);
});

console.log('\n🎉 Todos los iconos PWA han sido generados exitosamente!');
