import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleUserRound,
  Filter,
  Kanban,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  Table as TableIcon,
} from "lucide-react"

import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import type { RootState } from "@/app/store"
import { getProjectById } from "@/features/projects/services/projects.services"
import { setSelectedProject } from "@/features/projects/slice/projectSlice"
import {
  getTasksByProject,
  deleteTask,
  updateTaskStatus,
} from "@/features/tasks/services/task.services"
import {
  setTasks,
  setTaskLoading,
  setTaskError,
  setTaskPage,
  setTaskPageSize,
  removeTask,
  updateTask,
} from "@/features/tasks/slice/task.slice"
import PageSizeSelector from "@/components/common/PageSizeSelector"
import type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskView,
} from "@/features/tasks/types/task.types"
import TaskCard from "@/features/tasks/components/TaskCard"
import TaskList from "@/features/tasks/components/TaskList"
import TaskTable from "@/features/tasks/components/TaskTable"
import TaskKanbanBoard from "@/features/tasks/components/TaskKanbanBoard"
import { toast } from "@/components/ui/toast"
import confetti from "canvas-confetti"

type StatusFilter = "ALL" | TaskStatus
type PriorityFilter = "ALL" | TaskPriority
type SortField = "createdAt" | "dueDate" | "title" | "taskPriority" | "taskStatus"
type SortOrder = "asc" | "desc"

