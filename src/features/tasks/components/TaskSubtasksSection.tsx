import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckSquare,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react"

import DataPagination, { useClientPagination } from "@/components/common/DataPagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import {
  useCreateSubtaskMutation,
  useDeleteSubtaskMutation,
  useReorderSubtasksMutation,
  useTaskSubtasksQuery,
  useUpdateSubtaskMutation,
} from "@/features/tasks/hooks/useTasksQuery"
import {
  createSubtaskSchema,
  type CreateSubtaskFormValues,
} from "@/features/tasks/schema/task.schema"
import type { TaskSubtask } from "@/features/tasks/types/task.types"
import { getApiErrorMessage } from "@/lib/apiError"
import { cn } from "@/lib/utils"

export interface SubtaskMemberOption {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface TaskSubtasksSectionProps {
  taskId: string
  projectId?: string
  projectMembers: SubtaskMemberOption[]
  canManage?: boolean
}

const UNASSIGNED_VALUE = "__UNASSIGNED__"

function formatMemberName(member: {
  firstName?: string
  lastName?: string
  email?: string
}): string {
  const full = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim()
  return full || member.email || "Member"
}

/**
 * Displays and manages task subtasks / checklist items with inline creation,
 * completion toggles, assignee selection, inline title editing, and reordering.
 */
export default function TaskSubtasksSection({
  taskId,
  projectId,
  projectMembers,
  canManage = true,
}: TaskSubtasksSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const { data: subtasks = [], isLoading } = useTaskSubtasksQuery(taskId)
  const createMutation = useCreateSubtaskMutation(taskId, projectId)
  const updateMutation = useUpdateSubtaskMutation(taskId, projectId)
  const reorderMutation = useReorderSubtasksMutation(taskId)
  const deleteMutation = useDeleteSubtaskMutation(taskId, projectId)

  const pagination = useClientPagination(subtasks, 8)

  const memberById = useMemo(() => {
    const map = new Map<string, SubtaskMemberOption>()
    for (const member of projectMembers) {
      if (member.id) {
        map.set(member.id, member)
      }
    }
    return map
  }, [projectMembers])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSubtaskFormValues>({
    resolver: zodResolver(createSubtaskSchema),
    defaultValues: {
      title: "",
      assignedToId: "",
    },
  })

  const totalCount = subtasks.length
  const completedCount = useMemo(
    () => subtasks.filter((item) => item.completed).length,
    [subtasks]
  )
  const completionPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const onCreateSubtask = async (values: CreateSubtaskFormValues) => {
    try {
      await createMutation.mutateAsync({
        title: values.title.trim(),
        assignedToId:
          values.assignedToId && values.assignedToId !== UNASSIGNED_VALUE
            ? values.assignedToId
            : null,
      })
      reset({ title: "", assignedToId: "" })
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not add subtask",
        description: getApiErrorMessage(error, "Please try again."),
      })
    }
  }

  const handleToggleComplete = async (
    subtask: TaskSubtask,
    nextCompleted: boolean
  ) => {
    try {
      await updateMutation.mutateAsync({
        subtaskId: subtask.id,
        data: { completed: nextCompleted },
      })
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not update subtask",
        description: getApiErrorMessage(error, "Please try again."),
      })
    }
  }

  const handleAssignSubtask = async (
    subtask: TaskSubtask,
    selectedValue: string | null
  ) => {
    const nextAssigneeId =
      selectedValue && selectedValue !== UNASSIGNED_VALUE ? selectedValue : null

    try {
      await updateMutation.mutateAsync({
        subtaskId: subtask.id,
        data: nextAssigneeId
          ? { assignedToId: nextAssigneeId }
          : { clearAssignee: true },
      })
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not update subtask assignee",
        description: getApiErrorMessage(error, "Please try again."),
      })
    }
  }

  const startEditing = (subtask: TaskSubtask) => {
    setEditingId(subtask.id)
    setEditingTitle(subtask.title)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const handleSaveTitle = async (subtask: TaskSubtask) => {
    const trimmed = editingTitle.trim()
    if (!trimmed) {
      toast.add({
        type: "error",
        title: "Invalid title",
        description: "Subtask title cannot be empty.",
      })
      return
    }
    if (trimmed === subtask.title) {
      cancelEditing()
      return
    }

    try {
      await updateMutation.mutateAsync({
        subtaskId: subtask.id,
        data: { title: trimmed },
      })
      cancelEditing()
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not rename subtask",
        description: getApiErrorMessage(error, "Please try again."),
      })
    }
  }

  const handleMove = async (globalIndex: number, direction: -1 | 1) => {
    const targetIndex = globalIndex + direction
    if (targetIndex < 0 || targetIndex >= subtasks.length) return

    const reordered = [...subtasks]
    const [moved] = reordered.splice(globalIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    try {
      await reorderMutation.mutateAsync(reordered.map((item) => item.id))
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not reorder subtasks",
        description: getApiErrorMessage(error, "Please try again."),
      })
    }
  }

  const handleDelete = async (subtask: TaskSubtask) => {
    try {
      await deleteMutation.mutateAsync(subtask.id)
      toast.add({
        type: "success",
        title: "Subtask removed",
        description: `"${subtask.title}" was deleted.`,
      })
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not delete subtask",
        description: getApiErrorMessage(error, "Please try again."),
      })
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="size-4 text-primary" />
              <span>Subtasks &amp; Checklist</span>
            </CardTitle>
            <CardDescription>
              Break work into concrete checklist steps and optionally assign individual owners.
            </CardDescription>
          </div>

          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {completedCount} / {totalCount} completed
              </span>
              <Badge
                variant={completionPct === 100 ? "default" : "secondary"}
                className={cn(
                  "text-xs",
                  completionPct === 100 &&
                    "bg-emerald-600 text-white hover:bg-emerald-600"
                )}
              >
                {completionPct}%
              </Badge>
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <div
            role="progressbar"
            aria-label="Subtask completion progress"
            aria-valuenow={completionPct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full transition-all duration-300",
                completionPct === 100 ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Inline Add Form */}
        {canManage && (
          <form
            onSubmit={handleSubmit(onCreateSubtask)}
            className="space-y-1.5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                placeholder="Add a checklist item..."
                aria-label="New subtask title"
                disabled={createMutation.isPending}
                aria-invalid={Boolean(errors.title)}
                className="min-w-0 flex-1"
                {...register("title")}
              />

              <div className="flex items-center gap-2">
                <Controller
                  name="assignedToId"
                  control={control}
                  render={({ field }) => {
                    const selectedMember = field.value
                      ? memberById.get(field.value)
                      : undefined
                    return (
                      <Select
                        value={field.value || UNASSIGNED_VALUE}
                        onValueChange={(val) =>
                          field.onChange(
                            !val || val === UNASSIGNED_VALUE ? "" : val
                          )
                        }
                        disabled={createMutation.isPending}
                      >
                        <SelectTrigger
                          aria-label="New subtask assignee"
                          className="h-9 w-full min-w-[140px] sm:w-[165px] text-xs"
                        >
                          <SelectValue placeholder="Unassigned">
                            {selectedMember
                              ? formatMemberName(selectedMember)
                              : "Unassigned"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNASSIGNED_VALUE} className="text-xs">
                            Unassigned
                          </SelectItem>
                          {projectMembers.map((member) => (
                            <SelectItem
                              key={member.id}
                              value={member.id}
                              className="text-xs"
                            >
                              {formatMemberName(member)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  }}
                />

                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                  className="shrink-0 gap-1.5"
                >
                  <Plus className="size-4" />
                  <span>{createMutation.isPending ? "Adding..." : "Add"}</span>
                </Button>
              </div>
            </div>

            {errors.title && (
              <p className="text-xs text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </form>
        )}

        {/* Subtask Items */}
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-md bg-muted/60" />
            <div className="h-10 animate-pulse rounded-md bg-muted/60" />
          </div>
        ) : subtasks.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            No subtasks added yet. Break this task down into smaller checklist items above.
          </div>
        ) : (
          <div className="space-y-3">
            <ul className="divide-y rounded-lg border">
              {pagination.paginatedItems.map((subtask) => {
                const globalIndex = subtasks.findIndex(
                  (item) => item.id === subtask.id
                )
                const isEditing = editingId === subtask.id

                return (
                  <li
                    key={subtask.id}
                    className="flex flex-col gap-2 px-3 py-2.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <Checkbox
                        checked={subtask.completed}
                        disabled={!canManage || updateMutation.isPending}
                        aria-label={`Toggle "${subtask.title}"`}
                        onCheckedChange={(checked) =>
                          handleToggleComplete(subtask, Boolean(checked))
                        }
                      />

                      {isEditing ? (
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                void handleSaveTitle(subtask)
                              } else if (e.key === "Escape") {
                                cancelEditing()
                              }
                            }}
                            aria-label="Edit subtask title"
                            className="h-8 min-w-0 flex-1 text-sm"
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label="Save subtask title"
                            className="size-7 text-emerald-600"
                            disabled={updateMutation.isPending}
                            onClick={() => handleSaveTitle(subtask)}
                          >
                            <Check className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label="Cancel editing subtask"
                            className="size-7 text-muted-foreground"
                            onClick={cancelEditing}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span
                          className={cn(
                            "min-w-0 break-words text-sm",
                            subtask.completed &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {subtask.title}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0 pl-6 sm:pl-0">
                      {canManage ? (
                        <Select
                          value={subtask.assignedTo?.id ?? UNASSIGNED_VALUE}
                          onValueChange={(val) =>
                            handleAssignSubtask(subtask, val)
                          }
                          disabled={updateMutation.isPending}
                        >
                          <SelectTrigger
                            size="sm"
                            aria-label={`Assignee for "${subtask.title}"`}
                            className="w-[140px] text-[11px]"
                          >
                            <SelectValue placeholder="Unassigned">
                              {subtask.assignedTo
                                ? formatMemberName(subtask.assignedTo)
                                : "Unassigned"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UNASSIGNED_VALUE} className="text-xs">
                              Unassigned
                            </SelectItem>
                            {projectMembers.map((member) => (
                              <SelectItem
                                key={member.id}
                                value={member.id}
                                className="text-xs"
                              >
                                {formatMemberName(member)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        subtask.assignedTo && (
                          <Badge variant="outline" className="gap-1 text-[11px]">
                            <UserRound className="size-3" />
                            <span>{formatMemberName(subtask.assignedTo)}</span>
                          </Badge>
                        )
                      )}

                      {canManage && (
                        <>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 text-muted-foreground"
                            disabled={
                              globalIndex <= 0 || reorderMutation.isPending
                            }
                            aria-label={`Move "${subtask.title}" up`}
                            title="Move up"
                            onClick={() => handleMove(globalIndex, -1)}
                          >
                            <ArrowUp className="size-3.5" />
                          </Button>

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 text-muted-foreground"
                            disabled={
                              globalIndex < 0 ||
                              globalIndex >= subtasks.length - 1 ||
                              reorderMutation.isPending
                            }
                            aria-label={`Move "${subtask.title}" down`}
                            title="Move down"
                            onClick={() => handleMove(globalIndex, 1)}
                          >
                            <ArrowDown className="size-3.5" />
                          </Button>

                          {!isEditing && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7 text-muted-foreground"
                              aria-label={`Edit "${subtask.title}"`}
                              title="Edit title"
                              onClick={() => startEditing(subtask)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            disabled={deleteMutation.isPending}
                            aria-label={`Delete "${subtask.title}"`}
                            title="Delete subtask"
                            onClick={() => handleDelete(subtask)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>

            {subtasks.length > 8 && (
              <DataPagination
                compact
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalElements={pagination.totalElements}
                pageSize={pagination.pageSize}
                pageSizeOptions={[8, 16]}
                itemLabel="subtasks"
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
