import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { getWebSocketUrl } from "@/config/config"
import {
  createWhiteboard,
  deleteWhiteboard,
  getWhiteboardById,
  getWhiteboards,
  updateWhiteboard,
} from "../services/whiteboard.service"
import type {
  CreateWhiteboardRequest,
  UpdateWhiteboardRequest,
  Whiteboard,
} from "../types/whiteboard.types"

export const WHITEBOARD_KEYS = {
  all: ["whiteboards"] as const,
  list: (projectId?: string) => ["whiteboards", "list", projectId ?? "all"] as const,
  detail: (id: string) => ["whiteboards", id] as const,
}

export function useWhiteboardsQuery(projectId?: string) {
  return useQuery({
    queryKey: WHITEBOARD_KEYS.list(projectId),
    queryFn: () => getWhiteboards(projectId),
  })
}

export function useWhiteboardDetailQuery(id?: string) {
  return useQuery({
    queryKey: WHITEBOARD_KEYS.detail(id ?? ""),
    queryFn: () => getWhiteboardById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateWhiteboardMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWhiteboardRequest) => createWhiteboard(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WHITEBOARD_KEYS.all })
    },
  })
}

export function useUpdateWhiteboardMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateWhiteboardRequest) => updateWhiteboard(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(WHITEBOARD_KEYS.detail(id), updated)
      void queryClient.invalidateQueries({ queryKey: WHITEBOARD_KEYS.all })
    },
  })
}

export function useDeleteWhiteboardMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWhiteboard(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WHITEBOARD_KEYS.all })
    },
  })
}

/**
 * Subscribes to live STOMP updates for a specific whiteboard so meeting participants
 * receive collaborative edits in real time.
 */
export function useRealtimeWhiteboard(
  whiteboardId: string | undefined,
  onRemoteUpdate: (board: Whiteboard) => void
) {
  useEffect(() => {
    if (!whiteboardId) return

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(getWebSocketUrl()),
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        stompClient.subscribe(`/topic/whiteboards/${whiteboardId}`, (msg) => {
          try {
            const updated: Whiteboard = JSON.parse(msg.body)
            onRemoteUpdate(updated)
          } catch {
            // Ignore malformed payloads
          }
        })
      },
    })

    stompClient.activate()
    return () => {
      void stompClient.deactivate()
    }
  }, [whiteboardId, onRemoteUpdate])
}
