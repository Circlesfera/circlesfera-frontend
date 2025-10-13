const fs = require('fs')
const path = require('path')

// Función para limpiar clases duplicadas en un string
function cleanDuplicateClasses(classString) {
  // Dividir las clases por espacios
  const classes = classString.split(' ')

  // Crear un Set para eliminar duplicados manteniendo el orden
  const uniqueClasses = []
  const seen = new Set()

  for (const cls of classes) {
    if (!seen.has(cls)) {
      seen.add(cls)
      uniqueClasses.push(cls)
    }
  }

  return uniqueClasses.join(' ')
}

// Función para procesar archivos
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let hasChanges = false

    // Buscar y limpiar className con clases duplicadas
    content = content.replace(/className="([^"]*)"/g, (match, classString) => {
      const cleaned = cleanDuplicateClasses(classString)
      if (cleaned !== classString) {
        hasChanges = true
        return `className="${cleaned}"`
      }
      return match
    })

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ Limpiado: ${filePath}`)
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

console.log('🧹 Limpiando clases duplicadas...')
console.log('📁 Procesando archivos en:', process.cwd())

const result = processDirectory('./src')

console.log(`\n📊 Resumen:`)
console.log(`   Total archivos procesados: ${result.totalFiles}`)
console.log(`   Archivos limpiados: ${result.updatedFiles}`)
console.log(`\n✨ ¡Limpieza completada!`)
