/**
 * Utilidades para manejo de imágenes.
 */

/**
 * Verifica si una URL es de localhost/MinIO y debería usar unoptimized.
 */
export function isLocalImage(src: string): boolean {
  if (typeof src !== 'string') {
    return false;
  }
  
  return (
    src.startsWith('http://localhost') ||
    src.startsWith('http://127.0.0.1') ||
    src.startsWith('http://[::1]') ||
    src.startsWith('http://minio') ||
    src.includes('localhost:9000') ||
    src.includes('127.0.0.1:9000')
  );
}

/**
 * Obtiene la URL del avatar, usando un fallback de DiceBear si está vacía o no existe.
 */
export function getAvatarUrl(avatarUrl: string | null | undefined, handle: string): string {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${handle}`;
}

