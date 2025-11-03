/**
 * Genera una imagen del post para compartir en story.
 * Crea un canvas con el thumbnail del post, nombre del autor y un sticker indicador.
 */
export async function generateSharedPostImage(
  postThumbnailUrl: string,
  authorName: string,
  authorHandle: string,
  authorAvatarUrl?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Dimensiones de la story (1080x1920)
    const width = 1080;
    const height = 1920;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No se pudo crear el contexto del canvas'));
      return;
    }

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Cargar thumbnail del post
    const thumbnailImg = new Image();
    thumbnailImg.crossOrigin = 'anonymous';

    thumbnailImg.onload = (): void => {
      // Dibujar thumbnail centrado (manteniendo aspect ratio)
      const imgAspect = thumbnailImg.width / thumbnailImg.height;
      const canvasAspect = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > canvasAspect) {
        // Imagen más ancha
        drawHeight = width / imgAspect;
        offsetY = (height - drawHeight) / 2;
      } else {
        // Imagen más alta
        drawWidth = height * imgAspect;
        offsetX = (width - drawWidth) / 2;
      }

      ctx.drawImage(thumbnailImg, offsetX, offsetY, drawWidth, drawHeight);

      // Overlay oscuro en la parte superior para el texto
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 300);

      // Avatar y nombre del autor en la parte superior
      if (authorAvatarUrl) {
        const avatarImg = new Image();
        avatarImg.crossOrigin = 'anonymous';
        avatarImg.onload = (): void => {
          const avatarSize = 60;
          const avatarX = 40;
          const avatarY = 80;

          // Círculo para avatar
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, 2 * Math.PI);
          ctx.save();
          ctx.clip();

          ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
          ctx.restore();

          // Nombre del autor
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px Arial';
          ctx.fillText(authorName, avatarX + avatarSize + 15, avatarY + 25);
          ctx.font = '24px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(`@${authorHandle}`, avatarX + avatarSize + 15, avatarY + 55);

          // Badge "Post compartido" en la parte inferior
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(width / 2 - 150, height - 150, 300, 80);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Post compartido', width / 2, height - 110);
          ctx.textAlign = 'left';

          // Convertir a data URL
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        avatarImg.onerror = (): void => {
          // Si falla el avatar, continuar sin él
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px Arial';
          ctx.fillText(authorName, 40, 110);
          ctx.font = '24px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(`@${authorHandle}`, 40, 140);

          // Badge
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(width / 2 - 150, height - 150, 300, 80);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Post compartido', width / 2, height - 110);
          ctx.textAlign = 'left';

          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        avatarImg.src = authorAvatarUrl;
      } else {
        // Sin avatar
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(authorName, 40, 110);
        ctx.font = '24px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`@${authorHandle}`, 40, 140);

        // Badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(width / 2 - 150, height - 150, 300, 80);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Post compartido', width / 2, height - 110);
        ctx.textAlign = 'left';

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      }
    };

    thumbnailImg.onerror = (): void => {
      reject(new Error('No se pudo cargar el thumbnail del post'));
    };

    thumbnailImg.src = postThumbnailUrl;
  });
}

