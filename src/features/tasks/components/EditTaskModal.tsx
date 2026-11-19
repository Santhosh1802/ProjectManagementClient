import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ShortcutHint from "@/components/common/ShortcutHint"
import { submitFormOnModEnter, toAriaKeyShortcuts } from "@/lib/keyboard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useUpdateTaskDetailsMutation } from "@/features/tasks/hooks/useTasksQuery"
import { useProjectMembersQuery } from "@/features/projects/hooks/useProjectsQuery"
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types/task.types"
import { editTaskSchema, type EditTaskFormValues } from "@/features/tasks/schema/task.schema"
import TaskDueDateTimePicker from "@/features/tasks/components/create-task/TaskDueDateTimePicker"
import AssigneeSelect from "@/features/tasks/components/create-task/AssigneeSelect"
import CoAssigneesMultiSelect from "@/features/tasks/components/create-task/CoAssigneesMultiSelect"

function getInitialCoAssigneeIds(task: Task): string[] {
  return (task.assignees ?? [])
    .map((user) => user.id)
    .filter((id) => id !== task.assignedTo.id)
}

interface EditTaskModalProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (task: Task) => void
}

export default function EditTaskModal({
  task,
  open,
  onOpenChange,
  onUpdated,
}: EditTaskModalProps) {
  const updateMutation = useUpdateTaskDetailsMutation()

  const {
    data: membersData,
    isLoading: isMembersLoading,
  } = useProjectMembersQuery(
    { projectId: task.project.id, page: 0, size: 100 },
    { enabled: open }
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    mode: "onBlur",
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      taskStatus: task.taskStatus,
      taskPriority: task.taskPriority,
      projectId: task.project.id,
      assignedToId: task.assignedTo.id,
      assigneeIds: getInitialCoAssigneeIds(task),
      dueDate: task.dueDate ? task.dueDate.slice(0, 16).replace("T", " ") : "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        title: task.title,
        description: task.description ?? "",
        taskStatus: task.taskStatus,
        taskPriority: task.taskPriority,
        projectId: task.project.id,
        assignedToId: task.assignedTo.id,
        assigneeIds: getInitialCoAssigneeIds(task),
        dueDate: task.dueDate ? task.dueDate.slice(0, 16).replace("T", " ") : "",
      })
    }
  }, [open, task, reset])

  // Derive assignable users for the project
  const projectAssignees = useMemo(() => {
    const memberMap = new Map<
      string,
      {
        id: string
        firstName: string
        lastName: string
        email: string
        isActive: boolean
      }
    >()

    if (task.project.owner) {
      memberMap.set(task.project.owner.id, {
        id: task.project.owner.id,
        firstName: task.project.owner.firstName,
        lastName: task.project.owner.lastName,
        email: task.project.owner.email,
        isActive: true,
      })
    }

    if (membersData?.content) {
      for (const m of membersData.content) {
        if (m.user && !memberMap.has(m.user.id)) {
          memberMap.set(m.user.id, {
            id: m.user.id,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            email: m.user.email,
            isActive: m.user.isActive ?? true,
          })
        }
      }
    }

    for (const a of task.assignees ?? []) {
      if (a && !memberMap.has(a.id)) {
        memberMap.set(a.id, {
          id: a.id,
          firstName: a.firstName,
          lastName: a.lastName,
          email: a.email,
          isActive: a.isActive ?? true,
        })
      }
    }

    return Array.from(memberMap.values())
  }, [task.project.owner, task.assignees, membersData])

  const onSubmit = async (values: EditTaskFormValues) => {
    try {
      let formattedDueDate: string | null = null
      if (values.dueDate && values.dueDate.trim()) {
        const trimmed = values.dueDate.trim()
        if (trimmed.includes(" ")) {
          const [datePart, timePart] = trimmed.split(" ")
          formattedDueDate = new Date(`${datePart}T${timePart}:00`).toISOString()
        } else {
          formattedDueDate = new Date(trimmed).toISOString()
        }
      }

      const uniqueAssigneeIds = Array.from(
        new Set(
          [values.assignedToId, ...(values.assigneeIds ?? [])].filter(Boolean)
        )
      )

      const updated = await updateMutation.mutateAsync({
        id: task.id,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        taskStatus: values.taskStatus as TaskStatus,
        taskPriority: values.taskPriority as TaskPriority,
        projectId: values.projectId,
        assignedToId: values.assignedToId,
        assigneeIds: uniqueAssigneeIds,
        createdById: task.createdBy.id,
        dueDate: formattedDueDate,
      })

      onUpdated(updated)
      toast.add({
        type: "success",
        title: "Task updated",
        description: `"${updated.title}" updated successfully.`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.add({
        type: "error",
        title: "Failed to update task",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating the task.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Pencil className="size-5 text-primary" />
            <DialogTitle>Edit Task</DialogTitle>
          </div>
          <DialogDescription>
            Update task details, assignment, and schedule.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={submitFormOnModEnter}
          aria-keyshortcuts={toAriaKeyShortcuts(["mod", "Enter"])}
          className="space-y-4 py-2"
        >
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="edit-task-title" className="text-sm font-medium">
              Task Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-task-title"
              placeholder="e.g. Design Landing Page"
              disabled={isSubmitting}
              maxLength={100}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="edit-task-description" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="edit-task-description"
              placeholder="Provide context or instructions between 10 and 300 characters..."
              className="min-h-20"
              disabled={isSubmitting}
              minLength={10}
              maxLength={300}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <AssigneeSelect
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              users={projectAssignees}
              loading={isMembersLoading}
              disabled={isSubmitting}
            />
          </div>

          {/* Additional Co-assignees */}
          <Controller
            name="assigneeIds"
            control={control}
            render={({ field }) => (
              <CoAssigneesMultiSelect
                id="edit-task-co-assignees"
                value={field.value ?? []}
                onChange={field.onChange}
                users={projectAssignees}
                excludeUserId={watch("assignedToId")}
                loading={isMembersLoading}
                disabled={isSubmitting}
              />
            )}
          />

          {/* Status & Priority */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={watch("taskStatus")}
                onValueChange={(val) => setValue("taskStatus", val as TaskStatus, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={watch("taskPriority")}
                onValueChange={(val) => setValue("taskPriority", val as TaskPriority, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due date constrained by project timeline */}
          <div className="space-y-1.5">
            <TaskDueDateTimePicker
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              disabled={isSubmitting}
              minDate={task.project.startDate ? task.project.startDate.split("T")[0] : undefined}
              maxDate={task.project.dueDate ? task.project.dueDate.split("T")[0] : undefined}
            />
          </div>

          <DialogFooter className="gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              <span>Save Changes</span>
              <ShortcutHint
                keys={["mod", "Enter"]}
                compact
                decorative
                variant="onPrimary"
                className="hidden sm:inline-flex ml-1"
              />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
