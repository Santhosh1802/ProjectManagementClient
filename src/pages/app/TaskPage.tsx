import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import ErrorState from "@/components/common/ErrorState"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Plus } from "lucide-react"
import confetti from "canvas-confetti"
import { toast } from "@/components/ui/toast"

import { useQuery } from "@tanstack/react-query"
import { taskKeys } from "@/lib/queryKeys"

import {
  deleteTask,
  getAllTasks,
  getTasksByAssignedTo,
  getTasksByCreatedBy,
  updateTaskStatus,
} from "@/features/tasks/services/task.services"
import { searchProjects } from "@/features/projects/services/projects.services"

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
  TaskFilters,
  TaskScope,
  TaskStatus,
  TaskView,
} from "@/features/tasks/types/task.types"

import TaskToolbar from "@/features/tasks/components/TaskToolbar"
import TaskScopeTabs from "@/features/tasks/components/TaskScopeTabs"
import TaskKanbanBoard from "@/features/tasks/components/TaskKanbanBoard"
import TaskKanbanSkeleton from "@/features/tasks/components/TaskKanbanSkeleton"
import TaskList from "@/features/tasks/components/TaskList"
import TaskListSkeleton from "@/features/tasks/components/TaskListSkeleton"
import TaskTable from "@/features/tasks/components/TaskTable"
import TaskTableSkeleton from "@/features/tasks/components/TaskTableSkeleton"
import TaskEmptyState from "@/features/tasks/components/TaskEmptyState"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import { useIsMobile } from "@/hooks/use-mobile"

function getPaginationItems(
  totalPages: number,
  currentPage: number
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }

  const pages = new Set<number>([
    0,
    totalPages - 1,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ])

  const visiblePages = [...pages]
    .filter((p) => p >= 0 && p < totalPages)
    .sort((a, b) => a - b)

  const result: (number | "ellipsis")[] = []

  visiblePages.forEach((p, index) => {
    if (index > 0 && p - visiblePages[index - 1] > 1) {
      result.push("ellipsis")
    }
    result.push(p)
  })

  return result
}

type TaskFiltersState = TaskFilters

