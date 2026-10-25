import { useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  Link2,
  Plus,
  Trash2,
  Workflow,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/apiError"
import {
  useTaskDependenciesQuery,
  useCreateTaskDependencyMutation,
  useRemoveTaskDependencyMutation,
} from "@/features/tasks/hooks/useTasksQuery"
import type {
  DependencyType,
  Task,
  TaskDependencySummary,
} from "@/features/tasks/types/task.types"

interface TaskDependenciesSectionProps {
  task: Task
  projectTasks: Task[]
  canManage: boolean
}

export default function TaskDependenciesSection({
  task,
  projectTasks,
  canManage,
}: TaskDependenciesSectionProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedPrerequisiteId, setSelectedPrerequisiteId] = useState<string>("")
  const [selectedDependencyType, setSelectedDependencyType] = useState<DependencyType>("FINISH_TO_START")

  const { data: dependencies, isLoading } = useTaskDependenciesQuery(task.id)
  const createMutation = useCreateTaskDependencyMutation(task.id, task.project.id)
  const removeMutation = useRemoveTaskDependencyMutation(task.id, task.project.id)

  const blockedBy = dependencies?.blockedBy ?? []
  const blocking = dependencies?.blocking ?? []
  const isBlocked = dependencies?.isBlocked ?? false

  // Eligible tasks to depend on: same project, not the current task, and not already in blockedBy
  const existingPrerequisiteIds = new Set(blockedBy.map((d) => d.taskId))
  const eligibleTasks = projectTasks.filter(
    (t) => t.id !== task.id && !existingPrerequisiteIds.has(t.id)
  )

  const handleAddDependency = async () => {
    if (!selectedPrerequisiteId) {
      toast.add({
        type: "error",
        title: "Missing requirement",
        description: "Please select a prerequisite task to depend on.",
      })
      return
    }

    try {
      await createMutation.mutateAsync({
        taskId: task.id,
        dependsOnTaskId: selectedPrerequisiteId,
        dependencyType: selectedDependencyType,
      })

      toast.add({
        type: "success",
        title: "Dependency added",
        description: "Relationship has been successfully established.",
      })
      setSelectedPrerequisiteId("")
      setAddModalOpen(false)
    } catch (err) {
      toast.add({
        type: "error",
        title: "Cannot add dependency",
        description: getApiErrorMessage(err, "Failed to create dependency relationship."),
      })
    }
  }

  const handleRemoveDependency = async (dependency: TaskDependencySummary) => {
    const confirmed = window.confirm(
      `Remove dependency on "${dependency.taskTitle}"?`
    )
    if (!confirmed) return

    try {
      await removeMutation.mutateAsync(dependency.dependencyId)
      toast.add({
        type: "success",
        title: "Dependency removed",
        description: "The dependency relationship was removed.",
      })
    } catch (err) {
      toast.add({
        type: "error",
        title: "Failed to remove dependency",
        description: getApiErrorMessage(err, "Unable to delete task dependency."),
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="size-4 text-primary" />
            <CardTitle className="text-base font-semibold">Dependencies</CardTitle>
            {isBlocked && (
              <Badge variant="destructive" className="gap-1 text-[11px] py-0 px-2 font-medium">
                <Ban className="size-3" />
                Blocked
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Prerequisites that block this task, and downstream tasks blocked by it.
          </CardDescription>
        </div>

        {canManage && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddModalOpen(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Add Dependency</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Blocked banner notice */}
        {isBlocked && (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">This task is currently blocked</p>
              <p className="text-[11px] opacity-90 leading-relaxed">
                One or more prerequisite tasks are still incomplete. Complete all prerequisites before advancing this task to In Progress or Completed.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Blocked By (Prerequisites) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Blocked By (Prerequisites)
            </h4>
            <span className="text-[11px] text-muted-foreground">
              {blockedBy.length} {blockedBy.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {isLoading ? (
            <div className="py-4 text-center text-xs text-muted-foreground animate-pulse">
              Loading dependencies...
            </div>
          ) : blockedBy.length === 0 ? (
            <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
              No prerequisites. This task is free to start.
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {blockedBy.map((dep) => {
                const isComplete = dep.taskStatus === "DONE"
                return (
                  <div
                    key={dep.dependencyId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 text-xs hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isComplete ? (
                        <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="size-4 shrink-0 text-amber-500" />
                      )}
                      <div className="min-w-0">
                        <Link
                          to={`/app/tasks/${dep.taskId}`}
                          className="font-medium hover:underline hover:text-primary truncate block max-w-sm"
                        >
                          {dep.taskTitle}
                        </Link>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>Status: {dep.taskStatus.replace("_", " ")}</span>
                          <span>•</span>
                          <span>Priority: {dep.taskPriority}</span>
                          <span>•</span>
                          <span className="capitalize">
                            {dep.dependencyType === "FINISH_TO_START"
                              ? "Finish to Start"
                              : "Blocked By"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Badge
                        variant={isComplete ? "secondary" : "destructive"}
                        className="text-[10px] px-1.5 py-0 font-normal"
                      >
                        {isComplete ? "Satisfied" : "Blocking"}
                      </Badge>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDependency(dep)}
                          disabled={removeMutation.isPending}
                          className="size-7 text-muted-foreground hover:text-destructive"
                          title="Remove dependency"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Section 2: Downstream Blocking Tasks */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Blocks (Downstream Tasks)
            </h4>
            <span className="text-[11px] text-muted-foreground">
              {blocking.length} {blocking.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {blocking.length === 0 ? (
            <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
              This task is not blocking any downstream tasks.
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {blocking.map((dep) => (
                <div
                  key={dep.dependencyId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 text-xs hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <Link
                        to={`/app/tasks/${dep.taskId}`}
                        className="font-medium hover:underline hover:text-primary truncate block max-w-sm"
                      >
                        {dep.taskTitle}
                      </Link>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>Status: {dep.taskStatus.replace("_", " ")}</span>
                        <span>•</span>
                        <span>Priority: {dep.taskPriority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                      Dependent
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Dependency Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-foreground">
              <Link2 className="size-5 text-primary" />
              <DialogTitle>Add Task Dependency</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Specify a prerequisite task that must be completed before "{task.title}" can proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Select Prerequisite Task</label>
              {eligibleTasks.length === 0 ? (
                <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  No other tasks available in this project to set as dependencies.
                </p>
              ) : (
                <Select
                  value={selectedPrerequisiteId}
                  onValueChange={(val) => setSelectedPrerequisiteId(val ?? "")}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Choose prerequisite task...">
                      {selectedPrerequisiteId
                        ? eligibleTasks.find((t) => t.id === selectedPrerequisiteId)?.title
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {eligibleTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span className="truncate">{t.title}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                            {t.taskStatus}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Relationship Type</label>
              <Select
                value={selectedDependencyType}
                onValueChange={(val) => setSelectedDependencyType(val as DependencyType)}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Select type">
                    {selectedDependencyType === "FINISH_TO_START"
                      ? "Finish-to-Start (Prerequisite must be completed)"
                      : "Blocked-by (Work is blocked until resolved)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FINISH_TO_START" className="text-xs">
                    Finish-to-Start (Prerequisite must be completed)
                  </SelectItem>
                  <SelectItem value="BLOCKED_BY" className="text-xs">
                    Blocked-by (Work is blocked until resolved)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAddDependency}
              disabled={!selectedPrerequisiteId || createMutation.isPending}
            >
              {createMutation.isPending ? "Adding..." : "Add Dependency"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
