export interface ChatChannel {
  id: string
  name: string
  description: string
  channelType?: "GROUP" | "DIRECT"
  workspaceId: string
  projectId: string | null
  projectName: string | null
  directUserEmail?: string | null
  directUserAvatarUrl?: string | null
  createdByName: string
  lastMessageAt: string
  lastMessagePreview: string
  messageCount: number
  createdAt: string
}

export interface ChatMessage {
  id: string
  channelId: string
  senderId: string
  senderName: string
  senderEmail: string
  senderAvatarUrl?: string | null
  content: string
  messageType?: "USER" | "SYSTEM"
  replyToId: string | null
  replyPreview: string | null
  replySenderName?: string | null
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentType?: string | null
  attachmentSize?: number | null
  edited: boolean
  pinned?: boolean
  reactions?: Record<string, string[]>
  createdAt: string
}

export interface CreateChannelRequest {
  name: string
  description?: string
  projectId?: string
}

export interface UpdateChannelRequest {
  name: string
  description?: string
  projectId?: string
  workspaceWide?: boolean
}

export interface SendMessageRequest {
  content: string
  replyToId?: string
  attachmentUrl?: string
  attachmentName?: string
  attachmentType?: string
  attachmentSize?: number
}

export interface EditMessageRequest {
  content: string
}

export interface ReactMessageRequest {
  emoji: string
}
