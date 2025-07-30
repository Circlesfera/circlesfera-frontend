import api from './axios';

export interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  image: string;
  createdAt: string;
  expiresAt: string;
}

export const getStories = async (token: string): Promise<Story[]> => {
  const res = await api.get('/stories', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createStory = async (formData: FormData, token: string): Promise<Story> => {
  const res = await api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.story;
};
