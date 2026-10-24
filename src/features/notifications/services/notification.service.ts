import api from "@/config/api"
import type { NotificationItem, NotificationPageResponse } from "../types/notification.types"

export const notificationService = {
  getMyNotifications: async (unreadOnly = false, page = 0, size = 20): Promise<NotificationPageResponse> => {
    const unreadParam = unreadOnly ? "&unreadOnly=true" : ""
    const response = await api.get<{ data: NotificationPageResponse }>(
      `/notifications?page=${page}&size=${size}${unreadParam}`
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

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`)
  },

  deleteAllNotifications: async (): Promise<number> => {
    const response = await api.delete<{ data: { deletedCount: number } }>("/notifications")
    return response.data.data.deletedCount
  },
}
