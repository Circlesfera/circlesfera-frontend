import { faker } from '@faker-js/faker';
import type { FeedUser } from '@/services/api/types/feed';

/**
 * Factory para crear usuarios de prueba en el frontend
 */
export function createMockFeedUser(overrides?: Partial<FeedUser>): FeedUser {
  const baseUser: FeedUser = {
    id: faker.string.uuid(),
    handle: faker.string.alphanumeric({ length: 10, casing: 'lower' }),
    displayName: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    isVerified: faker.datatype.boolean({ probability: 0.1 }) // 10% verificados
  };

  return { ...baseUser, ...overrides };
}

/**
 * Crea múltiples usuarios
 */
export function createMockFeedUsers(count: number, overrides?: Partial<FeedUser>): FeedUser[] {
  return Array.from({ length: count }, () => createMockFeedUser(overrides));
}

