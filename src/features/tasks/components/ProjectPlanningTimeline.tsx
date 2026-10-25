import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Ban,
  Calendar,
  Search,
  Workflow,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import StatusBadge from "@/components/common/StatusBadge"
import type { Task, ProjectDependencyEdge } from "@/features/tasks/types/task.types"

interface ProjectPlanningTimelineProps {
  tasks: Task[]
  dependencies: ProjectDependencyEdge[]
  projectStartDate?: string | null
  projectDueDate?: string | null
}

export default function ProjectPlanningTimeline({
  tasks,
  dependencies,
  projectStartDate,
  projectDueDate,
}: ProjectPlanningTimelineProps) {
  // Use project bounds if present, or task bounds
  void projectStartDate
  void projectDueDate
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [filterBlockedOnly, setFilterBlockedOnly] = useState(false)

  const now = Date.now()

  // Map of tasks that have incomplete prerequisites (blocked tasks)
  const blockedTaskIds = useMemo(() => {
    const taskMap = new Map<string, Task>()
    tasks.forEach((t) => taskMap.set(t.id, t))

    const blocked = new Set<string>()
    for (const edge of dependencies) {
      const source = taskMap.get(edge.sourceTaskId)
      if (source && source.taskStatus !== "DONE") {
        blocked.add(edge.targetTaskId)
      }
    }
    return blocked
  }, [tasks, dependencies])

  // Count prerequisite dependencies per task
  const dependencyCounts = useMemo(() => {
    const counts = new Map<string, { blockedByCount: number; blockingCount: number }>()
    for (const edge of dependencies) {
      const target = counts.get(edge.targetTaskId) || { blockedByCount: 0, blockingCount: 0 }
      target.blockedByCount += 1
      counts.set(edge.targetTaskId, target)

      const source = counts.get(edge.sourceTaskId) || { blockedByCount: 0, blockingCount: 0 }
      source.blockingCount += 1
      counts.set(edge.sourceTaskId, source)
    }
    return counts
  }, [dependencies])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filterBlockedOnly && !blockedTaskIds.has(t.id)) return false
        if (statusFilter !== "ALL" && t.taskStatus !== statusFilter) return false
        if (priorityFilter !== "ALL" && t.taskPriority !== priorityFilter) return false
        if (search) {
          const matchTitle = t.title.toLowerCase().includes(search.toLowerCase())
          const matchAssignee = t.assignedTo
            ? `${t.assignedTo.firstName} ${t.assignedTo.lastName || ""}`.toLowerCase().includes(search.toLowerCase())
            : false
          if (!matchTitle && !matchAssignee) return false
        }
        return true
      })
      .sort((a, b) => {
        // Sort by dueDate ascending, nulls last
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
  }, [tasks, filterBlockedOnly, blockedTaskIds, statusFilter, priorityFilter, search])

  const formatDate = (val: string | null) => {
    if (!val) return "Unscheduled"
    const d = new Date(val)
    if (Number.isNaN(d.getTime())) return "Invalid date"
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d)
  }

  return (
    <div className="space-y-4">
      {/* Overview Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-[11px] text-muted-foreground">Total Planned Tasks</p>
          <p className="text-lg font-bold">{tasks.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-[11px] text-muted-foreground">Dependencies Defined</p>
          <p className="text-lg font-bold text-primary">{dependencies.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-[11px] text-muted-foreground">Currently Blocked</p>
          <p className="text-lg font-bold text-destructive">{blockedTaskIds.size}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-[11px] text-muted-foreground">Overdue Items</p>
          <p className="text-lg font-bold text-amber-600">
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

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between rounded-lg border bg-card p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or assignees..."
            className="pl-9 h-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filterBlockedOnly ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilterBlockedOnly(!filterBlockedOnly)}
            className="h-8 gap-1.5 text-xs"
          >
            <Ban className="size-3.5" />
            <span>Blocked Only ({blockedTaskIds.size})</span>
          </Button>

          {/* Status filter */}
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

          {/* Priority filter */}
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

      {/* Task Planning List with Visual Hierarchy & Timeline Milestones */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
          No tasks found matching the selected planning filters.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((t, idx) => {
            const isBlocked = blockedTaskIds.has(t.id)
            const isOverdue =
              t.dueDate &&
              new Date(t.dueDate).getTime() < now &&
              t.taskStatus !== "DONE" &&
              t.taskStatus !== "CANCELLED"
            const depCount = dependencyCounts.get(t.id) || { blockedByCount: 0, blockingCount: 0 }

            return (
              <div
                key={t.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors hover:bg-muted/40 ${
                  isBlocked ? "border-destructive/30 bg-destructive/5" : "bg-card"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                    #{idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        to={`/app/tasks/${t.id}`}
                        className="font-semibold text-sm hover:underline hover:text-primary truncate"
                      >
                        {t.title}
                      </Link>

                      {isBlocked && (
                        <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-medium gap-1">
                          <Ban className="size-3" />
                          Blocked
                        </Badge>
                      )}

                      {isOverdue && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-amber-600 border-amber-300">
                          Overdue
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>Assignee: {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName || ""}` : "Unassigned"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Due: {formatDate(t.dueDate)}
                      </span>
                      {depCount.blockedByCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <Workflow className="size-3" />
                            Requires {depCount.blockedByCount} {depCount.blockedByCount === 1 ? "prerequisite" : "prerequisites"}
                          </span>
                        </>
                      )}
                      {depCount.blockingCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-muted-foreground">
                            Blocks {depCount.blockingCount} downstream
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <StatusBadge status={t.taskStatus} showDot />
                  <StatusBadge status={t.taskPriority} />
                  <Link
                    to={`/app/tasks/${t.id}`}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 text-xs px-2.5 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
