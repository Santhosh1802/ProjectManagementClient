import api from "@/config/api"
import type { ApiResponse } from "@/features/tasks/types/task.types"
import type {
  ChatChannel,
  ChatMessage,
  CreateChannelRequest,
  EditMessageRequest,
  ReactMessageRequest,
  SendMessageRequest,
  UpdateChannelRequest,
} from "../types/chat.types"

export async function getChatChannels(projectId?: string): Promise<ChatChannel[]> {
  const response = await api.get<ApiResponse<ChatChannel[]>>("/chat/channels", {
    params: projectId ? { projectId } : undefined,
  })
  return response.data.data
}

export async function createChatChannel(
  data: CreateChannelRequest
): Promise<ChatChannel> {
  const response = await api.post<ApiResponse<ChatChannel>>("/chat/channels", data)
  return response.data.data
}

export async function updateChatChannel(
  channelId: string,
  data: UpdateChannelRequest
): Promise<ChatChannel> {
  const response = await api.put<ApiResponse<ChatChannel>>(
    `/chat/channels/${channelId}`,
    data
  )
  return response.data.data
}

export async function startDirectChat(targetUserId: string): Promise<ChatChannel> {
  const response = await api.post<ApiResponse<ChatChannel>>(
    `/chat/direct/${targetUserId}`
  )
  return response.data.data
}

export async function getChannelMessages(
  channelId: string,
  params?: { limit?: number; before?: string; query?: string }
): Promise<ChatMessage[]> {
  const response = await api.get<ApiResponse<ChatMessage[]>>(
    `/chat/channels/${channelId}/messages`,
    {
      params: {
        limit: params?.limit ?? 30,
        before: params?.before || undefined,
        query: params?.query || undefined,
      },
    }
  )
  return response.data.data
}

export async function sendChannelMessage(
  channelId: string,
  data: SendMessageRequest
): Promise<ChatMessage> {
  const response = await api.post<ApiResponse<ChatMessage>>(
    `/chat/channels/${channelId}/messages`,
    data
  )
  return response.data.data
}

export async function uploadChannelAttachment(
  channelId: string,
  payload: { file: File; caption?: string; replyToId?: string }
): Promise<ChatMessage> {
  const formData = new FormData()
  formData.append("file", payload.file)
  if (payload.caption) {
    formData.append("caption", payload.caption)
  }
  if (payload.replyToId) {
    formData.append("replyToId", payload.replyToId)
  }
  const response = await api.post<ApiResponse<ChatMessage>>(
    `/chat/channels/${channelId}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
  return response.data.data
}

export async function editChannelMessage(
  channelId: string,
  messageId: string,
  data: EditMessageRequest
): Promise<ChatMessage> {
  const response = await api.put<ApiResponse<ChatMessage>>(
    `/chat/channels/${channelId}/messages/${messageId}`,
    data
  )
  return response.data.data
}

export async function toggleChannelMessageReaction(
  channelId: string,
  messageId: string,
  data: ReactMessageRequest
): Promise<ChatMessage> {
  const response = await api.post<ApiResponse<ChatMessage>>(
    `/chat/channels/${channelId}/messages/${messageId}/reactions`,
    data
  )
  return response.data.data
}

export async function togglePinChannelMessage(
  channelId: string,
  messageId: string
): Promise<ChatMessage> {
  const response = await api.post<ApiResponse<ChatMessage>>(
    `/chat/channels/${channelId}/messages/${messageId}/pin`
  )
  return response.data.data
}

export async function deleteChannelMessage(
  channelId: string,
  messageId: string
): Promise<void> {
  await api.delete(`/chat/channels/${channelId}/messages/${messageId}`)
}
