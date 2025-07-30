import api from './axios';

export interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  image: string;
  caption: string;
  likes: string[];
  createdAt: string;
}

export const getPosts = async (): Promise<Post[]> => {
  const res = await api.get('/posts');
  return res.data;
};

export const createPost = async (formData: FormData, token: string): Promise<Post> => {
  const res = await api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.post;
};

export const toggleLike = async (postId: string, token: string): Promise<{ liked: boolean; likesCount: number }> => {
  const res = await api.post(`/posts/${postId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
}

export const getComments = async (postId: string): Promise<Comment[]> => {
  const res = await api.get(`/comments/${postId}`);
  return res.data;
};

export const addComment = async (postId: string, text: string, token: string): Promise<Comment> => {
  const res = await api.post(`/comments/${postId}`, { text }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.comment;
};
