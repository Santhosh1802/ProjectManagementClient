import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StatusBadge from "@/components/common/StatusBadge"
import { useUserOwnedProjectsQuery } from "../hooks/useUsersQuery"
import { useTasksByAssignedToQuery } from "@/features/tasks/hooks/useTasksQuery"
import { formatDate } from "@/lib/dateConverter"
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Briefcase,
  ArrowRight,
  Plus,
  Calendar,
  Layers,
} from "lucide-react"
import type { User } from "../types/user.types"

interface UserWorkspaceOverviewProps {
  user: User
  onSwitchToSettings?: () => void
}

export default function UserWorkspaceOverview({
  user,
}: UserWorkspaceOverviewProps) {
  const navigate = useNavigate()
  const [projectsPage, setProjectsPage] = useState(0)
  const [tasksPage, setTasksPage] = useState(0)

  const PROJECTS_PER_PAGE = 5
  const TASKS_PER_PAGE = 5

  const {
    data: ownedProjectsData,
    isLoading: loadingProjects,
  } = useUserOwnedProjectsQuery(user.id, { enabled: Boolean(user.id) })

  const {
    data: tasksData,
    isLoading: loadingTasks,
  } = useTasksByAssignedToQuery(
    { assignedToId: user.id, page: tasksPage, size: TASKS_PER_PAGE },
    { enabled: Boolean(user.id) }
  )

  const ownedProjects = ownedProjectsData?.ownedProjects ?? []
  const assignedTasks = tasksData?.content ?? []
  const totalTasks = tasksData?.totalElements ?? 0
  const totalTasksPages = tasksData?.totalPages ?? 1

  const totalProjects = ownedProjects.length
  const totalProjectsPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE) || 1
  const paginatedOwnedProjects = ownedProjects.slice(
    projectsPage * PROJECTS_PER_PAGE,
    (projectsPage + 1) * PROJECTS_PER_PAGE
  )

  const activeProjectsCount = ownedProjects.filter(
    (p) => p.projectStatus === "ACTIVE"
  ).length

  const completedProjectsCount = ownedProjects.filter(
    (p) => p.projectStatus === "COMPLETED"
  ).length

  return (
    <div className="flex w-full flex-col gap-6">
      {/* ----------------------------------------- */}
      {/* Metrics Row */}
      {/* ----------------------------------------- */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {/* Total Owned Projects */}
        <Card className="rounded-xl border border-border shadow-xs p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              Owned Projects
            </span>
            <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="size-3 sm:size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {loadingProjects ? "..." : ownedProjects.length}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              Created & managed
            </p>
          </div>
        </Card>

        {/* Active Projects */}
        <Card className="rounded-xl border border-border shadow-xs p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              Active Projects
            </span>
            <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Layers className="size-3 sm:size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {loadingProjects ? "..." : activeProjectsCount}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              In progress
            </p>
          </div>
        </Card>

        {/* Tasks Assigned */}
        <Card className="rounded-xl border border-border shadow-xs p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              Assigned Tasks
            </span>
            <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="size-3 sm:size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {loadingTasks ? "..." : totalTasks}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              Assigned to you
            </p>
          </div>
        </Card>

        {/* Completed Projects */}
        <Card className="rounded-xl border border-border shadow-xs p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              Completed
            </span>
            <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="size-3 sm:size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {loadingProjects ? "..." : completedProjectsCount}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              Finished
            </p>
          </div>
        </Card>
      </div>

      {/* ----------------------------------------- */}
      {/* 2-Column: Owned Projects & Assigned Tasks */}
      {/* ----------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Owned Projects (7 cols) */}
        <Card className="rounded-xl border border-border shadow-xs lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Your Owned Projects
              </CardTitle>
              <CardDescription className="text-xs">
                Projects where you are assigned as the owner.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7.5 gap-1.5 px-2.5 text-xs"
                onClick={() => navigate("/app/projects/create")}
              >
                <Plus className="size-3.5" />
                <span>New</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7.5 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/app/projects")}
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-1">
            {loadingProjects ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-18 animate-pulse rounded-lg border border-border bg-muted/40"
                  />
                ))}
              </div>
            ) : ownedProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FolderKanban className="size-6" />
                </div>
                <h4 className="mt-3 text-sm font-semibold">No owned projects yet</h4>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  You haven't created any projects. Start collaborating by launching your first project.
                </p>
                <Button
                  size="sm"
                  className="mt-4 h-8 gap-1.5 text-xs"
                  onClick={() => navigate("/app/projects/create")}
                >
                  <Plus className="size-3.5" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {paginatedOwnedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group flex flex-col justify-between gap-3 rounded-lg border border-border bg-card p-3.5 transition-all hover:bg-muted/40 hover:shadow-xs sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/app/projects/${project.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {project.name}
                        </Link>
                        <StatusBadge
                          status={project.projectStatus}
                          size="sm"
                          showDot
                        />
                      </div>
                      {project.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        {project.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Due {formatDate(project.dueDate)}
                          </span>
                        )}
                        {project.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            Created {formatDate(project.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7.5 self-start px-2.5 text-xs opacity-80 group-hover:opacity-100 sm:self-center"
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                    >
                      <span>Open</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                ))}

                {/* Pagination for Projects */}
                {totalProjectsPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      Page {projectsPage + 1} of {totalProjectsPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={projectsPage === 0}
                        onClick={() => setProjectsPage((p) => Math.max(0, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={projectsPage >= totalProjectsPages - 1}
                        onClick={() => setProjectsPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Tasks (5 cols) */}
        <Card className="rounded-xl border border-border shadow-xs lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Your Assigned Tasks
              </CardTitle>
              <CardDescription className="text-xs">
                Recent tasks assigned to you.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7.5 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/app/tasks")}
            >
              <span>View all</span>
              <ArrowRight className="size-3" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-3 pt-1">
            {loadingTasks ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg border border-border bg-muted/40"
                  />
                ))}
              </div>
            ) : assignedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Briefcase className="size-6" />
                </div>
                <h4 className="mt-3 text-sm font-semibold">No assigned tasks</h4>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  You currently have no tasks assigned to your queue.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 h-8 gap-1.5 text-xs"
                  onClick={() => navigate("/app/tasks")}
                >
                  Browse Tasks
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:bg-muted/40 hover:shadow-xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/app/tasks/${task.id}`}
                          className="line-clamp-1 text-sm font-medium text-foreground hover:underline"
                        >
                          {task.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          status={task.taskStatus}
                          size="sm"
                          showDot
                        />
                        {task.taskPriority && (
                          <StatusBadge
                            status={task.taskPriority}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7.5 p-0 text-muted-foreground group-hover:text-foreground"
                      onClick={() => navigate(`/app/tasks/${task.id}`)}
                    >
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                ))}

                {/* Pagination for Tasks */}
                {totalTasksPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      Page {tasksPage + 1} of {totalTasksPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={tasksPage === 0}
                        onClick={() => setTasksPage((p) => Math.max(0, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={tasksPage >= totalTasksPages - 1}
                        onClick={() => setTasksPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
