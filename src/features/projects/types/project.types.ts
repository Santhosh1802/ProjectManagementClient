export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "COMPLETED"
  | "ARCHIVED"

export type ProjectRole =
  | "MEMBER"
  | "MANAGER"

export interface ProjectOwner {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  projectStatus: ProjectStatus
  startDate: string
  dueDate: string
  owner: ProjectOwner
  createdAt: string
  updatedAt: string
}

/* -------------------- API Response -------------------- */

export interface ApiResponse<T> {
  timestamp: string
  status: number
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

/* -------------------- Project Requests -------------------- */

export interface CreateProjectRequest {
  name: string
  description?: string
  startDate: string
  dueDate: string
}

export interface GetProjectByIdRequest {
  id: string
}

export interface UpdateProjectDetailsRequest {
  id: string
  name: string
  description?: string
  projectStatus: ProjectStatus
  dueDate: string
}

export interface UpdateProjectOwnerRequest {
  id: string
  ownerId: string
}

export interface DeleteProjectRequest {
  id: string
}

/* -------------------- Project Search -------------------- */

export type ProjectScope =
  | "ALL"
  | "OWNED"
  | "SHARED"

export type ProjectSortBy =
  | "name"
  | "startDate"
  | "dueDate"
  | "createdAt"
  | "updatedAt"

export type ProjectSortOrder =
  | "asc"
  | "desc"

export type ProjectDueDateFilter =
  | "ALL"
  | "OVERDUE"
  | "DUE_TODAY"
  | "DUE_THIS_WEEK"
  | "DUE_THIS_MONTH"

export interface ProjectSearchRequest {
  page?: number
  size?: number
  keyword?: string
  scope?: ProjectScope
  status?: ProjectStatus
  ownerId?: string
  sortBy?: ProjectSortBy
  sortOrder?: ProjectSortOrder
}

export interface ProjectFilters {
  scope: ProjectScope
  search: string
  status: ProjectStatus | "ALL"
  ownerId: string | "ALL"
  dueDate: ProjectDueDateFilter
  sortBy: ProjectSortBy
  sortOrder: ProjectSortOrder
}

/* -------------------- Project Member -------------------- */

export interface CreateProjectMemberRequest {
  projectId: string
  projectMemberId: string
  projectRole: ProjectRole
}

export interface GetProjectMemberByIdRequest {
  id: string
}

export interface GetProjectMembersRequest {
  projectId: string
  page?: number
  size?: number
}

export interface GetUserProjectMembersRequest {
  userId: string
  page?: number
  size?: number
}

export interface UpdateProjectMemberRoleRequest {
  id: string
  projectRole: ProjectRole
}

export interface DeleteProjectMemberRequest {
  id: string
}

export interface ProjectMemberUser {
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

export interface ProjectMemberProject {
  id: string
  name: string
  description: string | null
  projectStatus: ProjectStatus
  startDate: string
  dueDate: string
  owner: ProjectOwner
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: string
  user: ProjectMemberUser
  project: ProjectMemberProject
  projectRole: ProjectRole
  joinedAt: string
}
export type ProjectView = "card" | "list" | "table"