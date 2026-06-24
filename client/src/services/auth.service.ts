import api from './api';
import type { User, ApiResponse } from '../types';

export const authService = {
  async signup(payload: { name: string; contact: string; contactType: 'email' | 'phone'; password: string; role: string }) {
    const { data } = await api.post<ApiResponse<{ expiresAt: number; requiresOTP: boolean }>>('/auth/signup', payload);
    return data;
  },

  async verifySignup(contact: string, otp: string) {
    const { data } = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/verify-signup', { contact, otp });
    return data;
  },

  async login(contact: string, contactType: 'email' | 'phone', password: string) {
    const { data } = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { contact, contactType, password });
    return data;
  },

  async sendOTP(contact: string, contactType: 'email' | 'phone', name?: string, role?: string) {
    const { data } = await api.post<ApiResponse<{ expiresAt: number }>>('/auth/send-otp', { contact, contactType, name, role });
    return data;
  },

  async verifyOTP(contact: string, otp: string) {
    const { data } = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/verify-otp', { contact, otp });
    return data;
  },

  async forgotPassword(contact: string, contactType: 'email' | 'phone') {
    const { data } = await api.post<ApiResponse<null>>('/auth/forgot-password', { contact, contactType });
    return data;
  },

  async verifyResetOTP(contact: string, otp: string) {
    const { data } = await api.post<ApiResponse<{ resetToken: string }>>('/auth/verify-reset-otp', { contact, otp });
    return data;
  },

  async resetPassword(resetToken: string, newPassword: string) {
    const { data } = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/reset-password', { resetToken, newPassword });
    return data;
  },

  async getMe() {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.patch<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
};