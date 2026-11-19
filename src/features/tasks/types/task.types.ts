import type { PageResponse } from "@/features/projects/types/project.types";


export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED"

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export interface TaskUser {
  id: string
  firstName: string
  lastName: string
  email: string
  userRole: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

export interface TaskProjectOwner {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface TaskProject {
  id: string
  name: string
  description: string | null
  projectStatus: string
  startDate: string
  dueDate: string
  owner: TaskProjectOwner
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  taskStatus: TaskStatus
  taskPriority: TaskPriority
  dueDate: string | null
  project: TaskProject
  assignedTo: TaskUser
  assignees?: TaskUser[]
  subtaskCount?: number
  completedSubtaskCount?: number
  createdBy: TaskUser
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  timestamp: string
  status: number
  message: string
  data: T
}

export interface CreateTaskRequest {
  title: string
  description?: string
  taskStatus: TaskStatus
  taskPriority: TaskPriority
  dueDate?: string | null
  projectId: string
  assignedToId: string
  assigneeIds?: string[]
}

export interface GetTaskByIdRequest {
  id: string
}

export interface GetTasksRequest {
  page?: number
  size?: number
}

export interface GetTasksByProjectRequest {
  projectId: string
  page?: number
  size?: number
}

export interface GetTasksByAssignedToRequest {
  assignedToId: string
  page?: number
  size?: number
}

export interface GetTasksByCreatedByRequest {
  createdByUserId: string
  page?: number
  size?: number
}

export interface UpdateTaskDetailsRequest {
  id: string
  title: string
  description?: string
  taskStatus: TaskStatus
  taskPriority: TaskPriority
  dueDate?: string | null
  projectId: string
  assignedToId: string
  assigneeIds?: string[]
  createdById: string
}

export interface UpdateTaskStatusRequest {
  id: string
  status: TaskStatus
}

export interface DeleteTaskRequest {
  id: string
}

export type TaskPageResponse = PageResponse<Task>

// features/tasks/types/task.types.ts

export type TaskView = "kanban" | "card" | "list" | "table" | "calendar" | "timeline"

export type DependencyType = "FINISH_TO_START" | "BLOCKED_BY"

export interface TaskDependencySummary {
  dependencyId: string
  taskId: string
  taskTitle: string
  taskStatus: TaskStatus
  taskPriority: TaskPriority
  dueDate: string | null
  dependencyType: DependencyType
  createdById: string | null
  createdByName: string
  createdAt: string
}

export interface TaskDependenciesResponse {
  taskId: string
  isBlocked: boolean
  blockedBy: TaskDependencySummary[]
  blocking: TaskDependencySummary[]
}

export interface ProjectDependencyEdge {
  dependencyId: string
  sourceTaskId: string
  sourceTaskTitle: string
  targetTaskId: string
  targetTaskTitle: string
  dependencyType: DependencyType
  createdAt: string
}

export interface CreateTaskDependencyRequest {
  taskId: string
  dependsOnTaskId: string
  dependencyType: DependencyType
}

export type TaskScope =
  | "ALL"
  | "ASSIGNED_TO_ME"
  | "CREATED_BY_ME"

export type TaskStatusFilter = "ALL" | TaskStatus

export type TaskPriorityFilter = "ALL" | TaskPriority

export type TaskSortField =
  | "createdAt"
  | "updatedAt"
  | "dueDate"
  | "title"
  | "taskPriority"
  | "taskStatus"

export type TaskSortOrder = "asc" | "desc"

export interface TaskFilters {
  search: string
  status: TaskStatusFilter
  priority: TaskPriorityFilter
  projectIds?: string[]
  assignedToId?: string
  createdById?: string
  unassigned?: boolean
  overdue?: boolean
  dueBefore?: string | null
  dueAfter?: string | null
  createdBefore?: string | null
  createdAfter?: string | null
  sortBy: TaskSortField
  sortOrder: TaskSortOrder
}

export interface TaskSearchParams {
  keyword?: string
  statuses?: TaskStatus[]
  priorities?: TaskPriority[]
  projectIds?: string[]
  assignedToId?: string
  createdById?: string
  unassigned?: boolean
  overdue?: boolean
  dueBefore?: string
  dueAfter?: string
  createdBefore?: string
  createdAfter?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  size?: number
}

export interface SubtaskAssignee {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface TaskSubtask {
  id: string
  taskId: string
  title: string
  completed: boolean
  sortOrder: number
  assignedTo: SubtaskAssignee | null
  dueDate: string | null
  completedAt: string | null
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface CreateSubtaskRequest {
  title: string
  assignedToId?: string | null
  dueDate?: string | null
}

export interface UpdateSubtaskRequest {
  title?: string
  completed?: boolean
  assignedToId?: string
  clearAssignee?: boolean
  dueDate?: string
  clearDueDate?: boolean
  sortOrder?: number
}