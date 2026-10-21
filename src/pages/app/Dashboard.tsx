import { useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import { useProjectsQuery } from "@/features/projects/hooks/useProjectsQuery"
import { useTasksByAssignedToQuery, useTasksQuery } from "@/features/tasks/hooks/useTasksQuery"
import { useUsersQuery } from "@/features/users/hooks/useUsersQuery"
import { useAppSelector } from "@/hooks/redux-hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  ArrowRight,
  Briefcase,
  Clock,
  FolderKanban,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Flame,
  Layers,
  ArrowUpRight,
} from "lucide-react"

import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------
   Chart Configurations for shadcn/ui ChartContainer
   ------------------------------------------------------------- */

const taskPieChartConfig = {
  tasks: {
    label: "Tasks",
  },
  DONE: {
    label: "Done",
    color: "var(--color-chart-2)",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "var(--color-chart-1)",
  },
  TODO: {
    label: "To Do",
    color: "var(--color-chart-4)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "var(--color-chart-5)",
  },
} satisfies ChartConfig

const barChartConfig = {
  count: {
    label: "Total",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export default function Dashboard() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.auth.user)
  const role = (currentUser?.user_role?.toUpperCase() || "USER") as "ADMIN" | "MANAGER" | "USER"

  /* Query: Projects */
  const {
    data: projRes,
    isLoading: loadingProjects,
    isFetching: isFetchingProjects,
    refetch: refetchProjects,
  } = useProjectsQuery({ size: 20, sortBy: "createdAt", sortOrder: "desc" })

  /* Query: My Assigned Tasks */
  const {
    data: myTasksRes,
    isLoading: loadingMyTasks,
    isFetching: isFetchingMyTasks,
    refetch: refetchMyTasks,
  } = useTasksByAssignedToQuery(
    { assignedToId: currentUser?.id ?? "", size: 20 },
    { enabled: Boolean(currentUser?.id) }
  )

  /* Query: Workspace Tasks (for Admin & Manager overview) */
  const {
    data: allTasksRes,
    isLoading: loadingAllTasks,
    isFetching: isFetchingAllTasks,
    refetch: refetchAllTasks,
  } = useTasksQuery(
    { size: 50 },
    { enabled: role === "ADMIN" || role === "MANAGER" }
  )

  /* Query: Users (for Admin metrics) */
  const {
    data: usersRes,
    isLoading: loadingUsers,
    isFetching: isFetchingUsers,
    refetch: refetchUsers,
  } = useUsersQuery(
    { size: 50 },
    { enabled: role === "ADMIN" }
  )

  const projects = projRes?.content ?? []
  const totalProjects = projRes?.totalElements ?? 0

  const myTasks = myTasksRes?.content ?? []
  const totalMyTasks = myTasksRes?.totalElements ?? 0

  const allTasks = allTasksRes?.content ?? []
  const totalAllTasks = allTasksRes?.totalElements ?? 0

  const users = usersRes?.content ?? []
  const totalUsers = usersRes?.totalElements ?? 0

  const displayedTasks = role === "USER" ? myTasks : allTasks
  const displayedTasksCount = role === "USER" ? totalMyTasks : totalAllTasks
  const loadingDisplayedTasks = role === "USER" ? loadingMyTasks : loadingAllTasks

  const isRefreshing =
    isFetchingProjects ||
    isFetchingMyTasks ||
    (role !== "USER" && isFetchingAllTasks) ||
    (role === "ADMIN" && isFetchingUsers)

  const handleRefresh = () => {
    void refetchProjects()
    if (currentUser?.id) void refetchMyTasks()
    if (role === "ADMIN" || role === "MANAGER") void refetchAllTasks()
    if (role === "ADMIN") void refetchUsers()
  }

  /* Compute Stats: My Tasks */
  const myTaskStats = useMemo(() => {
    let todo = 0
    let inProgress = 0
    let done = 0
    let overdue = 0
    let highOrUrgent = 0

    const now = new Date()

    myTasks.forEach((t) => {
      if (t.taskStatus === "TODO") todo++
      else if (t.taskStatus === "IN_PROGRESS") inProgress++
      else if (t.taskStatus === "DONE") done++

      if (t.taskPriority === "HIGH" || t.taskPriority === "URGENT") {
        highOrUrgent++
      }

      if (t.dueDate && t.taskStatus !== "DONE" && t.taskStatus !== "CANCELLED") {
        if (new Date(t.dueDate) < now) overdue++
      }
    })

    return { todo, inProgress, done, overdue, highOrUrgent }
  }, [myTasks])

  /* Compute Stats: Projects */
  const projectStats = useMemo(() => {
    let active = 0
    let planning = 0
    let completed = 0

    projects.forEach((p) => {
      if (p.projectStatus === "ACTIVE") active++
      else if (p.projectStatus === "PLANNING") planning++
      else if (p.projectStatus === "COMPLETED") completed++
    })

    return { active, planning, completed }
  }, [projects])

  /* Compute Stats: System Tasks (Admin/Manager) */
  const systemTaskStats = useMemo(() => {
    let todo = 0
    let inProgress = 0
    let done = 0
    let cancelled = 0

    allTasks.forEach((t) => {
      if (t.taskStatus === "TODO") todo++
      else if (t.taskStatus === "IN_PROGRESS") inProgress++
      else if (t.taskStatus === "DONE") done++
      else if (t.taskStatus === "CANCELLED") cancelled++
    })

    return { todo, inProgress, done, cancelled }
  }, [allTasks])

  /* Compute Stats: Users (Admin) */
  const userStats = useMemo(() => {
    let active = 0
    let admins = 0
    let managers = 0
    let regularUsers = 0

    users.forEach((u) => {
      if (u.isActive) active++
      const r = u.userRole?.toUpperCase()
      if (r === "ADMIN") admins++
      else if (r === "MANAGER") managers++
      else regularUsers++
    })

    return { active, admins, managers, regularUsers }
  }, [users])

  const completionRate =
    myTasks.length > 0 ? Math.round((myTaskStats.done / myTasks.length) * 100) : 0

  const systemCompletionRate =
    allTasks.length > 0 ? Math.round((systemTaskStats.done / allTasks.length) * 100) : 0

  /* -------------------------------------------------------------
     Chart Data for Pie Chart & Bar Chart
     ------------------------------------------------------------- */
  const taskStatusChartData = useMemo(() => {
    if (role === "USER") {
      return [
        { status: "DONE", count: myTaskStats.done, fill: "var(--color-chart-2)" },
        { status: "IN_PROGRESS", count: myTaskStats.inProgress, fill: "var(--color-chart-1)" },
        { status: "TODO", count: myTaskStats.todo, fill: "var(--color-chart-4)" },
      ].filter((d) => d.count > 0)
    }
    return [
      { status: "DONE", count: systemTaskStats.done, fill: "var(--color-chart-2)" },
      { status: "IN_PROGRESS", count: systemTaskStats.inProgress, fill: "var(--color-chart-1)" },
      { status: "TODO", count: systemTaskStats.todo, fill: "var(--color-chart-4)" },
      { status: "CANCELLED", count: systemTaskStats.cancelled, fill: "var(--color-chart-5)" },
    ].filter((d) => d.count > 0)
  }, [role, myTaskStats, systemTaskStats])

  const secondaryChartData = useMemo(() => {
    if (role === "ADMIN") {
      return [
        { category: "Admins", count: userStats.admins },
        { category: "Managers", count: userStats.managers },
        { category: "Members", count: userStats.regularUsers },
      ]
    }
    return [
      { category: "Active", count: projectStats.active },
      { category: "Planning", count: projectStats.planning },
      { category: "Completed", count: projectStats.completed },
    ]
  }, [role, userStats, projectStats])

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={`Welcome back, ${currentUser?.firstName || "User"}!`}
        description={
          role === "ADMIN"
            ? "Workspace Administration & Global Operations Dashboard"
            : role === "MANAGER"
            ? "Project Delivery, Resource Allocation & Progress Dashboard"
            : "Personal Workspace, Active Assignments & Productivity Dashboard"
        }
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* -------------------------------------------------------------
          TOP METRICS TILES (ROLE SENSITIVE & COMPACT ON MOBILE)
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {/* Metric 1: Total Projects */}
        <Card className="hover:border-primary/40 transition-all p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {role === "ADMIN" ? "Total Projects" : "Active Projects"}
            </span>
            <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="size-3 sm:size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {loadingProjects ? "..." : totalProjects}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 sm:gap-1.5 truncate">
              <span className="inline-block size-1 sm:size-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{projectStats.active} active</span>
            </p>
          </div>
        </Card>

        {/* Metric 2: Primary Work Metric */}
        {role === "ADMIN" ? (
          <Card className="hover:border-primary/40 transition-all p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Total Members
              </span>
              <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-primary/10 text-primary">
                <Users className="size-3 sm:size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                {loadingUsers ? "..." : totalUsers}
              </div>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 sm:gap-1.5 truncate">
                <span className="inline-block size-1 sm:size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{userStats.active} active</span>
              </p>
            </div>
          </Card>
        ) : (
          <Card className="hover:border-primary/40 transition-all p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Assigned Tasks
              </span>
              <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-primary/10 text-primary">
                <Briefcase className="size-3 sm:size-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                {loadingMyTasks ? "..." : totalMyTasks}
              </div>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 sm:gap-1.5 truncate">
                <span className="inline-block size-1 sm:size-1.5 rounded-full bg-sky-500 shrink-0" />
                <span className="truncate">{myTaskStats.inProgress} in progress</span>
              </p>
            </div>
          </Card>
        )}

        {/* Metric 3: Attention Required / High Priority */}
        <Card className="hover:border-primary/40 transition-all p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {role === "USER" ? "Due / Overdue" : "Critical Tasks"}
            </span>
            <div
              className={cn(
                "flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg",
                myTaskStats.overdue > 0
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {myTaskStats.overdue > 0 ? (
                <AlertCircle className="size-3 sm:size-4" />
              ) : (
                <Clock className="size-3 sm:size-4" />
              )}
            </div>
          </div>
          <div>
            <div
              className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight",
                myTaskStats.overdue > 0 && "text-destructive"
              )}
            >
              {myTaskStats.overdue}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              {myTaskStats.overdue > 0 ? "Needs attention" : "On schedule"}
            </p>
          </div>
        </Card>

        {/* Metric 4: Health / Completion Velocity */}
        <Card className="hover:border-primary/40 transition-all p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {role === "USER" ? "Completion" : "Velocity"}
            </span>
            <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="size-3 sm:size-4 text-emerald-500" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {role === "USER" ? `${completionRate}%` : `${systemCompletionRate}%`}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              {role === "USER"
                ? `${myTaskStats.done} of ${myTasks.length} done`
                : `${systemTaskStats.done} done`}
            </p>
          </div>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          SHADCN CHARTS SECTION (PIE / DONUT & BAR CHARTS)
          ------------------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-12 min-w-0">
        {/* Chart 1: shadcn/ui Pie Chart for Task Status Breakdown (7 Cols) */}
        <Card className="lg:col-span-7 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                {role === "USER" ? "My Tasks Status Breakdown" : "Workspace Task Distribution"}
              </CardTitle>
              <CardDescription>
                {role === "USER"
                  ? "Visual status breakdown of your deliverables."
                  : "Status progression across all workspace tasks."}
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs w-fit">
              {displayedTasksCount} Tasks
            </Badge>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden">
            {taskStatusChartData.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                <Briefcase className="mb-2 size-8 text-muted-foreground/50" />
                <p>No task data available to visualize yet.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2 min-w-0">
                <ChartContainer
                  config={taskPieChartConfig}
                  className="mx-auto aspect-square h-[200px] w-full max-w-[200px] shrink-0"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={taskStatusChartData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={50}
                      outerRadius={75}
                      strokeWidth={3}
                      stroke="var(--color-card, #ffffff)"
                    >
                      {taskStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                {/* Legend & Summary */}
                <div className="flex flex-col gap-2.5 min-w-[160px]">
                  {taskStatusChartData.map((item) => (
                    <div key={item.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="font-medium text-muted-foreground">
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                      <span className="font-bold text-foreground">{item.count}</span>
                    </div>
                  ))}
                  {myTaskStats.overdue > 0 && role === "USER" && (
                    <div className="mt-2 rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <AlertCircle className="size-3" /> Overdue
                      </span>
                      <span className="font-bold">{myTaskStats.overdue}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: shadcn/ui Bar Chart for Secondary Distribution (5 Cols) */}
        <Card className="lg:col-span-5 min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {role === "ADMIN" ? "System Role Distribution" : "Project Status Distribution"}
            </CardTitle>
            <CardDescription>
              {role === "ADMIN"
                ? "Active account permissions breakdown."
                : "Lifecycle stage overview across all initiatives."}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden px-2 sm:px-6">
            <ChartContainer
              config={barChartConfig}
              className="h-[220px] w-full min-w-0"
            >
              <BarChart data={secondaryChartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="text-xs text-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs text-muted-foreground"
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          RECENT WORKSPACE CONTENT LISTS
          ------------------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7 min-w-0">
        {/* Projects List (4 cols) */}
        <Card className="lg:col-span-4 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold">Recent Projects</CardTitle>
              <CardDescription>Active projects in your workspace.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {(role === "ADMIN" || role === "MANAGER") && (
                <Button size="sm" variant="outline" onClick={() => navigate("/app/projects/create")} className="h-8 gap-1.5 text-xs">
                  <Plus className="size-3.5" />
                  <span>New</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/app/projects")} className="h-8 gap-1 text-xs">
                <span>View All</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loadingProjects ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <FolderKanban className="mb-2 size-7 text-muted-foreground/60" />
                <p className="text-sm font-medium">No projects available</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Create a new project to start tracking milestones.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-muted/40 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderKanban className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/app/projects/${project.id}`}
                          className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate block"
                        >
                          {project.name}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          Owner: {project.owner.firstName} {project.owner.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider",
                          project.projectStatus === "ACTIVE"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : project.projectStatus === "PLANNING"
                            ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                            : "border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        {project.projectStatus}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/app/projects/${project.id}`)}
                        className="size-7"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks List (3 cols) */}
        <Card className="lg:col-span-3 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold">
                {role === "USER" ? "Your Assigned Tasks" : "Priority Tasks"}
              </CardTitle>
              <CardDescription>
                {role === "USER" ? "Items waiting on you." : "High priority work across projects."}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/tasks")} className="h-8 gap-1 text-xs">
              <span>View All</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {loadingDisplayedTasks ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : displayedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <Briefcase className="mb-2 size-7 text-muted-foreground/60" />
                <p className="text-sm font-medium">
                  {role === "USER" ? "No tasks assigned" : "No workspace tasks"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {role === "USER"
                    ? "You're all caught up on deliverables!"
                    : "Create tasks within projects to track work."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {displayedTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between py-3 transition-colors hover:bg-muted/40 px-2 rounded-lg"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <Link
                        to={`/app/tasks/${task.id}`}
                        className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {task.title}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.project?.name || "Workspace Task"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-mono",
                          task.taskPriority === "URGENT" || task.taskPriority === "HIGH"
                            ? "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10"
                            : "border-muted-foreground/20 text-muted-foreground"
                        )}
                      >
                        {task.taskPriority}
                      </Badge>

                      <Badge
                        variant="secondary"
                        className="text-[9px] font-semibold"
                      >
                        {task.taskStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          ROLE-BASED QUICK ACTION BANNER
          ------------------------------------------------------------- */}
      {role === "ADMIN" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Administrator Operations Center</p>
                <p className="text-xs text-muted-foreground">Manage user accounts, assign workspace roles, and control global settings.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => navigate("/app/users")} className="h-8 gap-1.5 text-xs">
                <Users className="size-3.5" />
                <span>Manage Users</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/app/settings")} className="h-8 gap-1.5 text-xs">
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {role === "MANAGER" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Layers className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Project Delivery & Planning Hub</p>
                <p className="text-xs text-muted-foreground">Set up new initiatives, invite team members, and assign task milestones.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => navigate("/app/projects/create")} className="h-8 gap-1.5 text-xs">
                <Plus className="size-3.5" />
                <span>Create Project</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/app/projects")} className="h-8 gap-1.5 text-xs">
                <span>View Projects</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {role === "USER" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Flame className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Productivity Focus</p>
                <p className="text-xs text-muted-foreground">
                  You have {myTaskStats.inProgress} tasks in progress and {myTaskStats.todo} to do. Keep the momentum going!
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => navigate("/app/tasks")} className="h-8 gap-1.5 text-xs">
              <Briefcase className="size-3.5" />
              <span>Open My Tasks</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
