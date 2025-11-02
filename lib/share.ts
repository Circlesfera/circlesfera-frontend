/**
 * Utilidad para compartir posts.
 */

/**
 * Genera la URL completa de un post para compartir.
 */
export const getPostShareUrl = (postId: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  return `${window.location.origin}/posts/${postId}`;
};

/**
 * Copia el enlace de un post al portapapeles.
 */
export const copyPostLink = async (postId: string): Promise<boolean> => {
  try {
    const url = getPostShareUrl(postId);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Error al copiar enlace:', error);
    // Fallback para navegadores antiguos
    try {
      const textArea = document.createElement('textarea');
      textArea.value = getPostShareUrl(postId);
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Error en fallback de copiar:', fallbackError);
      return false;
    }
  }
};

/**
 * Comparte un post usando la Web Share API (si está disponible).
 */
export const sharePost = async (postId: string, title: string, text?: string): Promise<boolean> => {
  if (!navigator.share) {
    // Si no hay soporte para Web Share API, copiar al portapapeles
    const copied = await copyPostLink(postId);
    return copied;
  }

  try {
    const url = getPostShareUrl(postId);
    await navigator.share({
      title,
      text: text || `Mira esta publicación en CircleSfera`,
      url
    });
    return true;
  } catch (error) {
    // El usuario canceló o hubo un error
    if ((error as Error).name !== 'AbortError') {
      console.error('Error al compartir:', error);
    }
    return false;
  }
};

