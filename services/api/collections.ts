import { apiClient } from './client';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  postCount: number;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionsResponse {
  collections: Collection[];
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
}

export interface CreateCollectionResponse {
  collection: Collection;
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string;
}

export interface UpdateCollectionResponse {
  collection: Collection;
}

/**
 * Obtiene todas las colecciones del usuario actual.
 */
export const getCollections = async (): Promise<CollectionsResponse> => {
  const { data } = await apiClient.get<CollectionsResponse>('/collections');
  return data;
};

/**
 * Crea una nueva colección.
 */
export const createCollection = async (payload: CreateCollectionPayload): Promise<CreateCollectionResponse> => {
  const { data } = await apiClient.post<CreateCollectionResponse>('/collections', payload);
  return data;
};

/**
 * Actualiza una colección existente.
 */
export const updateCollection = async (collectionId: string, payload: UpdateCollectionPayload): Promise<UpdateCollectionResponse> => {
  const { data } = await apiClient.patch<UpdateCollectionResponse>(`/collections/${collectionId}`, payload);
  return data;
};

/**
 * Elimina una colección.
 */
export const deleteCollection = async (collectionId: string): Promise<void> => {
  await apiClient.delete(`/collections/${collectionId}`);
};

