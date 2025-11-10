import { apiClient } from './client';

export type CommentResourceType = 'post' | 'frame';

export interface CommentAuthor {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  author: CommentAuthor | null;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentCursorResponse {
  data: Comment[];
  nextCursor: string | null;
}

export interface CreateCommentPayload {
  content: string;
  parentId?: string;
}

export interface CreateCommentResponse {
  comment: Comment;
}

const buildCommentsPath = (resourceType: CommentResourceType, resourceId: string): string => {
  return resourceType === 'frame'
    ? `/comments/frames/${resourceId}/comments`
    : `/comments/posts/${resourceId}/comments`;
};

export const fetchComments = async (
  resourceId: string,
  cursor?: string | null,
  limit = 20,
  resourceType: CommentResourceType = 'post'
): Promise<CommentCursorResponse> => {
  const { data } = await apiClient.get<CommentCursorResponse>(buildCommentsPath(resourceType, resourceId), {
    params: { cursor: cursor ?? undefined, limit }
  });
  return data;
};

export const createComment = async (
  resourceId: string,
  payload: CreateCommentPayload,
  resourceType: CommentResourceType = 'post'
): Promise<CreateCommentResponse> => {
  const { data } = await apiClient.post<CreateCommentResponse>(buildCommentsPath(resourceType, resourceId), payload);
  return data;
};

export interface RepliesResponse {
  data: Comment[];
}

export const fetchReplies = async (commentId: string): Promise<RepliesResponse> => {
  const { data } = await apiClient.get<RepliesResponse>(`/comments/${commentId}/replies`);
  return data;
};

export const fetchFrameComments = (
  frameId: string,
  cursor?: string | null,
  limit = 20
): Promise<CommentCursorResponse> => fetchComments(frameId, cursor, limit, 'frame');

export const createFrameComment = (
  frameId: string,
  payload: CreateCommentPayload
): Promise<CreateCommentResponse> => createComment(frameId, payload, 'frame');

