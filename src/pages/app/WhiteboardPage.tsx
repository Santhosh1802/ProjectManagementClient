import { useCallback, useEffect, useState } from "react"
import {
  Clock,
  Eye,
  FileText,
  FolderKanban,
  LayoutGrid,
  Loader2,
  Lock,
  Maximize2,
  Minimize2,
  PenTool,
  Plus,
  Radio,
  Save,
  Settings,
  Trash2,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ShortcutHint from "@/components/common/ShortcutHint"
import {
  hasAnyModifier,
  isEditableTarget,
  isOverlayOpen,
  toAriaKeyShortcuts,
} from "@/lib/keyboard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { useProjectsQuery } from "@/features/projects/hooks/useProjectsQuery"
import { CreateWhiteboardDialog } from "@/features/whiteboard/components/CreateWhiteboardDialog"
import { MeetingNotesEditor } from "@/features/whiteboard/components/MeetingNotesEditor"
import { WhiteboardCanvas } from "@/features/whiteboard/components/WhiteboardCanvas"
import { WhiteboardsDirectoryView } from "@/features/whiteboard/components/WhiteboardsDirectoryView"
import { WhiteboardSettingsDialog } from "@/features/whiteboard/components/WhiteboardSettingsDialog"
import { useWhiteboardSettings } from "@/features/whiteboard/hooks/useWhiteboardSettings"
import {
  useCreateWhiteboardMutation,
  useDeleteWhiteboardMutation,
  useRealtimeWhiteboard,
  useUpdateWhiteboardMutation,
  useWhiteboardsQuery,
} from "@/features/whiteboard/hooks/useWhiteboardsQuery"
import type { Whiteboard } from "@/features/whiteboard/types/whiteboard.types"

export default function WhiteboardPage() {
  const { settings, updateSettings, resetSettings } = useWhiteboardSettings()
  const [projectFilter, setProjectFilter] = useState<string>("")
  const [showBoardsList, setShowBoardsList] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: projectsData } = useProjectsQuery({ page: 0, size: 50 })
  const projects = Array.isArray(projectsData)
    ? projectsData
    : (projectsData as { content?: { id: string | number; name: string }[] } | undefined)?.content ?? []

  const { data: boards = [], isLoading } = useWhiteboardsQuery(projectFilter || undefined)
  const createMutation = useCreateWhiteboardMutation()
  const deleteMutation = useDeleteWhiteboardMutation()

  const [selectedBoardId, setSelectedBoardId] = useState<string>("")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const activeBoard = boards.find((b) => b.id === selectedBoardId) ?? boards[0] ?? null

  const [title, setTitle] = useState("")
  const [canvasJson, setCanvasJson] = useState("[]")
  const [meetingNotes, setMeetingNotes] = useState("")
  const [showNotes, setShowNotes] = useState(settings.showNotesByDefault)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const updateMutation = useUpdateWhiteboardMutation(activeBoard?.id ?? "")

  useEffect(() => {
    setShowNotes(settings.showNotesByDefault)
  }, [settings.showNotesByDefault])

  useEffect(() => {
    if (!activeBoard) return
    setSelectedBoardId(activeBoard.id)
    setTitle(activeBoard.title)
    setCanvasJson(activeBoard.canvasJson || "[]")
    setMeetingNotes(activeBoard.meetingNotes ?? "")
    setIsDirty(false)
  }, [activeBoard?.id])

  const handleRemoteUpdate = useCallback(
    (remote: Whiteboard) => {
      if (!activeBoard || remote.id !== activeBoard.id) return
      if (remote.version > activeBoard.version) {
        setTitle(remote.title)
        setCanvasJson(remote.canvasJson || "[]")
        setMeetingNotes(remote.meetingNotes ?? "")
        setIsDirty(false)
      }
    },
    [activeBoard]
  )

  useRealtimeWhiteboard(activeBoard?.id, handleRemoteUpdate)

  const handleSave = useCallback(() => {
    if (!activeBoard || !title.trim()) return
    updateMutation.mutate(
      {
        title: title.trim(),
        canvasJson,
        meetingNotes,
      },
      {
        onSuccess: () => setIsDirty(false),
      }
    )
  }, [activeBoard, title, canvasJson, meetingNotes, updateMutation])

  useEffect(() => {
    if (!settings.autoSaveEnabled || !isDirty || !activeBoard || updateMutation.isPending) {
      return
    }
    const timer = window.setTimeout(() => {
      handleSave()
    }, settings.autoSaveIntervalMs)
    return () => window.clearTimeout(timer)
  }, [
    settings.autoSaveEnabled,
    settings.autoSaveIntervalMs,
    isDirty,
    activeBoard,
    updateMutation.isPending,
    handleSave,
  ])

  // Global Ctrl+S / Cmd+S shortcut to save & broadcast + F / Esc focus mode
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        handleSave()
        return
      }
      if (e.defaultPrevented || e.repeat) return
      if (e.key === "Escape" && isFullscreen && !isOverlayOpen()) {
        e.preventDefault()
        setIsFullscreen(false)
        return
      }
      if (
        !hasAnyModifier(e) &&
        !e.shiftKey &&
        !isEditableTarget(e.target) &&
        !isOverlayOpen() &&
        e.key.toLowerCase() === "f"
      ) {
        e.preventDefault()
        setIsFullscreen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleSave, isFullscreen])

  function handleChangeVisibility(projectId: string | null) {
    if (!activeBoard || !title.trim()) return
    updateMutation.mutate(
      {
        title: title.trim(),
        canvasJson,
        meetingNotes,
        projectId: projectId ?? undefined,
        workspaceWide: projectId === null,
      },
      {
        onSuccess: () => setIsDirty(false),
      }
    )
  }

  return (
    <PageContainer className="max-w-none space-y-4">
      {!isFullscreen && (
        <PageHeader
          title="Meeting Whiteboards"
          description="Collaborate in real time with diagrammatic flows, sticky notes, and structured meeting notes."
          actions={
            <Button
              type="button"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-1.5 size-3.5" />
              New Whiteboard
            </Button>
          }
        />
      )}

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading whiteboards...
          </CardContent>
        </Card>
      ) : boards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PenTool className="size-4 text-primary" />
              Create your first meeting whiteboard
            </CardTitle>
            <CardDescription>
              Sketch architecture diagrams, sprint flows, or capture collaborative meeting notes with your team.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : showBoardsList ? (
        <WhiteboardsDirectoryView
          boards={boards}
          activeBoardId={activeBoard?.id}
          onSelectBoard={(id) => {
            setSelectedBoardId(id)
            setShowBoardsList(false)
          }}
          onBackToStudio={() => setShowBoardsList(false)}
        />
      ) : (
        <div
          className={
            isFullscreen
              ? "fixed inset-3 z-50 flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-border bg-background p-3.5 shadow-2xl"
              : "space-y-3"
          }
        >
          {/* Board Switcher & Studio Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex max-w-full flex-wrap items-center gap-2">
              {activeBoard && (
                <Select
                  value={activeBoard.id}
                  onValueChange={(val) => {
                    if (val) setSelectedBoardId(val)
                  }}
                >
                  <SelectTrigger
                    aria-label="Active whiteboard switcher"
                    className="h-8 w-52 sm:w-64 text-xs font-medium"
                  >
                    <SelectValue placeholder="Select whiteboard">
                      <span className="truncate">{activeBoard.title}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        <span className="flex items-center gap-1.5">
                          {b.projectName ? (
                            <Lock className="size-3 shrink-0 text-amber-500" />
                          ) : (
                            <Eye className="size-3 shrink-0 text-muted-foreground" />
                          )}
                          <span className="max-w-[200px] truncate">{b.title}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                type="button"
                size="sm"
                variant={showBoardsList ? "default" : "outline"}
                onClick={() => setShowBoardsList((v) => !v)}
                aria-label="Available whiteboards list"
              >
                <LayoutGrid className="mr-1.5 size-3.5" />
                Boards ({boards.length})
              </Button>
              {projects.length > 0 && (
                <Select
                  value={projectFilter || "all"}
                  onValueChange={(val) => setProjectFilter(val === "all" || !val ? "" : val)}
                >
                  <SelectTrigger aria-label="Filter whiteboards by project" className="h-8 w-44 text-xs">
                    <SelectValue placeholder="All Accessible Boards">
                      {projectFilter
                        ? `Project: ${projects.find((p) => String(p.id) === projectFilter)?.name ?? "Selected"}`
                        : "All Accessible Boards"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accessible Boards</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={String(p.id)} value={String(p.id)}>
                        Project: {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {activeBoard && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1 font-mono text-[11px]">
                  <Radio className="size-3 text-emerald-500" />
                  Live Sync · v{activeBoard.version}
                </Badge>
                <Badge variant="secondary" className="max-w-[200px] gap-1 text-[11px]">
                  {activeBoard.projectName ? (
                    <>
                      <FolderKanban className="size-3 shrink-0" />
                      <span className="truncate">
                        Project Only · {activeBoard.projectName}
                      </span>
                    </>
                  ) : (
                    <>
                      <Eye className="size-3 shrink-0" />
                      <span>Workspace</span>
                    </>
                  )}
                </Badge>
                {settings.autoSaveEnabled && (
                  <Badge variant="outline" className="text-[11px] text-muted-foreground">
                    Auto-save · {settings.autoSaveIntervalMs / 1000}s
                  </Badge>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Whiteboard settings"
                >
                  <Settings className="mr-1.5 size-3.5" />
                  Settings
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNotes((v) => !v)}
                >
                  <FileText className="mr-1.5 size-3.5" />
                  {showNotes ? "Hide Notes" : "Show Notes"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={isFullscreen ? "default" : "outline"}
                  onClick={() => setIsFullscreen((v) => !v)}
                  title={isFullscreen ? "Exit Focus (F or Esc)" : "Focus Mode (F)"}
                  aria-label={isFullscreen ? "Exit focus mode" : "Expand studio"}
                  aria-keyshortcuts="F"
                >
                  {isFullscreen ? (
                    <Minimize2 className="mr-1.5 size-3.5" />
                  ) : (
                    <Maximize2 className="mr-1.5 size-3.5" />
                  )}
                  <span>{isFullscreen ? "Exit Focus" : "Focus"}</span>
                  <ShortcutHint
                    keys={["f"]}
                    compact
                    decorative
                    variant={isFullscreen ? "onPrimary" : "default"}
                    className="ml-1 hidden sm:inline-flex"
                  />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={updateMutation.isPending}
                  onClick={handleSave}
                  aria-keyshortcuts={toAriaKeyShortcuts(["mod", "s"])}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 size-3.5" />
                  )}
                  <span>{isDirty ? "Save & Broadcast" : "Saved"}</span>
                  <ShortcutHint
                    keys={["mod", "s"]}
                    compact
                    decorative
                    variant="onPrimary"
                    className="ml-1.5 hidden sm:inline-flex"
                  />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={deleteMutation.isPending}
                  onClick={() => setDeleteConfirmOpen(true)}
                  aria-label="Delete whiteboard"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>

          {/* Active Board Time & Author Details Strip */}
          {activeBoard && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/25 px-3 py-1.5 text-xs text-muted-foreground">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-semibold text-foreground" title={activeBoard.title}>
                  {activeBoard.title}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground" />
                  Created {format(new Date(activeBoard.createdAt), "MMM d, yyyy · h:mm a")} by{" "}
                  <strong className="font-medium text-foreground">{activeBoard.createdByName}</strong>
                </span>
                <span>
                  Updated {format(new Date(activeBoard.updatedAt), "MMM d, yyyy · h:mm a")} (
                  {formatDistanceToNow(new Date(activeBoard.updatedAt), { addSuffix: true })}) by{" "}
                  <strong className="font-medium text-foreground">{activeBoard.updatedByName}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Flexible Collaborative Canvas + Collapsible Meeting Notes */}
          {activeBoard && (
            <div
              className={`flex flex-col gap-4 xl:flex-row ${
                isFullscreen ? "min-h-0 flex-1 overflow-hidden" : ""
              }`}
            >
              <div
                className={`min-w-0 flex-1 ${
                  isFullscreen
                    ? "h-full min-h-0"
                    : "h-[620px] min-h-[560px] xl:h-[calc(100dvh-13rem)]"
                }`}
              >
                <WhiteboardCanvas
                  boardId={activeBoard.id}
                  canvasJson={canvasJson}
                  settings={settings}
                  onChangeJson={(nextJson) => {
                    setCanvasJson(nextJson)
                    setIsDirty(true)
                  }}
                />
              </div>

              {showNotes && (
                <Card
                  className={`flex w-full shrink-0 flex-col border-border/80 xl:w-80 2xl:w-96 ${
                    isFullscreen
                      ? "h-full min-h-0 overflow-hidden"
                      : "h-[400px] xl:h-[calc(100dvh-13rem)] xl:min-h-[560px]"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="size-4 text-primary" />
                        Meeting Notes &amp; Textual Summary
                      </CardTitle>
                      <Button
                        type="button"
                        size="xs"
                        variant={isDirty ? "default" : "outline"}
                        disabled={updateMutation.isPending || !title.trim()}
                        onClick={handleSave}
                        aria-label="Save meeting notes"
                      >
                        <Save className="mr-1 size-3" />
                        {isDirty ? "Save Notes" : "Saved"}
                      </Button>
                    </div>
                    <CardDescription>
                      Capture agenda, decisions, and action items alongside your diagram.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-2.5 overflow-hidden">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Board Title</span>
                        <span className="font-mono">{title.length}/180</span>
                      </div>
                      <Input
                        value={title}
                        maxLength={180}
                        onChange={(e) => {
                          setTitle(e.target.value)
                          setIsDirty(true)
                        }}
                        placeholder="Board title (max 180 chars)"
                        aria-label="Whiteboard title"
                      />
                    </div>

                    <MeetingNotesEditor
                      boardId={activeBoard.id}
                      boardTitle={title}
                      value={meetingNotes}
                      readOnly={settings.readOnlyMode}
                      onChange={(html) => {
                        setMeetingNotes(html)
                        setIsDirty(true)
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      <CreateWhiteboardDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projects={projects}
        defaultSettings={settings}
        isPending={createMutation.isPending}
        onSubmitBoard={(payload) => {
          updateSettings(payload.settingsPatch)
          createMutation.mutate(
            {
              title: payload.title,
              projectId: payload.projectId,
              canvasJson: payload.canvasJson,
              meetingNotes: payload.meetingNotes,
            },
            {
              onSuccess: (created) => {
                setCreateDialogOpen(false)
                setSelectedBoardId(created.id)
              },
            }
          )
        }}
      />

      <WhiteboardSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
        activeBoard={activeBoard}
        projects={projects}
        onChangeVisibility={handleChangeVisibility}
        isUpdatingVisibility={updateMutation.isPending}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Whiteboard?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong className="text-foreground">{activeBoard?.title}</strong> along with its
              diagram and meeting notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!activeBoard) return
                deleteMutation.mutate(activeBoard.id, {
                  onSuccess: () => setDeleteConfirmOpen(false),
                })
              }}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              Delete Whiteboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
