#!/usr/bin/env node

/**
 * Script v2 - Más exhaustivo para agregar clases dark: a TODOS los archivos
 * Busca TODAS las clases que necesitan dark: sin importar el contexto
 */

const fs = require('fs');
const path = require('path');

// Patrones más exhaustivos (sin restricción de className)
const replacements = [
  // Fondos blancos y grises claros
  { from: /\bbg-white\b(?!\s+dark:)/g, to: 'bg-white dark:bg-gray-900' },
  { from: /\bbg-gray-50\b(?!\s+dark:)/g, to: 'bg-gray-50 dark:bg-gray-800' },
  { from: /\bbg-gray-100\b(?!\s+dark:)/g, to: 'bg-gray-100 dark:bg-gray-800' },
  { from: /\bbg-gray-200\b(?!\s+dark:)/g, to: 'bg-gray-200 dark:bg-gray-700' },

  // Textos oscuros
  { from: /\btext-gray-900\b(?!\s+dark:)/g, to: 'text-gray-900 dark:text-gray-100' },
  { from: /\btext-gray-800\b(?!\s+dark:)/g, to: 'text-gray-800 dark:text-gray-200' },
  { from: /\btext-gray-700\b(?!\s+dark:)/g, to: 'text-gray-700 dark:text-gray-300' },
  { from: /\btext-gray-600\b(?!\s+dark:)/g, to: 'text-gray-600 dark:text-gray-400' },
  { from: /\btext-gray-500\b(?!\s+dark:)/g, to: 'text-gray-500 dark:text-gray-400' },
  { from: /\btext-gray-400\b(?!\s+dark:)/g, to: 'text-gray-400 dark:text-gray-500' },

  // Bordes
  { from: /\bborder-gray-200\b(?!\s+dark:)/g, to: 'border-gray-200 dark:border-gray-700' },
  { from: /\bborder-gray-300\b(?!\s+dark:)/g, to: 'border-gray-300 dark:border-gray-600' },
  { from: /\bborder-gray-100\b(?!\s+dark:)/g, to: 'border-gray-100 dark:border-gray-700' },

  // Hovers de fondo
  { from: /\bhover:bg-white\b(?!\s+dark:)/g, to: 'hover:bg-white dark:hover:bg-gray-800' },
  { from: /\bhover:bg-gray-50\b(?!\s+dark:)/g, to: 'hover:bg-gray-50 dark:hover:bg-gray-800' },
  { from: /\bhover:bg-gray-100\b(?!\s+dark:)/g, to: 'hover:bg-gray-100 dark:hover:bg-gray-700' },
  { from: /\bhover:bg-gray-200\b(?!\s+dark:)/g, to: 'hover:bg-gray-200 dark:hover:bg-gray-600' },

  // Hovers de texto
  { from: /\bhover:text-gray-900\b(?!\s+dark:)/g, to: 'hover:text-gray-900 dark:hover:text-gray-100' },
  { from: /\bhover:text-gray-800\b(?!\s+dark:)/g, to: 'hover:text-gray-800 dark:hover:text-gray-200' },
  { from: /\bhover:text-gray-700\b(?!\s+dark:)/g, to: 'hover:text-gray-700 dark:hover:text-gray-300' },
  { from: /\bhover:text-gray-600\b(?!\s+dark:)/g, to: 'hover:text-gray-600 dark:hover:text-gray-400' },

  // Hovers de borde
  { from: /\bhover:border-gray-200\b(?!\s+dark:)/g, to: 'hover:border-gray-200 dark:hover:border-gray-700' },
  { from: /\bhover:border-gray-300\b(?!\s+dark:)/g, to: 'hover:border-gray-300 dark:hover:border-gray-600' },

  // Focus
  { from: /\bfocus:bg-white\b(?!\s+dark:)/g, to: 'focus:bg-white dark:focus:bg-gray-900' },
  { from: /\bfocus:bg-gray-50\b(?!\s+dark:)/g, to: 'focus:bg-gray-50 dark:focus:bg-gray-800' },
  { from: /\bfocus:border-gray-300\b(?!\s+dark:)/g, to: 'focus:border-gray-300 dark:focus:border-gray-600' },

  // Placeholders
  { from: /\bplaceholder-gray-400\b(?!\s+dark:)/g, to: 'placeholder-gray-400 dark:placeholder-gray-500' },
  { from: /\bplaceholder-gray-500\b(?!\s+dark:)/g, to: 'placeholder-gray-500 dark:placeholder-gray-400' },

  // Divide (separadores)
  { from: /\bdivide-gray-200\b(?!\s+dark:)/g, to: 'divide-gray-200 dark:divide-gray-700' },
  { from: /\bdivide-gray-100\b(?!\s+dark:)/g, to: 'divide-gray-100 dark:divide-gray-700' },

  // Ring (focus rings)
  { from: /\bring-gray-300\b(?!\s+dark:)/g, to: 'ring-gray-300 dark:ring-gray-600' },

  // Shadows (algunos casos específicos)
  { from: /\bshadow-sm\b(?!\s+dark:)/g, to: 'shadow-sm dark:shadow-gray-900/50' },
];

const excludePatterns = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'fix-dark-mode',
  'tailwind.config',
  'postcss.config'
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
  const originalContent = content;

  replacements.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      changes += matches.length;
      modified = true;
    }
  });

  if (modified && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${path.relative(process.cwd(), filePath)} (${changes} cambios)`);
    return true;
  }

  return false;
}

// Main
console.log('🔍 Buscando archivos TypeScript/TSX (v2 - exhaustivo)...\n');

const srcDir = path.join(__dirname, 'src');
const files = getAllFiles(srcDir);

console.log(`📁 Encontrados ${files.length} archivos\n`);
console.log('🔧 Procesando archivos con patrones exhaustivos...\n');

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

if (modifiedCount === 0) {
  console.log(`\n✅ ¡Todos los archivos ya tienen clases dark:!`);
} else {
  console.log(`\n💡 Ejecuta 'npm run lint:fix' para formatear el código`);
}

