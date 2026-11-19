import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, Loader2, Lock, MessageSquarePlus } from "lucide-react"
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

const createChannelSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Channel name must be at least 2 characters")
      .max(140, "Channel name must be at most 140 characters"),
    description: z.string().max(300).optional(),
    visibility: z.enum(["workspace", "project"]),
    projectId: z.string().optional(),
  })
  .refine(
    (data) => data.visibility === "workspace" || Boolean(data.projectId),
    {
      message: "Please select a project for a project-only chat group",
      path: ["projectId"],
    }
  )

type CreateChannelFormValues = z.infer<typeof createChannelSchema>

interface CreateChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: { id: string | number; name: string }[]
  isPending: boolean
  onSubmitChannel: (payload: {
    name: string
    description?: string
    projectId?: string
  }) => void
}

export function CreateChannelDialog({
  open,
  onOpenChange,
  projects,
  isPending,
  onSubmitChannel,
}: CreateChannelDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateChannelFormValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "workspace",
      projectId: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        description: "",
        visibility: "workspace",
        projectId: "",
      })
    }
  }, [open, reset])

  const visibility = watch("visibility")
  const projectId = watch("projectId")

  function onValid(values: CreateChannelFormValues) {
    onSubmitChannel({
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      projectId: values.visibility === "project" ? values.projectId : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquarePlus className="size-4 text-primary" />
            New Chat Group
          </DialogTitle>
          <DialogDescription>
            Create a workspace-wide group or a private project-only chat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="chat-channel-name">Group Name</Label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {(watch("name") ?? "").length}/140
              </span>
            </div>
            <Input
              id="chat-channel-name"
              maxLength={140}
              placeholder="e.g. Sprint 15 Standup"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chat-channel-desc">Topic / Description (optional)</Label>
            <Input
              id="chat-channel-desc"
              maxLength={300}
              placeholder="Daily updates, blockers, and quick decisions"
              {...register("description")}
            />
          </div>

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
              <SelectTrigger aria-label="Chat group visibility" className="w-full text-xs">
                <SelectValue>
                  {visibility === "project" ? (
                    <span className="flex items-center gap-1.5">
                      <Lock className="size-3 text-amber-500" />
                      Project Only (Project members)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Eye className="size-3 text-primary" />
                      Workspace (All members)
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

          {visibility === "project" && (
            <div className="space-y-1.5">
              <Label>Target Project</Label>
              <Select
                value={projectId || "none"}
                onValueChange={(val) =>
                  setValue("projectId", val === "none" || !val ? "" : val, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger aria-label="Chat target project" className="w-full text-xs">
                  <SelectValue placeholder="Select project...">
                    {projects.find((p) => String(p.id) === projectId)?.name ??
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
              {errors.projectId && (
                <p className="text-xs text-destructive">{errors.projectId.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
