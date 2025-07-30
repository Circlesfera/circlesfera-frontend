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
