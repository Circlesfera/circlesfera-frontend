#!/usr/bin/env node

/**
 * Script FINAL - Corrige estilos inline y otros casos especiales
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  // Estilos inline con color hardcodeado
  {
    from: /style=\{\{\s*color:\s*'#111827'/g,
    to: "style={{ color: 'var(--text-primary, #111827)'"
  },
  {
    from: /style=\{\{\s*color:\s*'#1F2937'/g,
    to: "style={{ color: 'var(--text-secondary, #1F2937)'"
  },

  // Clases en template strings que pueden haber sido omitidas
  {
    from: /`([^`]*)\bbg-white\b(?!\s+dark:)([^`]*)`/g,
    to: '`$1bg-white dark:bg-gray-900$2`'
  },
  {
    from: /`([^`]*)\btext-gray-900\b(?!\s+dark:)([^`]*)`/g,
    to: '`$1text-gray-900 dark:text-gray-100$2`'
  },
  {
    from: /`([^`]*)\btext-gray-800\b(?!\s+dark:)([^`]*)`/g,
    to: '`$1text-gray-800 dark:text-gray-200$2`'
  },
  {
    from: /`([^`]*)\btext-gray-700\b(?!\s+dark:)([^`]*)`/g,
    to: '`$1text-gray-700 dark:text-gray-300$2`'
  },
  {
    from: /`([^`]*)\btext-gray-600\b(?!\s+dark:)([^`]*)`/g,
    to: '`$1text-gray-600 dark:text-gray-400$2`'
  },
  {
    from: /`([^`]*)\bborder-gray-200\b(?!\s+dark:)([^`]*)`/g,
    to: '`$1border-gray-200 dark:border-gray-700$2`'
  },
  {
    from: /`([^`]*)\bbg-gray-50\b(?!\s+dark:)([^`]*)`/g,
    to: '`$1bg-gray-50 dark:bg-gray-800$2`'
  },
  {
    from: /`([^`]*)\bbg-gray-100\b(?!\s+dark:)([^`]*)`/g,
    to: '`$1bg-gray-100 dark:bg-gray-800$2`'
  },

  // Clases dentro de cn() o clsx() que pueden haber sido omitidas
  {
    from: /cn\(([^)]*)\bbg-white\b(?!\s+dark:)([^)]*)\)/g,
    to: 'cn($1bg-white dark:bg-gray-900$2)'
  },
  {
    from: /cn\(([^)]*)\btext-gray-900\b(?!\s+dark:)([^)]*)\)/g,
    to: 'cn($1text-gray-900 dark:text-gray-100$2)'
  },
  {
    from: /clsx\(([^)]*)\bbg-white\b(?!\s+dark:)([^)]*)\)/g,
    to: 'clsx($1bg-white dark:bg-gray-900$2)'
  },

  // Casos especiales de from-* y to-* en gradientes
  {
    from: /\bfrom-gray-50\b(?!\s+dark:)/g,
    to: 'from-gray-50 dark:from-gray-900'
  },
  {
    from: /\bto-gray-50\b(?!\s+dark:)/g,
    to: 'to-gray-50 dark:to-gray-900'
  },
  {
    from: /\bvia-white\b(?!\s+dark:)/g,
    to: 'via-white dark:via-gray-900'
  },
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
console.log('🔍 Buscando casos especiales (inline styles, template strings, cn/clsx)...\n');

const srcDir = path.join(__dirname, 'src');
const files = getAllFiles(srcDir);

console.log(`📁 Encontrados ${files.length} archivos\n`);
console.log('🔧 Procesando casos especiales...\n');

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
  console.log(`\n✅ ¡No se encontraron más casos especiales!`);
} else {
  console.log(`\n💡 Casos especiales corregidos (inline styles, template strings, etc)`);
}

