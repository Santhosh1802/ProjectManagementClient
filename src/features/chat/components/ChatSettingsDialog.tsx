import { useEffect, useState } from "react"
import {
  BellOff,
  Download,
  ExternalLink,
  Eye,
  Lock,
  MessageSquare,
  RotateCcw,
  Settings2,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ChatChannel, UpdateChannelRequest } from "../types/chat.types"
import type { ChatSettings } from "../hooks/useChatSettings"

interface ChatSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: ChatSettings
  onUpdateSettings: (patch: Partial<ChatSettings>) => void
  onResetSettings: () => void
  userName: string
  userAvatarUrl?: string | null
  activeChannel: ChatChannel | null
  projects: { id: string | number; name: string }[]
  isMuted: boolean
  onToggleMute: () => void
  onExportChat: () => void
  onUpdateChannel?: (data: UpdateChannelRequest) => void
  isUpdatingChannel?: boolean
}

type ModalTab = "preferences" | "group"

const TABS: {
  id: ModalTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "preferences", label: "Chat Preferences", icon: MessageSquare },
  { id: "group", label: "Group & Visibility", icon: Eye },
]

function ToggleChip({
  checked,
  label,
  onClick,
}: {
  checked: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      role="switch"
      size="sm"
      variant={checked ? "default" : "outline"}
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className="h-7 rounded-full px-3 text-xs font-medium"
    >
      {checked ? "Enabled" : "Disabled"}
    </Button>
  )
}

