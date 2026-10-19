import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Clock,
  Copy,
  FolderKanban,
  Layers,
  ListTodo,
  Mail,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react"

import StatusBadge from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import EmptyState from "@/components/common/EmptyState"

import { useUserDetailQuery, useUserOwnedProjectsQuery } from "@/features/users/hooks/useUsersQuery"
import { useTasksByAssignedToQuery, useTasksByCreatedByQuery } from "@/features/tasks/hooks/useTasksQuery"
import { formatDate, formatDateTime } from "@/lib/dateConverter"

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 py-3">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium wrap-break-word">{value || "—"}</p>
      </div>
    </div>
  )
}

function UserDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>("overview")

  const [projectsPage, setProjectsPage] = useState(0)
  const [assignedPage, setAssignedPage] = useState(0)
  const [createdPage, setCreatedPage] = useState(0)

  const PROJECTS_PER_PAGE = 5
  const TASKS_PER_PAGE = 5

  /* 1. User detail query */
  const {
    data: user,
    isLoading: userLoading,
    isFetching: userFetching,
    error: userError,
    refetch: refetchUser,
  } = useUserDetailQuery(userId, { enabled: Boolean(userId) })

  /* 2. User owned projects query */
  const {
    data: ownedProjectsData,
    isLoading: loadingProjects,
    refetch: refetchProjects,
  } = useUserOwnedProjectsQuery(userId, { enabled: Boolean(userId) })

  /* 3. Tasks assigned to user query */
  const {
    data: assignedTasksData,
    isLoading: loadingAssignedTasks,
    refetch: refetchAssignedTasks,
  } = useTasksByAssignedToQuery(
    { assignedToId: userId ?? "", page: assignedPage, size: TASKS_PER_PAGE },
    { enabled: Boolean(userId) }
  )

  /* 4. Tasks created by user query */
  const {
    data: createdTasksData,
    isLoading: loadingCreatedTasks,
    refetch: refetchCreatedTasks,
  } = useTasksByCreatedByQuery(
    { createdByUserId: userId ?? "", page: createdPage, size: 6 },
    { enabled: Boolean(userId) }
  )

  const handleRefreshAll = () => {
    void refetchUser()
    void refetchProjects()
    void refetchAssignedTasks()
    void refetchCreatedTasks()
  }

  const ownedProjects = ownedProjectsData?.ownedProjects ?? []
  const assignedTasks = assignedTasksData?.content ?? []
  const createdTasks = createdTasksData?.content ?? []

  const totalAssignedTasks = assignedTasksData?.totalElements ?? 0
  const totalCreatedTasks = createdTasksData?.totalElements ?? 0

  const activeProjectsCount = ownedProjects.filter(
    (p) => p.projectStatus === "ACTIVE"
  ).length

  const completedProjectsCount = ownedProjects.filter(
    (p) => p.projectStatus === "COMPLETED"
  ).length

  const totalProjects = ownedProjects.length
  const totalProjectsPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE) || 1
  const paginatedOwnedProjects = ownedProjects.slice(
    projectsPage * PROJECTS_PER_PAGE,
    (projectsPage + 1) * PROJECTS_PER_PAGE
  )

  const totalAssignedPages = assignedTasksData?.totalPages ?? 1
  const totalCreatedPages = createdTasksData?.totalPages ?? 1

  const handleCopyId = async () => {
    if (!userId) return

    try {
      await navigator.clipboard.writeText(userId)
      toast.add({ type: "success", title: "User ID copied." })
    } catch {
      toast.add({ type: "error", title: "Unable to copy user ID." })
    }
  }

  if (!userId) {
    return (
      <PageContainer>
        <EmptyState
          title="User ID is missing"
          description="No user ID was provided in the URL."
          action={<Button onClick={() => navigate("/app/users")}>Return to users</Button>}
          icon={CircleUserRound}
        />
      </PageContainer>
    )
  }

  if (userLoading) {
    return (
      <PageContainer>
        <UserDetailsSkeleton />
      </PageContainer>
    )
  }

  if (userError || !user) {
    return (
      <PageContainer className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/app/users")} className="-ml-3">
          <ArrowLeft className="mr-2 size-4" />
          Back to users
        </Button>

        <EmptyState
          title="Unable to display user"
          description="The requested user could not be found."
          action={<Button onClick={() => navigate("/app/users")}>Return to users</Button>}
          icon={CircleUserRound}
        />
      </PageContainer>
    )
  }

  const firstName = user.firstName ?? ""
  const lastName = user.lastName ?? ""
  const fullName = `${firstName} ${lastName}`.trim() || "Unnamed user"
  const email = user.email ?? "No email address"
  const role = user.userRole ?? "USER"
  const isUserActive = user.isActive === true
  const isVerified = user.emailVerified === true
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U"

  return (
    <PageContainer className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          to="/app/users"
          className="transition-colors hover:text-foreground"
        >
          Users
        </Link>
        <span>/</span>
        <span className="text-foreground">{fullName}</span>
      </div>

      <PageHeader
        title={fullName}
        description="Comprehensive user profile, workspace projects, and task activity."
        onRefresh={handleRefreshAll}
        isRefreshing={userFetching}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleCopyId}
            >
              <Copy className="size-3.5" />
              <span>Copy ID</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Back to users"
              onClick={() => navigate("/app/users")}
            >
              <ArrowLeft className="size-4" />
            </Button>
          </div>
        }
      />

      {/* ----------------------------------------- */}
      {/* User Header Profile Card */}
      {/* ----------------------------------------- */}
      <Card className="rounded-xl border border-border shadow-xs">
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full border bg-primary/10 text-xl font-bold text-primary">
              {initials}
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {fullName}
                </h2>
                <StatusBadge status={role} size="sm" />
                <StatusBadge
                  status={isUserActive ? "active" : "inactive"}
                  size="sm"
                  showDot
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                <span className="break-all">{email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t pt-3 sm:border-t-0 sm:pt-0">
            <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Account Status
              </p>
              <p className="text-xs font-semibold">
                {isUserActive ? "Active" : "Disabled"}
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Email Status
              </p>
              <p className="text-xs font-semibold">
                {isVerified ? "Verified" : "Unverified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------------------- */}
      {/* Insights & Metrics Cards */}
      {/* ----------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Owned Projects */}
        <Card className="rounded-xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Owned Projects
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingProjects ? "..." : ownedProjects.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeProjectsCount} active · {completedProjectsCount} completed
            </p>
          </CardContent>
        </Card>

        {/* Assigned Tasks */}
        <Card className="rounded-xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Assigned Tasks
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingAssignedTasks ? "..." : totalAssignedTasks}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tasks assigned to user
            </p>
          </CardContent>
        </Card>

        {/* Tasks Created */}
        <Card className="rounded-xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Created Tasks
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ListTodo className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingCreatedTasks ? "..." : totalCreatedTasks}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Authored by this user
            </p>
          </CardContent>
        </Card>

        {/* Last Login */}
        <Card className="rounded-xl border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Last Login
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold truncate">
              {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Member since {formatDate(user.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------- */}
      {/* Tabs: Workspace Activity vs Account Details */}
      {/* ----------------------------------------- */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) setActiveTab(val)
        }}
        className="w-full space-y-6"
      >
        <div className="w-full overflow-x-auto no-scrollbar border-b border-border pb-1">
          <TabsList variant="line" className="inline-flex w-max min-w-full sm:min-w-0 sm:w-auto gap-2">
            <TabsTrigger
              value="overview"
              className="gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
            >
              <Layers className="size-4 shrink-0" />
              <span>Projects & Tasks</span>
            </TabsTrigger>
            <TabsTrigger
              value="created-tasks"
              className="gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
            >
              <ListTodo className="size-4 shrink-0" />
              <span>Authored Tasks ({totalCreatedTasks})</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
            >
              <UserRound className="size-4 shrink-0" />
              <span>Account Details</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Projects & Tasks Showcase */}
        <TabsContent value="overview" className="mt-0 space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Owned Projects (7 cols) */}
            <Card className="rounded-xl border border-border shadow-xs lg:col-span-7">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">
                    Owned Projects ({ownedProjects.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Projects led and managed by this user.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-1">
                {loadingProjects ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 animate-pulse rounded-lg border border-border bg-muted/40"
                      />
                    ))}
                  </div>
                ) : ownedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
                    <FolderKanban className="size-6 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">No owned projects</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This user has not created or been assigned as project owner yet.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {paginatedOwnedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="group flex flex-col justify-between gap-3 rounded-lg border border-border bg-card p-3.5 transition-all hover:bg-muted/40 sm:flex-row sm:items-center"
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
                    Assigned Tasks ({totalAssignedTasks})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Recent tasks in user's queue.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-1">
                {loadingAssignedTasks ? (
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
                    <Briefcase className="size-6 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">No assigned tasks</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      User has no open tasks in their assignment queue.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {assignedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:bg-muted/40"
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

                    {/* Pagination for Assigned Tasks */}
                    {totalAssignedPages > 1 && (
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <p className="text-xs text-muted-foreground">
                          Page {assignedPage + 1} of {totalAssignedPages}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={assignedPage === 0}
                            onClick={() => setAssignedPage((p) => Math.max(0, p - 1))}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={assignedPage >= totalAssignedPages - 1}
                            onClick={() => setAssignedPage((p) => p + 1)}
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
        </TabsContent>

        {/* Tab 2: Authored Tasks Showcase */}
        <TabsContent value="created-tasks" className="mt-0 focus-visible:outline-none">
          <Card className="rounded-xl border border-border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  Authored Tasks ({totalCreatedTasks})
                </CardTitle>
                <CardDescription className="text-xs">
                  Tasks initiated and assigned to team members by this user.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {loadingCreatedTasks ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-lg border border-border bg-muted/40"
                    />
                  ))}
                </div>
              ) : createdTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <ListTodo className="size-6 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">No authored tasks</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This user has not created any tasks yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {createdTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:bg-muted/40"
                      >
                        <div className="min-w-0 space-y-1">
                          <Link
                            to={`/app/tasks/${task.id}`}
                            className="line-clamp-1 text-sm font-medium text-foreground hover:underline"
                          >
                            {task.title}
                          </Link>
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
                  </div>

                  {/* Pagination for Authored Tasks */}
                  {totalCreatedPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground">
                        Page {createdPage + 1} of {totalCreatedPages}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          disabled={createdPage === 0}
                          onClick={() => setCreatedPage((p) => Math.max(0, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          disabled={createdPage >= totalCreatedPages - 1}
                          onClick={() => setCreatedPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Account Information Details */}
        <TabsContent value="account" className="mt-0 focus-visible:outline-none">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-xl border border-border shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserRound className="size-5 text-muted-foreground" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>
                  Basic profile attributes and contact details.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <DetailItem label="First Name" value={firstName} />
                  <DetailItem label="Last Name" value={lastName} />
                  <DetailItem
                    label="Email Address"
                    value={email}
                    icon={<Mail className="size-4" />}
                  />
                  <DetailItem
                    label="Assigned Role"
                    value={role}
                    icon={<ShieldCheck className="size-4" />}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-muted-foreground" />
                  <CardTitle>Account Security & Timestamps</CardTitle>
                </div>
                <CardDescription>
                  Identifiers, verification state, and login history.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <DetailItem
                  label="System User ID"
                  value={userId ?? "Not available"}
                  icon={<CircleUserRound className="size-4" />}
                />

                <Separator />

                <div className="flex items-start gap-3 py-3">
                  {isVerified ? (
                    <CheckCircle2 className="mt-0.5 size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 text-destructive" />
                  )}

                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-muted-foreground">Email Verification</p>
                    <p className="text-sm font-medium">
                      {isVerified ? "Verified" : "Unverified"}
                    </p>
                  </div>
                </div>

                <Separator />

                <DetailItem
                  label="Member Since"
                  value={formatDateTime(user.createdAt)}
                  icon={<CalendarDays className="size-4" />}
                />

                <Separator />

                <DetailItem
                  label="Last Account Update"
                  value={formatDateTime(user.updatedAt)}
                  icon={<Clock className="size-4" />}
                />

                <Separator />

                <DetailItem
                  label="Last Active / Login"
                  value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never logged in"}
                  icon={<Clock className="size-4" />}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
