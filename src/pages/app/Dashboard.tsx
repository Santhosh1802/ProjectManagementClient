
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { searchProjects } from "@/features/projects/services/projects.services"
import { getTasksByAssignedTo } from "@/features/tasks/services/task.services"
import { useAppSelector } from "@/hooks/redux-hooks"
import type { Project } from "@/features/projects/types/project.types"
import type { Task } from "@/features/tasks/types/task.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, Clock, FolderKanban, Activity } from "lucide-react"

import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"

export default function Dashboard() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.auth.user)

  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [totalTasks, setTotalTasks] = useState(0)
  const [totalProjects, setTotalProjects] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      try {
        const projRes = await searchProjects({ size: 5, sortBy: "createdAt", sortOrder: "desc" })
        if (!cancelled) {
          setProjects(projRes.content)
          setTotalProjects(projRes.totalElements)
          setLoadingProjects(false)
        }
      } catch {
        if (!cancelled) setLoadingProjects(false)
      }
    }
    void loadData()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    
    async function loadTasksData() {
      if (!currentUser?.id) {
        if (!cancelled) setLoadingTasks(false)
        return
      }
      
      const userId = currentUser.id;
      try {
        const taskRes = await getTasksByAssignedTo({ assignedToId: userId, size: 5 })
        if (!cancelled) {
          setTasks(taskRes.content)
          setTotalTasks(taskRes.totalElements)
          setLoadingTasks(false)
        }
      } catch {
        if (!cancelled) setLoadingTasks(false)
      }
    }
    void loadTasksData()
    return () => { cancelled = true }
  }, [currentUser?.id])

  return (
    <PageContainer className="space-y-6">
      <PageHeader 
        title={`Welcome back, ${currentUser?.firstName || 'User'}!`}
        description="Here is an overview of your workspace."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingProjects ? "..." : totalProjects}</div>
            <p className="text-xs text-muted-foreground">Active in your workspace</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Tasks</CardTitle>
            <Briefcase className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingTasks ? "..." : totalTasks}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Tasks requiring attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Workspace is healthy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Recently created projects in your workspace.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/projects")}>
              View All <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                <FolderKanban className="mb-2 size-6 text-muted-foreground" />
                <p className="text-sm font-medium">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        <FolderKanban className="size-5 text-primary" />
                      </div>
                      <div>
                        <Link to={`/app/projects/${project.id}`} className="font-medium hover:underline">{project.name}</Link>
                        <p className="text-sm text-muted-foreground">{project.projectStatus}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>Tasks currently assigned to you.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/tasks")}>
              View All <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingTasks ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                <Briefcase className="mb-2 size-6 text-muted-foreground" />
                <p className="text-sm font-medium">No assigned tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div>
                      <Link to={`/app/tasks/${task.id}`} className="font-medium hover:underline">{task.title}</Link>
                      <p className="text-sm text-muted-foreground">{task.taskStatus}</p>
                    </div>
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
