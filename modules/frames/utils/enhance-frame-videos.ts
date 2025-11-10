const ENHANCED_FLAG = 'frameEnhanced';

export const enhanceFrameVideos = (selector: string): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const videos = document.querySelectorAll<HTMLVideoElement>(selector);
  videos.forEach((video) => {
    if (!(video instanceof HTMLVideoElement)) {
      return;
    }

    video.controls = true;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.setAttribute('playsinline', 'true');
    video.classList.remove('pointer-events-none');

    if (video.dataset[ENHANCED_FLAG] !== 'true') {
      video.dataset[ENHANCED_FLAG] = 'true';
      const playPromise = video.play();
      if (playPromise !== undefined) {
        void playPromise.catch(() => {
          // Ignorar errores de autoplay por políticas del navegador
        });
      }
    }
  });
};