export default function ProjectTasksPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { projectId } = useParams<{ projectId: string }>()

  const project = useAppSelector(
    (state: RootState) => state.project.selectedProject
  )

  const { tasks, page, size, totalElements, totalPages, loading, error } =
    useAppSelector((state: RootState) => state.task)

  const [view, setView] = useState<TaskView>("card")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL")
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Load project details if not present or ID mismatch
  useEffect(() => {
    if (!projectId) return

    let cancelled = false

    async function loadProject() {
      try {
        const projectData = await getProjectById({ id: projectId || "" })
        if (!cancelled) {
          dispatch(setSelectedProject(projectData))
        }
      } catch {
        // Handled silently
      }
    }

    if (!project || project.id !== projectId) {
      loadProject()
    }

    return () => {
      cancelled = true
    }
  }, [projectId, project, dispatch])

  // Fetch project tasks with pagination
  useEffect(() => {
    if (!projectId) return

    let cancelled = false

    async function fetchTasks() {
      try {
        dispatch(setTaskLoading(true))
        dispatch(setTaskError(null))

        const response = await getTasksByProject({
          projectId: projectId || "",
          page,
          size: size || 10,
        })

        if (!cancelled) {
          dispatch(setTasks(response))
        }
      } catch (err) {
        if (!cancelled) {
          dispatch(
            setTaskError(
              err instanceof Error ? err.message : "Unable to load project tasks."
            )
          )
        }
      } finally {
        if (!cancelled) {
          dispatch(setTaskLoading(false))
        }
      }
    }

    fetchTasks()

    return () => {
      cancelled = true
    }
  }, [projectId, page, size, dispatch])

  // Client-side filtering & sorting for the loaded tasks
  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    const list = tasks.filter((t) => {
      const matchesSearch =
        !keyword ||
        t.title?.toLowerCase().includes(keyword) ||
        t.description?.toLowerCase().includes(keyword)

      const matchesStatus =
        statusFilter === "ALL" || t.taskStatus === statusFilter

      const matchesPriority =
        priorityFilter === "ALL" || t.taskPriority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    list.sort((a, b) => {
      if (sortBy === "createdAt") {
        const timeA = new Date(a.createdAt).getTime() || 0
        const timeB = new Date(b.createdAt).getTime() || 0
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA
      }
      if (sortBy === "dueDate") {
        const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0
        const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA
      }
      if (sortBy === "title") {
        return sortOrder === "asc"
          ? (a.title || "").localeCompare(b.title || "")
          : (b.title || "").localeCompare(a.title || "")
      }
      return 0
    })

    return list
  }, [tasks, search, statusFilter, priorityFilter, sortBy, sortOrder])

  const handleTaskDelete = async (task: Task) => {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      await deleteTask({ id: task.id })
      dispatch(removeTask(task.id))
      toast.add({
        type: "success",
        title: "Task deleted",
        description: `"${task.title}" was removed.`,
      })
    } catch {
      toast.add({
        type: "error",
        title: "Delete failed",
        description: "Failed to delete task.",
      })
    }
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const previousTask = tasks.find((t) => t.id === taskId)
    if (!previousTask) return

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
      if (newStatus === "DONE") {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          })
        } catch {
          // ignore confetti error
        }
      }
      toast.add({
        type: "success",
        title: `Task moved to ${newStatus.replace("_", " ")}`,
        description: `"${previousTask.title}" updated successfully.`,
      })
    } catch (err) {
      dispatch(updateTask(previousTask))
      toast.add({
        type: "error",
        title: "Status update failed",
        description: err instanceof Error ? err.message : "Failed to update status",
      })
    }
  }

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages) return
    dispatch(setTaskPage(nextPage))
  }

  return (
    <PageContainer>
      {/* Top back & Page Header */}
      <div className="mb-6">
        <Button
          type="button"
          variant="ghost"
          className="mb-4 -ml-3 gap-2"
          onClick={() => navigate(`/app/projects/${projectId}`)}
        >
          <ArrowLeft className="size-4" />
          Project
        </Button>

        <PageHeader
          title={project ? `${project.name} Tasks` : "Project Tasks"}
          description="Manage and track work items for this project."
          className="mb-0"
          actions={
            <Button
              type="button"
              onClick={() =>
                navigate(`/app/tasks/create${projectId ? `?projectId=${projectId}` : ""}`)
              }
              className="w-full sm:w-auto"
            >
              <Plus className="size-4" />
              Create Task
            </Button>
          }
        />
      </div>

      {/* Project metrics summary cards */}
      {project && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Kanban className="size-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total Tasks</p>
                <p className="truncate text-base font-semibold">{totalElements}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                <Check className="size-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Completed Tasks</p>
                <p className="truncate text-base font-semibold">
                  {tasks.filter((t) => t.taskStatus === "DONE").length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                <CalendarDays className="size-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="truncate text-base font-semibold">
                  {tasks.filter((t) => t.taskStatus === "IN_PROGRESS").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toolbar / Controls */}
      <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                  <Filter className="size-3.5" />
                  Status: {statusFilter === "ALL" ? "All" : statusFilter.replace("_", " ")}
                </Button>
              } />
              <DropdownMenuContent align="start">
                {(["ALL", "TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const).map(
                  (st) => (
                    <DropdownMenuItem
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className="justify-between text-xs"
                    >
                      {st === "ALL" ? "All statuses" : st.replace("_", " ")}
                      {statusFilter === st && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                  Priority: {priorityFilter === "ALL" ? "All" : priorityFilter}
                </Button>
              } />
              <DropdownMenuContent align="start">
                {(["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((pr) => (
                  <DropdownMenuItem
                    key={pr}
                    onClick={() => setPriorityFilter(pr)}
                    className="justify-between text-xs"
                  >
                    {pr === "ALL" ? "All priorities" : pr}
                    {priorityFilter === pr && <Check className="size-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                  Sort: {sortBy === "createdAt" ? "Created date" : sortBy === "dueDate" ? "Due date" : "Title"} ({sortOrder})
                </Button>
              } />
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("createdAt")
                    setSortOrder("desc")
                  }}
                  className="text-xs"
                >
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("createdAt")
                    setSortOrder("asc")
                  }}
                  className="text-xs"
                >
                  Oldest first
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("dueDate")
                    setSortOrder("asc")
                  }}
                  className="text-xs"
                >
                  Due date (soonest)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("title")
                    setSortOrder("asc")
                  }}
                  className="text-xs"
                >
                  Title (A-Z)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 border-t pt-2 sm:border-t-0 sm:pt-0">
          <Button
            variant={view === "card" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("card")}
            className="size-8 p-0"
            title="Card View"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            className="size-8 p-0"
            title="List View"
          >
            <List className="size-4" />
          </Button>
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("table")}
            className="size-8 p-0"
            title="Table View"
          >
            <TableIcon className="size-4" />
          </Button>
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("kanban")}
            className="size-8 p-0"
            title="Kanban View"
          >
            <Kanban className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading project tasks...
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Unable to load tasks</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredTasks.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-12 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <CircleUserRound className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">No tasks found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {search || statusFilter !== "ALL" || priorityFilter !== "ALL"
              ? "Try adjusting your search query or filter selections."
              : "No tasks have been created for this project yet."}
          </p>
          <Button
            className="mt-4"
            size="sm"
            onClick={() =>
              navigate(`/app/tasks/create${projectId ? `?projectId=${projectId}` : ""}`)
            }
          >
            <Plus className="size-4" />
            Create First Task
          </Button>
        </div>
      ) : (
        <>
          {view === "card" && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTasks.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onView={(t: Task) => navigate(`/app/tasks/${t.id}`)}
                  onDelete={handleTaskDelete}
                  onStatusChange={(t: Task) => {
                    const next: TaskStatus = t.taskStatus === "DONE" ? "IN_PROGRESS" : "DONE"
                    handleTaskStatusChange(t.id, next)
                  }}
                />
              ))}
            </div>
          )}

          {view === "list" && (
            <TaskList
              tasks={filteredTasks}
              onView={(t: Task) => navigate(`/app/tasks/${t.id}`)}
              onDelete={handleTaskDelete}
            />
          )}

          {view === "table" && (
            <TaskTable
              tasks={filteredTasks}
              onView={(t: Task) => navigate(`/app/tasks/${t.id}`)}
              onDelete={handleTaskDelete}
            />
          )}

          {view === "kanban" && (
            <TaskKanbanBoard
              tasks={filteredTasks}
              onViewTask={(t: Task) => navigate(`/app/tasks/${t.id}`)}
              onDeleteTask={handleTaskDelete}
              onStatusChange={handleTaskStatusChange}
              onAddTask={(status: TaskStatus) =>
                navigate(`/app/tasks/create?projectId=${projectId}&status=${status}`)
              }
            />
          )}

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="mt-6 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing {totalElements === 0 ? 0 : page * (size || 10) + 1}–{Math.min((page + 1) * (size || 10), totalElements)} of{" "}
                  {totalElements.toLocaleString("en-IN")} tasks
                </p>
                <PageSizeSelector
                  value={size || 10}
                  onChange={(newSize) => {
                    dispatch(setTaskPageSize(newSize))
                    dispatch(setTaskPage(0))
                  }}
                  options={[10, 20, 50, 100]}
                />
              </div>

              {totalPages > 1 && (
                <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                  <PaginationContent className="flex-wrap">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={page === 0}
                        tabIndex={page === 0 ? -1 : undefined}
                        className={
                          page === 0
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 0) handlePageChange(page - 1)
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
                            onClick={(e) => {
                              e.preventDefault()
                              if (page !== item) handlePageChange(item)
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
                        aria-disabled={page >= totalPages - 1}
                        tabIndex={page >= totalPages - 1 ? -1 : undefined}
                        className={
                          page >= totalPages - 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                        onClick={(e) => {
                          e.preventDefault()
                          if (page < totalPages - 1) handlePageChange(page + 1)
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
