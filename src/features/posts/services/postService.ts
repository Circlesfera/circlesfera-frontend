/**
 * Post Service - Frontend
 * Servicio para manejar operaciones de posts
 */

import api from '../../../services/api'
import type {
  Post,
  CreatePostData,
  UpdatePostData,
  PostsResponse,
  PostStats,
  PostComment,
  PostCommentData,
  // PostLikeData,
  PostShareData,
  PostReportData,
  // PostBookmarkData,
  PostFeedOptions,
  PostSearchResult,
  PostAnalytics,
  PostApiResponse
} from '../types'

export class PostService {
  private readonly baseUrl = '/api/posts'

  /**
   * Obtener feed de posts
   * @param options - Opciones del feed
   * @returns Promise con posts del feed
   */
  async getFeed(options: PostFeedOptions = {}): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams()

      if (options.type) {
        params.append('type', options.type)
      }

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','))
            } else {
              params.append(key, value.toString())
            }
          }
        })
      }

      if (options.sort) {
        params.append('sort', `${options.sort.field}:${options.sort.order}`)
      }

      if (options.pagination) {
        params.append('page', options.pagination.page.toString())
        params.append('limit', options.pagination.limit.toString())
      }

      const response = await api.get<PostApiResponse<PostsResponse>>(
        `${this.baseUrl}/feed?${params.toString()}`
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error obteniendo feed')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtener post por ID
   * @param id - ID del post
   * @returns Promise con el post
   */
  async getPost(id: string): Promise<Post> {
    try {
      const response = await api.get<PostApiResponse<Post>>(`${this.baseUrl}/${id}`)

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Post no encontrado')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Crear nuevo post
   * @param data - Datos del post
   * @returns Promise con el post creado
   */
  async createPost(data: CreatePostData): Promise<Post> {
    try {
      const formData = new FormData()

      formData.append('type', data.type)
      formData.append('caption', data.caption)

      if (data.media && data.media.length > 0) {
        data.media.forEach(file => {
          formData.append('media', file)
        })
      }

      if (data.location) {
        formData.append('location', JSON.stringify(data.location))
      }

      if (data.tags && data.tags.length > 0) {
        formData.append('tags', data.tags.join(','))
      }

      if (data.mentions && data.mentions.length > 0) {
        formData.append('mentions', data.mentions.join(','))
      }

      if (data.isPublic !== undefined) {
        formData.append('isPublic', data.isPublic.toString())
      }

      const response = await api.post<PostApiResponse<Post>>(
        this.baseUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error creando post')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Actualizar post
   * @param id - ID del post
   * @param data - Datos a actualizar
   * @returns Promise con el post actualizado
   */
  async updatePost(id: string, data: UpdatePostData): Promise<Post> {
    try {
      const response = await api.put<PostApiResponse<Post>>(
        `${this.baseUrl}/${id}`,
        data
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error actualizando post')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Eliminar post
   * @param id - ID del post
   * @returns Promise<void>
   */
  async deletePost(id: string): Promise<void> {
    try {
      const response = await api.delete<PostApiResponse>(`${this.baseUrl}/${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error eliminando post')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Dar like a un post
   * @param id - ID del post
   * @returns Promise<void>
   */
  async likePost(id: string): Promise<void> {
    try {
      const response = await api.post<PostApiResponse>(`${this.baseUrl}/${id}/like`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error dando like')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Quitar like de un post
   * @param id - ID del post
   * @returns Promise<void>
   */
  async unlikePost(id: string): Promise<void> {
    try {
      const response = await api.delete<PostApiResponse>(`${this.baseUrl}/${id}/like`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error quitando like')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtener likes de un post
   * @param id - ID del post
   * @param page - Página
   * @param limit - Límite por página
   * @returns Promise con usuarios que dieron like
   */
  async getPostLikes(id: string, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const response = await api.get<PostApiResponse<any>>(
        `${this.baseUrl}/${id}/likes?page=${page}&limit=${limit}`
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error obteniendo likes')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Agregar comentario a un post
   * @param data - Datos del comentario
   * @returns Promise con el comentario creado
   */
  async addComment(data: PostCommentData): Promise<PostComment> {
    try {
      const response = await api.post<PostApiResponse<PostComment>>(
        `${this.baseUrl}/${data.postId}/comments`,
        {
          text: data.text,
          parentCommentId: data.parentCommentId
        }
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error agregando comentario')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Eliminar comentario
   * @param postId - ID del post
   * @param commentId - ID del comentario
   * @returns Promise<void>
   */
  async deleteComment(postId: string, commentId: string): Promise<void> {
    try {
      const response = await api.delete<PostApiResponse>(
        `${this.baseUrl}/${postId}/comments/${commentId}`
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error eliminando comentario')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtener comentarios de un post
   * @param id - ID del post
   * @param page - Página
   * @param limit - Límite por página
   * @returns Promise con comentarios
   */
  async getPostComments(id: string, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const response = await api.get<PostApiResponse<any>>(
        `${this.baseUrl}/${id}/comments?page=${page}&limit=${limit}`
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error obteniendo comentarios')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Dar like a un comentario
   * @param postId - ID del post
   * @param commentId - ID del comentario
   * @returns Promise<void>
   */
  async likeComment(postId: string, commentId: string): Promise<void> {
    try {
      const response = await api.post<PostApiResponse>(
        `${this.baseUrl}/${postId}/comments/${commentId}/like`
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error dando like al comentario')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Quitar like de un comentario
   * @param postId - ID del post
   * @param commentId - ID del comentario
   * @returns Promise<void>
   */
  async unlikeComment(postId: string, commentId: string): Promise<void> {
    try {
      const response = await api.delete<PostApiResponse>(
        `${this.baseUrl}/${postId}/comments/${commentId}/like`
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error quitando like del comentario')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Compartir post
   * @param data - Datos del share
   * @returns Promise<void>
   */
  async sharePost(data: PostShareData): Promise<void> {
    try {
      const response = await api.post<PostApiResponse>(
        `${this.baseUrl}/${data.postId}/share`,
        {
          platform: data.platform,
          message: data.message
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error compartiendo post')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Reportar post
   * @param data - Datos del reporte
   * @returns Promise<void>
   */
  async reportPost(data: PostReportData): Promise<void> {
    try {
      const response = await api.post<PostApiResponse>(
        `${this.baseUrl}/${data.postId}/report`,
        {
          reason: data.reason,
          description: data.description
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error reportando post')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Guardar post en favoritos
   * @param id - ID del post
   * @returns Promise<void>
   */
  async bookmarkPost(id: string): Promise<void> {
    try {
      const response = await api.post<PostApiResponse>(`${this.baseUrl}/${id}/bookmark`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error guardando post')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Quitar post de favoritos
   * @param id - ID del post
   * @returns Promise<void>
   */
  async unbookmarkPost(id: string): Promise<void> {
    try {
      const response = await api.delete<PostApiResponse>(`${this.baseUrl}/${id}/bookmark`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error quitando post de favoritos')
      }
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtener posts guardados
   * @param page - Página
   * @param limit - Límite por página
   * @returns Promise con posts guardados
   */
  async getBookmarkedPosts(page: number = 1, limit: number = 20): Promise<PostsResponse> {
    try {
      const response = await api.get<PostApiResponse<PostsResponse>>(
        `${this.baseUrl}/bookmarked?page=${page}&limit=${limit}`
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error obteniendo posts guardados')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Buscar posts
   * @param query - Término de búsqueda
   * @param page - Página
   * @param limit - Límite por página
   * @returns Promise con resultados de búsqueda
   */
  async searchPosts(query: string, page: number = 1, limit: number = 20): Promise<PostSearchResult> {
    try {
      const response = await api.get<PostApiResponse<PostSearchResult>>(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error buscando posts')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtener posts trending
   * @param limit - Límite de resultados
   * @returns Promise con posts trending
   */
  async getTrendingPosts(limit: number = 20): Promise<Post[]> {
    try {
      const response = await api.get<PostApiResponse<Post[]>>(
        `${this.baseUrl}/trending?limit=${limit}`
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error obteniendo posts trending')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtener estadísticas de un post
   * @param id - ID del post
   * @returns Promise con estadísticas
   */
  async getPostStats(id: string): Promise<PostStats> {
    try {
      const response = await api.get<PostApiResponse<PostStats>>(`${this.baseUrl}/${id}/stats`)

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error obteniendo estadísticas')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtener analytics de posts del usuario
   * @param period - Período de tiempo
   * @returns Promise con analytics
   */
  async getUserPostAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<PostAnalytics> {
    try {
      const response = await api.get<PostApiResponse<PostAnalytics>>(
        `${this.baseUrl}/analytics?period=${period}`
      )

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error obteniendo analytics')
      }

      return response.data.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  /**
   * Manejar errores de la API
   * @param error - Error capturado
   * @returns Error procesado
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }

    if (error.response?.status === 401) {
      return new Error('No tienes permisos para realizar esta acción')
    }

    if (error.response?.status === 404) {
      return new Error('Post no encontrado')
    }

    if (error.response?.status >= 500) {
      return new Error('Error del servidor. Por favor, intenta más tarde')
    }

    return new Error(error.message || 'Error de posts')
  }
}

// Instancia singleton del servicio
export const postService = new PostService()
