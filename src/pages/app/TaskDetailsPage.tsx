import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FolderKanban,
  Mail,
  Pencil,
  Trash2,
  UserPlus,
  Loader2,
} from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import PageContainer from "@/components/common/PageContainer"
import ErrorState from "@/components/common/ErrorState"
import StatusBadge from "@/components/common/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/toast"

import {
  deleteTask,
  getTaskById,
  updateTaskStatus,
} from "@/features/tasks/services/task.services"

import type {
  Task,
  TaskStatus,
} from "@/features/tasks/types/task.types"

import { useAppDispatch } from "@/hooks/redux-hooks"
import {
  removeTask,
  setSelectedTask,
  updateTask as updateTaskInState,
} from "@/features/tasks/slice/task.slice"
import EditTaskModal from "@/features/tasks/components/EditTaskModal"

const STATUS_OPTIONS = [
  {
    value: "TODO",
    label: "To Do",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "DONE",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
] as const

function formatPriority(priority: string) {
  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1).toLowerCase()
  )
}

function formatDate(
  value?: string | null,
) {
  if (!value) return "Not set"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatDateTime(
  value?: string | null,
) {
  if (!value) return "Not available"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getFullName(
  user?: {
    firstName?: string
    lastName?: string
  } | null,
) {
  if (!user) return "Unknown user"

  return `${user.firstName ?? ""} ${
    user.lastName ?? ""
  }`.trim() || "Unknown user"
}

function getInitials(
  user?: {
    firstName?: string
    lastName?: string
  } | null,
) {
  if (!user) return "?"

  const first = user.firstName?.charAt(0) ?? ""
  const last = user.lastName?.charAt(0) ?? ""

  return `${first}${last}`.toUpperCase() || "?"
}

function TaskDetailsSkeleton() {
  return (
    <PageContainer className="flex flex-col">
      <div className="mb-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-4 h-9 w-2/3" />
        <Skeleton className="mt-3 h-5 w-1/3" />
      </div>

      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>

            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>

            <CardContent className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="space-y-2"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
            </CardHeader>

            <CardContent className="space-y-5">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default function TaskDetailsPage() {
  const { taskId } = useParams<{
    taskId: string
  }>()

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [task, setTask] = useState<Task | null>(null)

  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] =
    useState(false)
  const [deleteLoading, setDeleteLoading] =
    useState(false)

  const [error, setError] = useState<string | null>(
    null,
  )

  const [actionError, setActionError] =
    useState<string | null>(null)
    
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [now] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false

    async function loadTask() {
      if (!taskId) {
        setError("Task ID is missing.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const taskData = await getTaskById({
          id: taskId,
        })

        if (cancelled) return

        setTask(taskData)
        dispatch(setSelectedTask(taskData))
      } catch (error) {
        if (cancelled) return

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load task.",
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadTask()

    return () => {
      cancelled = true
    }
  }, [taskId, dispatch])

  const handleStatusChange = async (
    status: TaskStatus,
  ) => {
    if (!task || status === task.taskStatus) {
      return
    }

    try {
      setStatusLoading(true)
      setActionError(null)

      const updatedTask = await updateTaskStatus({
        id: task.id,
        status,
      })

      setTask(updatedTask)
      dispatch(setSelectedTask(updatedTask))
      dispatch(updateTaskInState(updatedTask))
      toast.add({
        type: "success",
        title: "Status updated",
        description: `Task status changed to ${status.replace("_", " ").toLowerCase()}.`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to update task status."
      setActionError(msg)
      toast.add({
        type: "error",
        title: "Update failed",
        description: msg,
      })
    } finally {
      setStatusLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!task) return

    try {
      setDeleteLoading(true)
      setActionError(null)

      await deleteTask({
        id: task.id,
      })

      dispatch(removeTask(task.id))
      dispatch(setSelectedTask(null))

      toast.add({
        type: "success",
        title: "Task deleted",
        description: `Task "${task.title}" was deleted successfully.`,
      })

      setDeleteDialogOpen(false)
      navigate("/app/tasks", { replace: true })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to delete task."
      setActionError(msg)
      toast.add({
        type: "error",
        title: "Deletion failed",
        description: msg,
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTask(updatedTask)
    dispatch(setSelectedTask(updatedTask))
    dispatch(updateTaskInState(updatedTask))
  }

  if (loading) {
    return <TaskDetailsSkeleton />
  }

  if (!task) {
    return (
      <PageContainer>
      <div className="mb-6">
        <Button
          variant="ghost"
          className="w-fit -ml-3 mb-4"
          onClick={() => navigate("/app/tasks")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to tasks
        </Button>
      </div>

      <ErrorState 
        title="Unable to load task"
        description={error ?? "Task not found."}
        retryAction={() => window.location.reload()}
      />
    </PageContainer>
    )
  }

  const assignedTo = task.assignedTo
  const createdBy = task.createdBy
  const project = task.project

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate).getTime() <
      now &&
    task.taskStatus !== "DONE" &&
    task.taskStatus !== "CANCELLED"

  return (
    <PageContainer className="flex flex-col gap-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/tasks")}
            aria-label="Back to tasks"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={task.taskStatus} showDot />
              <StatusBadge status={task.taskPriority} />

              {isOverdue && (
                <Badge variant="destructive">
                  Overdue
                </Badge>
              )}
            </div>

            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-3xl">
              {task.title}
            </h1>

            
          </div>
        </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditTaskOpen(true)}
                >
                  <Pencil className="mr-2 size-4" />
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  disabled={deleteLoading}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
      </div>

      {/* Content */}
      <div className="grid w-full flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>
                Unable to load task
              </AlertTitle>

              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {actionError && (
            <Alert variant="destructive">
              <AlertTitle>
                Action failed
              </AlertTitle>

              <AlertDescription>
                {actionError}
              </AlertDescription>
            </Alert>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>

            <CardContent>
              {task.description ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No description provided.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Task information */}
          <Card>
            <CardHeader>
              <CardTitle>Task information</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Status
                  </p>

                  <Select
                    value={task.taskStatus}
                    onValueChange={(val) => { if (val) void handleStatusChange(val as TaskStatus) }}
                    disabled={statusLoading}
                  >
                    <SelectTrigger className="w-full sm:w-52">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {STATUS_OPTIONS.map(
                        (option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Priority
                  </p>

                  <div className="font-medium">
                    {formatPriority(
                      task.taskPriority,
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Due date
                  </p>

                  <div className="flex items-center gap-2 font-medium">
                    <CalendarDays className="size-4 text-muted-foreground" />

                    {formatDate(task.dueDate)}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Created
                  </p>

                  <div className="flex items-center gap-2 font-medium">
                    <Clock3 className="size-4 text-muted-foreground" />

                    {formatDateTime(
                      task.createdAt,
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Last updated
                  </p>

                  <div className="flex items-center gap-2 font-medium">
                    <Clock3 className="size-4 text-muted-foreground" />

                    {formatDateTime(
                      task.updatedAt,
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project */}
          <Card>
            <CardHeader>
              <CardTitle>Project</CardTitle>
            </CardHeader>

            <CardContent>
              <Link
                to={`/app/projects/${project.id}`}
                className="group block rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FolderKanban className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium group-hover:underline">
                      {project.name}
                    </p>

                    {project.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        Status:{" "}
                        {project.projectStatus}
                      </span>

                      <span>
                        Start:{" "}
                        {formatDate(
                          project.startDate,
                        )}
                      </span>

                      <span>
                        Due:{" "}
                        {formatDate(
                          project.dueDate,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned to</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-medium">
                  {getInitials(assignedTo)}
                </div>

                <div className="min-w-0">
                  <p className="font-medium">
                    {getFullName(assignedTo)}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="size-3.5" />

                    <span className="truncate">
                      {assignedTo.email}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {assignedTo.userRole}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creator */}
          <Card>
            <CardHeader>
              <CardTitle>Created by</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-medium">
                  {getInitials(createdBy)}
                </div>

                <div className="min-w-0">
                  <p className="font-medium">
                    {getFullName(createdBy)}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="size-3.5" />

                    <span className="truncate">
                      {createdBy.email}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {createdBy.userRole}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project owner */}
          <Card>
            <CardHeader>
              <CardTitle>Project owner</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-medium">
                  {project.owner
                    ? `${project.owner.firstName?.charAt(0) ?? ""}${project.owner.lastName?.charAt(0) ?? ""}`.toUpperCase()
                    : "?"}
                </div>

                <div className="min-w-0">
                  <p className="font-medium">
                    {project.owner
                      ? `${project.owner.firstName} ${project.owner.lastName}`
                      : "Unknown"}
                  </p>

                  {project.owner?.email && (
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="size-3.5" />

                      <span className="truncate">
                        {project.owner.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <CalendarDays className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Created
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(
                        task.createdAt,
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Clock3 className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Last updated
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(
                        task.updatedAt,
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <UserPlus className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Assignee
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {getFullName(assignedTo)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={task}
        open={editTaskOpen}
        onOpenChange={setEditTaskOpen}
        onUpdated={handleTaskUpdated}
      />

      {/* Delete Task Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5 shrink-0" />
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-1.5 text-sm">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{task.title}"</span>? This will permanently remove the task and its history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-3 border-t">
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="gap-2"
            >
              {deleteLoading && <Loader2 className="size-4 animate-spin" />}
              {deleteLoading ? "Deleting..." : "Delete Task"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}