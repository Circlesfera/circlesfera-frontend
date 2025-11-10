import type { FeedItem } from '@/services/api/types/feed';

export const isFrameFeedItem = (item: FeedItem): boolean => {
  if (!item || !Array.isArray(item.media) || item.media.length !== 1) {
    return false;
  }

  const [media] = item.media;
  return Boolean(
    media &&
      media.kind === 'video' &&
      typeof media.durationMs === 'number' &&
      media.durationMs <= 60000
  );
};
