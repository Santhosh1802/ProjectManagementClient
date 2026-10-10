import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { searchProjects } from "@/features/projects/services/projects.services"
import { searchUsers } from "@/features/users/services/users.service"
import ErrorState from "@/components/common/ErrorState"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import {
  createTask,
  deleteTask,
  getAllTasks,
  getTasksByAssignedTo,
  getTasksByCreatedBy,
} from "@/features/tasks/services/task.services"

import {
  addTask,
  removeTask,
  setSelectedTask,
  setTaskError,
  setTaskLoading,
  setTaskPage,
  setTasks,
} from "@/features/tasks/slice/task.slice"

import type {
  Task,
  TaskPriorityFilter,
  TaskScope,
  TaskSortField,
  TaskSortOrder,
  TaskStatusFilter,
  TaskView,
} from "@/features/tasks/types/task.types"

import type { CreateTaskFormValues } from "@/features/tasks/schema/task.schema"

import TaskToolbar from "@/features/tasks/components/TaskToolbar"

import TaskScopeTabs from "@/features/tasks/components/TaskScopeTabs"
import TaskList from "@/features/tasks/components/TaskList"
import TaskCard from "@/features/tasks/components/TaskCard"
import TaskTable from "@/features/tasks/components/TaskTable"
import TaskListSkeleton from "@/features/tasks/components/TaskListSkeleton"
import TaskTableSkeleton from "@/features/tasks/components/TaskTableSkeleton"
import TaskEmptyState from "@/features/tasks/components/TaskEmptyState"
import CreateTaskForm from "@/features/tasks/components/create-task/CreateTaskForm"

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
   * Your UserState currently exposes `user`, not `users`.
   *
   * We deliberately don't use:
   *
   * state.user.users
   *
   * because that property doesn't exist in your current
   * UserState.
   *
   * Until a proper user-list/search API is connected,
   * the current authenticated user is used as the available
   * assignee.
   */

  const [createProjects, setCreateProjects] = useState<
    Array<{
      id: string
      name: string
    }>
  >([])

  const [createUsers, setCreateUsers] = useState<
    Array<{
      id: string
      firstName: string
      lastName: string
      email: string
      isActive: boolean
    }>
  >([])

  const [projectsLoading, setProjectsLoading] = useState(false)

  const [usersLoading, setUsersLoading] = useState(false)

  

  

  /*
   * ---------------------------------------------------------
   * Local UI state
   * ---------------------------------------------------------
   */

  const [scope, setScope] = useState<TaskScope>(
    canViewAllTasks ? "ALL" : "ASSIGNED_TO_ME"
  )

  const [view, setView] = useState<TaskView>("card")

  const [createOpen, setCreateOpen] = useState(false)

  /*
   * `?create=1` (used by the C → T keyboard shortcut) opens the
   * create dialog. Derived from the URL instead of synced into state.
   */
  const [searchParams, setSearchParams] = useSearchParams()
  const createRequested = searchParams.get("create") === "1"
  const isCreateDialogOpen = createOpen || createRequested

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open)

    if (!open && createRequested) {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.delete("create")
          return next
        },
        { replace: true }
      )
    }
  }

  const [filters, setFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS)
  const [refreshKey, setRefreshKey] = useState(0)

  /*
   * ---------------------------------------------------------
   * Load tasks
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!isCreateDialogOpen) {
      return
    }

    const loadCreateTaskOptions = async () => {
      try {
        setProjectsLoading(true)
        setUsersLoading(true)

        const [projectsResponse, usersResponse] = await Promise.all([
          searchProjects({
            page: 0,
            size: 10,
            scope: "ALL",
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
          searchUsers({
            page: 0,
            size: 10,
            isActive: true,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        ])

        setCreateProjects(
          projectsResponse.content.map((project) => ({
            id: project.id,
            name: project.name,
          }))
        )

        setCreateUsers(
          usersResponse.content.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName ?? "",
            email: user.email,
            isActive: user.isActive,
          }))
        )
      } catch (error) {
        console.error("Failed to load task creation options:", error)
      } finally {
        setProjectsLoading(false)
        setUsersLoading(false)
      }
    }

    void loadCreateTaskOptions()
  }, [isCreateDialogOpen])
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
   * Create task
   * ---------------------------------------------------------
   */

  const handleTaskCreated = (task: Task) => {
    dispatch(addTask(task))
    handleCreateOpenChange(false)
  }

  const handleCreateTask = async (
    values: CreateTaskFormValues
  ): Promise<Task> => {
    if (!currentUser?.id) {
      throw new Error("Unable to determine the current user.")
    }

    return createTask({
      title: values.title.trim(),

      description: values.description?.trim() || undefined,

      taskStatus: values.taskStatus,

      taskPriority: values.taskPriority,

      projectId: values.projectId,

      assignedToId: values.assignedToId,

      createdById: currentUser.id,

      dueDate: values.dueDate
        ? new Date(`${values.dueDate}T23:59:59`).toISOString()
        : null,
    })
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

    window.location.href = `/app/tasks/${task.id}`
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
   * Create form search
   * ---------------------------------------------------------
   *
   * These remain intentionally empty until the project/user
   * search services are connected.
   */

  const handleProjectSearch = async (keyword: string) => {
    try {
      setProjectsLoading(true)

      const response = await searchProjects({
        page: 0,
        size: 10,
        keyword: keyword.trim() || undefined,
        scope: "ALL",
        sortBy: "createdAt",
        sortOrder: "desc",
      })

      setCreateProjects(
        response.content.map((project) => ({
          id: project.id,
          name: project.name,
        }))
      )
    } catch (error) {
      console.error("Failed to search projects:", error)

      setCreateProjects([])
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleUserSearch = async (keyword: string) => {
    try {
      setUsersLoading(true)

      const response = await searchUsers({
        page: 0,
        size: 10,
        keyword: keyword.trim() || undefined,
        isActive: true,
        sortBy: "createdAt",
        sortOrder: "desc",
      })

      setCreateUsers(
        response.content.map((user) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName ?? "",
          email: user.email,
          isActive: user.isActive,
        }))
      )
    } catch (error) {
      console.error("Failed to search users:", error)

      setCreateUsers([])
    } finally {
      setUsersLoading(false)
    }
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
          <Button onClick={() => setCreateOpen(true)}>
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
          view={view}
          onViewChange={setView}
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
        {loading && view !== "table" && <TaskListSkeleton count={6} />}

        {loading && view === "table" && <TaskTableSkeleton rows={10} />}

        {/* Empty */}
        {showEmptyState && (
          <TaskEmptyState
            filtered={hasActiveFilters}
            onCreate={() => setCreateOpen(true)}
            onClearFilters={hasActiveFilters ? handleResetFilters : undefined}
          />
        )}

        {/* Card view */}
        {!loading && filteredTasks.length > 0 && view === "card" && (
          <TaskList
            tasks={filteredTasks}
            onView={handleViewTask}
            onDelete={handleDeleteTask}
          />
        )}

        {/* List view */}
        {!loading && filteredTasks.length > 0 && view === "list" && (
          <div className="flex flex-col gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onView={handleViewTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}

        {/* Table view */}
        {!loading && filteredTasks.length > 0 && view === "table" && (
          <TaskTable
            tasks={filteredTasks}
            onView={handleViewTask}
            onDelete={handleDeleteTask}
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

      {/* Create task dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>

            <DialogDescription>
              Create a task, assign it to a project member, and set its priority
              and due date.
            </DialogDescription>
          </DialogHeader>

          <CreateTaskForm
            projects={createProjects}
            users={createUsers}
            projectsLoading={projectsLoading}
            usersLoading={usersLoading}
            onProjectSearch={handleProjectSearch}
            onUserSearch={handleUserSearch}
            onSubmitTask={handleCreateTask}
            onCreated={handleTaskCreated}
            onCancel={() => handleCreateOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
