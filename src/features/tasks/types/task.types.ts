import type { PageResponse } from "@/features/projects/types/project.types";


export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED"

export type TaskPriority = string

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
  createdById: string
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

export type TaskView = "kanban" | "card" | "list" | "table"

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
  sortBy: TaskSortField
  sortOrder: TaskSortOrder
}