import api from './axios';

export interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  type: 'text' | 'image' | 'video';
  content: {
    text?: string;
    image?: string;
    video?: {
      url: string;
      duration: number;
      thumbnail: string;
    };
  };
  caption: string;
  likes: string[];
  views: number;
  isPublic: boolean;
  createdAt: string;
}

export const getPosts = async (type?: string): Promise<Post[]> => {
  const params = type ? { type } : {};
  const res = await api.get('/posts', { params });
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

export const createTextPost = async (text: string, caption: string, token: string): Promise<Post> => {
  const res = await api.post('/posts', { type: 'text', text, caption }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.post;
};

export const createImagePost = async (file: File, caption: string, token: string): Promise<Post> => {
  const formData = new FormData();
  formData.append('type', 'image');
  formData.append('file', file);
  formData.append('caption', caption);
  
  const res = await api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.post;
};

export const createVideoPost = async (file: File, caption: string, token: string): Promise<Post> => {
  const formData = new FormData();
  formData.append('type', 'video');
  formData.append('file', file);
  formData.append('caption', caption);
  
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

export const getPostById = async (id: string): Promise<Post> => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

export const deletePost = async (postId: string, token: string): Promise<void> => {
  await api.delete(`/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

export interface FeedResponse {
  posts: Post[];
  total: number;
  page: number;
  pages: number;
}

export const getFeed = async (token: string, page = 1, limit = 10): Promise<FeedResponse> => {
  const res = await api.get('/posts/feed', {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit },
  });
  return res.data;
};
