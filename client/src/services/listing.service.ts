import api from './api';
import type { Listing, FilterState, ApiResponse } from '../types';

export const listingService = {
  async getAll(filters?: Partial<FilterState>, page = 1, limit = 12) {
    const params = new URLSearchParams();
    if (filters?.city) params.set('city', filters.city);
    if (filters?.area) params.set('area', filters.area);
    if (filters?.houseType) params.set('houseType', filters.houseType);
    if (filters?.minPrice) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    params.set('page', String(page));
    params.set('limit', String(limit));
    const { data } = await api.get<ApiResponse<{ listings: Listing[]; total: number; pages: number }>>(
      `/listings?${params}`
    );
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Listing>>(`/listings/${id}`);
    return data;
  },

  async getMyListings() {
    const { data } = await api.get<ApiResponse<Listing[]>>('/listings/my');
    return data;
  },

  async create(formData: FormData) {
    const { data } = await api.post<ApiResponse<Listing>>('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(id: string, formData: FormData) {
    const { data } = await api.put<ApiResponse<Listing>>(`/listings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async delete(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/listings/${id}`);
    return data;
  },
};