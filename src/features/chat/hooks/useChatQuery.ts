import { useEffect, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { getWebSocketUrl } from "@/config/config"
import {
  createChatChannel,
  deleteChannelMessage,
  editChannelMessage,
  getChannelMessages,
  getChatChannels,
  sendChannelMessage,
  startDirectChat,
  toggleChannelMessageReaction,
  togglePinChannelMessage,
  updateChatChannel,
  uploadChannelAttachment,
} from "../services/chat.service"
import type {
  ChatMessage,
  CreateChannelRequest,
  SendMessageRequest,
  UpdateChannelRequest,
} from "../types/chat.types"

export const CHAT_KEYS = {
  channels: (projectId?: string) => ["chat", "channels", projectId ?? "all"] as const,
  messages: (channelId: string) => ["chat", "messages", channelId] as const,
  search: (channelId: string, query: string) =>
    ["chat", "messages-search", channelId, query] as const,
}

function upsertMessageInList(prev: ChatMessage[], updated: ChatMessage): ChatMessage[] {
  if (prev.some((m) => m.id === updated.id)) {
    return prev.map((m) => (m.id === updated.id ? updated : m))
  }
  return [...prev, updated]
}

export function useChatChannelsQuery(projectId?: string) {
  return useQuery({
    queryKey: CHAT_KEYS.channels(projectId),
    queryFn: () => getChatChannels(projectId),
  })
}

export function useCreateChatChannelMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateChannelRequest) => createChatChannel(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "channels"] })
    },
  })
}

export function useUpdateChatChannelMutation(channelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateChannelRequest) => updateChatChannel(channelId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "channels"] })
    },
  })
}

export function useStartDirectChatMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targetUserId: string) => startDirectChat(targetUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "channels"] })
    },
  })
}

export function useChannelMessagesQuery(channelId?: string) {
  return useQuery({
    queryKey: CHAT_KEYS.messages(channelId ?? ""),
    queryFn: () => getChannelMessages(channelId!, { limit: 30 }),
    enabled: Boolean(channelId),
  })
}

export function useSendChannelMessageMutation(channelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendMessageRequest) => sendChannelMessage(channelId, data),
    onSuccess: (sent) => {
      queryClient.setQueryData<ChatMessage[]>(
        CHAT_KEYS.messages(channelId),
        (prev = []) => upsertMessageInList(prev, sent)
      )
      void queryClient.invalidateQueries({ queryKey: ["chat", "channels"] })
    },
  })
}

export function useUploadChatAttachmentMutation(channelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { file: File; caption?: string; replyToId?: string }) =>
      uploadChannelAttachment(channelId, payload),
    onSuccess: (sent) => {
      queryClient.setQueryData<ChatMessage[]>(
        CHAT_KEYS.messages(channelId),
        (prev = []) => upsertMessageInList(prev, sent)
      )
      void queryClient.invalidateQueries({ queryKey: ["chat", "channels"] })
      void queryClient.invalidateQueries({ queryKey: ["project-storage"] })
    },
  })
}

export function useEditChannelMessageMutation(channelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { messageId: string; content: string }) =>
      editChannelMessage(channelId, payload.messageId, { content: payload.content }),
    onSuccess: (updated) => {
      queryClient.setQueryData<ChatMessage[]>(
        CHAT_KEYS.messages(channelId),
        (prev = []) => upsertMessageInList(prev, updated)
      )
      void queryClient.invalidateQueries({ queryKey: ["chat", "channels"] })
    },
  })
}

export function useToggleMessageReactionMutation(channelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { messageId: string; emoji: string }) =>
      toggleChannelMessageReaction(channelId, payload.messageId, {
        emoji: payload.emoji,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<ChatMessage[]>(
        CHAT_KEYS.messages(channelId),
        (prev = []) => upsertMessageInList(prev, updated)
      )
    },
  })
}

export function useTogglePinMessageMutation(channelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => togglePinChannelMessage(channelId, messageId),
    onSuccess: (updated) => {
      queryClient.setQueryData<ChatMessage[]>(
        CHAT_KEYS.messages(channelId),
        (prev = []) => upsertMessageInList(prev, updated)
      )
    },
  })
}

export function useDeleteChannelMessageMutation(channelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (messageId: string) => deleteChannelMessage(channelId, messageId),
    onSuccess: (_res, messageId) => {
      queryClient.setQueryData<ChatMessage[]>(
        CHAT_KEYS.messages(channelId),
        (prev = []) => prev.filter((m) => m.id !== messageId)
      )
      void queryClient.invalidateQueries({ queryKey: ["chat", "channels"] })
    },
  })
}

/**
 * Subscribes to live STOMP updates for a chat channel on /topic/chat/{channelId}
 * so incoming messages, reactions, edits, pins, and system events appear immediately.
 */
export function useRealtimeChat(
  channelId: string | undefined,
  onIncomingMessage?: (msg: ChatMessage, isNew: boolean) => void
) {
  const queryClient = useQueryClient()
  const callbackRef = useRef(onIncomingMessage)
  callbackRef.current = onIncomingMessage

  useEffect(() => {
    if (!channelId) return

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(getWebSocketUrl()),
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        stompClient.subscribe(`/topic/chat/${channelId}`, (msg) => {
          try {
            const incoming: ChatMessage = JSON.parse(msg.body)
            let wasNew = false
            queryClient.setQueryData<ChatMessage[]>(
              CHAT_KEYS.messages(channelId),
              (prev = []) => {
                wasNew = !prev.some((m) => m.id === incoming.id)
                return upsertMessageInList(prev, incoming)
              }
            )
            if (callbackRef.current) {
              callbackRef.current(incoming, wasNew)
            }
            void queryClient.invalidateQueries({ queryKey: ["chat", "channels"] })
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
  }, [channelId, queryClient])
}
