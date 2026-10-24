import { useEffect, useRef } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { useQueryClient } from "@tanstack/react-query"
import { getWebSocketUrl } from "@/config/config"
import { notificationKeys, taskKeys, projectKeys, activityKeys } from "@/lib/queryKeys"
import type { NotificationItem } from "../types/notification.types"

interface UseRealtimeNotificationsOptions {
  isAuthenticated: boolean
}

/**
 * Connects to Spring WebSocket/STOMP broker using SockJS fallback.
 * Subscribes to the authenticated user's private destination (/user/queue/notifications).
 * Invalidates notification, task, project, and activity queries upon incoming events
 * and triggers immediate refetch to recover missed state upon reconnection.
 */
export function useRealtimeNotifications({ isAuthenticated }: UseRealtimeNotificationsOptions) {
  const queryClient = useQueryClient()
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      if (clientRef.current) {
        clientRef.current.deactivate()
        clientRef.current = null
      }
      return
    }

    const wsUrl = getWebSocketUrl()

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {
        // Suppress verbose debug logs in production
      },
      onConnect: () => {
        // Refetch persisted notifications on connect/reconnect to catch up on any missed updates
        void queryClient.invalidateQueries({ queryKey: notificationKeys.all })

        // Subscribe to user-specific notification queue
        stompClient.subscribe("/user/queue/notifications", (message) => {
          try {
            const notification: NotificationItem = JSON.parse(message.body)

            // Invalidate notification queries to refresh bell badge & panel
            void queryClient.invalidateQueries({ queryKey: notificationKeys.all })

            // Invalidate related resource queries
            if (notification.taskId) {
              void queryClient.invalidateQueries({ queryKey: taskKeys.detail(notification.taskId) })
              void queryClient.invalidateQueries({ queryKey: activityKeys.byTask(notification.taskId) })
            }
            if (notification.projectId) {
              void queryClient.invalidateQueries({ queryKey: projectKeys.detail(notification.projectId) })
              void queryClient.invalidateQueries({ queryKey: taskKeys.byProject(notification.projectId) })
              void queryClient.invalidateQueries({ queryKey: activityKeys.byProject(notification.projectId) })
            }
          } catch (e) {
            console.error("Failed to parse incoming realtime notification:", e)
          }
        })
      },
      onDisconnect: () => {
        // Handled gracefully by reconnectDelay
      },
      onStompError: (frame) => {
        console.warn("STOMP protocol error:", frame.headers["message"])
      },
    })

    stompClient.activate()
    clientRef.current = stompClient

    return () => {
      stompClient.deactivate()
      clientRef.current = null
    }
  }, [isAuthenticated, queryClient])
}
