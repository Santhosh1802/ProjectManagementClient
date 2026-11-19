import { useCallback, useState } from "react"

export interface ChatSettings {
  profilePictureUrl: string
  statusText: string
  enterToSend: boolean
  showReadReceipts: boolean
  soundAlerts: boolean
  compactMode: boolean
  mutedChannelIds: string[]
  pinnedChannelIds: string[]
  starredMessageIds: string[]
  pinnedMessageIdsByChannel: Record<string, string[]>
  reactionsByMessage: Record<string, string[]>
  editedContentByMessage: Record<string, string>
  lastReadByChannel: Record<string, string>
}

const STORAGE_KEY = "chat-settings-v1"

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  profilePictureUrl: "",
  statusText: "Available",
  enterToSend: true,
  showReadReceipts: true,
  soundAlerts: true,
  compactMode: false,
  mutedChannelIds: [],
  pinnedChannelIds: [],
  starredMessageIds: [],
  pinnedMessageIdsByChannel: {},
  reactionsByMessage: {},
  editedContentByMessage: {},
  lastReadByChannel: {},
}

function isRecordOfStringArray(val: unknown): val is Record<string, string[]> {
  return Boolean(val && typeof val === "object" && !Array.isArray(val))
}

function isRecordOfString(val: unknown): val is Record<string, string> {
  return Boolean(val && typeof val === "object" && !Array.isArray(val))
}

function loadChatSettings(): ChatSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CHAT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<ChatSettings>
    return {
      ...DEFAULT_CHAT_SETTINGS,
      ...parsed,
      mutedChannelIds: Array.isArray(parsed.mutedChannelIds) ? parsed.mutedChannelIds : [],
      pinnedChannelIds: Array.isArray(parsed.pinnedChannelIds) ? parsed.pinnedChannelIds : [],
      starredMessageIds: Array.isArray(parsed.starredMessageIds) ? parsed.starredMessageIds : [],
      pinnedMessageIdsByChannel: isRecordOfStringArray(parsed.pinnedMessageIdsByChannel)
        ? parsed.pinnedMessageIdsByChannel
        : {},
      reactionsByMessage: isRecordOfStringArray(parsed.reactionsByMessage)
        ? parsed.reactionsByMessage
        : {},
      editedContentByMessage: isRecordOfString(parsed.editedContentByMessage)
        ? parsed.editedContentByMessage
        : {},
      lastReadByChannel: isRecordOfString(parsed.lastReadByChannel)
        ? parsed.lastReadByChannel
        : {},
    }
  } catch {
    return DEFAULT_CHAT_SETTINGS
  }
}

function persistSettings(next: ChatSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage quota errors
  }
}

export function useChatSettings() {
  const [settings, setSettings] = useState<ChatSettings>(loadChatSettings)

  const updateSettings = useCallback((patch: Partial<ChatSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      persistSettings(next)
      return next
    })
  }, [])

  const toggleMuteChannel = useCallback((channelId: string) => {
    setSettings((prev) => {
      const exists = prev.mutedChannelIds.includes(channelId)
      const mutedChannelIds = exists
        ? prev.mutedChannelIds.filter((id) => id !== channelId)
        : [...prev.mutedChannelIds, channelId]
      const next = { ...prev, mutedChannelIds }
      persistSettings(next)
      return next
    })
  }, [])

  const togglePinChannel = useCallback((channelId: string) => {
    setSettings((prev) => {
      const exists = prev.pinnedChannelIds.includes(channelId)
      const pinnedChannelIds = exists
        ? prev.pinnedChannelIds.filter((id) => id !== channelId)
        : [...prev.pinnedChannelIds, channelId]
      const next = { ...prev, pinnedChannelIds }
      persistSettings(next)
      return next
    })
  }, [])

  const toggleStarMessage = useCallback((messageId: string) => {
    setSettings((prev) => {
      const exists = prev.starredMessageIds.includes(messageId)
      const starredMessageIds = exists
        ? prev.starredMessageIds.filter((id) => id !== messageId)
        : [...prev.starredMessageIds, messageId]
      const next = { ...prev, starredMessageIds }
      persistSettings(next)
      return next
    })
  }, [])

  const togglePinMessage = useCallback((channelId: string, messageId: string) => {
    setSettings((prev) => {
      const current = prev.pinnedMessageIdsByChannel[channelId] ?? []
      const exists = current.includes(messageId)
      const updated = exists
        ? current.filter((id) => id !== messageId)
        : [...current, messageId]
      const pinnedMessageIdsByChannel = {
        ...prev.pinnedMessageIdsByChannel,
        [channelId]: updated,
      }
      const next = { ...prev, pinnedMessageIdsByChannel }
      persistSettings(next)
      return next
    })
  }, [])

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setSettings((prev) => {
      const current = prev.reactionsByMessage[messageId] ?? []
      const exists = current.includes(emoji)
      const updated = exists ? current.filter((e) => e !== emoji) : [...current, emoji]
      const reactionsByMessage = { ...prev.reactionsByMessage, [messageId]: updated }
      const next = { ...prev, reactionsByMessage }
      persistSettings(next)
      return next
    })
  }, [])

  const saveEditedMessage = useCallback((messageId: string, content: string) => {
    setSettings((prev) => {
      const trimmed = content.trim()
      if (!trimmed) return prev
      const editedContentByMessage = {
        ...prev.editedContentByMessage,
        [messageId]: trimmed,
      }
      const next = { ...prev, editedContentByMessage }
      persistSettings(next)
      return next
    })
  }, [])

  const markChannelRead = useCallback((channelId: string, isoTimestamp?: string) => {
    if (!channelId) return
    setSettings((prev) => {
      const ts = isoTimestamp ?? new Date().toISOString()
      if (prev.lastReadByChannel[channelId] === ts) return prev
      const lastReadByChannel = {
        ...prev.lastReadByChannel,
        [channelId]: ts,
      }
      const next = { ...prev, lastReadByChannel }
      persistSettings(next)
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_CHAT_SETTINGS)
    persistSettings(DEFAULT_CHAT_SETTINGS)
  }, [])

  return {
    settings,
    updateSettings,
    toggleMuteChannel,
    togglePinChannel,
    toggleStarMessage,
    togglePinMessage,
    toggleReaction,
    saveEditedMessage,
    markChannelRead,
    resetSettings,
  }
}
