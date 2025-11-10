import { apiClient } from './client';

export interface MediaUploadResult {
  url: string;
  thumbnailUrl: string;
  durationMs?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

/**
 * Sube un archivo de media (imagen o video) y devuelve su URL y metadata.
 */
export const uploadMedia = async (file: File): Promise<MediaUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<MediaUploadResult>('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};

