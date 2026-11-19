import { useEffect, useState } from "react"
import {
  Eye,
  Grid3X3,
  Lock,
  Palette,
  RotateCcw,
  Save,
  Settings2,
} from "lucide-react"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { RoughnessLevel, Whiteboard } from "../types/whiteboard.types"
import type { WhiteboardSettings } from "../hooks/useWhiteboardSettings"

interface WhiteboardSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: WhiteboardSettings
  onUpdateSettings: (patch: Partial<WhiteboardSettings>) => void
  onResetSettings: () => void
  activeBoard: Whiteboard | null
  projects?: { id: string | number; name: string }[]
  onChangeVisibility?: (projectId: string | null) => void
  isUpdatingVisibility?: boolean
}

type ModalTab = "general" | "canvas" | "visibility"

const MODAL_TABS: {
  id: ModalTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "general", label: "Auto-Save", icon: Save },
  { id: "canvas", label: "Canvas & Style", icon: Palette },
  { id: "visibility", label: "Visibility", icon: Eye },
]

function ToggleChip({
  checked,
  onClick,
  label,
}: {
  checked: boolean
  onClick: () => void
  label: string
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

export function WhiteboardSettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  onResetSettings,
  activeBoard,
  projects = [],
  onChangeVisibility,
  isUpdatingVisibility = false,
}: WhiteboardSettingsDialogProps) {
  const [tab, setTab] = useState<ModalTab>("general")
  const [visScope, setVisScope] = useState<"workspace" | "project">(
    activeBoard?.projectId ? "project" : "workspace"
  )
  const [visProjectId, setVisProjectId] = useState<string>(
    activeBoard?.projectId ?? ""
  )

  useEffect(() => {
    setVisScope(activeBoard?.projectId ? "project" : "workspace")
    setVisProjectId(activeBoard?.projectId ?? "")
  }, [activeBoard?.id, activeBoard?.projectId, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/70 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings2 className="size-4 text-primary" />
            Whiteboard Settings
          </DialogTitle>
          <DialogDescription>
            Configure auto-save, canvas defaults, and board visibility.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col sm:flex-row">
          {/* Left Category Rail */}
          <nav
            aria-label="Whiteboard settings sections"
            className="flex shrink-0 gap-1 border-b border-border/70 bg-muted/25 p-2.5 sm:w-44 sm:flex-col sm:border-r sm:border-b-0"
          >
            {MODAL_TABS.map((t) => {
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

          {/* Tab Content */}
          <div className="min-w-0 flex-1 overflow-y-auto p-5 text-sm">
            {tab === "general" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">Auto-Save Changes</div>
                      <p className="text-xs text-muted-foreground">
                        Automatically save and broadcast updates to collaborators after you pause editing.
                      </p>
                    </div>
                    <ToggleChip
                      checked={settings.autoSaveEnabled}
                      label="Auto-Save Changes"
                      onClick={() =>
                        onUpdateSettings({
                          autoSaveEnabled: !settings.autoSaveEnabled,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Auto-Save Delay
                    </span>
                    <div className="flex items-center gap-1.5">
                      {([2000, 5000, 10000] as const).map((ms) => (
                        <Button
                          key={ms}
                          type="button"
                          size="xs"
                          variant={
                            settings.autoSaveIntervalMs === ms
                              ? "default"
                              : "outline"
                          }
                          disabled={!settings.autoSaveEnabled}
                          onClick={() =>
                            onUpdateSettings({ autoSaveIntervalMs: ms })
                          }
                        >
                          {ms / 1000}s
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">Show Style Panel by Default</div>
                      <p className="text-xs text-muted-foreground">
                        Keep the left stroke, fill, and sloppiness inspector open.
                      </p>
                    </div>
                    <ToggleChip
                      checked={settings.showPropertiesByDefault}
                      label="Show Style Panel by Default"
                      onClick={() =>
                        onUpdateSettings({
                          showPropertiesByDefault:
                            !settings.showPropertiesByDefault,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                    <div>
                      <div className="font-medium">Show Meeting Notes by Default</div>
                      <p className="text-xs text-muted-foreground">
                        Display the textual agenda &amp; action items pane beside the canvas.
                      </p>
                    </div>
                    <ToggleChip
                      checked={settings.showNotesByDefault}
                      label="Show Meeting Notes by Default"
                      onClick={() =>
                        onUpdateSettings({
                          showNotesByDefault: !settings.showNotesByDefault,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === "canvas" && (
              <div className="space-y-4">
                {/* Visual Grid Mode Cards */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                    <Grid3X3 className="size-3.5" />
                    Default Canvas Grid
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        {
                          id: "dots",
                          label: "Dots",
                          bg: "bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] [background-size:10px_10px]",
                        },
                        {
                          id: "grid",
                          label: "Grid",
                          bg: "bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:10px_10px]",
                        },
                        { id: "none", label: "Clean", bg: "bg-background" },
                      ] as const
                    ).map((g) => {
                      const active = settings.defaultGridMode === g.id
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() =>
                            onUpdateSettings({ defaultGridMode: g.id })
                          }
                          className={cn(
                            "flex flex-col gap-1.5 rounded-xl border p-2 text-left transition-all",
                            active
                              ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                              : "border-border/70 hover:border-primary/50"
                          )}
                        >
                          <div
                            className={cn(
                              "h-10 w-full rounded-md border border-border/60",
                              g.bg
                            )}
                          />
                          <span className="text-xs font-semibold">{g.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Visual Sloppiness Cards */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase">
                    Default Sketch Sloppiness
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        { lvl: 0, label: "Crisp" },
                        { lvl: 1, label: "Sketch" },
                        { lvl: 2, label: "Rough" },
                      ] as { lvl: RoughnessLevel; label: string }[]
                    ).map((r) => {
                      const active = settings.defaultRoughness === r.lvl
                      return (
                        <button
                          key={r.lvl}
                          type="button"
                          onClick={() =>
                            onUpdateSettings({ defaultRoughness: r.lvl })
                          }
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all",
                            active
                              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/40"
                              : "border-border/70 text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          <svg
                            viewBox="0 0 36 14"
                            className="h-4 w-9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          >
                            {r.lvl === 0 && <path d="M2 7 L34 7" />}
                            {r.lvl === 1 && <path d="M2 7 Q 10 3 18 7 T 34 7" />}
                            {r.lvl === 2 && (
                              <path d="M2 8 Q 8 2 14 8 T 26 5 T 34 8 M3 5 Q 11 10 21 4 T 33 6" />
                            )}
                          </svg>
                          <span className="text-xs font-semibold">{r.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Snap to Grid */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5">
                  <div>
                    <div className="font-medium">Snap to Grid</div>
                    <p className="text-xs text-muted-foreground">
                      Align shapes and connectors to {settings.gridSize}px increments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {([16, 24] as const).map((sz) => (
                        <Button
                          key={sz}
                          type="button"
                          size="xs"
                          variant={settings.gridSize === sz ? "secondary" : "outline"}
                          onClick={() => onUpdateSettings({ gridSize: sz })}
                        >
                          {sz}px
                        </Button>
                      ))}
                    </div>
                    <ToggleChip
                      checked={settings.snapToGrid}
                      label="Snap to Grid"
                      onClick={() =>
                        onUpdateSettings({ snapToGrid: !settings.snapToGrid })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === "visibility" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-muted-foreground">Board visibility</span>
                    <Badge variant="secondary">
                      {activeBoard?.projectName
                        ? `Project Only: ${activeBoard.projectName} (Project members only)`
                        : "Workspace-wide (All workspace members)"}
                    </Badge>
                  </div>
                  {activeBoard && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground">
                      <span>
                        Created by{" "}
                        <strong className="text-foreground">
                          {activeBoard.createdByName}
                        </strong>
                      </span>
                      <span>Delete: Creator, Owner, or Admin</span>
                    </div>
                  )}
                </div>

                {activeBoard && onChangeVisibility && (
                  <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">
                        Change Board Visibility
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Switch between sharing with the whole workspace or restricting to project members only.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={visScope}
                        onValueChange={(val) => {
                          const next = (val ?? "workspace") as "workspace" | "project"
                          setVisScope(next)
                          if (next === "workspace") setVisProjectId("")
                        }}
                      >
                        <SelectTrigger aria-label="Change board visibility scope" className="h-8 w-52 text-xs">
                          <SelectValue>
                            {visScope === "project"
                              ? "Project Only (Project members)"
                              : "Workspace (All members)"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workspace">Workspace (All members)</SelectItem>
                          <SelectItem value="project">Project Only (Project members)</SelectItem>
                        </SelectContent>
                      </Select>

                      {visScope === "project" && (
                        <Select
                          value={visProjectId || "none"}
                          onValueChange={(val) =>
                            setVisProjectId(val === "none" || !val ? "" : val)
                          }
                        >
                          <SelectTrigger aria-label="Change board project" className="h-8 w-44 text-xs">
                            <SelectValue placeholder="Select project...">
                              {projects.find((p) => String(p.id) === visProjectId)?.name ??
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
                          isUpdatingVisibility ||
                          (visScope === "project" && !visProjectId)
                        }
                        onClick={() =>
                          onChangeVisibility(visScope === "project" ? visProjectId : null)
                        }
                      >
                        Apply Visibility
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Lock className="size-3.5 text-primary" />
                      Presentation (Read-Only) Mode
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lock editing so you can pan, zoom, and present safely during meetings.
                    </p>
                  </div>
                  <ToggleChip
                    checked={settings.readOnlyMode}
                    label="Presentation Read-Only Mode"
                    onClick={() =>
                      onUpdateSettings({ readOnlyMode: !settings.readOnlyMode })
                    }
                  />
                </div>
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
