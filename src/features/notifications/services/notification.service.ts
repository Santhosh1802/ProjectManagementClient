import api from "@/config/api"
import type { NotificationItem, NotificationPageResponse } from "../types/notification.types"

export const notificationService = {
  getMyNotifications: async (page = 0, size = 20): Promise<NotificationPageResponse> => {
    const response = await api.get<{ data: NotificationPageResponse }>(
      `/notifications?page=${page}&size=${size}`
    )
    return response.data.data
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ data: { unreadCount: number } }>(
      "/notifications/unread-count"
    )
    return response.data.data.unreadCount
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const response = await api.patch<{ data: NotificationItem }>(
      `/notifications/${id}/read`
    )
    return response.data.data
  },

  markAllAsRead: async (): Promise<number> => {
    const response = await api.patch<{ data: { updatedCount: number } }>(
      "/notifications/read-all"
    )
    return response.data.data.updatedCount
  },
}
