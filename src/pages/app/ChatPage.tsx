import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react"
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns"
import {
  ArrowLeft,
  AtSign,
  BellOff,
  Bold,
  Check,
  CheckCheck,
  Code,
  Code2,
  Copy,
  CornerUpLeft,
  Edit3,
  Eye,
  FileText,
  Hash,
  History,
  Info,
  Link2,
  Loader2,
  Lock,
  Maximize2,
  MessageCircle,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Pin,
  Plus,
  Radio,
  Reply,
  Search as SearchIcon,
  Send,
  Settings,
  Smile,
  Sparkles,
  Star,
  Terminal,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react"

import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import ShortcutHint from "@/components/common/ShortcutHint"
import {
  hasAnyModifier,
  isEditableTarget,
  isOverlayOpen,
} from "@/lib/keyboard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useAppSelector } from "@/hooks/redux-hooks"
import { useProjectsQuery } from "@/features/projects/hooks/useProjectsQuery"
import { formatBytes } from "@/features/projects/services/projectStorage.service"
import {
  ChatInfoPanel,
  type InfoPanelTab,
} from "@/features/chat/components/ChatInfoPanel"
import { ChatMessageContent } from "@/features/chat/components/ChatMessageContent"
import { ChatSettingsDialog } from "@/features/chat/components/ChatSettingsDialog"
import { CreateChannelDialog } from "@/features/chat/components/CreateChannelDialog"
import { StartDirectChatDialog } from "@/features/chat/components/StartDirectChatDialog"
import {
  CHAT_KEYS,
  useChannelMessagesQuery,
  useChatChannelsQuery,
  useCreateChatChannelMutation,
  useDeleteChannelMessageMutation,
  useEditChannelMessageMutation,
  useRealtimeChat,
  useSendChannelMessageMutation,
  useStartDirectChatMutation,
  useToggleMessageReactionMutation,
  useTogglePinMessageMutation,
  useUpdateChatChannelMutation,
  useUploadChatAttachmentMutation,
} from "@/features/chat/hooks/useChatQuery"
import { getChannelMessages } from "@/features/chat/services/chat.service"
import { useChatSettings } from "@/features/chat/hooks/useChatSettings"
import type { ChatChannel, ChatMessage } from "@/features/chat/types/chat.types"
import { cn } from "@/lib/utils"

type ScopeFilter = "all" | "direct" | "workspace" | "project"
const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "🚀"]

interface SlashCommandItem {
  command: string
  label: string
  description: string
  insertText?: string
  action?: "clear" | "mute" | "standup" | "code"
}

const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    command: "/standup",
    label: "Daily Standup Template",
    description: "Insert Yesterday / Today / Blockers template",
    action: "standup",
  },
  {
    command: "/code",
    label: "Code Block",
    description: "Insert a formatted fenced code block",
    action: "code",
  },
  {
    command: "/shrug",
    label: "Shrug Emoji",
    description: "Append ¯\\_(ツ)_/¯ to message",
    insertText: "¯\\_(ツ)_/¯",
  },
  {
    command: "/shipit",
    label: "Ship It",
    description: "Insert deployment ready callout",
    insertText: "🚀 **Ready to ship!** All checks passing.",
  },
  {
    command: "/mute",
    label: "Toggle Mute Channel",
    description: "Mute or unmute notifications for this channel",
    action: "mute",
  },
  {
    command: "/clear",
    label: "Clear Draft",
    description: "Clear the current message input",
    action: "clear",
  },
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function makeAvatarSvgDataUri(name: string, isProject: boolean): string {
  const initials = getInitials(name)
  const bg = isProject ? "%23d97706" : "%234f46e5"
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" fill="${bg}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14" font-weight="600">${initials}</text></svg>`
}

function parseChatDate(iso: string | number | null | undefined): Date | null {
  if (iso === null || iso === undefined || iso === "") return null
  if (typeof iso === "number") {
    if (iso <= 0) return null
    // Jackson Instant numeric timestamps are in epoch seconds (e.g. 1763452800.123)
    const ms = iso < 1e11 ? Math.round(iso * 1000) : iso
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) || d.getFullYear() <= 1970 ? null : d
  }
  const trimmed = String(iso).trim()
  if (!trimmed) return null
  const asNum = Number(trimmed)
  if (!Number.isNaN(asNum)) {
    if (asNum <= 0) return null
    const ms = asNum < 1e11 ? Math.round(asNum * 1000) : asNum
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) || d.getFullYear() <= 1970 ? null : d
  }
  const d = new Date(trimmed)
  if (Number.isNaN(d.getTime()) || d.getFullYear() <= 1970) return null
  return d
}

function formatDayLabel(iso: string | number | null | undefined): string {
  const d = parseChatDate(iso)
  if (!d) return "Today"
  if (isToday(d)) return "Today"
  if (isYesterday(d)) return "Yesterday"
  return format(d, "MMM d, yyyy")
}

function formatMessageTime(iso: string | number | null | undefined): string {
  const d = parseChatDate(iso)
  if (!d) return format(new Date(), "h:mm a")
  return format(d, "h:mm a")
}

function formatConversationTime(iso: string | number | null | undefined): string {
  const d = parseChatDate(iso)
  if (!d) return ""
  if (isToday(d)) return format(d, "h:mm a")
  if (isYesterday(d)) return "Yesterday"
  return format(d, "MMM d")
}

function getStatusDotColor(statusText: string): string {
  switch (statusText) {
    case "In a meeting":
      return "bg-amber-500"
    case "Focus mode":
      return "bg-violet-500"
    case "Busy":
      return "bg-rose-500"
    default:
      return "bg-emerald-500"
  }
}

function isConsecutiveGroup(prev: ChatMessage | undefined, curr: ChatMessage): boolean {
  if (!prev) return false
  if (prev.messageType === "SYSTEM" || curr.messageType === "SYSTEM") return false
  if (prev.senderEmail.toLowerCase() !== curr.senderEmail.toLowerCase()) return false
  if (formatDayLabel(prev.createdAt) !== formatDayLabel(curr.createdAt)) return false
  const prevDate = parseChatDate(prev.createdAt)
  const currDate = parseChatDate(curr.createdAt)
  if (!prevDate || !currDate) return true
  return Math.abs(differenceInMinutes(currDate, prevDate)) < 5
}

function playSoftNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.04, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.18)
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

