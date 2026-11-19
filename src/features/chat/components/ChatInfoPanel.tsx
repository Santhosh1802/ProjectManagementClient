import { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  AtSign,
  Bell,
  BellOff,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Info,
  Link2,
  Lock,
  Pin,
  PinOff,
  Settings,
  Star,
  User,
  Users,
  X,
} from "lucide-react"
import {
  formatBytes,
  resolveBackendFileUrl,
} from "@/features/projects/services/projectStorage.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataPagination, { useClientPagination } from "@/components/common/DataPagination"
import { cn } from "@/lib/utils"
import type { ChatChannel, ChatMessage } from "../types/chat.types"
import {
  extractCodeBlocksFromText,
  extractUrlsFromText,
  type ExtractedCodeSnippet,
  type ExtractedLink,
} from "./ChatMessageContent"

export type InfoPanelTab = "overview" | "saved" | "shared"

interface ChatInfoPanelProps {
  channel: ChatChannel
  messages: ChatMessage[]
  initialTab?: InfoPanelTab
  isMuted: boolean
  isPinnedChannel: boolean
  starredMessageIds: string[]
  pinnedMessageIds: string[]
  editedContentByMessage: Record<string, string>
  onClose: () => void
  onToggleMute: () => void
  onTogglePinChannel: () => void
  onOpenSettings: () => void
  onExportChat: () => void
  onToggleStarMessage: (messageId: string) => void
  onTogglePinMessage: (messageId: string) => void
  onJumpToMessage: (messageId: string) => void
  onMentionUser: (handle: string) => void
  makeAvatarUrl: (name: string, isProject: boolean) => string
}

