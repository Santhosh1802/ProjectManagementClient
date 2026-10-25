import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Briefcase,
  Clock,
  Search,
  Users,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Task } from "@/features/tasks/types/task.types"
import type { ProjectMember } from "@/features/projects/types/project.types"

interface TeamWorkloadPlanningViewProps {
  tasks: Task[]
  members: ProjectMember[]
}

export default function TeamWorkloadPlanningView({
  tasks,
  members,
}: TeamWorkloadPlanningViewProps) {
  const [search, setSearch] = useState("")
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")

  const now = Date.now()

  // Compute detailed workloads per member
  const memberWorkloadStats = useMemo(() => {
    // Build map for each member
    return members.map((member) => {
      const memberTasks = tasks.filter((t) => t.assignedTo?.id === member.user.id)
      const completed = memberTasks.filter((t) => t.taskStatus === "DONE").length
      const inProgress = memberTasks.filter((t) => t.taskStatus === "IN_PROGRESS").length
      const todo = memberTasks.filter((t) => t.taskStatus === "TODO").length
      const cancelled = memberTasks.filter((t) => t.taskStatus === "CANCELLED").length
      const overdue = memberTasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate).getTime() < now &&
          t.taskStatus !== "DONE" &&
          t.taskStatus !== "CANCELLED"
      ).length

      const total = memberTasks.length
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

      return {
        member,
        total,
        completed,
        inProgress,
        todo,
        cancelled,
        overdue,
        completionRate,
        tasks: memberTasks,
      }
    })
  }, [members, tasks, now])

  // Unassigned tasks
  const unassignedTasks = useMemo(() => {
    return tasks.filter((t) => !t.assignedTo)
  }, [tasks])

  // Filtered members & tasks based on search & filters
  const filteredWorkloads = useMemo(() => {
    return memberWorkloadStats.filter(({ member, tasks: memberTasks }) => {
      if (selectedMemberFilter !== "ALL" && member.user.id !== selectedMemberFilter) {
        return false
      }

      const memberName = `${member.user.firstName} ${member.user.lastName || ""}`.toLowerCase()
      const matchesSearch =
        !search ||
        memberName.includes(search.toLowerCase()) ||
        member.user.email.toLowerCase().includes(search.toLowerCase())

      if (!matchesSearch) return false

      // Check if any tasks match status/priority filters if specified
      if (statusFilter !== "ALL") {
        const hasStatus = memberTasks.some((t) => t.taskStatus === statusFilter)
        if (!hasStatus && memberTasks.length > 0) return false
      }

      if (priorityFilter !== "ALL") {
        const hasPriority = memberTasks.some((t) => t.taskPriority === priorityFilter)
        if (!hasPriority && memberTasks.length > 0) return false
      }

      return true
    })
  }, [memberWorkloadStats, search, selectedMemberFilter, statusFilter, priorityFilter])

  return (
    <div className="space-y-6">
      {/* Workload Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Team Size</p>
              <p className="text-base sm:text-xl font-bold">{members.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Briefcase className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Assigned Tasks</p>
              <p className="text-base sm:text-xl font-bold">
                {tasks.length - unassignedTasks.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="size-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">In Progress</p>
              <p className="text-base sm:text-xl font-bold">
                {tasks.filter((t) => t.taskStatus === "IN_PROGRESS").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="size-4 text-destructive" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Overdue Tasks</p>
              <p className="text-base sm:text-xl font-bold text-destructive">
                {
                  tasks.filter(
                    (t) =>
                      t.dueDate &&
                      new Date(t.dueDate).getTime() < now &&
                      t.taskStatus !== "DONE" &&
                      t.taskStatus !== "CANCELLED"
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-lg border bg-card p-3 sm:p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team member..."
            className="pl-9 h-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Member Filter */}
          <div className="w-36">
            <Select value={selectedMemberFilter} onValueChange={(val) => val && setSelectedMemberFilter(val)}>
              <SelectTrigger size="sm" className="h-8 text-xs">
                <SelectValue placeholder="All Members">
                  {selectedMemberFilter === "ALL"
                    ? "All Members"
                    : members.find((m) => m.user.id === selectedMemberFilter)
                    ? `${members.find((m) => m.user.id === selectedMemberFilter)?.user.firstName} ${members.find((m) => m.user.id === selectedMemberFilter)?.user.lastName || ""}`.trim()
                    : selectedMemberFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Members</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.user.id} value={m.user.id}>
                    {m.user.firstName} {m.user.lastName || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-28">
            <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
              <SelectTrigger size="sm" className="h-8 text-xs">
                <SelectValue placeholder="Status">
                  {statusFilter === "ALL" ? "All Status" : statusFilter.replace("_", " ")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="w-28">
            <Select value={priorityFilter} onValueChange={(val) => val && setPriorityFilter(val)}>
              <SelectTrigger size="sm" className="h-8 text-xs">
                <SelectValue placeholder="Priority">
                  {priorityFilter === "ALL" ? "All Priority" : priorityFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      {filteredWorkloads.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
          No team members matched the specified search and filter criteria.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWorkloads.map(
            ({ member, total, completed, inProgress, todo, overdue, completionRate, tasks: memberTasks }) => {
              const fullName = `${member.user.firstName} ${member.user.lastName || ""}`.trim()
              const initials = `${member.user.firstName?.[0] ?? ""}${member.user.lastName?.[0] ?? ""}`.toUpperCase()

              return (
                <Card key={member.user.id} className="overflow-hidden hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px] uppercase font-semibold shrink-0">
                        {member.projectRole}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Completion Rate</span>
                        <span className="font-semibold text-foreground">{completionRate}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 text-xs">
                    {/* Stat Badges */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="rounded-md bg-muted/50 p-1.5">
                        <p className="text-[10px] text-muted-foreground">Total</p>
                        <p className="font-bold text-foreground text-xs">{total}</p>
                      </div>
                      <div className="rounded-md bg-amber-500/10 p-1.5 text-amber-700 dark:text-amber-400">
                        <p className="text-[10px]">Active</p>
                        <p className="font-bold text-xs">{inProgress}</p>
                      </div>
                      <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-700 dark:text-blue-400">
                        <p className="text-[10px]">To Do</p>
                        <p className="font-bold text-xs">{todo}</p>
                      </div>
                      <div className="rounded-md bg-green-500/10 p-1.5 text-green-700 dark:text-green-400">
                        <p className="text-[10px]">Done</p>
                        <p className="font-bold text-xs">{completed}</p>
                      </div>
                    </div>

                    {/* Overdue Alert if any */}
                    {overdue > 0 && (
                      <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>{overdue} overdue {overdue === 1 ? "task" : "tasks"}</span>
                      </div>
                    )}

                    {/* Recent Assigned Tasks Snippet */}
                    <div className="space-y-1.5 pt-1 border-t">
                      <p className="text-[11px] font-semibold text-muted-foreground">Assigned Tasks ({total})</p>
                      {total === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic">No tasks currently assigned.</p>
                      ) : (
                        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                          {memberTasks.slice(0, 4).map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-[11px] hover:bg-muted/60 transition-colors"
                            >
                              <span className="truncate">{t.title}</span>
                              <span className="text-[10px] shrink-0 font-medium text-muted-foreground uppercase">
                                {t.taskStatus}
                              </span>
                            </div>
                          ))}
                          {total > 4 && (
                            <p className="text-[10px] text-muted-foreground pl-1">
                              +{total - 4} more tasks
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}
