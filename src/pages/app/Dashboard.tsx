import { useState, useMemo } from "react"
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

import { useOverviewAnalyticsQuery, useProjectAnalyticsQuery, useWorkloadAnalyticsQuery } from "@/features/analytics/hooks/useAnalyticsQuery"
import { useProjectsQuery } from "@/features/projects/hooks/useProjectsQuery"
import { useProjectActivityQuery } from "@/features/activity/hooks/useActivityQuery"
import { useAppSelector } from "@/hooks/redux-hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Activity,
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

const priorityBarChartConfig = {
  count: {
    label: "Tasks",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export default function Dashboard() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.auth.user)
  const role = (currentUser?.user_role?.toUpperCase() || "USER") as "ADMIN" | "MANAGER" | "USER"

  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")

  /* -------------------------------------------------------------
     Queries
     ------------------------------------------------------------- */
  const {
    data: overviewData,
    isLoading: loadingOverview,
    isFetching: isFetchingOverview,
    refetch: refetchOverview,
  } = useOverviewAnalyticsQuery()

  const {
    data: projectAnalyticsData,
    isFetching: isFetchingProjectAnalytics,
    refetch: refetchProjectAnalytics,
  } = useProjectAnalyticsQuery(selectedProjectId !== "ALL" ? selectedProjectId : null)

  const {
    data: workloadData,
    isLoading: loadingWorkload,
    isFetching: isFetchingWorkload,
    refetch: refetchWorkload,
  } = useWorkloadAnalyticsQuery(selectedProjectId !== "ALL" ? selectedProjectId : null)

  const { data: projectsRes } = useProjectsQuery({ size: 100, sortBy: "name", sortOrder: "asc" })
  const availableProjects = projectsRes?.content ?? []

  // Activity feed for selected project or first project
  const firstProjectId = availableProjects[0]?.id
  const activeActivityProjectId = selectedProjectId !== "ALL" ? selectedProjectId : firstProjectId
  const { data: activityData, isLoading: loadingActivity } = useProjectActivityQuery(activeActivityProjectId)

  const isRefreshing =
    isFetchingOverview || isFetchingProjectAnalytics || isFetchingWorkload

  const handleRefresh = () => {
    void refetchOverview()
    if (selectedProjectId !== "ALL") {
      void refetchProjectAnalytics()
    }
    void refetchWorkload()
  }

  /* -------------------------------------------------------------
     Active Metric Calculations (Filtered by Project if selected)
     ------------------------------------------------------------- */
  const isProjectScoped = selectedProjectId !== "ALL" && !!projectAnalyticsData

  const totalProjects = overviewData?.totalProjects ?? 0
  const activeProjects = overviewData?.activeProjects ?? 0

  const totalTasks = isProjectScoped
    ? (projectAnalyticsData?.totalTasks ?? 0)
    : (overviewData?.totalTasks ?? 0)

  const completedTasks = isProjectScoped
    ? (projectAnalyticsData?.completedTasks ?? 0)
    : (overviewData?.completedTasks ?? 0)

  const overdueTasks = isProjectScoped
    ? (projectAnalyticsData?.overdueTasks ?? 0)
    : (overviewData?.overdueTasks ?? 0)

  const completionPercentage = isProjectScoped
    ? (projectAnalyticsData?.completionPercentage ?? 0)
    : (overviewData?.completionPercentage ?? 0)

  /* Task Status Map & Chart Data */
  const statusMap = useMemo(() => {
    return isProjectScoped
      ? (projectAnalyticsData?.tasksByStatus ?? {})
      : (overviewData?.tasksByStatus ?? {})
  }, [isProjectScoped, projectAnalyticsData?.tasksByStatus, overviewData?.tasksByStatus])

  const taskStatusChartData = useMemo(() => {
    return [
      { status: "DONE", count: statusMap["DONE"] || 0, fill: "var(--color-chart-2)" },
      { status: "IN_PROGRESS", count: statusMap["IN_PROGRESS"] || 0, fill: "var(--color-chart-1)" },
      { status: "TODO", count: statusMap["TODO"] || 0, fill: "var(--color-chart-4)" },
      { status: "CANCELLED", count: statusMap["CANCELLED"] || 0, fill: "var(--color-chart-5)" },
    ].filter((d) => d.count > 0)
  }, [statusMap])

  /* Priority Map & Distribution Chart Data */
  const priorityMap = useMemo(() => {
    return isProjectScoped
      ? (projectAnalyticsData?.tasksByPriority ?? {})
      : (overviewData?.tasksByPriority ?? {})
  }, [isProjectScoped, projectAnalyticsData?.tasksByPriority, overviewData?.tasksByPriority])

  const priorityChartData = useMemo(() => {
    const list = [
      { priority: "URGENT", count: priorityMap["URGENT"] || 0 },
      { priority: "HIGH", count: priorityMap["HIGH"] || 0 },
      { priority: "MEDIUM", count: priorityMap["MEDIUM"] || 0 },
      { priority: "LOW", count: priorityMap["LOW"] || 0 },
    ]
    if (priorityFilter !== "ALL") {
      return list.filter((p) => p.priority === priorityFilter)
    }
    return list
  }, [priorityMap, priorityFilter])

  const projectProgressList = overviewData?.projectProgress ?? []
  const overdueTasksList = overviewData?.overdueTasksList ?? []
  const upcomingTasksList = overviewData?.upcomingTasksList ?? []
  const workloadMembers = workloadData?.members ?? []

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Dashboard Analytics"
        description="Comprehensive workspace metrics, velocity distributions, and team workload insights."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Project Filter */}
            <div className="w-[180px] sm:w-[220px]">
              <Select
                value={selectedProjectId}
                onValueChange={(val) => val && setSelectedProjectId(val)}
              >
                <SelectTrigger size="sm" className="w-full h-8 text-xs">
                  <SelectValue placeholder="All Projects">
                    {selectedProjectId === "ALL"
                      ? "All Accessible Projects"
                      : (availableProjects.find((p) => p.id === selectedProjectId)?.name || selectedProjectId)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Accessible Projects</SelectItem>
                  {availableProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Quick Action */}
            {(role === "ADMIN" || role === "MANAGER") && (
              <Button
                size="sm"
                onClick={() => navigate("/app/projects/create")}
                className="h-8 gap-1.5 text-xs shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>New Project</span>
              </Button>
            )}
          </div>
        }
      />

      {/* -------------------------------------------------------------
          KEY METRIC SUMMARY CARDS
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 min-w-0">
        {/* Metric 1: Total / Active Projects */}
        <Card className="hover:border-primary/40 transition-all p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {isProjectScoped ? "Project" : "Projects"}
            </span>
            <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="size-3 sm:size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {isProjectScoped ? 1 : totalProjects}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              {isProjectScoped
                ? `${projectAnalyticsData?.projectStatus || "Active"}`
                : `${activeProjects} active initiatives`}
            </p>
          </div>
        </Card>

        {/* Metric 2: Total Tasks */}
        <Card className="hover:border-primary/40 transition-all p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Total Tasks
            </span>
            <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-primary/10 text-primary">
              <Briefcase className="size-3 sm:size-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">{totalTasks}</div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              {completedTasks} completed
            </p>
          </div>
        </Card>

        {/* Metric 3: Overdue Tasks */}
        <Card
          className={cn(
            "hover:border-primary/40 transition-all p-3 sm:p-4",
            overdueTasks > 0 && "border-rose-500/30 bg-rose-500/[0.02]"
          )}
        >
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Overdue
            </span>
            <div
              className={cn(
                "flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg",
                overdueTasks > 0
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-primary/10 text-primary"
              )}
            >
              <AlertCircle className="size-3 sm:size-4" />
            </div>
          </div>
          <div>
            <div
              className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight",
                overdueTasks > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
              )}
            >
              {overdueTasks}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              {overdueTasks > 0 ? "Requires attention" : "All on schedule"}
            </p>
          </div>
        </Card>

        {/* Metric 4: Completion Rate */}
        <Card className="hover:border-primary/40 transition-all p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1 pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Completion Rate
            </span>
            <div className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="size-3 sm:size-4 text-emerald-500" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {completionPercentage}%
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
              {completedTasks} of {totalTasks} deliverables done
            </p>
          </div>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          VISUAL DISTRIBUTION CHARTS (PIE + BAR)
          ------------------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-12 min-w-0">
        {/* Chart 1: Task Status Distribution (7 Cols) */}
        <Card className="lg:col-span-7 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Task Status Distribution</CardTitle>
              <CardDescription>
                Progress breakdown across active deliverable states.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs w-fit">
              {totalTasks} Total Tasks
            </Badge>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden">
            {taskStatusChartData.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                <Briefcase className="mb-2 size-8 text-muted-foreground/50" />
                <p>No task distribution data available yet.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2 min-w-0">
                <ChartContainer
                  config={taskPieChartConfig}
                  className="mx-auto aspect-square h-[200px] w-full max-w-[200px] shrink-0"
                >
                  <PieChart aria-label="Task status distribution pie chart">
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={taskStatusChartData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={50}
                      outerRadius={75}
                      strokeWidth={3}
                      stroke="var(--color-background)"
                    >
                      {taskStatusChartData.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="grid grid-cols-2 gap-3 w-full sm:w-auto text-xs min-w-44">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-muted-foreground truncate">Done:</span>
                    <span className="font-bold ml-auto">{statusMap["DONE"] || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-muted-foreground truncate">In Progress:</span>
                    <span className="font-bold ml-auto">{statusMap["IN_PROGRESS"] || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-muted-foreground truncate">To Do:</span>
                    <span className="font-bold ml-auto">{statusMap["TODO"] || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-zinc-400 shrink-0" />
                    <span className="text-muted-foreground truncate">Cancelled:</span>
                    <span className="font-bold ml-auto">{statusMap["CANCELLED"] || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Priority Distribution (5 Cols) */}
        <Card className="lg:col-span-5 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Priority Distribution</CardTitle>
              <CardDescription>Task urgency allocation.</CardDescription>
            </div>
            {/* Priority filter */}
            <div className="w-[120px]">
              <Select
                value={priorityFilter}
                onValueChange={(val) => val && setPriorityFilter(val)}
              >
                <SelectTrigger size="sm" className="h-7 text-[11px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden px-2 sm:px-6">
            <ChartContainer config={priorityBarChartConfig} className="h-[220px] w-full min-w-0">
              <BarChart
                data={priorityChartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                aria-label="Task priority distribution bar chart"
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="priority"
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
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          PROJECT PROGRESS & TEAM WORKLOAD
          ------------------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-12 min-w-0">
        {/* Project Progress List (7 cols) */}
        <Card className="lg:col-span-7 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold">Project Progress</CardTitle>
              <CardDescription>Deliverable completion status by project.</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/projects")}
              className="h-8 gap-1 text-xs"
            >
              <span>View All</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {loadingOverview ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : projectProgressList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <FolderKanban className="mb-2 size-7 text-muted-foreground/60" />
                <p className="text-sm font-medium">No projects available</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Create a new project to start tracking milestones.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {projectProgressList.slice(0, 5).map((project) => (
                  <div
                    key={project.projectId}
                    className="flex flex-col gap-2 py-3 transition-colors hover:bg-muted/40 px-2 rounded-lg"
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <Link
                        to={`/app/projects/${project.projectId}`}
                        className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {project.projectName}
                      </Link>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          {project.projectStatus}
                        </Badge>
                        <span className="text-xs font-bold text-foreground">
                          {project.completionPercentage}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${project.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Workload Summary (5 cols) */}
        <Card className="lg:col-span-5 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold">Team Workload</CardTitle>
              <CardDescription>Deliverables allocated across team members.</CardDescription>
            </div>
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loadingWorkload ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : workloadMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <Users className="mb-2 size-7 text-muted-foreground/60" />
                <p className="text-sm font-medium">No team workload recorded</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Assign tasks to team members to visualize work allocation.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {workloadMembers.slice(0, 5).map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between py-2.5 transition-colors hover:bg-muted/40 px-2 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {member.totalAssigned} tasks
                      </Badge>
                      {member.overdueTasks > 0 && (
                        <Badge variant="destructive" className="text-[10px]">
                          {member.overdueTasks} overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          OVERDUE TASKS & UPCOMING DEADLINES & RECENT ACTIVITY
          ------------------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-12 min-w-0">
        {/* Overdue / Upcoming Tasks (7 cols) */}
        <Card className="lg:col-span-7 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold">Overdue & Upcoming Deadlines</CardTitle>
              <CardDescription>Deliverables requiring immediate attention.</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/tasks")}
              className="h-8 gap-1 text-xs"
            >
              <span>View Tasks</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {overdueTasksList.length === 0 && upcomingTasksList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <CheckCircle2 className="mb-2 size-7 text-emerald-500" />
                <p className="text-sm font-medium">All deliverables on schedule</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  No overdue or upcoming deadlines pending.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overdue Section */}
                {overdueTasksList.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" />
                      <span>Overdue Deliverables</span>
                    </h4>
                    <div className="divide-y divide-border/60">
                      {overdueTasksList.slice(0, 3).map((task) => (
                        <div
                          key={task.taskId}
                          className="flex items-center justify-between py-2 px-2 hover:bg-rose-500/5 rounded-lg transition-colors"
                        >
                          <div className="min-w-0">
                            <Link
                              to={`/app/tasks/${task.taskId}`}
                              className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate block"
                            >
                              {task.title}
                            </Link>
                            <p className="text-xs text-muted-foreground truncate">
                              {task.projectName} · Assigned to {task.assignedToName}
                            </p>
                          </div>
                          <Badge variant="destructive" className="text-[10px] shrink-0">
                            {task.taskPriority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Section */}
                {upcomingTasksList.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      <span>Upcoming Deadlines</span>
                    </h4>
                    <div className="divide-y divide-border/60">
                      {upcomingTasksList.slice(0, 3).map((task) => (
                        <div
                          key={task.taskId}
                          className="flex items-center justify-between py-2 px-2 hover:bg-muted/40 rounded-lg transition-colors"
                        >
                          <div className="min-w-0">
                            <Link
                              to={`/app/tasks/${task.taskId}`}
                              className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate block"
                            >
                              {task.title}
                            </Link>
                            <p className="text-xs text-muted-foreground truncate">
                              {task.projectName} · Assigned to {task.assignedToName}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {task.taskPriority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity (5 cols) */}
        <Card className="lg:col-span-5 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <CardDescription>Latest changes across your active initiatives.</CardDescription>
            </div>
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Activity className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loadingActivity ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : !activityData || activityData.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <Activity className="mb-2 size-7 text-muted-foreground/60" />
                <p className="text-sm font-medium">No recent activity</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Actions performed on projects and tasks will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {activityData.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-2.5 px-2 hover:bg-muted/40 rounded-lg transition-colors">
                    <p className="text-xs text-foreground font-medium">{log.details}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      by {log.actorName || "Team Member"} · {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
