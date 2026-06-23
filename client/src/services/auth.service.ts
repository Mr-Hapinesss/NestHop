import api from './api';
import type { User, ApiResponse } from '../types';

export const authService = {
  async sendOTP(contact: string, contactType: 'email' | 'phone', name?: string) {
    const { data } = await api.post<ApiResponse<{ expiresAt: number }>>('/auth/send-otp', {
      contact, contactType, name,
    });
    return data;
  },

  async verifyOTP(contact: string, otp: string) {
    const { data } = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/verify-otp', {
      contact, otp,
    });
    return data;
  },

  async getMe() {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },

  async updateProfile(payload: Partial<User>) {
    const { data } = await api.patch<ApiResponse<User>>('/auth/profile', payload);
    return data;
  },
};