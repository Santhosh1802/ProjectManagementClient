import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, Loader2, Lock, PenTool, Sparkles } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import type { RoughnessLevel } from "../types/whiteboard.types"
import type { WhiteboardSettings } from "../hooks/useWhiteboardSettings"

const createWhiteboardSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(180, "Title must be at most 180 characters"),
    visibility: z.enum(["workspace", "project"]),
    projectId: z.string().optional(),
    template: z.enum(["blank", "flowchart", "retro"]),
    autoSaveEnabled: z.boolean(),
    defaultGridMode: z.enum(["dots", "grid", "none"]),
    defaultRoughness: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  })
  .refine(
    (data) => data.visibility === "workspace" || Boolean(data.projectId),
    {
      message: "Please select a project for a project-only whiteboard",
      path: ["projectId"],
    }
  )

type CreateWhiteboardFormValues = z.infer<typeof createWhiteboardSchema>

interface ProjectOption {
  id: string | number
  name: string
}

interface CreateWhiteboardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: ProjectOption[]
  defaultSettings: WhiteboardSettings
  isPending: boolean
  onSubmitBoard: (payload: {
    title: string
    projectId?: string
    canvasJson: string
    meetingNotes: string
    settingsPatch: Partial<WhiteboardSettings>
  }) => void
}

export function CreateWhiteboardDialog({
  open,
  onOpenChange,
  projects,
  defaultSettings,
  isPending,
  onSubmitBoard,
}: CreateWhiteboardDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateWhiteboardFormValues>({
    resolver: zodResolver(createWhiteboardSchema),
    defaultValues: {
      title: "",
      visibility: "workspace",
      projectId: "",
      template: "blank",
      autoSaveEnabled: defaultSettings.autoSaveEnabled,
      defaultGridMode: defaultSettings.defaultGridMode,
      defaultRoughness: defaultSettings.defaultRoughness,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        title: "",
        visibility: "workspace",
        projectId: "",
        template: "blank",
        autoSaveEnabled: defaultSettings.autoSaveEnabled,
        defaultGridMode: defaultSettings.defaultGridMode,
        defaultRoughness: defaultSettings.defaultRoughness,
      })
    }
  }, [open, defaultSettings, reset])

  const visibility = watch("visibility")
  const projectId = watch("projectId")
  const template = watch("template")
  const autoSaveEnabled = watch("autoSaveEnabled")
  const defaultGridMode = watch("defaultGridMode")
  const defaultRoughness = watch("defaultRoughness")

  function onValid(values: CreateWhiteboardFormValues) {
    const canvasJson = "[]"
    let meetingNotes = "## Meeting Agenda\n- \n\n## Action Items\n- "

    if (values.template === "flowchart") {
      meetingNotes =
        "## Architecture / Flow Review\n- \n\n## Decisions\n- \n\n## Action Items\n- "
    } else if (values.template === "retro") {
      meetingNotes =
        "## What went well\n- \n\n## What to improve\n- \n\n## Action Items\n- "
    }

    onSubmitBoard({
      title: values.title.trim(),
      projectId: values.visibility === "project" ? values.projectId : undefined,
      canvasJson,
      meetingNotes,
      settingsPatch: {
        autoSaveEnabled: values.autoSaveEnabled,
        defaultGridMode: values.defaultGridMode,
        defaultRoughness: values.defaultRoughness,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <PenTool className="size-4 text-primary" />
            Create Meeting Whiteboard
          </DialogTitle>
          <DialogDescription>
            Configure board visibility, starter template, and initial studio settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="space-y-4 py-1">
          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="wb-create-title">Board Title</Label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {(watch("title") ?? "").length}/180
              </span>
            </div>
            <Input
              id="wb-create-title"
              maxLength={180}
              placeholder="e.g. Sprint 15 Architecture & API Flow"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Visibility */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(val) => {
                  const next = (val ?? "workspace") as "workspace" | "project"
                  setValue("visibility", next, { shouldValidate: true })
                  if (next === "workspace") {
                    setValue("projectId", "", { shouldValidate: true })
                  }
                }}
              >
                <SelectTrigger aria-label="Create board visibility" className="w-full text-xs">
                  <SelectValue>
                    {visibility === "project" ? (
                      <span className="flex items-center gap-1.5">
                        <Lock className="size-3 text-amber-500" />
                        Project Only
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Eye className="size-3 text-primary" />
                        Workspace-wide
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workspace">Workspace (All members)</SelectItem>
                  <SelectItem value="project">Project Only (Project members)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Starter Template</Label>
              <Select
                value={template}
                onValueChange={(val) =>
                  setValue("template", (val ?? "blank") as "blank" | "flowchart" | "retro")
                }
              >
                <SelectTrigger aria-label="Starter template" className="w-full text-xs">
                  <SelectValue>
                    {template === "flowchart"
                      ? "Flowchart Starter"
                      : template === "retro"
                        ? "Sprint Retro & Notes"
                        : "Blank Canvas"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Blank Canvas</SelectItem>
                  <SelectItem value="flowchart">Flowchart Starter</SelectItem>
                  <SelectItem value="retro">Sprint Retro &amp; Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {visibility === "project" && (
            <div className="space-y-1.5">
              <Label>Target Project (Shared only with project members)</Label>
              <Select
                value={projectId || "none"}
                onValueChange={(val) =>
                  setValue("projectId", val === "none" || !val ? "" : val, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger aria-label="Target project" className="w-full text-xs">
                  <SelectValue placeholder="Select a project...">
                    {projects.find((p) => String(p.id) === projectId)?.name ??
                      "Select a project..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a project...</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={String(p.id)} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-xs text-destructive">{errors.projectId.message}</p>
              )}
            </div>
          )}

          <Separator />

          {/* Initial Board Settings */}
          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-muted-foreground uppercase">
              <Sparkles className="size-3.5 text-primary" />
              Initial Studio Settings
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">Auto-Save &amp; Broadcast</span>
              <Button
                type="button"
                size="xs"
                variant={autoSaveEnabled ? "default" : "outline"}
                onClick={() => setValue("autoSaveEnabled", !autoSaveEnabled)}
              >
                {autoSaveEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">Canvas Grid</span>
              <div className="flex items-center gap-1">
                {(["dots", "grid", "none"] as const).map((g) => (
                  <Button
                    key={g}
                    type="button"
                    size="xs"
                    className="capitalize"
                    variant={defaultGridMode === g ? "default" : "outline"}
                    onClick={() => setValue("defaultGridMode", g)}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">Sketch Sloppiness</span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { lvl: 0, label: "Crisp" },
                    { lvl: 1, label: "Sketch" },
                    { lvl: 2, label: "Rough" },
                  ] as { lvl: RoughnessLevel; label: string }[]
                ).map((r) => (
                  <Button
                    key={r.lvl}
                    type="button"
                    size="xs"
                    variant={defaultRoughness === r.lvl ? "default" : "outline"}
                    onClick={() => setValue("defaultRoughness", r.lvl)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              Create Whiteboard
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
