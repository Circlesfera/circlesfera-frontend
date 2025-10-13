/**
 * 🔧 FORMATTERS UTILITIES
 * =======================
 * Funciones de formateo reutilizables
 */

/**
 * Formatea una fecha a formato relativo (ej: "2h", "3d", "hace 5m")
 */
export function formatTimeAgo(date: string | Date): string {
  const now = new Date()
  const postDate = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'ahora'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`

  return postDate.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Formatea una duración en segundos a formato MM:SS
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Formatea un número con sufijos K, M, B
 */
export function formatCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`
  if (count < 1000000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  return `${(count / 1000000000).toFixed(1).replace(/\.0$/, '')}B`
}

/**
 * Trunca texto con ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Formatea nombre de usuario con @
 */
export function formatUsername(username: string): string {
  return username.startsWith('@') ? username : `@${username}`
}

/**
 * Verifica si un string es una URL válida
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

