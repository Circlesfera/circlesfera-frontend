import { apiClient } from './client';

export type ReactionEmoji = '❤️' | '😂' | '😮' | '😢' | '👍' | '🔥' | '💯';

export interface StoryReaction {
  id: string;
  userId: string;
  emoji: ReactionEmoji;
  user: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string;
  };
  createdAt: string;
}

export interface ReactionCounts {
  [emoji: string]: number;
}

export interface ReactToStoryPayload {
  emoji: ReactionEmoji;
}

export interface ReactToStoryResponse {
  reaction: StoryReaction;
}

export interface StoryReactionsResponse {
  reactions: StoryReaction[];
  counts: ReactionCounts;
}

export interface UserReactionResponse {
  emoji: ReactionEmoji | null;
}

/**
 * Reacciona a una story (o actualiza la reacción si ya existe).
 */
export const reactToStory = async (
  storyId: string,
  payload: ReactToStoryPayload
): Promise<ReactToStoryResponse | null> => {
  try {
    const { data } = await apiClient.post<ReactToStoryResponse>(`/stories/${storyId}/reactions`, payload);
    return data;
  } catch (error: unknown) {
    const maybeAxiosError = error as { response?: { status?: number } };
    // Si la reacción fue eliminada (toggle), retornar null
    if (maybeAxiosError.response?.status === 200) {
      return null;
    }
    throw error;
  }
};

/**
 * Obtiene todas las reacciones de una story.
 */
export const getStoryReactions = async (storyId: string): Promise<StoryReactionsResponse> => {
  const { data } = await apiClient.get<StoryReactionsResponse>(`/stories/${storyId}/reactions`);
  return data;
};

/**
 * Obtiene la reacción del usuario actual a una story.
 */
export const getUserReaction = async (storyId: string): Promise<UserReactionResponse> => {
  const { data } = await apiClient.get<UserReactionResponse>(`/stories/${storyId}/reactions/me`);
  return data;
};

/**
 * Elimina la reacción del usuario actual a una story.
 */
export const removeReaction = async (storyId: string): Promise<void> => {
  await apiClient.delete(`/stories/${storyId}/reactions`);
};