const DEFAULT_FILTERS: TaskFiltersState = {
  search: "",
  status: "ALL",
  priority: "ALL",
  projectIds: [],
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

  const isMobile = useIsMobile()
  const [userSelectedView, setUserSelectedView] = useState<TaskView | null>(null)
  const view: TaskView = userSelectedView ?? (isMobile ? "card" : "kanban")

  const [scope, setScope] = useState<TaskScope>(
    canViewAllTasks ? "ALL" : "ASSIGNED_TO_ME"
  )

  const [filters, setFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS)


  const {
    data: tasksResponse,
    isLoading: queryLoading,
    isFetching: queryFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [...taskKeys.all, scope, currentUser?.id ?? "anonymous", page, size],
    queryFn: () =>
      fetchTasks({
        scope,
        currentUserId: currentUser?.id,
        page,
        size,
      }),
  })

  useEffect(() => {
    dispatch(setTaskLoading(queryLoading))
  }, [dispatch, queryLoading])

  useEffect(() => {
    if (tasksResponse) {
      dispatch(setTasks(tasksResponse))
    }
  }, [dispatch, tasksResponse])

  useEffect(() => {
    if (queryError) {
      dispatch(
        setTaskError(
          queryError instanceof Error ? queryError.message : "Unable to load tasks."
        )
      )
    } else {
      dispatch(setTaskError(null))
    }
  }, [dispatch, queryError])
  /*
  /*
   * ---------------------------------------------------------
   * Fetch available projects for filtering
   * ---------------------------------------------------------
   */
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "for-task-filter"],
    queryFn: async () => {
      try {
        const res = await searchProjects({
          page: 0,
          size: 100,
          scope: "ALL",
          sortBy: "createdAt",
          sortOrder: "desc",
        })
        return (res?.content || []).map((p) => ({
          id: p.id,
          name: p.name,
        }))
      } catch (err) {
        console.error("Failed to load projects for filter:", err)
        return []
      }
    },
    staleTime: 2 * 60 * 1000,
  })

  // Derive projects from both projects API and tasks currently loaded (deduplicated)
  const projectOptions = useMemo(() => {
    const map = new Map<string, string>()

    if (projectsData) {
      for (const p of projectsData) {
        if (p?.id && p?.name) {
          map.set(p.id, p.name)
        }
      }
    }

    // Also include any project already present on the loaded tasks
    for (const t of tasks) {
      if (t?.project?.id && t?.project?.name && !map.has(t.project.id)) {
        map.set(t.project.id, t.project.name)
      }
    }

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [projectsData, tasks])

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
    const selectedProjectIds = filters.projectIds || []

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

      const matchesProject =
        selectedProjectIds.length === 0 ||
        selectedProjectIds.includes(task.project.id)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesProject
      )
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
    (filters.projectIds && filters.projectIds.length > 0) ||
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
        onRefresh={() => void refetch()}
        isRefreshing={queryFetching}
        actions={
          <Button onClick={() => navigate("/app/tasks/create")} className="gap-2">
            <Plus className="size-4" />
            <span>Create task</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 ml-1 opacity-75">
              <Kbd className="h-4 min-w-4 px-1 text-[9px] bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 font-mono">C</Kbd>
              <Kbd className="h-4 min-w-4 px-1 text-[9px] bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 font-mono">T</Kbd>
            </span>
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
            retryAction={() => void refetch()}
          />
        )}

        <TaskToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          view={view}
          onViewChange={setUserSelectedView}
          projects={projectOptions}
          projectsLoading={projectsLoading}
          pageSize={size}
          onPageSizeChange={(newSize) => {
            dispatch(setTaskPageSize(newSize))
            dispatch(setTaskPage(0))
          }}
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
        {loading && (
          <>
            {view === "kanban" && <TaskKanbanSkeleton />}
            {(view === "card" || view === "list") && <TaskListSkeleton />}
            {view === "table" && <TaskTableSkeleton />}
          </>
        )}

        {/* Empty */}
        {showEmptyState && (
          <TaskEmptyState
            filtered={hasActiveFilters}
            onCreate={() => navigate("/app/tasks/create")}
            onClearFilters={hasActiveFilters ? handleResetFilters : undefined}
          />
        )}

        {/* Views */}
        {!loading && !showEmptyState && (
          <>
            {view === "kanban" && (
              <TaskKanbanBoard
                tasks={filteredTasks}
                onStatusChange={handleStatusChange}
                onViewTask={handleViewTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTaskInColumn}
              />
            )}

            {(view === "card" || view === "list") && (
              <TaskList
                tasks={filteredTasks}
                onView={handleViewTask}
                onDelete={handleDeleteTask}
              />
            )}

            {view === "table" && (
              <TaskTable
                tasks={filteredTasks}
                onView={handleViewTask}
                onDelete={handleDeleteTask}
              />
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && totalElements > 0 && (
          <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of{" "}
              {totalElements.toLocaleString("en-IN")} tasks
            </p>

            <Pagination className="mx-0 w-auto justify-start sm:justify-end">
              <PaginationContent className="flex-wrap">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={first || loading}
                    tabIndex={first || loading ? -1 : undefined}
                    className={
                      first || loading
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    onClick={(event) => {
                      event.preventDefault()
                      if (!first && !loading) {
                        handlePreviousPage()
                      }
                    }}
                  />
                </PaginationItem>

                {getPaginationItems(totalPages, page).map((item, index) => (
                  <PaginationItem key={`${item}-${index}`}>
                    {item === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={page === item}
                        aria-label={`Go to page ${item + 1}`}
                        aria-current={page === item ? "page" : undefined}
                        onClick={(event) => {
                          event.preventDefault()
                          if (page !== item && !loading) {
                            dispatch(setTaskPage(item))
                          }
                        }}
                      >
                        {item + 1}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={last || loading}
                    tabIndex={last || loading ? -1 : undefined}
                    className={
                      last || loading
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    onClick={(event) => {
                      event.preventDefault()
                      if (!last && !loading) {
                        handleNextPage()
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
    </PageContainer>
  )
}
