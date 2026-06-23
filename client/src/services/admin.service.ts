import api from './api';
import type { AdminMetrics, User, Listing, SupportTicket, ApiResponse } from '../types';

export const adminService = {
  async getMetrics() {
    const { data } = await api.get<ApiResponse<AdminMetrics>>('/admin/metrics');
    return data;
  },

  async searchUsers(query: string) {
    const { data } = await api.get<ApiResponse<User[]>>(`/admin/users?q=${query}`);
    return data;
  },

  async banUser(userId: string) {
    const { data } = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/ban`);
    return data;
  },

  async unbanUser(userId: string) {
    const { data } = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/unban`);
    return data;
  },

  async deleteListing(listingId: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/admin/listings/${listingId}`);
    return data;
  },

  async getAllListings(page = 1) {
    const { data } = await api.get<ApiResponse<{ listings: Listing[]; total: number }>>(
      `/admin/listings?page=${page}`
    );
    return data;
  },

  async getTickets(status?: string) {
    const params = status ? `?status=${status}` : '';
    const { data } = await api.get<ApiResponse<SupportTicket[]>>(`/admin/tickets${params}`);
    return data;
  },

  async updateTicketStatus(ticketId: string, status: SupportTicket['status']) {
    const { data } = await api.patch<ApiResponse<SupportTicket>>(
      `/admin/tickets/${ticketId}`, { status }
    );
    return data;
  },

  async createAdmin(payload: { name: string; contact: string; contactType: 'email' | 'phone' }) {
    const { data } = await api.post<ApiResponse<User>>('/admin/create-admin', payload);
    return data;
  },
};