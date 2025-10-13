const fs = require('fs')
const path = require('path')

// Patrones más específicos y completos
const patterns = [
  // Fondos
  { from: /bg-white/g, to: 'bg-white dark:bg-gray-900' },
  { from: /bg-gray-50/g, to: 'bg-gray-50 dark:bg-gray-800' },
  { from: /bg-gray-100/g, to: 'bg-gray-100 dark:bg-gray-700' },
  { from: /bg-gray-200/g, to: 'bg-gray-200 dark:bg-gray-600' },

  // Textos
  { from: /text-gray-900/g, to: 'text-gray-900 dark:text-gray-100' },
  { from: /text-gray-800/g, to: 'text-gray-800 dark:text-gray-200' },
  { from: /text-gray-700/g, to: 'text-gray-700 dark:text-gray-300' },
  { from: /text-gray-600/g, to: 'text-gray-600 dark:text-gray-400' },
  { from: /text-gray-500/g, to: 'text-gray-500 dark:text-gray-400' },

  // Bordes
  { from: /border-gray-200/g, to: 'border-gray-200 dark:border-gray-700' },
  { from: /border-gray-300/g, to: 'border-gray-300 dark:border-gray-600' },
  { from: /border-gray-400/g, to: 'border-gray-400 dark:border-gray-500' },

  // Dividers
  { from: /divide-gray-200/g, to: 'divide-gray-200 dark:divide-gray-700' },
  { from: /divide-gray-300/g, to: 'divide-gray-300 dark:divide-gray-600' },

  // Ring colors
  { from: /ring-gray-300/g, to: 'ring-gray-300 dark:ring-gray-600' },
  { from: /ring-gray-400/g, to: 'ring-gray-400 dark:ring-gray-500' },

  // Placeholder
  { from: /placeholder-gray-400/g, to: 'placeholder-gray-400 dark:placeholder-gray-500' },
  { from: /placeholder-gray-500/g, to: 'placeholder-gray-500 dark:placeholder-gray-400' },

  // Hover states
  { from: /hover:bg-gray-50/g, to: 'hover:bg-gray-50 dark:hover:bg-gray-800' },
  { from: /hover:bg-gray-100/g, to: 'hover:bg-gray-100 dark:hover:bg-gray-700' },
  { from: /hover:bg-gray-200/g, to: 'hover:bg-gray-200 dark:hover:bg-gray-600' },
  { from: /hover:text-gray-700/g, to: 'hover:text-gray-700 dark:hover:text-gray-300' },
  { from: /hover:text-gray-800/g, to: 'hover:text-gray-800 dark:hover:text-gray-200' },

  // Focus states
  { from: /focus:bg-gray-50/g, to: 'focus:bg-gray-50 dark:focus:bg-gray-800' },
  { from: /focus:ring-gray-300/g, to: 'focus:ring-gray-300 dark:focus:ring-gray-600' },

  // Active states
  { from: /active:bg-gray-100/g, to: 'active:bg-gray-100 dark:active:bg-gray-700' },

  // Shadows
  { from: /shadow-gray-200/g, to: 'shadow-gray-200 dark:shadow-gray-800' },
  { from: /shadow-gray-300/g, to: 'shadow-gray-300 dark:shadow-gray-700' },
]

// Función para procesar archivos
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let hasChanges = false

    patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to)
        hasChanges = true
      }
    })

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ Actualizado: ${filePath}`)
      return true
    }
    return false
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message)
    return false
  }
}

// Función para recorrer directorios
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath)
  let totalFiles = 0
  let updatedFiles = 0

  items.forEach(item => {
    const fullPath = path.join(dirPath, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // Ignorar node_modules y .next
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
        const result = processDirectory(fullPath)
        totalFiles += result.totalFiles
        updatedFiles += result.updatedFiles
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
      totalFiles++
      if (processFile(fullPath)) {
        updatedFiles++
      }
    }
  })

  return { totalFiles, updatedFiles }
}

console.log('🚀 Iniciando corrección completa de dark mode...')
console.log('📁 Procesando archivos en:', process.cwd())

const result = processDirectory('./src')

console.log(`\n📊 Resumen:`)
console.log(`   Total archivos procesados: ${result.totalFiles}`)
console.log(`   Archivos actualizados: ${result.updatedFiles}`)
console.log(`\n✨ ¡Corrección completada!`)