export function ChatSettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  onResetSettings,
  userName,
  userAvatarUrl,
  activeChannel,
  projects,
  isMuted,
  onToggleMute,
  onExportChat,
  onUpdateChannel,
  isUpdatingChannel = false,
}: ChatSettingsDialogProps) {
  const [tab, setTab] = useState<ModalTab>("preferences")

  const [groupName, setGroupName] = useState(activeChannel?.name ?? "")
  const [groupDesc, setGroupDesc] = useState(activeChannel?.description ?? "")
  const [groupScope, setGroupScope] = useState<"workspace" | "project">(
    activeChannel?.projectId ? "project" : "workspace"
  )
  const [groupProjectId, setGroupProjectId] = useState(activeChannel?.projectId ?? "")

  useEffect(() => {
    setGroupName(activeChannel?.name ?? "")
    setGroupDesc(activeChannel?.description ?? "")
    setGroupScope(activeChannel?.projectId ? "project" : "workspace")
    setGroupProjectId(activeChannel?.projectId ?? "")
  }, [
    activeChannel?.id,
    activeChannel?.name,
    activeChannel?.description,
    activeChannel?.projectId,
    open,
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/70 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings2 className="size-4 text-primary" />
            Chat Settings
          </DialogTitle>
          <DialogDescription>
            Customize your availability status, messaging behavior, and group visibility.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col sm:flex-row">
          <nav
            aria-label="Chat settings sections"
            className="flex shrink-0 gap-1 border-b border-border/70 bg-muted/25 p-2.5 sm:w-48 sm:flex-col sm:border-r sm:border-b-0"
          >
            {TABS.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <Button
                  key={t.id}
                  type="button"
                  size="sm"
                  variant={active ? "secondary" : "ghost"}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "justify-start gap-2 px-3 py-2 text-xs font-medium",
                    active && "bg-primary/15 text-primary hover:bg-primary/20"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{t.label}</span>
                </Button>
              )
            })}
          </nav>

          <div className="min-w-0 flex-1 overflow-y-auto p-5 text-sm">
            {tab === "preferences" && (
              <div className="space-y-4">
                {/* Centralized Profile Picture Notice */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/40 bg-primary/10 text-sm font-semibold text-primary">
                      {userAvatarUrl ? (
                        <img
                          src={userAvatarUrl}
                          alt={userName}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span>{userName.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-foreground">
                        {userName}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Profile picture is centrally managed in your Account Profile.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    nativeButton={false}
                    onClick={() => onOpenChange(false)}
                    render={<Link to="/app/profile" />}
                  >
                    <span>Manage in Profile</span>
                    <ExternalLink className="ml-1 size-3" />
                  </Button>
                </div>

                {/* Availability Status */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Availability Status</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Available", "In a meeting", "Focus mode", "Busy"].map((st) => (
                      <Button
                        key={st}
                        type="button"
                        size="xs"
                        variant={settings.statusText === st ? "default" : "outline"}
                        onClick={() => onUpdateSettings({ statusText: st })}
                      >
                        {st}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5">
                  <div>
                    <div className="font-medium">Enter to Send</div>
                    <p className="text-xs text-muted-foreground">
                      Press Enter to send messages, or disable to use Ctrl+Enter.
                    </p>
                  </div>
                  <ToggleChip
                    checked={settings.enterToSend}
                    label="Enter to Send"
                    onClick={() =>
                      onUpdateSettings({ enterToSend: !settings.enterToSend })
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5">
                  <div>
                    <div className="font-medium">Read Receipts (✓✓)</div>
                    <p className="text-xs text-muted-foreground">
                      Display WhatsApp-style double-check delivery &amp; read ticks on sent messages.
                    </p>
                  </div>
                  <ToggleChip
                    checked={settings.showReadReceipts}
                    label="Read Receipts"
                    onClick={() =>
                      onUpdateSettings({
                        showReadReceipts: !settings.showReadReceipts,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5">
                  <div>
                    <div className="font-medium">Compact Message Density</div>
                    <p className="text-xs text-muted-foreground">
                      Show tighter vertical spacing between message bubbles.
                    </p>
                  </div>
                  <ToggleChip
                    checked={settings.compactMode}
                    label="Compact Message Density"
                    onClick={() =>
                      onUpdateSettings({ compactMode: !settings.compactMode })
                    }
                  />
                </div>
              </div>
            )}

            {tab === "group" && (
              <div className="space-y-4">
                {activeChannel ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-muted/30 p-3 text-xs">
                      <span className="text-muted-foreground">Current visibility</span>
                      <Badge variant="secondary" className="gap-1">
                        {activeChannel.projectName ? (
                          <>
                            <Lock className="size-3" />
                            Project Only · {activeChannel.projectName}
                          </>
                        ) : (
                          <>
                            <Eye className="size-3" />
                            Workspace (All members)
                          </>
                        )}
                      </Badge>
                    </div>

                    {onUpdateChannel && (
                      <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="chat-edit-group-name" className="text-xs">
                            Group Name
                          </Label>
                          <Input
                            id="chat-edit-group-name"
                            maxLength={140}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="chat-edit-group-desc" className="text-xs">
                            Topic / Description
                          </Label>
                          <Input
                            id="chat-edit-group-desc"
                            maxLength={300}
                            value={groupDesc}
                            onChange={(e) => setGroupDesc(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Select
                            value={groupScope}
                            onValueChange={(val) => {
                              const next = (val ?? "workspace") as "workspace" | "project"
                              setGroupScope(next)
                              if (next === "workspace") setGroupProjectId("")
                            }}
                          >
                            <SelectTrigger aria-label="Edit group visibility" className="h-8 w-52 text-xs">
                              <SelectValue>
                                {groupScope === "project"
                                  ? "Project Only (Project members)"
                                  : "Workspace (All members)"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="workspace">Workspace (All members)</SelectItem>
                              <SelectItem value="project">Project Only (Project members)</SelectItem>
                            </SelectContent>
                          </Select>

                          {groupScope === "project" && (
                            <Select
                              value={groupProjectId || "none"}
                              onValueChange={(val) =>
                                setGroupProjectId(val === "none" || !val ? "" : val)
                              }
                            >
                              <SelectTrigger aria-label="Edit group project" className="h-8 w-44 text-xs">
                                <SelectValue placeholder="Select project...">
                                  {projects.find((p) => String(p.id) === groupProjectId)?.name ??
                                    "Select project..."}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Select project...</SelectItem>
                                {projects.map((p) => (
                                  <SelectItem key={String(p.id)} value={String(p.id)}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              isUpdatingChannel ||
                              !groupName.trim() ||
                              (groupScope === "project" && !groupProjectId)
                            }
                            onClick={() =>
                              onUpdateChannel({
                                name: groupName.trim(),
                                description: groupDesc.trim(),
                                projectId: groupScope === "project" ? groupProjectId : undefined,
                                workspaceWide: groupScope === "workspace",
                              })
                            }
                          >
                            Save Group
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-card p-3.5">
                      <Button type="button" size="sm" variant="outline" onClick={onToggleMute}>
                        <BellOff className="mr-1.5 size-3.5" />
                        {isMuted ? "Unmute Group" : "Mute Group"}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={onExportChat}>
                        <Download className="mr-1.5 size-3.5" />
                        Export Chat (.txt)
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Select a chat group to manage its visibility and settings.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 px-5 py-3 sm:justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={onResetSettings}>
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset Defaults
          </Button>
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
