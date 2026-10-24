import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notificationKeys } from "@/lib/queryKeys"
import { notificationService } from "../services/notification.service"

export function useNotificationsQuery(unreadOnly = false, page = 0, size = 20) {
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly, page, size),
    queryFn: () => notificationService.getMyNotifications(unreadOnly, page, size),
  })
}

export function useUnreadNotificationsCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Background poll every 30s as fallback
  })
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useClearAllNotificationsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
