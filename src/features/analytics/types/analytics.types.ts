export interface ProjectProgress {
  projectId: string
  projectName: string
  projectStatus: string
  totalTasks: number
  completedTasks: number
  completionPercentage: number
  dueDate: string
}

export interface OverdueTask {
  taskId: string
  title: string
  taskPriority: string
  taskStatus: string
  dueDate: string
  projectId: string
  projectName: string
  assignedToName: string
}

export interface UpcomingTask {
  taskId: string
  title: string
  taskPriority: string
  taskStatus: string
  dueDate: string
  projectId: string
  projectName: string
  assignedToName: string
}

export interface OverviewAnalytics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  planningProjects: number

  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  cancelledTasks: number
  overdueTasks: number
  completionPercentage: number

  tasksByStatus: Record<string, number>
  tasksByPriority: Record<string, number>

  projectProgress: ProjectProgress[]
  overdueTasksList: OverdueTask[]
  upcomingTasksList: UpcomingTask[]
}

export interface ProjectAnalytics {
  projectId: string
  projectName: string
  projectStatus: string
  startDate: string
  dueDate: string
  ownerName: string

  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  cancelledTasks: number
  overdueTasks: number
  completionPercentage: number

  tasksByStatus: Record<string, number>
  tasksByPriority: Record<string, number>
}

export interface MemberWorkload {
  userId: string
  name: string
  email: string
  totalAssigned: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  overdueTasks: number
}

export interface WorkloadAnalytics {
  members: MemberWorkload[]
}
