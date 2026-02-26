import api from './client'
import type { Review, CreateReviewRequest, PaginatedResponse } from '@/types'

export const createReview = (data: CreateReviewRequest) =>
  api.post<Review>('/review', data).then((r) => r.data)

export const getProductReviews = (productUuid: string) =>
  api.get<PaginatedResponse<Review>>(`/review/product/${productUuid}`).then((r) => r.data.content)

export const getReviewByUuid = (uuid: string) =>
  api.get<Review>(`/review/${uuid}`).then((r) => r.data)

export const updateReview = (uuid: string, data: { rating?: number; comment?: string }) =>
  api.put<Review>(`/review/${uuid}`, data).then((r) => r.data)

export const deleteReview = (uuid: string) =>
  api.delete(`/review/${uuid}`).then((r) => r.data)

export const getMyReviews = () =>
  api.get<PaginatedResponse<Review>>('/review/me').then((r) => r.data.content)

export const voteReview = (uuid: string, helpful: boolean) =>
  api.post<string>(`/review/${uuid}/vote`, null, { params: { helpful } }).then((r) => r.data)

export const addReviewImage = (uuid: string, imageUrl: string) =>
  api.post<string>(`/review/${uuid}/images`, null, { params: { imageUrl } }).then((r) => r.data)

