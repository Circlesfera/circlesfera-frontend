import { faker } from '@faker-js/faker';
import type { FeedItem, FeedMedia, FeedStats, FeedUser } from '@/services/api/types/feed';

/**
 * Factory para crear media
 */
export function createMockFeedMedia(overrides?: Partial<FeedMedia>): FeedMedia {
  const kind = overrides?.kind || faker.helpers.arrayElement(['image', 'video'] as const);
  
  const baseMedia: FeedMedia = {
    id: faker.string.uuid(),
    kind,
    url: faker.image.url(),
    thumbnailUrl: faker.image.url(),
    ...(kind === 'video' && { durationMs: faker.number.int({ min: 5000, max: 300000 }) }),
    width: faker.number.int({ min: 800, max: 1920 }),
    height: faker.number.int({ min: 600, max: 1080 })
  };

  return { ...baseMedia, ...overrides };
}

/**
 * Crea estadísticas de post
 */
export function createMockFeedStats(overrides?: Partial<FeedStats>): FeedStats {
  return {
    likes: faker.number.int({ min: 0, max: 50000 }),
    comments: faker.number.int({ min: 0, max: 5000 }),
    saves: faker.number.int({ min: 0, max: 5000 }),
    shares: faker.number.int({ min: 0, max: 1000 }),
    views: faker.number.int({ min: 0, max: 1000000 }),
    ...overrides
  };
}

/**
 * Factory temporal para crear autores inline (evita circular dependency)
 */
function createAuthor(overrides?: Partial<FeedUser>): FeedUser {
  return {
    id: faker.string.uuid(),
    handle: faker.string.alphanumeric({ length: 10, casing: 'lower' }),
    displayName: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    isVerified: faker.datatype.boolean({ probability: 0.1 }),
    ...overrides
  };
}

/**
 * Factory para crear posts del feed
 */
export function createMockFeedItem(overrides?: Partial<FeedItem>): FeedItem {
  const mediaCount = faker.number.int({ min: 0, max: 10 });
  
  const baseItem: FeedItem = {
    id: faker.string.uuid(),
    author: createAuthor(),
    caption: faker.lorem.paragraph({ min: 1, max: 3 }),
    media: Array.from({ length: mediaCount }, () => createMockFeedMedia()),
    stats: createMockFeedStats(),
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    isLikedByViewer: false,
    isSavedByViewer: false
  };

  return { ...baseItem, ...overrides };
}

/**
 * Crea múltiples posts
 */
export function createMockFeedItems(count: number, overrides?: Partial<FeedItem>): FeedItem[] {
  return Array.from({ length: count }, () => createMockFeedItem(overrides));
}

