import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import ErrorState from "@/components/common/ErrorState"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import confetti from "canvas-confetti"
import { toast } from "@/components/ui/toast"

import {
  deleteTask,
  getAllTasks,
  getTasksByAssignedTo,
  getTasksByCreatedBy,
  updateTaskStatus,
} from "@/features/tasks/services/task.services"

import {
  removeTask,
  setSelectedTask,
  setTaskError,
  setTaskLoading,
  setTaskPage,
  setTaskPageSize,
  setTasks,
  updateTask,
} from "@/features/tasks/slice/task.slice"

import type {
  Task,
  TaskPriorityFilter,
  TaskScope,
  TaskSortField,
  TaskSortOrder,
  TaskStatus,
  TaskStatusFilter,
} from "@/features/tasks/types/task.types"

import TaskToolbar from "@/features/tasks/components/TaskToolbar"
import TaskScopeTabs from "@/features/tasks/components/TaskScopeTabs"
import TaskKanbanBoard from "@/features/tasks/components/TaskKanbanBoard"
import TaskKanbanSkeleton from "@/features/tasks/components/TaskKanbanSkeleton"
import TaskEmptyState from "@/features/tasks/components/TaskEmptyState"

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"

interface TaskFiltersState {
  search: string
  status: TaskStatusFilter
  priority: TaskPriorityFilter
  sortBy: TaskSortField
  sortOrder: TaskSortOrder
}

const DEFAULT_FILTERS: TaskFiltersState = {
  search: "",
  status: "ALL",
  priority: "ALL",
  sortBy: "createdAt",
  sortOrder: "desc",
}

async function fetchTasks({
  scope,
  currentUserId,
  page,
  size,
}: {
  scope: TaskScope
  currentUserId?: string
  page: number
  size: number
}) {
  if (scope === "ASSIGNED_TO_ME" && currentUserId) {
    return getTasksByAssignedTo({
      assignedToId: currentUserId,
      page,
      size,
    })
  }

  if (scope === "CREATED_BY_ME" && currentUserId) {
    return getTasksByCreatedBy({
      createdByUserId: currentUserId,
      page,
      size,
    })
  }

  return getAllTasks({
    page,
    size,
  })
}