export function ChatInfoPanel({
  channel,
  messages,
  initialTab = "overview",
  isMuted,
  isPinnedChannel,
  starredMessageIds,
  pinnedMessageIds,
  editedContentByMessage,
  onClose,
  onToggleMute,
  onTogglePinChannel,
  onOpenSettings,
  onExportChat,
  onToggleStarMessage,
  onTogglePinMessage,
  onJumpToMessage,
  onMentionUser,
  makeAvatarUrl,
}: ChatInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<InfoPanelTab>(initialTab)

  const participants = useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; avatarUrl?: string | null; count: number; lastActive: string }
    >()
    for (const msg of messages) {
      const key = msg.senderEmail.toLowerCase() || msg.senderName
      const existing = map.get(key)
      if (existing) {
        existing.count += 1
        existing.lastActive = msg.createdAt
        if (!existing.avatarUrl && msg.senderAvatarUrl) {
          existing.avatarUrl = msg.senderAvatarUrl
        }
      } else {
        map.set(key, {
          name: msg.senderName,
          email: msg.senderEmail,
          avatarUrl: msg.senderAvatarUrl,
          count: 1,
          lastActive: msg.createdAt,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [messages])

  const pinnedMessages = useMemo(
    () => messages.filter((m) => Boolean(m.pinned) || pinnedMessageIds.includes(m.id)),
    [messages, pinnedMessageIds]
  )

  const starredMessages = useMemo(
    () => messages.filter((m) => starredMessageIds.includes(m.id)),
    [messages, starredMessageIds]
  )

  const sharedLinks = useMemo<ExtractedLink[]>(() => {
    const items: ExtractedLink[] = []
    for (const msg of messages) {
      const body = editedContentByMessage[msg.id] ?? msg.content
      const urls = extractUrlsFromText(body)
      for (const url of urls) {
        items.push({
          url,
          messageId: msg.id,
          senderName: msg.senderName,
          createdAt: msg.createdAt,
        })
      }
    }
    return items.reverse()
  }, [messages, editedContentByMessage])

  const sharedSnippets = useMemo<ExtractedCodeSnippet[]>(() => {
    const items: ExtractedCodeSnippet[] = []
    for (const msg of messages) {
      const body = editedContentByMessage[msg.id] ?? msg.content
      const blocks = extractCodeBlocksFromText(body)
      for (const block of blocks) {
        items.push({
          language: block.language,
          code: block.code,
          messageId: msg.id,
          senderName: msg.senderName,
          createdAt: msg.createdAt,
        })
      }
    }
    return items.reverse()
  }, [messages, editedContentByMessage])

  const sharedFiles = useMemo(
    () => messages.filter((m) => Boolean(m.attachmentUrl)).reverse(),
    [messages]
  )

  const createdDateText = useMemo(() => {
    const raw = channel.createdAt as string | number | null | undefined
    if (raw === null || raw === undefined || raw === "") return "Recently"
    const num = typeof raw === "number" ? raw : Number(raw)
    const d = !Number.isNaN(num)
      ? new Date(num < 1e11 ? Math.round(num * 1000) : num)
      : new Date(String(raw))
    if (Number.isNaN(d.getTime()) || d.getFullYear() <= 1970) return "Recently"
    return format(d, "MMM d, yyyy")
  }, [channel.createdAt])

  const participantsPag = useClientPagination(participants, 6)
  const pinnedPag = useClientPagination(pinnedMessages, 5)
  const starredPag = useClientPagination(starredMessages, 5)
  const filesPag = useClientPagination(sharedFiles, 5)
  const linksPag = useClientPagination(sharedLinks, 5)
  const snippetsPag = useClientPagination(sharedSnippets, 4)

  return (
    <aside
      aria-label="Channel details drawer"
      className="absolute inset-y-0 right-0 z-30 flex h-full w-full flex-col border-l border-border/80 bg-card shadow-lg sm:w-80 xl:static xl:w-88 xl:shadow-none shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-primary" />
          <h3 className="text-xs font-semibold tracking-tight uppercase text-muted-foreground">
            Channel Info
          </h3>
        </div>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          onClick={onClose}
          aria-label="Close channel info drawer"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1 border-b border-border/70 bg-muted/30 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors",
            activeTab === "overview"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="size-3" />
          <span>Overview</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={cn(
            "flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors",
            activeTab === "saved"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Pin className="size-3" />
          <span>Saved</span>
          {pinnedMessages.length + starredMessages.length > 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
              {pinnedMessages.length + starredMessages.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("shared")}
          className={cn(
            "flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors",
            activeTab === "shared"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link2 className="size-3" />
          <span>Shared</span>
          {sharedFiles.length + sharedLinks.length + sharedSnippets.length > 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
              {sharedFiles.length + sharedLinks.length + sharedSnippets.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "overview" && (
          <>
            {/* Channel Identity Card */}
            <div className="flex flex-col items-center rounded-xl border border-border/70 bg-muted/20 p-4 text-center">
              <img
                src={
                  channel.directUserAvatarUrl ||
                  makeAvatarUrl(channel.name, Boolean(channel.projectId))
                }
                alt={channel.name}
                className="mb-2.5 size-14 rounded-full border-2 border-primary/25 object-cover shadow-xs"
              />
              <h4 className="text-sm font-semibold text-foreground">{channel.name}</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                {channel.description || "No topic description set for this conversation."}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  {channel.channelType === "DIRECT" ? (
                    <>
                      <User className="size-2.5" />
                      Direct Message
                    </>
                  ) : channel.projectName ? (
                    <>
                      <Lock className="size-2.5" />
                      Project · {channel.projectName}
                    </>
                  ) : (
                    <>
                      <Eye className="size-2.5" />
                      Workspace
                    </>
                  )}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {messages.length} {messages.length === 1 ? "message" : "messages"}
                </Badge>
              </div>

              <div className="mt-2 text-[11px] text-muted-foreground">
                Created by <span className="font-medium text-foreground">{channel.createdByName}</span> ·{" "}
                {createdDateText}
              </div>
            </div>

            {/* Quick Channel Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="xs"
                variant={isPinnedChannel ? "default" : "outline"}
                onClick={onTogglePinChannel}
                className="justify-center gap-1.5"
              >
                {isPinnedChannel ? (
                  <>
                    <PinOff className="size-3" />
                    Unpin Chat
                  </>
                ) : (
                  <>
                    <Pin className="size-3" />
                    Pin Chat
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="xs"
                variant={isMuted ? "secondary" : "outline"}
                onClick={onToggleMute}
                className="justify-center gap-1.5"
              >
                {isMuted ? (
                  <>
                    <Bell className="size-3" />
                    Unmute
                  </>
                ) : (
                  <>
                    <BellOff className="size-3" />
                    Mute
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={onOpenSettings}
                className="justify-center gap-1.5"
              >
                <Settings className="size-3" />
                Edit Group
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={onExportChat}
                className="justify-center gap-1.5"
              >
                <Download className="size-3" />
                Export .txt
              </Button>
            </div>

            {/* Active Participants */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Active Participants
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {participants.length}
                </Badge>
              </div>
              {participants.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  No messages sent in this conversation yet.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    {participantsPag.paginatedItems.map((p) => {
                      const mentionHandle = p.name.replace(/\s+/g, "")
                      return (
                        <div
                          key={p.email || p.name}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <img
                              src={p.avatarUrl || makeAvatarUrl(p.name, false)}
                              alt={p.name}
                              className="size-7 shrink-0 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-foreground">
                                {p.name}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {p.count} {p.count === 1 ? "msg" : "msgs"}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            title={`Mention @${mentionHandle}`}
                            aria-label={`Mention ${p.name}`}
                            onClick={() => onMentionUser(mentionHandle)}
                          >
                            <AtSign className="size-3 text-primary" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                  <DataPagination
                    compact
                    page={participantsPag.page}
                    totalPages={participantsPag.totalPages}
                    totalElements={participantsPag.totalElements}
                    pageSize={participantsPag.pageSize}
                    itemLabel="participants"
                    onPageChange={participantsPag.setPage}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            {/* Pinned Messages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Pin className="size-3 text-primary" />
                  Pinned Messages
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {pinnedMessages.length}
                </Badge>
              </div>

              {pinnedMessages.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Hover any message and click the pin icon to highlight key decisions here.
                </p>
              ) : (
                <div className="space-y-2">
                  {pinnedPag.paginatedItems.map((m) => {
                    const body = editedContentByMessage[m.id] ?? m.content
                    return (
                      <div
                        key={m.id}
                        className="rounded-lg border border-border/80 bg-muted/25 p-2.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-primary">{m.senderName}</span>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => onTogglePinMessage(m.id)}
                            title="Unpin message"
                            aria-label="Unpin message"
                          >
                            <PinOff className="size-3" />
                          </Button>
                        </div>
                        <p className="line-clamp-3 break-words text-foreground">{body}</p>
                        <button
                          type="button"
                          onClick={() => onJumpToMessage(m.id)}
                          className="text-[11px] font-medium text-primary hover:underline"
                        >
                          Jump to message →
                        </button>
                      </div>
                    )
                  })}
                  <DataPagination
                    compact
                    page={pinnedPag.page}
                    totalPages={pinnedPag.totalPages}
                    totalElements={pinnedPag.totalElements}
                    pageSize={pinnedPag.pageSize}
                    itemLabel="pinned"
                    onPageChange={pinnedPag.setPage}
                  />
                </div>
              )}
            </div>

            {/* Starred Messages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  Starred Messages
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {starredMessages.length}
                </Badge>
              </div>

              {starredMessages.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  No starred messages in this channel yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {starredPag.paginatedItems.map((m) => {
                    const body = editedContentByMessage[m.id] ?? m.content
                    return (
                      <div
                        key={m.id}
                        className="rounded-lg border border-border/80 bg-muted/25 p-2.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">{m.senderName}</span>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => onToggleStarMessage(m.id)}
                            title="Unstar message"
                            aria-label="Unstar message"
                          >
                            <Star className="size-3 fill-primary text-primary" />
                          </Button>
                        </div>
                        <p className="line-clamp-3 break-words text-muted-foreground">{body}</p>
                        <button
                          type="button"
                          onClick={() => onJumpToMessage(m.id)}
                          className="text-[11px] font-medium text-primary hover:underline"
                        >
                          Jump to message →
                        </button>
                      </div>
                    )
                  })}
                  <DataPagination
                    compact
                    page={starredPag.page}
                    totalPages={starredPag.totalPages}
                    totalElements={starredPag.totalElements}
                    pageSize={starredPag.pageSize}
                    itemLabel="starred"
                    onPageChange={starredPag.setPage}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "shared" && (
          <div className="space-y-4">
            {/* Shared Files & Images */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <FileText className="size-3 text-primary" />
                  Files &amp; Images
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {sharedFiles.length}
                </Badge>
              </div>

              {sharedFiles.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Files and images shared in this chat will appear here.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    {filesPag.paginatedItems.map((m) => {
                      const url = resolveBackendFileUrl(m.attachmentUrl)
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/20 p-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate font-medium text-primary hover:underline"
                            >
                              {m.attachmentName ?? "Attachment"}
                            </a>
                            <span className="text-[10px] text-muted-foreground">
                              {formatBytes(m.attachmentSize)} · {m.senderName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onJumpToMessage(m.id)}
                            className="shrink-0 text-[11px] font-medium text-primary hover:underline"
                          >
                            Jump
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <DataPagination
                    compact
                    page={filesPag.page}
                    totalPages={filesPag.totalPages}
                    totalElements={filesPag.totalElements}
                    pageSize={filesPag.pageSize}
                    itemLabel="files"
                    onPageChange={filesPag.setPage}
                  />
                </div>
              )}
            </div>

            {/* Shared Links */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Link2 className="size-3 text-primary" />
                  Shared Links
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {sharedLinks.length}
                </Badge>
              </div>

              {sharedLinks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Links shared in the chat will automatically appear here.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    {linksPag.paginatedItems.map((item, idx) => (
                      <div
                        key={`${item.messageId}-${idx}`}
                        className="rounded-lg border border-border/70 bg-muted/20 p-2.5 text-xs space-y-1"
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-1.5 font-medium text-primary hover:underline"
                        >
                          <span className="truncate">{item.url}</span>
                          <ExternalLink className="size-3 shrink-0" />
                        </a>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Shared by {item.senderName}</span>
                          <button
                            type="button"
                            onClick={() => onJumpToMessage(item.messageId)}
                            className="text-primary hover:underline"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <DataPagination
                    compact
                    page={linksPag.page}
                    totalPages={linksPag.totalPages}
                    totalElements={linksPag.totalElements}
                    pageSize={linksPag.pageSize}
                    itemLabel="links"
                    onPageChange={linksPag.setPage}
                  />
                </div>
              )}
            </div>

            {/* Shared Code Snippets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Code2 className="size-3 text-primary" />
                  Code Snippets
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {sharedSnippets.length}
                </Badge>
              </div>

              {sharedSnippets.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Code blocks wrapped in ``` will be indexed here.
                </p>
              ) : (
                <div className="space-y-2">
                  {snippetsPag.paginatedItems.map((snip, idx) => (
                    <div
                      key={`${snip.messageId}-${idx}`}
                      className="overflow-hidden rounded-lg border border-border/80 bg-muted/30 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-border/60 bg-muted/60 px-2.5 py-1 text-[10px]">
                        <span className="font-mono uppercase text-muted-foreground">
                          {snip.language} · {snip.senderName}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void navigator.clipboard?.writeText(snip.code)}
                            className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-muted-foreground hover:text-foreground"
                            title="Copy snippet"
                          >
                            <Copy className="size-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onJumpToMessage(snip.messageId)}
                            className="text-primary hover:underline"
                          >
                            Jump
                          </button>
                        </div>
                      </div>
                      <pre className="max-h-28 overflow-auto p-2 font-mono text-[11px]">
                        <code>{snip.code}</code>
                      </pre>
                    </div>
                  ))}
                  <DataPagination
                    compact
                    page={snippetsPag.page}
                    totalPages={snippetsPag.totalPages}
                    totalElements={snippetsPag.totalElements}
                    pageSize={snippetsPag.pageSize}
                    itemLabel="snippets"
                    onPageChange={snippetsPag.setPage}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
