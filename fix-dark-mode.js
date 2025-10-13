#!/usr/bin/env node

/**
 * Script para agregar clases dark: a todos los archivos
 * Actualiza automáticamente los patrones más comunes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patrones a reemplazar (orden importante)
const replacements = [
  // Fondos
  { from: /className="([^"]*\s)?bg-white(\s[^"]*)"/g, to: 'className="$1bg-white dark:bg-gray-900$2"' },
  { from: /className="([^"]*\s)?bg-gray-50(\s[^"]*)"/g, to: 'className="$1bg-gray-50 dark:bg-gray-800$2"' },
  { from: /className="([^"]*\s)?bg-gray-100(\s[^"]*)"/g, to: 'className="$1bg-gray-100 dark:bg-gray-800$2"' },

  // Textos
  { from: /className="([^"]*\s)?text-gray-900(\s[^"]*)"/g, to: 'className="$1text-gray-900 dark:text-gray-100$2"' },
  { from: /className="([^"]*\s)?text-gray-800(\s[^"]*)"/g, to: 'className="$1text-gray-800 dark:text-gray-200$2"' },
  { from: /className="([^"]*\s)?text-gray-700(\s[^"]*)"/g, to: 'className="$1text-gray-700 dark:text-gray-300$2"' },
  { from: /className="([^"]*\s)?text-gray-600(\s[^"]*)"/g, to: 'className="$1text-gray-600 dark:text-gray-400$2"' },
  { from: /className="([^"]*\s)?text-gray-500(\s[^"]*)"/g, to: 'className="$1text-gray-500 dark:text-gray-400$2"' },

  // Bordes
  { from: /className="([^"]*\s)?border-gray-200(\s[^"]*)"/g, to: 'className="$1border-gray-200 dark:border-gray-700$2"' },
  { from: /className="([^"]*\s)?border-gray-300(\s[^"]*)"/g, to: 'className="$1border-gray-300 dark:border-gray-600$2"' },

  // Hovers
  { from: /className="([^"]*\s)?hover:bg-gray-50(\s[^"]*)"/g, to: 'className="$1hover:bg-gray-50 dark:hover:bg-gray-800$2"' },
  { from: /className="([^"]*\s)?hover:bg-gray-100(\s[^"]*)"/g, to: 'className="$1hover:bg-gray-100 dark:hover:bg-gray-700$2"' },
  { from: /className="([^"]*\s)?hover:text-gray-900(\s[^"]*)"/g, to: 'className="$1hover:text-gray-900 dark:hover:text-gray-100$2"' },
];

// Archivos a excluir
const excludePatterns = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'fix-dark-mode.js'
];

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    if (shouldExclude(filePath)) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.match(/\.(tsx?|jsx?)$/)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = 0;

  // Evitar duplicados (si ya tiene dark:)
  if (content.includes('dark:bg-') || content.includes('dark:text-') || content.includes('dark:border-')) {
    // Ya tiene algunas clases dark, pero puede necesitar más
    // Solo procesar si no tiene todas las clases dark necesarias
  }

  replacements.forEach(({ from, to }) => {
    const before = content;
    // Evitar duplicar clases dark:
    content = content.replace(from, (match) => {
      // Si ya tiene la clase dark correspondiente, no reemplazar
      if (match.includes('dark:')) {
        return match;
      }
      changes++;
      return match.replace(from, to);
    });

    if (before !== content) {
      modified = true;
    }
  });

  if (modified && changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} (${changes} cambios)`);
    return true;
  }

  return false;
}

// Main
console.log('🔍 Buscando archivos TypeScript/TSX...\n');

const srcDir = path.join(__dirname, 'src');
const files = getAllFiles(srcDir);

console.log(`📁 Encontrados ${files.length} archivos\n`);
console.log('🔧 Procesando archivos...\n');

let processedCount = 0;
let modifiedCount = 0;

files.forEach(file => {
  processedCount++;
  if (processFile(file)) {
    modifiedCount++;
  }
});

console.log(`\n✨ Completado!`);
console.log(`📊 Procesados: ${processedCount} archivos`);
console.log(`✏️  Modificados: ${modifiedCount} archivos`);
console.log(`\n💡 Ejecuta 'npm run lint:fix' para formatear el código`);