export default function TaskPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  /*
   * ---------------------------------------------------------
   * Redux state
   * ---------------------------------------------------------
   */

  const {
    tasks,
    page,
    size,
    totalElements,
    totalPages,
    first,
    last,
    loading,
    error,
  } = useAppSelector((state) => state.task)

  const currentUser = useAppSelector((state) => state.auth.user)
  const canViewAllTasks = currentUser?.user_role === "ADMIN"

  /*
   * ---------------------------------------------------------
   * Local UI state
   * ---------------------------------------------------------
   */

  const [scope, setScope] = useState<TaskScope>(
    canViewAllTasks ? "ALL" : "ASSIGNED_TO_ME"
  )

  const [filters, setFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (size < 50) {
      dispatch(setTaskPageSize(50))
    }
  }, [dispatch, size])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        dispatch(setTaskLoading(true))
        dispatch(setTaskError(null))

        const response = await fetchTasks({
          scope,
          currentUserId: currentUser?.id,
          page,
          size,
        })

        if (!cancelled) {
          dispatch(setTasks(response))
        }
      } catch (error) {
        if (!cancelled) {
          dispatch(
            setTaskError(
              error instanceof Error ? error.message : "Unable to load tasks."
            )
          )
        }
      } finally {
        if (!cancelled) {
          dispatch(setTaskLoading(false))
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [currentUser, dispatch, page, scope, size, refreshKey])
  /*
   * ---------------------------------------------------------
   * Client-side filtering + sorting
   * ---------------------------------------------------------
   *
   * The current task APIs are paginated, so these filters
   * operate on the currently loaded page.
   */

  const filteredTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    const result = tasks.filter((task) => {
      const createdByName =
        `${task.createdBy.firstName} ${task.createdBy.lastName}`.toLowerCase()

      const assignedToName =
        `${task.assignedTo.firstName} ${task.assignedTo.lastName}`.toLowerCase()

      const matchesSearch =
        !search ||
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search) ||
        createdByName.includes(search) ||
        assignedToName.includes(search)

      const matchesStatus =
        filters.status === "ALL" || task.taskStatus === filters.status

      const matchesPriority =
        filters.priority === "ALL" || task.taskPriority === filters.priority

      return matchesSearch && matchesStatus && matchesPriority
    })

    return [...result].sort((a, b) => {
      const direction = filters.sortOrder === "asc" ? 1 : -1

      switch (filters.sortBy) {
        case "title":
          return a.title.localeCompare(b.title) * direction

        case "taskPriority":
          return a.taskPriority.localeCompare(b.taskPriority) * direction

        case "taskStatus":
          return a.taskStatus.localeCompare(b.taskStatus) * direction

        case "dueDate": {
          const aTime = a.dueDate
            ? new Date(a.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER

          const bTime = b.dueDate
            ? new Date(b.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER

          return (aTime - bTime) * direction
        }

        case "updatedAt":
          return (
            (new Date(a.updatedAt).getTime() -
              new Date(b.updatedAt).getTime()) *
            direction
          )

        case "createdAt":
        default:
          return (
            (new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()) *
            direction
          )
      }
    })
  }, [filters, tasks])

  /*
   * ---------------------------------------------------------
   * Filters
   * ---------------------------------------------------------
   */

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc"

  const handleFiltersChange = (nextFilters: TaskFiltersState) => {
    setFilters(nextFilters)

    if (page !== 0) {
      dispatch(setTaskPage(0))
    }
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)

    if (page !== 0) {
      dispatch(setTaskPage(0))
    }
  }

  /*
   * ---------------------------------------------------------
   * Scope
   * ---------------------------------------------------------
   */

  const handleScopeChange = (nextScope: TaskScope) => {
    setScope(nextScope)

    if (page !== 0) {
      dispatch(setTaskPage(0))
    }
  }

  /*
   * ---------------------------------------------------------
   * Refresh
   * ---------------------------------------------------------
   */

  const handleRefresh = () => {
    setRefreshKey((value) => value + 1)
  }
  /*
   * ---------------------------------------------------------
   * View task
   * ---------------------------------------------------------
   */

  const handleViewTask = (task: Task) => {
    dispatch(setSelectedTask(task))
    navigate(`/app/tasks/${task.id}`)
  }

  /*
   * ---------------------------------------------------------
   * Delete task
   * ---------------------------------------------------------
   */

  const handleDeleteTask = async (task: Task) => {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      dispatch(setTaskLoading(true))
      dispatch(setTaskError(null))

      await deleteTask({
        id: task.id,
      })

      dispatch(removeTask(task.id))
    } catch (error) {
      dispatch(
        setTaskError(
          error instanceof Error ? error.message : "Unable to delete task."
        )
      )
    } finally {
      dispatch(setTaskLoading(false))
    }
  }

  /*
   * ---------------------------------------------------------
   * Kanban Status Change (Drag & Drop or Quick Move)
   * ---------------------------------------------------------
   */

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const previousTask = tasks.find((t) => t.id === taskId)
    if (!previousTask || previousTask.taskStatus === newStatus) {
      return
    }

    // Optimistically update in Redux so card moves immediately
    const optimisticTask: Task = {
      ...previousTask,
      taskStatus: newStatus,
      updatedAt: new Date().toISOString(),
    }
    dispatch(updateTask(optimisticTask))

    try {
      const updated = await updateTaskStatus({
        id: taskId,
        status: newStatus,
      })
      dispatch(updateTask(updated))

      const statusLabels: Record<string, string> = {
        TODO: "To Do",
        IN_PROGRESS: "In Progress",
        DONE: "Completed",
        CANCELLED: "Cancelled",
      }

      toast.add({
        type: "success",
        title: `Task moved to ${statusLabels[newStatus] || newStatus}`,
        description: `"${previousTask.title}" updated successfully.`,
      })

      if (newStatus === "DONE") {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          })
        } catch {
          // ignore confetti errors
        }
      }
    } catch (error) {
      // Revert optimistic update on failure
      dispatch(updateTask(previousTask))
      toast.add({
        type: "error",
        title: "Unable to update task status",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating status.",
      })
    }
  }

  const handleAddTaskInColumn = (status: TaskStatus) => {
    navigate(`/app/tasks/create?status=${status}`)
  }

  /*
   * ---------------------------------------------------------
   * Pagination
   * ---------------------------------------------------------
   */

  const handlePreviousPage = () => {
    if (first) {
      return
    }

    dispatch(setTaskPage(Math.max(0, page - 1)))
  }

  const handleNextPage = () => {
    if (last) {
      return
    }

    dispatch(setTaskPage(Math.min(totalPages - 1, page + 1)))
  }

  /*
   * ---------------------------------------------------------
   * Render state
   * ---------------------------------------------------------
   */

  const showEmptyState = !loading && filteredTasks.length === 0

  return (
    <PageContainer>
      <PageHeader 
        title="Tasks" 
        description="Manage and track your tasks across projects." 
        actions={
          <Button onClick={() => navigate("/app/tasks/create")}>
            <Plus className="size-4 mr-2" />
            Create task
          </Button>
        }
      />

      <TaskScopeTabs 
        value={scope} 
        onChange={handleScopeChange} 
        showAll={canViewAllTasks}
      />
        {/* Error */}
        {error && (
          <ErrorState 
            title="Unable to load tasks"
            description={error}
            retryAction={handleRefresh}
          />
        )}

        <TaskToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Result information */}
        {!loading && (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"} shown
              {totalElements > 0 && ` of ${totalElements}`}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && <TaskKanbanSkeleton />}

        {/* Empty */}
        {showEmptyState && (
          <TaskEmptyState
            filtered={hasActiveFilters}
            onCreate={() => navigate("/app/tasks/create")}
            onClearFilters={hasActiveFilters ? handleResetFilters : undefined}
          />
        )}

        {/* Kanban Board */}
        {!loading && !showEmptyState && (
          <TaskKanbanBoard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onViewTask={handleViewTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTaskInColumn}
          />
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={first || loading}
                onClick={handlePreviousPage}
                className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={last || loading}
                onClick={handleNextPage}
                className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </PageContainer>
  )
}
