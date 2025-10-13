const fs = require('fs');
const path = require('path');

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Patrones que necesitan dark: variants
    const patterns = [
      // Backgrounds
      { from: /className="([^"]*?)bg-white([^"]*?)"/g, to: 'className="$1bg-white dark:bg-gray-900$2"' },
      { from: /className="([^"]*?)bg-gray-50([^"]*?)"/g, to: 'className="$1bg-gray-50 dark:bg-gray-800$2"' },
      { from: /className="([^"]*?)bg-gray-100([^"]*?)"/g, to: 'className="$1bg-gray-100 dark:bg-gray-700$2"' },

      // Text colors
      { from: /className="([^"]*?)text-gray-900([^"]*?)"/g, to: 'className="$1text-gray-900 dark:text-gray-100$2"' },
      { from: /className="([^"]*?)text-gray-800([^"]*?)"/g, to: 'className="$1text-gray-800 dark:text-gray-200$2"' },

      // Borders
      { from: /className="([^"]*?)border-gray-200([^"]*?)"/g, to: 'className="$1border-gray-200 dark:border-gray-700$2"' },
      { from: /className="([^"]*?)border-gray-300([^"]*?)"/g, to: 'className="$1border-gray-300 dark:border-gray-600$2"' },

      // Hover states
      { from: /className="([^"]*?)hover:bg-gray-50([^"]*?)"/g, to: 'className="$1hover:bg-gray-50 dark:hover:bg-gray-800$2"' },
      { from: /className="([^"]*?)hover:bg-gray-100([^"]*?)"/g, to: 'className="$1hover:bg-gray-100 dark:hover:bg-gray-700$2"' },

      // Ring colors
      { from: /className="([^"]*?)ring-gray-300([^"]*?)"/g, to: 'className="$1ring-gray-300 dark:ring-gray-600$2"' },

      // Placeholder colors
      { from: /className="([^"]*?)placeholder-gray-400([^"]*?)"/g, to: 'className="$1placeholder-gray-400 dark:placeholder-gray-500$2"' },
    ];

    // Aplicar patrones
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.from, pattern.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // También manejar className con template literals
    const templatePatterns = [
      { from: /className=\{`([^`]*?)bg-white([^`]*?)`\}/g, to: 'className={`$1bg-white dark:bg-gray-900$2`}' },
      { from: /className=\{`([^`]*?)bg-gray-50([^`]*?)`\}/g, to: 'className={`$1bg-gray-50 dark:bg-gray-800$2`}' },
      { from: /className=\{`([^`]*?)bg-gray-100([^`]*?)`\}/g, to: 'className={`$1bg-gray-100 dark:bg-gray-700$2`}' },
      { from: /className=\{`([^`]*?)text-gray-900([^`]*?)`\}/g, to: 'className={`$1text-gray-900 dark:text-gray-100$2`}' },
      { from: /className=\{`([^`]*?)text-gray-800([^`]*?)`\}/g, to: 'className={`$1text-gray-800 dark:text-gray-200$2`}' },
    ];

    templatePatterns.forEach(pattern => {
      const newContent = content.replace(pattern.from, pattern.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Manejar cn() calls
    const cnPatterns = [
      { from: /cn\(["']([^"']*?)bg-white([^"']*?)["']/g, to: 'cn("$1bg-white dark:bg-gray-900$2"' },
      { from: /cn\(["']([^"']*?)bg-gray-50([^"']*?)["']/g, to: 'cn("$1bg-gray-50 dark:bg-gray-800$2"' },
      { from: /cn\(["']([^"']*?)bg-gray-100([^"']*?)["']/g, to: 'cn("$1bg-gray-100 dark:bg-gray-700$2"' },
      { from: /cn\(["']([^"']*?)text-gray-900([^"']*?)["']/g, to: 'cn("$1text-gray-900 dark:text-gray-100$2"' },
    ];

    cnPatterns.forEach(pattern => {
      const newContent = content.replace(pattern.from, pattern.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Función para recorrer directorios recursivamente
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Saltar node_modules y otros directorios
      if (!['node_modules', '.next', '.git', 'coverage', 'dist', 'build'].includes(file)) {
        updatedCount += walkDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      if (processFile(filePath)) {
        updatedCount++;
      }
    }
  });

  return updatedCount;
}

// Ejecutar
console.log('🔧 Fixing theme styles...');
const srcDir = path.join(__dirname, 'src');
const updatedCount = walkDirectory(srcDir);
console.log(`\n✅ Updated ${updatedCount} files with dark mode variants`);
