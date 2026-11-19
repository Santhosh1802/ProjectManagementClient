import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  FolderKanban,
  Sparkles,
} from "lucide-react"

import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ShortcutHint from "@/components/common/ShortcutHint"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"

import { searchProjects } from "@/features/projects/services/projects.services"
import { createTask } from "@/features/tasks/services/task.services"
import { addTask } from "@/features/tasks/slice/task.slice"
import type { Task, TaskStatus } from "@/features/tasks/types/task.types"
import type { CreateTaskFormValues } from "@/features/tasks/schema/task.schema"
import CreateTaskForm from "@/features/tasks/components/create-task/CreateTaskForm"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"

const VALID_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]

export default function CreateTaskPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()

  const currentUser = useAppSelector((state) => state.auth.user)

  // Initial values from URL params (e.g. ?status=TODO or ?projectId=...)
  const statusParam = searchParams.get("status") as TaskStatus | null
  const defaultStatus: TaskStatus | undefined =
    statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : undefined

  const defaultProjectId = searchParams.get("projectId") || undefined

  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  // Load available projects
  useEffect(() => {
    let cancelled = false

    const loadOptions = async () => {
      try {
        setProjectsLoading(true)

        const projectsResponse = await searchProjects({
          page: 0,
          size: 50,
          scope: "ALL",
          sortBy: "createdAt",
          sortOrder: "desc",
        })

        if (!cancelled) {
          setProjects(
            projectsResponse.content.map((p) => ({
              id: p.id,
              name: p.name,
            }))
          )
        }
      } catch (err) {
        console.error("Failed to load projects for task creation:", err)
      } finally {
        if (!cancelled) {
          setProjectsLoading(false)
        }
      }
    }

    void loadOptions()

    return () => {
      cancelled = true
    }
  }, [])

  const handleProjectSearch = async (keyword: string) => {
    try {
      setProjectsLoading(true)
      const res = await searchProjects({
        page: 0,
        size: 20,
        keyword: keyword.trim() || undefined,
        scope: "ALL",
        sortBy: "createdAt",
        sortOrder: "desc",
      })
      setProjects(
        res.content.map((p) => ({
          id: p.id,
          name: p.name,
        }))
      )
    } catch (err) {
      console.error("Failed to search projects:", err)
    } finally {
      setProjectsLoading(false)
    }
  }

  const formatDueDateForSubmission = (dueDateStr?: string | null): string | null => {
    if (!dueDateStr || !dueDateStr.trim()) return null
    const trimmed = dueDateStr.trim()

    if (trimmed.includes(" ")) {
      const [datePart, timePart] = trimmed.split(" ")
      const [h = "00", m = "00"] = timePart.split(":")
      const hours = h.padStart(2, "0")
      const minutes = m.padStart(2, "0")
      const d = new Date(`${datePart}T${hours}:${minutes}:00`)
      return isNaN(d.getTime()) ? null : d.toISOString()
    }

    if (trimmed.includes("T")) {
      const d = new Date(trimmed)
      return isNaN(d.getTime()) ? null : d.toISOString()
    }

    const d = new Date(`${trimmed}T23:59:59`)
    return isNaN(d.getTime()) ? null : d.toISOString()
  }

  const handleSubmitTask = async (values: CreateTaskFormValues): Promise<Task> => {
    if (!currentUser?.id) {
      throw new Error("Unable to identify the authenticated user.")
    }

    const uniqueAssigneeIds = Array.from(
      new Set(
        [values.assignedToId, ...(values.assigneeIds ?? [])].filter(Boolean)
      )
    )

    const newTask = await createTask({
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      taskStatus: values.taskStatus,
      taskPriority: values.taskPriority,
      projectId: values.projectId,
      assignedToId: values.assignedToId,
      assigneeIds: uniqueAssigneeIds,
      dueDate: formatDueDateForSubmission(values.dueDate),
    })

    return newTask
  }

  const handleCreated = (task: Task) => {
    dispatch(addTask(task))
    toast.add({
      type: "success",
      title: "Task created successfully",
      description: `"${task.title}" has been added.`,
    })
    navigate("/app/tasks")
  }

  const defaultProjectName = projects.find((p) => p.id === defaultProjectId)?.name

  return (
    <PageContainer className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/app/tasks")}
        >
          <ArrowLeft className="size-4" /> Back to Tasks
        </Button>
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="size-3 text-primary" />
          New Task Workflow
        </Badge>
      </div>

      <PageHeader
        title="Create task"
        description="Define task details, assign it to a team member, and schedule a due date."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="border shadow-xs lg:col-span-8">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary">
                <CheckSquare className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">Task Information</CardTitle>
                <CardDescription className="text-xs">
                  Fill in the details below to create a new task.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <CreateTaskForm
              defaultProjectId={defaultProjectId}
              defaultStatus={defaultStatus}
              projects={projects}
              projectsLoading={projectsLoading}
              onProjectSearch={handleProjectSearch}
              onSubmitTask={handleSubmitTask}
              onCreated={handleCreated}
              onCancel={() => navigate("/app/tasks")}
            />
          </CardContent>
        </Card>

        <aside className="space-y-4 lg:col-span-4">
          <Card className="sticky top-6 border-border/80 bg-card/95 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Creation Checklist &amp; Context
              </CardTitle>
              <CardDescription className="text-xs">
                Tips for clear, trackable sprint tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {(defaultProjectName || defaultStatus) && (
                <div className="space-y-2 rounded-lg border border-primary/25 bg-primary/5 p-3">
                  <div className="font-semibold text-primary">Pre-filled Context</div>
                  <div className="flex flex-wrap gap-1.5">
                    {defaultProjectName && (
                      <Badge variant="secondary" className="gap-1">
                        <FolderKanban className="size-3" />
                        {defaultProjectName}
                      </Badge>
                    )}
                    {defaultStatus && (
                      <Badge variant="outline">{defaultStatus.replace("_", " ")}</Badge>
                    )}
                  </div>
                </div>
              )}

              <ul className="space-y-2.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>Start titles with an action verb (e.g. &ldquo;Implement&rdquo;, &ldquo;Fix&rdquo;, &ldquo;Review&rdquo;).</span>
                </li>
                <li className="flex items-start gap-2">
                  <FolderKanban className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>Link to a project and assign an owner so notifications trigger automatically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>Set a due date &amp; priority for accurate calendar and dashboard tracking.</span>
                </li>
              </ul>

              <Separator />

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Quick submit</span>
                <ShortcutHint keys={["mod", "Enter"]} />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  )
}
