import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, CheckSquare } from "lucide-react"

import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

    const newTask = await createTask({
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      taskStatus: values.taskStatus,
      taskPriority: values.taskPriority,
      projectId: values.projectId,
      assignedToId: values.assignedToId,
      createdById: currentUser.id,
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

  return (
    <PageContainer className="max-w-4xl space-y-6">
      {/* Back button */}
      <div>
        <Button
          type="button"
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/app/tasks")}
        >
          <ArrowLeft className="size-4" /> Back to Tasks
        </Button>
      </div>

      <PageHeader
        title="Create task"
        description="Define task details, assign it to a team member, and schedule a due date."
      />

      <Card className="border shadow-xs">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
    </PageContainer>
  )
}
