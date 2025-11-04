import { apiClient } from './client';

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

export const fetchComments = async (postId: string, cursor?: string | null, limit = 20): Promise<CommentCursorResponse> => {
  const { data } = await apiClient.get<CommentCursorResponse>(`/comments/posts/${postId}/comments`, {
    params: { cursor: cursor ?? undefined, limit }
  });
  return data;
};

export const createComment = async (postId: string, payload: CreateCommentPayload): Promise<CreateCommentResponse> => {
  const { data } = await apiClient.post<CreateCommentResponse>(`/comments/posts/${postId}/comments`, payload);
  return data;
};

export interface RepliesResponse {
  data: Comment[];
}

export const fetchReplies = async (commentId: string): Promise<RepliesResponse> => {
  const { data } = await apiClient.get<RepliesResponse>(`/comments/${commentId}/replies`);
  return data;
};