export default function ChatPage() {
  const queryClient = useQueryClient()
  const currentUser = useAppSelector((state) => state.auth.user)
  const themeMode = useAppSelector((state) => state.theme.theme)
  const currentUserName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    currentUser?.email ||
    "You"

  const {
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
  } = useChatSettings()

  const [searchParams] = useSearchParams()
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all")

  useEffect(() => {
    const scopeParam = searchParams.get("scope")
    if (
      scopeParam === "all" ||
      scopeParam === "direct" ||
      scopeParam === "workspace" ||
      scopeParam === "project"
    ) {
      setScopeFilter(scopeParam)
    }
  }, [searchParams])
  const [projectFilter, setProjectFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChannelId, setSelectedChannelId] = useState<string>("")
  const [createOpen, setCreateOpen] = useState(false)
  const [directOpen, setDirectOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const [draftText, setDraftText] = useState("")
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const [messageSearch, setMessageSearch] = useState("")
  const [starredOnly, setStarredOnly] = useState(false)

  // New UX states
  const [focusMode, setFocusMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [stagedFile, setStagedFile] = useState<File | null>(null)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasMoreOlder, setHasMoreOlder] = useState(true)
  const [showInfoDrawer, setShowInfoDrawer] = useState(false)
  const [infoDrawerTab, setInfoDrawerTab] = useState<InfoPanelTab>("overview")
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashQuery, setSlashQuery] = useState("")

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const fileAttachmentInputRef = useRef<HTMLInputElement | null>(null)

  const { data: projectsData } = useProjectsQuery({ page: 0, size: 50 })
  const projects = Array.isArray(projectsData)
    ? projectsData
    : (projectsData as { content?: { id: string | number; name: string }[] } | undefined)
        ?.content ?? []

  const { data: channels = [], isLoading: channelsLoading } = useChatChannelsQuery(
    projectFilter || undefined
  )
  const createChannelMutation = useCreateChatChannelMutation()
  const startDirectMutation = useStartDirectChatMutation()

  const scopeCounts = useMemo(() => {
    let direct = 0
    let workspace = 0
    let project = 0
    for (const c of channels) {
      if (c.channelType === "DIRECT") direct += 1
      else if (c.projectId) project += 1
      else workspace += 1
    }
    return {
      all: channels.length,
      direct,
      workspace,
      project,
    }
  }, [channels])

  const filteredChannels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const matching = channels.filter((c) => {
      const isDirect = c.channelType === "DIRECT"
      if (scopeFilter === "direct" && !isDirect) return false
      if (scopeFilter === "workspace" && (isDirect || c.projectId)) return false
      if (scopeFilter === "project" && (isDirect || !c.projectId)) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        (c.projectName ?? "").toLowerCase().includes(q) ||
        (c.lastMessagePreview ?? "").toLowerCase().includes(q)
      )
    })

    // Sort pinned channels to the top while preserving order
    return [...matching].sort((a, b) => {
      const aPinned = settings.pinnedChannelIds.includes(a.id) ? 1 : 0
      const bPinned = settings.pinnedChannelIds.includes(b.id) ? 1 : 0
      return bPinned - aPinned
    })
  }, [channels, scopeFilter, searchQuery, settings.pinnedChannelIds])

  const activeChannel =
    channels.find((c) => c.id === selectedChannelId) ??
    filteredChannels[0] ??
    channels[0] ??
    null

  const { data: messages = [], isLoading: messagesLoading } = useChannelMessagesQuery(
    activeChannel?.id
  )
  const sendMutation = useSendChannelMessageMutation(activeChannel?.id ?? "")
  const uploadAttachmentMutation = useUploadChatAttachmentMutation(
    activeChannel?.id ?? ""
  )
  const editMutation = useEditChannelMessageMutation(activeChannel?.id ?? "")
  const reactMutation = useToggleMessageReactionMutation(activeChannel?.id ?? "")
  const pinMutation = useTogglePinMessageMutation(activeChannel?.id ?? "")
  const deleteMutation = useDeleteChannelMessageMutation(activeChannel?.id ?? "")
  const updateChannelMutation = useUpdateChatChannelMutation(activeChannel?.id ?? "")

  // Full-history server search when user enters a search query
  const trimmedSearch = messageSearch.trim()
  const { data: serverSearchResults, isFetching: isSearchingHistory } = useQuery({
    queryKey: CHAT_KEYS.search(activeChannel?.id ?? "", trimmedSearch),
    queryFn: () =>
      getChannelMessages(activeChannel!.id, { query: trimmedSearch }),
    enabled: Boolean(activeChannel?.id && trimmedSearch.length >= 2),
  })

  useEffect(() => {
    setHasMoreOlder(true)
    setStagedFile(null)
  }, [activeChannel?.id])

  useEffect(() => {
    function handleChatKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return

      if (event.key === "Escape" && !isOverlayOpen()) {
        if (showEmojiPicker) {
          event.preventDefault()
          setShowEmojiPicker(false)
          return
        }
        if (showMessageSearch) {
          event.preventDefault()
          setMessageSearch("")
          setShowMessageSearch(false)
          return
        }
        if (editingMessageId) {
          event.preventDefault()
          setEditingMessageId(null)
          return
        }
        if (replyTo) {
          event.preventDefault()
          setReplyTo(null)
          return
        }
        if (focusMode) {
          event.preventDefault()
          setFocusMode(false)
          return
        }
      }

      if (
        !hasAnyModifier(event) &&
        !event.shiftKey &&
        !isEditableTarget(event.target) &&
        !isOverlayOpen() &&
        event.key.toLowerCase() === "f"
      ) {
        event.preventDefault()
        setFocusMode((v) => !v)
      }
    }

    document.addEventListener("keydown", handleChatKeyDown)
    return () => document.removeEventListener("keydown", handleChatKeyDown)
  }, [
    showEmojiPicker,
    showMessageSearch,
    editingMessageId,
    replyTo,
    focusMode,
  ])

  async function handleLoadOlderMessages() {
    if (!activeChannel?.id || messages.length === 0 || loadingOlder) return
    const oldest = messages[0]
    if (!oldest?.createdAt) return
    setLoadingOlder(true)
    try {
      const olderBatch = await getChannelMessages(activeChannel.id, {
        limit: 30,
        before: oldest.createdAt,
      })
      if (olderBatch.length < 30) {
        setHasMoreOlder(false)
      }
      if (olderBatch.length > 0) {
        queryClient.setQueryData<ChatMessage[]>(
          CHAT_KEYS.messages(activeChannel.id),
          (prev = []) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const uniqueOlder = olderBatch.filter((m) => !existingIds.has(m.id))
            return [...uniqueOlder, ...prev]
          }
        )
      }
    } catch {
      setHasMoreOlder(false)
    } finally {
      setLoadingOlder(false)
    }
  }

  useRealtimeChat(activeChannel?.id, (incoming, isNew) => {
    if (!isNew || !activeChannel) return
    const isFromSelf =
      Boolean(currentUser?.email) &&
      incoming.senderEmail.toLowerCase() === currentUser?.email?.toLowerCase()
    if (isFromSelf) return
    const isMuted = settings.mutedChannelIds.includes(activeChannel.id)
    if (isMuted) return

    if (settings.soundAlerts) {
      playSoftNotificationChime()
    }
    const myFirstName = currentUser?.firstName?.toLowerCase() ?? ""
    const isMentioned =
      incoming.content.toLowerCase().includes("@everyone") ||
      incoming.content.toLowerCase().includes("@here") ||
      (myFirstName && incoming.content.toLowerCase().includes(`@${myFirstName}`))
    if (isMentioned) {
      toast.add({
        type: "info",
        title: `${incoming.senderName} mentioned you in #${activeChannel.name}`,
        description: incoming.content.slice(0, 100),
      })
    }
  })

  // Mark active channel as read when viewed or when new messages arrive
  useEffect(() => {
    if (!activeChannel?.id) return
    const latestTs =
      messages.length > 0
        ? messages[messages.length - 1].createdAt
        : activeChannel.lastMessageAt
    if (latestTs) {
      markChannelRead(activeChannel.id, latestTs)
    }
  }, [activeChannel?.id, activeChannel?.lastMessageAt, messages, markChannelRead])

  // Auto-scroll to bottom when messages count changes
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length, activeChannel?.id])

  const activeChannelPinnedIds = useMemo(
    () =>
      activeChannel
        ? settings.pinnedMessageIdsByChannel[activeChannel.id] ?? []
        : [],
    [activeChannel, settings.pinnedMessageIdsByChannel]
  )

  const pinnedMessagesInChannel = useMemo(
    () =>
      messages.filter(
        (m) => Boolean(m.pinned) || activeChannelPinnedIds.includes(m.id)
      ),
    [messages, activeChannelPinnedIds]
  )

  function handleToggleReaction(messageId: string, emoji: string) {
    toggleReaction(messageId, emoji)
    reactMutation.mutate({ messageId, emoji })
  }

  function handleTogglePinMessage(messageId: string) {
    if (!activeChannel) return
    togglePinMessage(activeChannel.id, messageId)
    pinMutation.mutate(messageId)
  }

  function handleSaveMessageEdit(messageId: string, content: string) {
    const trimmed = content.trim()
    if (!trimmed) return
    saveEditedMessage(messageId, trimmed)
    editMutation.mutate({ messageId, content: trimmed })
  }

  const visibleMessages = useMemo(() => {
    const q = messageSearch.trim().toLowerCase()
    const baseList =
      q.length >= 2 && Array.isArray(serverSearchResults)
        ? serverSearchResults
        : messages
    return baseList.filter((m) => {
      if (starredOnly && !settings.starredMessageIds.includes(m.id)) return false
      if (!q) return true
      const effectiveContent = settings.editedContentByMessage[m.id] ?? m.content
      return (
        effectiveContent.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        (m.attachmentName ?? "").toLowerCase().includes(q)
      )
    })
  }, [
    messages,
    serverSearchResults,
    messageSearch,
    starredOnly,
    settings.starredMessageIds,
    settings.editedContentByMessage,
  ])

  const mentionCandidates = useMemo(() => {
    const map = new Map<string, { handle: string; label: string; sub: string }>()
    map.set("everyone", {
      handle: "everyone",
      label: "@everyone",
      sub: "Notify all members in this channel",
    })
    map.set("here", {
      handle: "here",
      label: "@here",
      sub: "Notify active teammates",
    })
    for (const m of messages) {
      const cleanHandle = m.senderName.replace(/\s+/g, "")
      if (cleanHandle && !map.has(cleanHandle.toLowerCase())) {
        map.set(cleanHandle.toLowerCase(), {
          handle: cleanHandle,
          label: m.senderName,
          sub: m.senderEmail,
        })
      }
    }
    const q = mentionQuery.trim().toLowerCase()
    const list = Array.from(map.values())
    if (!q) return list.slice(0, 6)
    return list
      .filter(
        (item) =>
          item.handle.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q)
      )
      .slice(0, 6)
  }, [messages, mentionQuery])

  const filteredSlashCommands = useMemo(() => {
    const q = slashQuery.trim().toLowerCase()
    if (!q) return SLASH_COMMANDS
    return SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.command.toLowerCase().includes(q) ||
        cmd.label.toLowerCase().includes(q)
    )
  }, [slashQuery])

  const isDark =
    themeMode === "dark" ||
    (typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")) ||
    (themeMode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches)

  function handleDraftChange(val: string) {
    setDraftText(val)

    // Detect slash command at start of input
    if (val.startsWith("/") && !val.includes("\n") && !val.includes(" ")) {
      setShowSlashMenu(true)
      setSlashQuery(val.slice(1))
    } else {
      setShowSlashMenu(false)
    }

    // Detect @mention token at end of input
    const mentionMatch = val.match(/(?:^|\s)@([a-zA-Z0-9_.-]*)$/)
    if (mentionMatch) {
      setShowMentionMenu(true)
      setMentionQuery(mentionMatch[1] ?? "")
    } else {
      setShowMentionMenu(false)
    }
  }

  function applyMention(handle: string) {
    setDraftText((prev) => {
      if (/(?:^|\s)@([a-zA-Z0-9_.-]*)$/.test(prev)) {
        return prev.replace(/@([a-zA-Z0-9_.-]*)$/, `@${handle} `)
      }
      return `${prev}${prev.endsWith(" ") || !prev ? "" : " "}@${handle} `
    })
    setShowMentionMenu(false)
    composerRef.current?.focus()
  }

  function applySlashCommand(item: SlashCommandItem) {
    setShowSlashMenu(false)
    if (item.action === "clear") {
      setDraftText("")
      return
    }
    if (item.action === "mute") {
      if (activeChannel) toggleMuteChannel(activeChannel.id)
      setDraftText("")
      return
    }
    if (item.action === "standup") {
      setDraftText(
        "**Yesterday:**\n- \n**Today:**\n- \n**Blockers:**\n- None"
      )
      composerRef.current?.focus()
      return
    }
    if (item.action === "code") {
      setDraftText("```ts\n// Paste code here\n```")
      composerRef.current?.focus()
      return
    }
    if (item.insertText) {
      setDraftText(item.insertText)
      composerRef.current?.focus()
    }
  }

  function insertFormatting(prefix: string, suffix: string = prefix, placeholder = "text") {
    const el = composerRef.current
    if (!el) {
      setDraftText((prev) => `${prev}${prefix}${placeholder}${suffix}`)
      return
    }
    const start = el.selectionStart ?? draftText.length
    const end = el.selectionEnd ?? draftText.length
    const selected = draftText.slice(start, end) || placeholder
    const next =
      draftText.slice(0, start) + prefix + selected + suffix + draftText.slice(end)
    setDraftText(next)
    window.setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
    }, 0)
  }

  function handleSend(textContent?: string) {
    if (!activeChannel) return
    const raw = (textContent ?? draftText).trim()

    if (stagedFile) {
      uploadAttachmentMutation.mutate(
        {
          file: stagedFile,
          caption: raw || undefined,
          replyToId: replyTo?.id,
        },
        {
          onSuccess: () => {
            setStagedFile(null)
            setDraftText("")
            setReplyTo(null)
            setShowEmojiPicker(false)
          },
          onError: (err) => {
            const msg =
              err instanceof Error
                ? err.message
                : "Failed to upload attachment. Check project storage quota."
            toast.add({
              type: "error",
              title: "Attachment upload failed",
              description: msg,
            })
          },
        }
      )
      return
    }

    if (!raw) return

    // Check if user typed an exact slash command and hit send
    const matchedCmd = SLASH_COMMANDS.find(
      (c) => c.command.toLowerCase() === raw.toLowerCase()
    )
    if (matchedCmd) {
      applySlashCommand(matchedCmd)
      return
    }

    sendMutation.mutate(
      {
        content: raw,
        replyToId: replyTo?.id,
      },
      {
        onSuccess: () => {
          setDraftText("")
          setReplyTo(null)
          setShowEmojiPicker(false)
          setShowMentionMenu(false)
          setShowSlashMenu(false)
        },
      }
    )
  }

  function handleJumpToMessage(messageId: string) {
    setHighlightedMessageId(messageId)
    const el = document.getElementById(`chat-msg-${messageId}`)
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    window.setTimeout(() => {
      setHighlightedMessageId((curr) => (curr === messageId ? null : curr))
    }, 2200)
  }

  function handleExportChat() {
    if (!activeChannel) return
    const lines = messages.map((m) => {
      const body = settings.editedContentByMessage[m.id] ?? m.content
      const dt = parseChatDate(m.createdAt) ?? new Date()
      return `[${format(dt, "MMM d, yyyy h:mm a")}] ${m.senderName}: ${body}`
    })
    const blob = new Blob([`# ${activeChannel.name}\n\n${lines.join("\n")}`], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeChannel.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-chat.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function isChannelUnread(channel: ChatChannel): boolean {
    if (activeChannel?.id === channel.id) return false
    if (!channel.lastMessageAt || channel.messageCount === 0) return false
    const lastRead = settings.lastReadByChannel[channel.id]
    if (!lastRead) return false
    const lastMsgDate = parseChatDate(channel.lastMessageAt)
    const lastReadDate = parseChatDate(lastRead)
    if (!lastMsgDate || !lastReadDate) return false
    return lastMsgDate.getTime() > lastReadDate.getTime()
  }

  const userAvatarSrc =
    currentUser?.avatarUrl || makeAvatarSvgDataUri(currentUserName, false)

  return (
    <PageContainer className={cn("max-w-none", focusMode ? "space-y-2 py-2" : "space-y-4")}>
      {!focusMode && (
        <PageHeader
          title="Team Chat"
          description="Real-time messaging with rich code blocks, file & image sharing, @mentions, and workspace or project-scoped privacy."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setFocusMode(true)}
                aria-label="Enter focus view"
              >
                <Maximize2 className="mr-1.5 size-3.5" />
                Focus View
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSettingsOpen(true)}
                aria-label="Chat settings"
              >
                <Settings className="mr-1.5 size-3.5" />
                Chat Settings
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setDirectOpen(true)}
              >
                <UserPlus className="mr-1.5 size-3.5" />
                Direct Message
              </Button>
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 size-3.5" />
                New Chat Group
              </Button>
            </div>
          }
        />
      )}

      {/* Custom shadcn/ui Full Chat Layout */}
      <div
        className={cn(
          "relative flex w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs transition-all",
          focusMode
            ? "h-[calc(100dvh-6.5rem)] min-h-[560px]"
            : "h-[660px] min-h-[560px] xl:h-[calc(100dvh-12rem)]"
        )}
      >
        {/* LEFT SIDEBAR: Conversations & Filters */}
        <aside
          aria-label="Conversations sidebar"
          className={cn(
            "flex h-full w-full shrink-0 flex-col border-r border-border/80 bg-card md:w-80 lg:w-84",
            sidebarCollapsed
              ? "hidden"
              : mobileShowChat
                ? "hidden md:flex"
                : "flex"
          )}
        >
          {/* User Profile Strip */}
          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/15 px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative shrink-0">
                <img
                  src={userAvatarSrc}
                  alt={currentUserName}
                  className="size-9 rounded-full border border-border object-cover shadow-2xs"
                />
                <span
                  className={cn(
                    "absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-card",
                    getStatusDotColor(settings.statusText)
                  )}
                  title={settings.statusText}
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-foreground">
                  {currentUserName}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {settings.statusText}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => setDirectOpen(true)}
                title="New Direct Message"
                aria-label="Quick start direct message"
              >
                <UserPlus className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => setSettingsOpen(true)}
                title="Profile & Chat Settings"
                aria-label="Open chat settings from sidebar"
              >
                <Settings className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Scope Filter Pills + Project Selector */}
          <div className="space-y-2 border-b border-border/60 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: "all", label: "All", count: scopeCounts.all },
                  { id: "direct", label: "Direct", count: scopeCounts.direct },
                  { id: "workspace", label: "Workspace", count: scopeCounts.workspace },
                  { id: "project", label: "Project Only", count: scopeCounts.project },
                ] as { id: ScopeFilter; label: string; count: number }[]
              ).map((f) => (
                <Button
                  key={f.id}
                  type="button"
                  size="xs"
                  variant={scopeFilter === f.id ? "default" : "outline"}
                  onClick={() => setScopeFilter(f.id)}
                  className="gap-1"
                >
                  <span>{f.label}</span>
                  {f.count > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1 text-[10px]",
                        scopeFilter === f.id
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {f.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {projects.length > 0 && (
              <Select
                value={projectFilter || "all"}
                onValueChange={(val) =>
                  setProjectFilter(val === "all" || !val ? "" : val)
                }
              >
                <SelectTrigger
                  aria-label="Filter chats by project"
                  className="h-7 w-full text-xs"
                >
                  <SelectValue placeholder="All Projects">
                    {projectFilter
                      ? `Project: ${projects.find((p) => String(p.id) === projectFilter)?.name ?? "Selected"}`
                      : "All Projects"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={String(p.id)} value={String(p.id)}>
                      Project: {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                aria-label="Search chats"
                aria-keyshortcuts="/"
                data-page-search=""
                className={
                  searchQuery
                    ? "h-7 bg-muted/40 pr-7 pl-8 text-xs"
                    : "h-7 bg-muted/40 pr-8 pl-8 text-xs"
                }
              />
              {!searchQuery && (
                <Kbd
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-2 hidden h-4 min-w-4 -translate-y-1/2 px-1 text-[9px] sm:inline-flex"
                >
                  /
                </Kbd>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1.5 right-2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Clear chat search"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Conversation List */}
          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-border/40">
            {channelsLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-xs text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span>Loading conversations...</span>
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
                <MessageCircle className="size-7 text-muted-foreground/50" />
                <p className="text-xs font-medium text-foreground">
                  No matching conversations
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Try clearing your search filter or start a new chat group.
                </p>
              </div>
            ) : (
              filteredChannels.map((channel) => {
                const isActive = activeChannel?.id === channel.id
                const isMuted = settings.mutedChannelIds.includes(channel.id)
                const isPinned = settings.pinnedChannelIds.includes(channel.id)
                const isUnread = isChannelUnread(channel)

                return (
                  <div
                    key={channel.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedChannelId(channel.id)
                      setReplyTo(null)
                      setEditingMessageId(null)
                      setMobileShowChat(true)
                      markChannelRead(channel.id, channel.lastMessageAt)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedChannelId(channel.id)
                        setReplyTo(null)
                        setEditingMessageId(null)
                        setMobileShowChat(true)
                        markChannelRead(channel.id, channel.lastMessageAt)
                      }
                    }}
                    className={cn(
                      "group relative flex cursor-pointer items-start gap-2.5 px-3 py-2.5 transition-colors",
                      isActive
                        ? "border-l-3 border-l-primary bg-primary/10"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          channel.directUserAvatarUrl ||
                          makeAvatarSvgDataUri(
                            channel.name,
                            Boolean(channel.projectId)
                          )
                        }
                        alt={channel.name}
                        className="size-10 rounded-full object-cover shadow-2xs"
                      />
                      {isUnread && (
                        <span
                          className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card"
                          title="New messages"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex min-w-0 items-center gap-1">
                          {isPinned && (
                            <Pin className="size-3 shrink-0 text-primary" />
                          )}
                          <span
                            className={cn(
                              "truncate text-xs",
                              isActive || isUnread
                                ? "font-bold text-foreground"
                                : "font-semibold text-foreground"
                            )}
                          >
                            {channel.name}
                          </span>
                          {isMuted && (
                            <BellOff
                              className="size-3 shrink-0 text-muted-foreground"
                              aria-label="Muted channel"
                            />
                          )}
                        </div>
                        <span
                          className={cn(
                            "shrink-0 text-[10px]",
                            isActive || isUnread
                              ? "font-semibold text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatConversationTime(channel.lastMessageAt)}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                        {channel.channelType === "DIRECT" ? (
                          <span className="inline-flex items-center gap-0.5 text-primary/80">
                            <User className="size-2.5" />
                            Direct Message
                          </span>
                        ) : channel.projectName ? (
                          <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                            <Lock className="size-2.5" />
                            Project · {channel.projectName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5">
                            <Hash className="size-2.5" />
                            Workspace
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-xs",
                            isUnread
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {channel.lastMessagePreview || "No messages yet"}
                        </p>
                        {channel.messageCount > 0 && (
                          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground group-hover:hidden">
                            {channel.messageCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Pin Button on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePinChannel(channel.id)
                      }}
                      title={isPinned ? "Unpin conversation" : "Pin conversation"}
                      aria-label={isPinned ? "Unpin conversation" : "Pin conversation"}
                      className="hidden rounded p-1 text-muted-foreground hover:bg-background hover:text-primary group-hover:inline-flex"
                    >
                      <Pin className={cn("size-3", isPinned && "fill-current text-primary")} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* CENTER: Chat Viewport */}
        <section
          aria-label="Active conversation"
          className={cn(
            "relative flex min-w-0 flex-1 flex-col bg-background",
            !mobileShowChat ? "hidden md:flex" : "flex"
          )}
        >
          {/* Conversation Header */}
          {activeChannel ? (
            <header className="flex items-center justify-between gap-2 border-b border-border/80 bg-card px-3.5 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="md:hidden"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="Back to channels"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="hidden md:inline-flex"
                  onClick={() => setSidebarCollapsed((v) => !v)}
                  title={sidebarCollapsed ? "Show channel list" : "Hide channel list"}
                  aria-label="Toggle channel list sidebar"
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="size-4 text-primary" />
                  ) : (
                    <PanelLeftClose className="size-4" />
                  )}
                </Button>
                <img
                  src={
                    activeChannel.directUserAvatarUrl ||
                    makeAvatarSvgDataUri(
                      activeChannel.name,
                      Boolean(activeChannel.projectId)
                    )
                  }
                  alt={activeChannel.name}
                  className="size-9 shrink-0 rounded-full object-cover shadow-2xs"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-sm font-semibold text-foreground">
                      {activeChannel.name}
                    </h2>
                    {settings.pinnedChannelIds.includes(activeChannel.id) && (
                      <Pin className="size-3 shrink-0 text-primary" />
                    )}
                    {settings.mutedChannelIds.includes(activeChannel.id) && (
                      <BellOff className="size-3 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {activeChannel.description
                      ? `${activeChannel.description} · ${activeChannel.messageCount || messages.length} messages`
                      : activeChannel.channelType === "DIRECT"
                        ? `1-to-1 Direct Message · ${activeChannel.messageCount || messages.length} messages`
                        : activeChannel.projectName
                          ? `Project Only · ${activeChannel.projectName} · ${activeChannel.messageCount || messages.length} messages`
                          : `Workspace-wide · ${activeChannel.messageCount || messages.length} messages`}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="icon-xs"
                  variant={focusMode ? "default" : "ghost"}
                  onClick={() => setFocusMode((v) => !v)}
                  title={focusMode ? "Exit focus view (F or Esc)" : "Focus view (F)"}
                  aria-label="Toggle focus view"
                  aria-keyshortcuts="F"
                >
                  {focusMode ? (
                    <Minimize2 className="size-3.5" />
                  ) : (
                    <Maximize2 className="size-3.5" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant={showMessageSearch ? "default" : "ghost"}
                  onClick={() => setShowMessageSearch((v) => !v)}
                  title="Search messages"
                  aria-label="Search messages in chat"
                >
                  <SearchIcon className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant={starredOnly ? "default" : "ghost"}
                  onClick={() => setStarredOnly((v) => !v)}
                  title="Starred messages"
                  aria-label="Filter starred messages"
                >
                  <Star className={cn("size-3.5", starredOnly && "fill-current")} />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant={showEmojiPicker ? "default" : "ghost"}
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  title="Insert emoji"
                  aria-label="Toggle emoji picker"
                >
                  <Smile className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant={showInfoDrawer ? "default" : "ghost"}
                  onClick={() => setShowInfoDrawer((v) => !v)}
                  title="Channel info, pinned messages & shared links"
                  aria-label="Toggle channel info drawer"
                >
                  <Info className="size-3.5" />
                </Button>

                <Badge
                  variant="outline"
                  className="hidden gap-1 font-mono text-[10px] sm:inline-flex"
                >
                  <Radio className="size-2.5 text-emerald-500" />
                  Live
                </Badge>
                <Badge
                  variant={activeChannel.projectName ? "secondary" : "outline"}
                  className="hidden gap-1 text-[10px] sm:inline-flex"
                >
                  {activeChannel.channelType === "DIRECT" ? (
                    <>
                      <User className="size-2.5" />
                      Direct
                    </>
                  ) : activeChannel.projectName ? (
                    <>
                      <Lock className="size-2.5" />
                      {activeChannel.projectName}
                    </>
                  ) : (
                    <>
                      <Eye className="size-2.5" />
                      Workspace
                    </>
                  )}
                </Badge>
              </div>
            </header>
          ) : (
            <header className="flex items-center justify-between border-b border-border/80 bg-card px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Select a chat group
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose a workspace or project chat on the left
                </p>
              </div>
            </header>
          )}

          {/* Pinned Messages Strip (if channel has pinned messages) */}
          {activeChannel && pinnedMessagesInChannel.length > 0 && (
            <div className="flex items-center justify-between gap-2 border-b border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleJumpToMessage(
                    pinnedMessagesInChannel[pinnedMessagesInChannel.length - 1].id
                  )
                }
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <Pin className="size-3.5 shrink-0 text-primary" />
                <span className="shrink-0 font-semibold text-primary">
                  Pinned ({pinnedMessagesInChannel.length}):
                </span>
                <span className="truncate text-muted-foreground">
                  {settings.editedContentByMessage[
                    pinnedMessagesInChannel[pinnedMessagesInChannel.length - 1].id
                  ] ??
                    pinnedMessagesInChannel[pinnedMessagesInChannel.length - 1].content}
                </span>
              </button>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                className="h-6 px-2 text-[11px] text-primary"
                onClick={() => {
                  setInfoDrawerTab("saved")
                  setShowInfoDrawer(true)
                }}
              >
                View all
              </Button>
            </div>
          )}

          {/* In-Chat Message Search Bar */}
          {showMessageSearch && (
            <div className="flex items-center gap-2 border-b border-primary/30 bg-card/95 px-3.5 py-1.5 text-foreground shadow-2xs">
              <SearchIcon className="size-3.5 text-primary" />
              <Input
                autoFocus
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault()
                    setMessageSearch("")
                    setShowMessageSearch(false)
                  }
                }}
                placeholder="Search messages in this chat..."
                aria-label="Search messages input"
                className="h-7 border-0 bg-transparent px-0 text-xs focus-visible:ring-0"
              />
              {messageSearch && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  {isSearchingHistory && <Loader2 className="size-2.5 animate-spin" />}
                  {visibleMessages.length} matches in history
                </Badge>
              )}
              <ShortcutHint
                keys={["Esc"]}
                compact
                decorative
                className="hidden sm:inline-flex"
              />
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => {
                  setMessageSearch("")
                  setShowMessageSearch(false)
                }}
                aria-label="Close message search"
                title="Close message search (Esc)"
              >
                <X className="size-3" />
              </Button>
            </div>
          )}

          {/* Message List Viewport */}
          <div
            className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3 space-y-1"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in oklch, var(--border) 55%, transparent) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {messagesLoading ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span>Loading messages...</span>
              </div>
            ) : activeChannel && visibleMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center text-muted-foreground">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="size-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {starredOnly || messageSearch
                    ? "No matching messages"
                    : `Start the conversation in ${activeChannel.name}`}
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  {activeChannel.projectName
                    ? `Messages here are visible only to ${activeChannel.projectName} members. Share code blocks with \`\`\` or type / for quick templates.`
                    : "Messages here are visible to all workspace members. Type @ to mention teammates or / for quick commands."}
                </p>
              </div>
            ) : (
              <>
                {/* WhatsApp-Style Load Older Messages Trigger */}
                {!messageSearch.trim() &&
                  !starredOnly &&
                  hasMoreOlder &&
                  messages.length >= 30 && (
                    <div className="flex justify-center py-2">
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        disabled={loadingOlder}
                        onClick={() => void handleLoadOlderMessages()}
                        className="rounded-full bg-card/90 text-xs shadow-2xs"
                      >
                        {loadingOlder ? (
                          <>
                            <Loader2 className="mr-1.5 size-3 animate-spin" />
                            Loading older messages...
                          </>
                        ) : (
                          <>
                            <History className="mr-1.5 size-3" />
                            Load older messages
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                {visibleMessages.map((msg, idx) => {
                  const isSystemMsg = msg.messageType === "SYSTEM"
                  const isOwn =
                    Boolean(currentUser?.email) &&
                    msg.senderEmail.toLowerCase() === currentUser?.email?.toLowerCase()
                  const prevMsg = idx > 0 ? visibleMessages[idx - 1] : undefined
                  const prevDay = prevMsg ? formatDayLabel(prevMsg.createdAt) : null
                  const currDay = formatDayLabel(msg.createdAt)
                  const showDay = currDay !== prevDay
                  const grouped = !showDay && isConsecutiveGroup(prevMsg, msg)

                  if (isSystemMsg) {
                    return (
                      <div key={msg.id} id={`chat-msg-${msg.id}`} className="py-1">
                        {showDay && (
                          <div className="my-3 flex items-center gap-3">
                            <div className="h-px flex-1 bg-border/80" />
                            <span className="rounded-full border border-border/70 bg-card px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-2xs">
                              {currDay}
                            </span>
                            <div className="h-px flex-1 bg-border/80" />
                          </div>
                        )}
                        <div className="my-1.5 flex justify-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[11px] font-medium text-foreground shadow-2xs">
                            <span>{msg.content}</span>
                            <span className="text-[10px] text-muted-foreground">
                              · {formatMessageTime(msg.createdAt)}
                            </span>
                          </span>
                        </div>
                      </div>
                    )
                  }

                  const isStarred = settings.starredMessageIds.includes(msg.id)
                const isPinnedMsg =
                  Boolean(msg.pinned) || activeChannelPinnedIds.includes(msg.id)
                const serverReactionEntries = msg.reactions
                  ? Object.entries(msg.reactions).filter(([, list]) => list.length > 0)
                  : []
                const localReactions = settings.reactionsByMessage[msg.id] ?? []
                const reactionPills: { emoji: string; count: number }[] =
                  serverReactionEntries.length > 0
                    ? serverReactionEntries.map(([emoji, users]) => ({
                        emoji,
                        count: users.length,
                      }))
                    : localReactions.map((emoji) => ({ emoji, count: 1 }))

                const displayContent =
                  settings.editedContentByMessage[msg.id] ?? msg.content
                const isEdited =
                  msg.edited || Boolean(settings.editedContentByMessage[msg.id])
                const isEditing = editingMessageId === msg.id
                const isHighlighted = highlightedMessageId === msg.id

                const repliedMsg = msg.replyToId
                  ? messages.find((m) => m.id === msg.replyToId)
                  : null
                const replyAuthor = msg.replySenderName ?? repliedMsg?.senderName

                return (
                  <div
                    key={msg.id}
                    id={`chat-msg-${msg.id}`}
                    className={cn(
                      "transition-colors duration-300",
                      settings.compactMode ? "py-0.5" : grouped ? "pt-0.5" : "pt-2.5",
                      isHighlighted && "rounded-xl bg-primary/15 px-2 py-1"
                    )}
                  >
                    {showDay && (
                      <div className="my-3 flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/80" />
                        <span className="rounded-full border border-border/70 bg-card px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-2xs">
                          {currDay}
                        </span>
                        <div className="h-px flex-1 bg-border/80" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "group relative flex items-start gap-2.5",
                        isOwn ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar (only shown for first message in a consecutive group) */}
                      <div className="w-8 shrink-0 pt-0.5">
                        {!grouped && (
                          <img
                            src={
                              (isOwn ? currentUser?.avatarUrl : msg.senderAvatarUrl) ||
                              makeAvatarSvgDataUri(msg.senderName, false)
                            }
                            alt={msg.senderName}
                            className="size-8 rounded-full border border-border/60 object-cover shadow-2xs"
                          />
                        )}
                      </div>

                      {/* Message Bubble & Metadata */}
                      <div
                        className={cn(
                          "relative flex max-w-[82%] flex-col sm:max-w-[70%]",
                          isOwn ? "items-end" : "items-start"
                        )}
                      >
                        {!grouped && (
                          <div
                            className={cn(
                              "mb-1 flex items-center gap-1.5 px-1 text-[11px]",
                              isOwn ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <span
                              className={cn(
                                "font-semibold",
                                isOwn ? "text-muted-foreground" : "text-primary"
                              )}
                            >
                              {isOwn ? "You" : msg.senderName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* Floating Hover Action Toolbar (does not affect bubble width or vertical flow) */}
                        <div
                          className={cn(
                            "pointer-events-none absolute -top-3.5 z-20 inline-flex w-max items-center gap-0.5 rounded-full border border-border/90 bg-card/95 px-1.5 py-0.5 whitespace-nowrap text-foreground opacity-0 shadow-md backdrop-blur-xs transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100",
                            isOwn ? "right-0" : "left-0"
                          )}
                        >
                          {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
                            <Button
                              key={emoji}
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              className="h-5 w-5 rounded-full text-xs leading-none hover:bg-muted"
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              title={`React ${emoji}`}
                            >
                              {emoji}
                            </Button>
                          ))}
                          <div className="mx-0.5 h-3 w-px bg-border" />
                          <Button
                            type="button"
                            size="xs"
                            variant="ghost"
                            className="h-5 rounded-full px-1.5 text-[10px] text-foreground hover:bg-muted"
                            onClick={() => setReplyTo(msg)}
                            aria-label="Reply to message"
                          >
                            <Reply className="mr-1 size-2.5" />
                            Reply
                          </Button>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            className="h-5 w-5 rounded-full text-foreground hover:bg-muted"
                            onClick={() => toggleStarMessage(msg.id)}
                            aria-label="Star message"
                            title="Star message"
                          >
                            <Star
                              className={cn(
                                "size-2.5",
                                isStarred && "fill-primary text-primary"
                              )}
                            />
                          </Button>
                          {activeChannel && (
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              className="h-5 w-5 rounded-full text-foreground hover:bg-muted"
                              onClick={() => handleTogglePinMessage(msg.id)}
                              aria-label="Pin message"
                              title={isPinnedMsg ? "Unpin message" : "Pin message"}
                            >
                              <Pin
                                className={cn(
                                  "size-2.5",
                                  isPinnedMsg && "fill-primary text-primary"
                                )}
                              />
                            </Button>
                          )}
                          {isOwn && (
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              className="h-5 w-5 rounded-full text-foreground hover:bg-muted"
                              onClick={() => {
                                setEditingMessageId(msg.id)
                                setEditingText(displayContent)
                              }}
                              aria-label="Edit message"
                              title="Edit message"
                            >
                              <Edit3 className="size-2.5" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            className="h-5 w-5 rounded-full text-foreground hover:bg-muted"
                            onClick={() =>
                              void navigator.clipboard?.writeText(displayContent)
                            }
                            aria-label="Copy message"
                            title="Copy message"
                          >
                            <Copy className="size-2.5" />
                          </Button>
                          {isOwn && (
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              className="h-5 w-5 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => deleteMutation.mutate(msg.id)}
                              aria-label="Delete message"
                              title="Delete message"
                            >
                              <Trash2 className="size-2.5" />
                            </Button>
                          )}
                        </div>

                        <div
                          className={cn(
                            "relative rounded-2xl px-3.5 py-2 shadow-xs transition-all",
                            isOwn
                              ? "rounded-tr-xs bg-linear-to-br from-primary to-primary/90 text-primary-foreground"
                              : "rounded-tl-xs border border-border/80 bg-card text-foreground"
                          )}
                        >
                          {isEditing ? (
                            <div className="min-w-[220px] space-y-2 sm:min-w-[300px]">
                              <Textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                aria-label="Edit message content"
                                rows={2}
                                className="min-h-14 bg-background/95 text-xs text-foreground"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    if (editingText.trim()) {
                                      handleSaveMessageEdit(msg.id, editingText)
                                      setEditingMessageId(null)
                                    }
                                  } else if (e.key === "Escape") {
                                    setEditingMessageId(null)
                                  }
                                }}
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  type="button"
                                  size="xs"
                                  variant="secondary"
                                  onClick={() => setEditingMessageId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  size="xs"
                                  onClick={() => {
                                    if (editingText.trim()) {
                                      handleSaveMessageEdit(msg.id, editingText)
                                      setEditingMessageId(null)
                                    }
                                  }}
                                >
                                  <Check className="mr-1 size-3" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <ChatMessageContent
                              content={displayContent}
                              isOwn={isOwn}
                              replyPreview={msg.replyPreview}
                              replyToId={msg.replyToId}
                              replySenderName={replyAuthor}
                              attachmentUrl={msg.attachmentUrl}
                              attachmentName={msg.attachmentName}
                              attachmentType={msg.attachmentType}
                              attachmentSize={msg.attachmentSize}
                              onJumpToMessage={handleJumpToMessage}
                            />
                          )}

                          {/* Bubble Footer Metadata */}
                          <div
                            className={cn(
                              "mt-1 flex items-center justify-end gap-1 text-[10px]",
                              isOwn
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            )}
                          >
                            {isPinnedMsg && (
                              <Pin
                                className="size-2.5 fill-current"
                                aria-label="Pinned message"
                              />
                            )}
                            {isStarred && (
                              <Star
                                className="size-2.5 fill-current"
                                aria-label="Starred message"
                              />
                            )}
                            {isEdited && <span className="italic">(edited)</span>}
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {isOwn && settings.showReadReceipts && (
                              <CheckCheck className="size-3" />
                            )}
                          </div>
                        </div>

                        {/* Active Reaction Pills (only rendered when reactions exist, flush with bubble corner) */}
                        {reactionPills.length > 0 && (
                          <div
                            className={cn(
                              "-mt-1.5 z-10 flex flex-wrap items-center gap-1 px-1.5",
                              isOwn ? "justify-end" : "justify-start"
                            )}
                          >
                            {reactionPills.map(({ emoji, count }) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, emoji)}
                                className="inline-flex h-5.5 items-center gap-1 rounded-full border border-border bg-card px-2 text-xs leading-none text-foreground shadow-2xs transition-transform hover:scale-105 hover:bg-muted"
                              >
                                <span className="text-xs leading-none">{emoji}</span>
                                {count > 1 && (
                                  <span className="font-mono text-[10px] font-medium text-muted-foreground">
                                    {count}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Staged File / Image Attachment Preview Banner */}
          {stagedFile && (
            <div className="flex items-center justify-between gap-2 border-t border-primary/30 bg-primary/5 px-3.5 py-2 text-xs">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <FileText className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1 truncate">
                  <span className="font-semibold text-foreground">
                    {stagedFile.name}
                  </span>
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    ({formatBytes(stagedFile.size)})
                  </span>
                </div>
              </div>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => setStagedFile(null)}
                aria-label="Remove attached file"
              >
                <X className="size-3" />
              </Button>
            </div>
          )}

          {/* Reply Quote Banner */}
          {replyTo && (
            <div className="flex items-center justify-between gap-2 border-t border-border/80 bg-muted/40 px-3.5 py-2 text-xs">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <CornerUpLeft className="size-3.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1 truncate">
                  <span className="font-semibold text-primary">
                    Replying to {replyTo.senderName}:{" "}
                  </span>
                  <span className="text-muted-foreground">
                    {settings.editedContentByMessage[replyTo.id] ?? replyTo.content}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => setReplyTo(null)}
                aria-label="Cancel reply"
              >
                <X className="size-3" />
              </Button>
            </div>
          )}

          {/* Floating @Mention Autocomplete Popover */}
          {showMentionMenu && mentionCandidates.length > 0 && (
            <div className="absolute right-4 bottom-24 left-4 z-30 max-w-xs overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <div className="border-b border-border/60 bg-muted/40 px-3 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                Mention Teammate
              </div>
              <div className="max-h-44 overflow-y-auto p-1">
                {mentionCandidates.map((item) => (
                  <button
                    key={item.handle}
                    type="button"
                    onClick={() => applyMention(item.handle)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                  >
                    <span className="font-semibold text-foreground">{item.label}</span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Floating /Slash Commands Menu */}
          {showSlashMenu && filteredSlashCommands.length > 0 && (
            <div className="absolute right-4 bottom-24 left-4 z-30 max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                Quick Commands
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredSlashCommands.map((item) => (
                  <button
                    key={item.command}
                    type="button"
                    onClick={() => applySlashCommand(item)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                  >
                    <div>
                      <span className="font-mono font-semibold text-primary">
                        {item.command}
                      </span>
                      <span className="ml-2 font-medium text-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute right-4 bottom-24 z-30 shadow-xl">
              <EmojiPicker
                theme={isDark ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                onEmojiClick={(emojiData) => {
                  setDraftText((prev) => prev + emojiData.emoji)
                }}
                height={350}
                width={300}
              />
            </div>
          )}

          {/* Rich Composer Footer */}
          <footer className="border-t border-border/80 bg-card px-3.5 py-2.5">
            {/* Formatting & Quick Action Toolbar */}
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center gap-0.5">
                <input
                  ref={fileAttachmentInputRef}
                  type="file"
                  className="hidden"
                  aria-label="Upload chat file or image"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      setStagedFile(f)
                      e.target.value = ""
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon-xs"
                  variant={stagedFile ? "default" : "ghost"}
                  disabled={!activeChannel}
                  onClick={() => fileAttachmentInputRef.current?.click()}
                  title="Attach file or image"
                  aria-label="Attach file or image"
                >
                  <Paperclip className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={!activeChannel}
                  onClick={() => insertFormatting("**", "**", "bold")}
                  title="Bold (**text**)"
                  aria-label="Format bold"
                >
                  <Bold className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={!activeChannel}
                  onClick={() => insertFormatting("`", "`", "code")}
                  title="Inline code (`code`)"
                  aria-label="Format inline code"
                >
                  <Code className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={!activeChannel}
                  onClick={() =>
                    insertFormatting("```ts\n", "\n```", "// code snippet")
                  }
                  title="Insert code snippet block"
                  aria-label="Insert code block"
                >
                  <Code2 className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={!activeChannel}
                  onClick={() => insertFormatting("", "", "https://")}
                  title="Share link"
                  aria-label="Insert link"
                >
                  <Link2 className="size-3.5" />
                </Button>
                <div className="mx-1 h-3.5 w-px bg-border" />
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={!activeChannel}
                  onClick={() => {
                    setShowMentionMenu((v) => !v)
                    setShowSlashMenu(false)
                  }}
                  className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                  aria-label="Open mention menu"
                >
                  <AtSign className="size-3" />
                  Mention
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={!activeChannel}
                  onClick={() => {
                    setShowSlashMenu((v) => !v)
                    setShowMentionMenu(false)
                  }}
                  className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                  aria-label="Open quick commands"
                >
                  <Terminal className="size-3" />
                  Commands
                </Button>
              </div>
              <span className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:inline-flex">
                {settings.enterToSend ? (
                  <>
                    <ShortcutHint keys={["Enter"]} compact />
                    <span>send</span>
                    <span>·</span>
                    <ShortcutHint keys={["Shift", "Enter"]} compact />
                    <span>new line</span>
                  </>
                ) : (
                  <>
                    <ShortcutHint keys={["mod", "Enter"]} compact />
                    <span>to send</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-end gap-2">
              <Textarea
                ref={composerRef}
                value={draftText}
                onChange={(e) => handleDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && settings.enterToSend) {
                    e.preventDefault()
                    handleSend()
                  } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    handleSend()
                  } else if (e.key === "Escape") {
                    setShowMentionMenu(false)
                    setShowSlashMenu(false)
                  }
                }}
                placeholder={
                  activeChannel
                    ? `Message ${activeChannel.name}... (Type @ to mention, / for commands)`
                    : "Select a chat group..."
                }
                aria-label="Chat message input"
                disabled={!activeChannel || sendMutation.isPending}
                rows={1}
                className="max-h-28 min-h-9 flex-1 resize-none rounded-xl bg-muted/50 px-3 py-2 text-xs"
              />
              <Button
                type="button"
                size="sm"
                disabled={
                  !activeChannel ||
                  sendMutation.isPending ||
                  uploadAttachmentMutation.isPending ||
                  (!draftText.trim() && !stagedFile)
                }
                onClick={() => handleSend()}
                aria-label="Send message"
                className="h-9 shrink-0 rounded-xl px-3.5"
              >
                {sendMutation.isPending || uploadAttachmentMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="mr-1.5 size-3.5" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </footer>
        </section>

        {/* RIGHT DRAWER: Channel Info, Participants, Saved & Shared Links/Snippets */}
        {activeChannel && showInfoDrawer && (
          <ChatInfoPanel
            channel={activeChannel}
            messages={messages}
            initialTab={infoDrawerTab}
            isMuted={settings.mutedChannelIds.includes(activeChannel.id)}
            isPinnedChannel={settings.pinnedChannelIds.includes(activeChannel.id)}
            starredMessageIds={settings.starredMessageIds}
            pinnedMessageIds={activeChannelPinnedIds}
            editedContentByMessage={settings.editedContentByMessage}
            onClose={() => setShowInfoDrawer(false)}
            onToggleMute={() => toggleMuteChannel(activeChannel.id)}
            onTogglePinChannel={() => togglePinChannel(activeChannel.id)}
            onOpenSettings={() => setSettingsOpen(true)}
            onExportChat={handleExportChat}
            onToggleStarMessage={(messageId) => toggleStarMessage(messageId)}
            onTogglePinMessage={(messageId) => handleTogglePinMessage(messageId)}
            onJumpToMessage={handleJumpToMessage}
            onMentionUser={(handle) => applyMention(handle)}
            makeAvatarUrl={makeAvatarSvgDataUri}
          />
        )}
      </div>

      <StartDirectChatDialog
        open={directOpen}
        onOpenChange={setDirectOpen}
        currentUserId={currentUser?.id}
        isPending={startDirectMutation.isPending}
        onSelectUser={(userId) => {
          startDirectMutation.mutate(userId, {
            onSuccess: (channel) => {
              setDirectOpen(false)
              setSelectedChannelId(channel.id)
              setMobileShowChat(true)
            },
          })
        }}
      />

      <CreateChannelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projects={projects}
        isPending={createChannelMutation.isPending}
        onSubmitChannel={(payload) => {
          createChannelMutation.mutate(payload, {
            onSuccess: (created) => {
              setCreateOpen(false)
              setSelectedChannelId(created.id)
            },
          })
        }}
      />

      <ChatSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
        userName={currentUserName}
        userAvatarUrl={currentUser?.avatarUrl}
        activeChannel={activeChannel}
        projects={projects}
        isMuted={
          activeChannel ? settings.mutedChannelIds.includes(activeChannel.id) : false
        }
        onToggleMute={() => {
          if (activeChannel) toggleMuteChannel(activeChannel.id)
        }}
        onExportChat={handleExportChat}
        onUpdateChannel={(data) => {
          if (!activeChannel) return
          updateChannelMutation.mutate(data)
        }}
        isUpdatingChannel={updateChannelMutation.isPending}
      />
    </PageContainer>
  )
}
